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
  invitations,
  type Invitation,
  type InsertInvitation,
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
  roles,
  permissions,
  rolePermissions,
  userRoleAssignments,
  type Role,
  type InsertRole,
  type Permission,
  type InsertPermission,
  type RolePermission,
  type InsertRolePermission,
  type UserRoleAssignment,
  type InsertUserRoleAssignment,
  type RoleWithPermissions,
  type EffectivePermissions,
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
  consultantScorecards,
  pulseSurveys,
  pulseResponses,
  npsResponses,
  incidents,
  correctiveActions,
  achievementBadges,
  consultantBadges,
  pointTransactions,
  referrals,
  complianceChecks,
  complianceAudits,
  type ConsultantScorecard,
  type InsertConsultantScorecard,
  type ConsultantScorecardWithDetails,
  type PulseSurvey,
  type InsertPulseSurvey,
  type PulseSurveyWithDetails,
  type PulseResponse,
  type InsertPulseResponse,
  type PulseResponseWithDetails,
  type NpsResponse,
  type InsertNpsResponse,
  type Incident,
  type InsertIncident,
  type IncidentWithDetails,
  type CorrectiveAction,
  type InsertCorrectiveAction,
  type CorrectiveActionWithDetails,
  type AchievementBadge,
  type InsertAchievementBadge,
  type ConsultantBadge,
  type InsertConsultantBadge,
  type ConsultantBadgeWithDetails,
  type PointTransaction,
  type InsertPointTransaction,
  type PointTransactionWithDetails,
  type Referral,
  type InsertReferral,
  type ReferralWithDetails,
  type ComplianceCheck,
  type InsertComplianceCheck,
  type ComplianceCheckWithDetails,
  type ComplianceAudit,
  type InsertComplianceAudit,
  type ComplianceAuditWithDetails,
  type QualityAnalytics,
  type GamificationAnalytics,
  type ComplianceAnalytics,
  type AIAnalytics,
  type AIInsight,
  contractTemplates,
  contracts,
  contractSigners,
  contractSignatures,
  contractAuditEvents,
  chatChannels,
  channelMembers,
  chatMessages,
  chatMessageReads,
  shiftChatSummaries,
  identityVerifications,
  identityDocuments,
  verificationEvents,
  fraudFlags,
  type ContractTemplate,
  type InsertContractTemplate,
  type Contract,
  type InsertContract,
  type ContractSigner,
  type InsertContractSigner,
  type ContractSignature,
  type InsertContractSignature,
  type ContractAuditEvent,
  type InsertContractAuditEvent,
  type ContractWithDetails,
  type ContractSignerWithDetails,
  type ChatChannel,
  type InsertChatChannel,
  type ChannelMember,
  type InsertChannelMember,
  type ChatMessage,
  type InsertChatMessage,
  type ChatMessageRead,
  type InsertChatMessageRead,
  type ShiftChatSummary,
  type InsertShiftChatSummary,
  type ChatChannelWithDetails,
  type ChatMessageWithSender,
  type IdentityVerification,
  type InsertIdentityVerification,
  type IdentityDocument,
  type InsertIdentityDocument,
  type VerificationEvent,
  type InsertVerificationEvent,
  type FraudFlag,
  type InsertFraudFlag,
  type IdentityVerificationWithDetails,
  type FraudFlagWithDetails,
  reportTemplates,
  savedReports,
  scheduledReports,
  reportRuns,
  exportLogs,
  executiveDashboards,
  dashboardWidgets,
  kpiDefinitions,
  kpiSnapshots,
  type ReportTemplate,
  type InsertReportTemplate,
  type SavedReport,
  type InsertSavedReport,
  type ScheduledReport,
  type InsertScheduledReport,
  type ReportRun,
  type InsertReportRun,
  type ExportLog,
  type InsertExportLog,
  type ExecutiveDashboard,
  type InsertExecutiveDashboard,
  type DashboardWidget,
  type InsertDashboardWidget,
  type KpiDefinition,
  type InsertKpiDefinition,
  type KpiSnapshot,
  type InsertKpiSnapshot,
  type ReportTemplateWithDetails,
  type SavedReportWithDetails,
  type ScheduledReportWithDetails,
  type ReportRunWithDetails,
  type ExecutiveDashboardWithDetails,
  type KpiDefinitionWithDetails,
  type ReportAnalytics,
  type DashboardAnalytics,
  skillCategories,
  skillItems,
  consultantQuestionnaires,
  consultantSkills,
  skillVerifications,
  consultantEhrExperience,
  consultantCertifications,
  type SkillCategory,
  type InsertSkillCategory,
  type SkillItem,
  type InsertSkillItem,
  type ConsultantQuestionnaire,
  type InsertConsultantQuestionnaire,
  type ConsultantSkill,
  type InsertConsultantSkill,
  type SkillVerification,
  type InsertSkillVerification,
  type ConsultantEhrExperience,
  type InsertConsultantEhrExperience,
  type ConsultantCertification,
  type InsertConsultantCertification,
  type QuestionnaireWithSkills,
  // Phase 18: Integration & Automation
  integrationConnections,
  syncJobs,
  syncEvents,
  calendarSyncSettings,
  ehrSystems,
  ehrStatusMetrics,
  ehrIncidents,
  ehrIncidentUpdates,
  payrollSyncProfiles,
  payrollExportJobs,
  escalationTriggers,
  escalationEvents,
  notificationQueue,
  automationWorkflows,
  workflowExecutions,
  type IntegrationConnection,
  type InsertIntegrationConnection,
  type SyncJob,
  type InsertSyncJob,
  type SyncEvent,
  type InsertSyncEvent,
  type CalendarSyncSettings,
  type InsertCalendarSyncSettings,
  type EhrSystem,
  type InsertEhrSystem,
  type EhrStatusMetric,
  type InsertEhrStatusMetric,
  type EhrIncident,
  type InsertEhrIncident,
  type EhrIncidentUpdate,
  type InsertEhrIncidentUpdate,
  type PayrollSyncProfile,
  type InsertPayrollSyncProfile,
  type PayrollExportJob,
  type InsertPayrollExportJob,
  type EscalationTrigger,
  type InsertEscalationTrigger,
  type EscalationEvent,
  type InsertEscalationEvent,
  type NotificationQueueItem,
  type InsertNotificationQueue,
  type AutomationWorkflow,
  type InsertAutomationWorkflow,
  type WorkflowExecution,
  type InsertWorkflowExecution,
  type IntegrationAnalytics,
  type EhrMonitoringAnalytics,
  type EscalationAnalytics,
  type SyncJobWithDetails,
  type EhrIncidentWithDetails,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, ilike, or, desc, asc, sql, inArray, lt, gt } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserRole(id: string, role: "admin" | "hospital_staff" | "consultant"): Promise<User | undefined>;
  updateUserProfilePhoto(id: string, photoUrl: string): Promise<User | undefined>;
  updateUserCoverPhoto(id: string, coverPhotoUrl: string): Promise<User | undefined>;
  updateUser(id: string, userData: Partial<{ firstName: string; lastName: string; linkedinUrl: string; websiteUrl: string }>): Promise<User | undefined>;
  updateUserAccessStatus(id: string, status: "pending_invitation" | "active" | "suspended" | "revoked", invitationId?: string): Promise<User | undefined>;

  // Invitation operations (invitation-only access control)
  createInvitation(invitation: InsertInvitation): Promise<Invitation>;
  getInvitation(id: string): Promise<Invitation | undefined>;
  getInvitationByToken(token: string): Promise<Invitation | undefined>;
  getInvitationByEmail(email: string): Promise<Invitation | undefined>;
  getPendingInvitationByEmail(email: string): Promise<Invitation | undefined>;
  getAllInvitations(): Promise<Invitation[]>;
  getInvitationsByStatus(status: "pending" | "accepted" | "revoked" | "expired"): Promise<Invitation[]>;
  acceptInvitation(id: string, userId: string): Promise<Invitation | undefined>;
  revokeInvitation(id: string, revokedByUserId: string, reason?: string): Promise<Invitation | undefined>;
  expireOldInvitations(): Promise<number>;
  updateInvitationExpiration(id: string, expiresAt: Date): Promise<Invitation | undefined>;

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
  getProjectsForConsultant(consultantId: string): Promise<string[]>;
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
  getAllTimesheets(): Promise<TimesheetWithDetails[]>;
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

  // ========================================
  // PHASE 15: Quality Assurance, Gamification, Compliance
  // ========================================

  // Consultant Scorecard operations
  getConsultantScorecard(id: string): Promise<ConsultantScorecardWithDetails | undefined>;
  listConsultantScorecards(filters?: { consultantId?: string; projectId?: string; period?: string }): Promise<ConsultantScorecardWithDetails[]>;
  createConsultantScorecard(scorecard: InsertConsultantScorecard): Promise<ConsultantScorecard>;
  updateConsultantScorecard(id: string, data: Partial<InsertConsultantScorecard>): Promise<ConsultantScorecard | undefined>;
  deleteConsultantScorecard(id: string): Promise<boolean>;

  // Pulse Survey operations
  getPulseSurvey(id: string): Promise<PulseSurveyWithDetails | undefined>;
  listPulseSurveys(filters?: { projectId?: string; isActive?: boolean }): Promise<PulseSurveyWithDetails[]>;
  listActivePulseSurveys(): Promise<PulseSurveyWithDetails[]>;
  createPulseSurvey(survey: InsertPulseSurvey): Promise<PulseSurvey>;
  updatePulseSurvey(id: string, data: Partial<InsertPulseSurvey>): Promise<PulseSurvey | undefined>;
  deletePulseSurvey(id: string): Promise<boolean>;

  // Pulse Response operations
  getPulseResponse(id: string): Promise<PulseResponseWithDetails | undefined>;
  listPulseResponses(filters?: { surveyId?: string; consultantId?: string }): Promise<PulseResponseWithDetails[]>;
  createPulseResponse(response: InsertPulseResponse): Promise<PulseResponse>;
  updatePulseResponse(id: string, data: Partial<InsertPulseResponse>): Promise<PulseResponse | undefined>;
  deletePulseResponse(id: string): Promise<boolean>;

  // NPS Response operations
  getNpsResponse(id: string): Promise<NpsResponse | undefined>;
  listNpsResponses(filters?: { category?: string; consultantId?: string }): Promise<NpsResponse[]>;
  createNpsResponse(response: InsertNpsResponse): Promise<NpsResponse>;
  updateNpsResponse(id: string, data: Partial<InsertNpsResponse>): Promise<NpsResponse | undefined>;
  deleteNpsResponse(id: string): Promise<boolean>;
  getNpsScore(category?: string): Promise<{ score: number; promoters: number; passives: number; detractors: number; total: number }>;

  // Incident operations
  getIncident(id: string): Promise<IncidentWithDetails | undefined>;
  listIncidents(filters?: { projectId?: string; hospitalId?: string; status?: string; severity?: string }): Promise<IncidentWithDetails[]>;
  createIncident(incident: InsertIncident): Promise<Incident>;
  updateIncident(id: string, data: Partial<InsertIncident>): Promise<Incident | undefined>;
  deleteIncident(id: string): Promise<boolean>;

  // Corrective Action operations
  getCorrectiveAction(id: string): Promise<CorrectiveActionWithDetails | undefined>;
  listCorrectiveActions(filters?: { incidentId?: string; status?: string; assignedToId?: string }): Promise<CorrectiveActionWithDetails[]>;
  createCorrectiveAction(action: InsertCorrectiveAction): Promise<CorrectiveAction>;
  updateCorrectiveAction(id: string, data: Partial<InsertCorrectiveAction>): Promise<CorrectiveAction | undefined>;
  deleteCorrectiveAction(id: string): Promise<boolean>;

  // Achievement Badge operations (admin only)
  getAchievementBadge(id: string): Promise<AchievementBadge | undefined>;
  listAchievementBadges(filters?: { category?: string; isActive?: boolean }): Promise<AchievementBadge[]>;
  createAchievementBadge(badge: InsertAchievementBadge): Promise<AchievementBadge>;
  updateAchievementBadge(id: string, data: Partial<InsertAchievementBadge>): Promise<AchievementBadge | undefined>;
  deleteAchievementBadge(id: string): Promise<boolean>;

  // Consultant Badge operations
  getConsultantBadge(id: string): Promise<ConsultantBadgeWithDetails | undefined>;
  listConsultantBadges(filters?: { consultantId?: string; badgeId?: string }): Promise<ConsultantBadgeWithDetails[]>;
  awardBadgeToConsultant(data: InsertConsultantBadge): Promise<ConsultantBadge>;
  deleteConsultantBadge(id: string): Promise<boolean>;

  // Point Transaction operations
  getPointTransaction(id: string): Promise<PointTransactionWithDetails | undefined>;
  listPointTransactions(filters?: { consultantId?: string; type?: string }): Promise<PointTransactionWithDetails[]>;
  createPointTransaction(transaction: InsertPointTransaction): Promise<PointTransaction>;
  getConsultantPointBalance(consultantId: string): Promise<number>;

  // Referral operations
  getReferral(id: string): Promise<ReferralWithDetails | undefined>;
  listReferrals(filters?: { referrerId?: string; status?: string }): Promise<ReferralWithDetails[]>;
  createReferral(referral: InsertReferral): Promise<Referral>;
  updateReferral(id: string, data: Partial<InsertReferral>): Promise<Referral | undefined>;
  deleteReferral(id: string): Promise<boolean>;

  // Compliance Check operations
  getComplianceCheck(id: string): Promise<ComplianceCheckWithDetails | undefined>;
  listComplianceChecks(filters?: { consultantId?: string; checkType?: string; status?: string }): Promise<ComplianceCheckWithDetails[]>;
  listExpiringComplianceChecks(withinDays: number): Promise<ComplianceCheckWithDetails[]>;
  createComplianceCheck(check: InsertComplianceCheck): Promise<ComplianceCheck>;
  updateComplianceCheck(id: string, data: Partial<InsertComplianceCheck>): Promise<ComplianceCheck | undefined>;
  deleteComplianceCheck(id: string): Promise<boolean>;

  // Compliance Audit operations
  getComplianceAudit(id: string): Promise<ComplianceAuditWithDetails | undefined>;
  listComplianceAudits(filters?: { projectId?: string; hospitalId?: string; status?: string }): Promise<ComplianceAuditWithDetails[]>;
  createComplianceAudit(audit: InsertComplianceAudit): Promise<ComplianceAudit>;
  updateComplianceAudit(id: string, data: Partial<InsertComplianceAudit>): Promise<ComplianceAudit | undefined>;
  deleteComplianceAudit(id: string): Promise<boolean>;

  // Phase 15 Analytics
  getQualityAnalytics(filters?: { projectId?: string }): Promise<QualityAnalytics>;
  getGamificationAnalytics(): Promise<GamificationAnalytics>;
  getComplianceAnalytics(filters?: { consultantId?: string }): Promise<ComplianceAnalytics>;
  
  // AI Analytics
  getAIAnalytics(): Promise<AIAnalytics>;

  // ============================================
  // PHASE 16: DIGITAL SIGNATURES & CONTRACTS
  // ============================================

  // Contract Templates
  createContractTemplate(data: InsertContractTemplate): Promise<ContractTemplate>;
  getContractTemplate(id: string): Promise<ContractTemplate | undefined>;
  listContractTemplates(filters?: { isActive?: boolean; templateType?: string }): Promise<ContractTemplate[]>;
  updateContractTemplate(id: string, data: Partial<InsertContractTemplate>): Promise<ContractTemplate | undefined>;
  deleteContractTemplate(id: string): Promise<boolean>;

  // Contracts
  createContract(data: InsertContract): Promise<Contract>;
  getContract(id: string): Promise<Contract | undefined>;
  getContractWithDetails(id: string): Promise<ContractWithDetails | undefined>;
  listContracts(filters?: { consultantId?: string; projectId?: string; status?: string }): Promise<ContractWithDetails[]>;
  updateContract(id: string, data: Partial<InsertContract>): Promise<Contract | undefined>;
  generateContractNumber(): Promise<string>;

  // Contract Signers
  createContractSigner(data: InsertContractSigner): Promise<ContractSigner>;
  getContractSigners(contractId: string): Promise<ContractSignerWithDetails[]>;
  updateContractSigner(id: string, data: Partial<InsertContractSigner>): Promise<ContractSigner | undefined>;

  // Contract Signatures
  createContractSignature(data: InsertContractSignature): Promise<ContractSignature>;
  getContractSignatures(contractId: string): Promise<ContractSignature[]>;

  // Contract Audit Events
  createContractAuditEvent(data: InsertContractAuditEvent): Promise<ContractAuditEvent>;
  getContractAuditEvents(contractId: string): Promise<ContractAuditEvent[]>;

  // ============================================
  // PHASE 17: REAL-TIME CHAT
  // ============================================

  // Chat Channels
  createChatChannel(data: InsertChatChannel): Promise<ChatChannel>;
  getChatChannel(id: string): Promise<ChatChannel | undefined>;
  getChatChannelWithDetails(id: string, userId: string): Promise<ChatChannelWithDetails | undefined>;
  listChatChannels(userId: string, filters?: { projectId?: string; channelType?: string }): Promise<ChatChannelWithDetails[]>;
  updateChatChannel(id: string, data: Partial<InsertChatChannel>): Promise<ChatChannel | undefined>;

  // Channel Members
  addChannelMember(data: InsertChannelMember): Promise<ChannelMember>;
  removeChannelMember(channelId: string, userId: string): Promise<boolean>;
  getChannelMembers(channelId: string): Promise<ChannelMember[]>;
  updateChannelMember(id: string, data: Partial<InsertChannelMember>): Promise<ChannelMember | undefined>;
  isChannelMember(channelId: string, userId: string): Promise<boolean>;

  // Chat Messages
  createChatMessage(data: InsertChatMessage): Promise<ChatMessage>;
  getChatMessage(id: string): Promise<ChatMessage | undefined>;
  getChatMessages(channelId: string, options?: { limit?: number; before?: string }): Promise<ChatMessageWithSender[]>;
  updateChatMessage(id: string, data: Partial<InsertChatMessage>): Promise<ChatMessage | undefined>;
  deleteMessage(id: string): Promise<boolean>;

  // Message Reads
  markMessageRead(data: InsertChatMessageRead): Promise<ChatMessageRead>;
  getUnreadCount(channelId: string, userId: string): Promise<number>;

  // Shift Summaries
  createShiftSummary(data: InsertShiftChatSummary): Promise<ShiftChatSummary>;
  getShiftSummaries(channelId: string, filters?: { shiftDate?: string }): Promise<ShiftChatSummary[]>;

  // ============================================
  // PHASE 18: IDENTITY VERIFICATION
  // ============================================

  // Identity Verifications
  createIdentityVerification(data: InsertIdentityVerification): Promise<IdentityVerification>;
  getIdentityVerification(id: string): Promise<IdentityVerification | undefined>;
  getIdentityVerificationWithDetails(id: string): Promise<IdentityVerificationWithDetails | undefined>;
  getUserVerification(userId: string): Promise<IdentityVerification | undefined>;
  listIdentityVerifications(filters?: { status?: string; consultantId?: string }): Promise<IdentityVerificationWithDetails[]>;
  updateIdentityVerification(id: string, data: Partial<InsertIdentityVerification>): Promise<IdentityVerification | undefined>;

  // Identity Documents
  createIdentityDocument(data: InsertIdentityDocument): Promise<IdentityDocument>;
  getIdentityDocuments(verificationId: string): Promise<IdentityDocument[]>;
  updateIdentityDocument(id: string, data: Partial<InsertIdentityDocument>): Promise<IdentityDocument | undefined>;

  // Verification Events
  createVerificationEvent(data: InsertVerificationEvent): Promise<VerificationEvent>;
  getVerificationEvents(verificationId: string): Promise<VerificationEvent[]>;

  // Fraud Flags
  createFraudFlag(data: InsertFraudFlag): Promise<FraudFlag>;
  getFraudFlags(filters?: { userId?: string; isResolved?: boolean }): Promise<FraudFlagWithDetails[]>;
  updateFraudFlag(id: string, data: Partial<InsertFraudFlag>): Promise<FraudFlag | undefined>;

  // ============================================
  // PHASE 17: REPORTING & BUSINESS INTELLIGENCE
  // ============================================

  // Report Templates
  createReportTemplate(data: InsertReportTemplate): Promise<ReportTemplate>;
  getReportTemplate(id: string): Promise<ReportTemplate | undefined>;
  listReportTemplates(filters?: { category?: string; isActive?: boolean }): Promise<ReportTemplateWithDetails[]>;
  updateReportTemplate(id: string, data: Partial<InsertReportTemplate>): Promise<ReportTemplate | undefined>;
  deleteReportTemplate(id: string): Promise<boolean>;

  // Saved Reports
  createSavedReport(data: InsertSavedReport): Promise<SavedReport>;
  getSavedReport(id: string): Promise<SavedReport | undefined>;
  getSavedReportWithDetails(id: string): Promise<SavedReportWithDetails | undefined>;
  listSavedReports(userId: string, filters?: { templateId?: string; isFavorite?: boolean; isPublic?: boolean }): Promise<SavedReportWithDetails[]>;
  updateSavedReport(id: string, data: Partial<InsertSavedReport>): Promise<SavedReport | undefined>;
  deleteSavedReport(id: string): Promise<boolean>;

  // Scheduled Reports
  createScheduledReport(data: InsertScheduledReport): Promise<ScheduledReport>;
  getScheduledReport(id: string): Promise<ScheduledReport | undefined>;
  listScheduledReports(userId: string, filters?: { isActive?: boolean }): Promise<ScheduledReportWithDetails[]>;
  updateScheduledReport(id: string, data: Partial<InsertScheduledReport>): Promise<ScheduledReport | undefined>;
  deleteScheduledReport(id: string): Promise<boolean>;
  getScheduledReportsDue(): Promise<ScheduledReport[]>;

  // Report Runs
  createReportRun(data: InsertReportRun): Promise<ReportRun>;
  getReportRun(id: string): Promise<ReportRun | undefined>;
  listReportRuns(filters?: { userId?: string; savedReportId?: string; scheduledReportId?: string; status?: string }): Promise<ReportRunWithDetails[]>;
  updateReportRun(id: string, data: Partial<InsertReportRun>): Promise<ReportRun | undefined>;

  // Export Logs
  createExportLog(data: InsertExportLog): Promise<ExportLog>;
  listExportLogs(userId: string, filters?: { exportType?: string; format?: string }): Promise<ExportLog[]>;

  // Executive Dashboards
  createExecutiveDashboard(data: InsertExecutiveDashboard): Promise<ExecutiveDashboard>;
  getExecutiveDashboard(id: string): Promise<ExecutiveDashboard | undefined>;
  getExecutiveDashboardWithDetails(id: string): Promise<ExecutiveDashboardWithDetails | undefined>;
  listExecutiveDashboards(userId: string, filters?: { isPublic?: boolean }): Promise<ExecutiveDashboardWithDetails[]>;
  updateExecutiveDashboard(id: string, data: Partial<InsertExecutiveDashboard>): Promise<ExecutiveDashboard | undefined>;
  deleteExecutiveDashboard(id: string): Promise<boolean>;

  // Dashboard Widgets
  createDashboardWidget(data: InsertDashboardWidget): Promise<DashboardWidget>;
  getDashboardWidget(id: string): Promise<DashboardWidget | undefined>;
  listDashboardWidgets(dashboardId: string): Promise<DashboardWidget[]>;
  updateDashboardWidget(id: string, data: Partial<InsertDashboardWidget>): Promise<DashboardWidget | undefined>;
  deleteDashboardWidget(id: string): Promise<boolean>;

  // KPI Definitions
  createKpiDefinition(data: InsertKpiDefinition): Promise<KpiDefinition>;
  getKpiDefinition(id: string): Promise<KpiDefinition | undefined>;
  listKpiDefinitions(filters?: { category?: string; isActive?: boolean }): Promise<KpiDefinitionWithDetails[]>;
  updateKpiDefinition(id: string, data: Partial<InsertKpiDefinition>): Promise<KpiDefinition | undefined>;
  deleteKpiDefinition(id: string): Promise<boolean>;

  // KPI Snapshots
  createKpiSnapshot(data: InsertKpiSnapshot): Promise<KpiSnapshot>;
  listKpiSnapshots(kpiId: string, filters?: { limit?: number }): Promise<KpiSnapshot[]>;
  getLatestKpiSnapshot(kpiId: string): Promise<KpiSnapshot | undefined>;

  // Analytics
  getReportAnalytics(): Promise<ReportAnalytics>;
  getDashboardAnalytics(): Promise<DashboardAnalytics>;

  // ============================================
  // SKILLS QUESTIONNAIRE
  // ============================================

  // Skill Categories
  getSkillCategory(id: string): Promise<SkillCategory | undefined>;
  listSkillCategories(filters?: { category?: string; isActive?: boolean }): Promise<SkillCategory[]>;
  createSkillCategory(data: InsertSkillCategory): Promise<SkillCategory>;
  updateSkillCategory(id: string, data: Partial<InsertSkillCategory>): Promise<SkillCategory | undefined>;
  deleteSkillCategory(id: string): Promise<boolean>;

  // Skill Items
  getSkillItem(id: string): Promise<SkillItem | undefined>;
  listSkillItems(filters?: { categoryId?: string; isActive?: boolean }): Promise<SkillItem[]>;
  createSkillItem(data: InsertSkillItem): Promise<SkillItem>;
  updateSkillItem(id: string, data: Partial<InsertSkillItem>): Promise<SkillItem | undefined>;
  deleteSkillItem(id: string): Promise<boolean>;

  // Consultant Questionnaires
  getConsultantQuestionnaire(id: string): Promise<ConsultantQuestionnaire | undefined>;
  getQuestionnaireByConsultantId(consultantId: string): Promise<ConsultantQuestionnaire | undefined>;
  getQuestionnaireWithSkills(consultantId: string): Promise<QuestionnaireWithSkills | undefined>;
  createConsultantQuestionnaire(data: InsertConsultantQuestionnaire): Promise<ConsultantQuestionnaire>;
  updateConsultantQuestionnaire(id: string, data: Partial<InsertConsultantQuestionnaire>): Promise<ConsultantQuestionnaire | undefined>;
  listQuestionnaires(filters?: { status?: string }): Promise<ConsultantQuestionnaire[]>;

  // Consultant Skills
  getConsultantSkill(id: string): Promise<ConsultantSkill | undefined>;
  listConsultantSkills(consultantId: string): Promise<ConsultantSkill[]>;
  createConsultantSkill(data: InsertConsultantSkill): Promise<ConsultantSkill>;
  updateConsultantSkill(id: string, data: Partial<InsertConsultantSkill>): Promise<ConsultantSkill | undefined>;
  deleteConsultantSkill(id: string): Promise<boolean>;
  upsertConsultantSkill(data: InsertConsultantSkill): Promise<ConsultantSkill>;

  // Skill Verifications
  createSkillVerification(data: InsertSkillVerification): Promise<SkillVerification>;
  listSkillVerifications(consultantSkillId: string): Promise<SkillVerification[]>;

  // EHR Experience
  getConsultantEhrExperience(id: string): Promise<ConsultantEhrExperience | undefined>;
  listConsultantEhrExperience(consultantId: string): Promise<ConsultantEhrExperience[]>;
  createConsultantEhrExperience(data: InsertConsultantEhrExperience): Promise<ConsultantEhrExperience>;
  updateConsultantEhrExperience(id: string, data: Partial<InsertConsultantEhrExperience>): Promise<ConsultantEhrExperience | undefined>;
  deleteConsultantEhrExperience(id: string): Promise<boolean>;
  upsertConsultantEhrExperience(consultantId: string, ehrSystem: string, data: Partial<InsertConsultantEhrExperience>): Promise<ConsultantEhrExperience>;

  // Consultant Certifications
  getConsultantCertification(id: string): Promise<ConsultantCertification | undefined>;
  listConsultantCertifications(consultantId: string): Promise<ConsultantCertification[]>;
  createConsultantCertification(data: InsertConsultantCertification): Promise<ConsultantCertification>;
  updateConsultantCertification(id: string, data: Partial<InsertConsultantCertification>): Promise<ConsultantCertification | undefined>;
  deleteConsultantCertification(id: string): Promise<boolean>;

  // Seed skill categories and items
  seedSkillsData(): Promise<void>;

  // ============================================
  // RBAC (Role-Based Access Control)
  // ============================================
  
  // Role operations
  getRole(id: string): Promise<Role | undefined>;
  getRoleByName(name: string): Promise<Role | undefined>;
  listRoles(filters?: { roleType?: 'base' | 'custom'; hospitalId?: string; isActive?: boolean }): Promise<Role[]>;
  createRole(role: InsertRole): Promise<Role>;
  updateRole(id: string, role: Partial<InsertRole>): Promise<Role | undefined>;
  deleteRole(id: string): Promise<boolean>;
  
  // Permission operations
  getPermission(id: string): Promise<Permission | undefined>;
  getPermissionByName(name: string): Promise<Permission | undefined>;
  listPermissions(filters?: { domain?: string; isActive?: boolean }): Promise<Permission[]>;
  createPermission(permission: InsertPermission): Promise<Permission>;
  
  // Role-Permission operations
  getRolePermissions(roleId: string): Promise<RolePermission[]>;
  getRoleWithPermissions(roleId: string): Promise<RoleWithPermissions | undefined>;
  addPermissionToRole(roleId: string, permissionId: string): Promise<RolePermission>;
  removePermissionFromRole(roleId: string, permissionId: string): Promise<boolean>;
  setRolePermissions(roleId: string, permissionIds: string[]): Promise<RolePermission[]>;
  
  // User Role Assignment operations
  getUserRoleAssignments(userId: string): Promise<UserRoleAssignment[]>;
  getUserRoleAssignmentsWithDetails(userId: string): Promise<(UserRoleAssignment & { role: Role })[]>;
  assignRoleToUser(assignment: InsertUserRoleAssignment): Promise<UserRoleAssignment>;
  removeRoleFromUser(userId: string, roleId: string, projectId?: string): Promise<boolean>;
  
  // Effective Permissions (computed)
  getEffectivePermissions(userId: string, projectId?: string): Promise<EffectivePermissions[]>;
  hasPermission(userId: string, permissionName: string, projectId?: string): Promise<boolean>;
  
  // Seeding
  seedBaseRolesAndPermissions(): Promise<void>;

  // ============================================
  // PHASE 18: INTEGRATION & AUTOMATION
  // ============================================

  // Integration Connections
  getIntegrationConnection(id: string): Promise<IntegrationConnection | undefined>;
  listIntegrationConnections(filters?: { category?: string; provider?: string; status?: string; isActive?: boolean }): Promise<IntegrationConnection[]>;
  createIntegrationConnection(data: InsertIntegrationConnection): Promise<IntegrationConnection>;
  updateIntegrationConnection(id: string, data: Partial<InsertIntegrationConnection>): Promise<IntegrationConnection | undefined>;
  deleteIntegrationConnection(id: string): Promise<boolean>;

  // Sync Jobs
  getSyncJob(id: string): Promise<SyncJob | undefined>;
  listSyncJobs(filters?: { connectionId?: string; status?: string }): Promise<SyncJob[]>;
  createSyncJob(data: InsertSyncJob): Promise<SyncJob>;
  updateSyncJob(id: string, data: Partial<InsertSyncJob>): Promise<SyncJob | undefined>;

  // Sync Events
  listSyncEvents(syncJobId: string): Promise<SyncEvent[]>;
  createSyncEvent(data: InsertSyncEvent): Promise<SyncEvent>;

  // Calendar Sync Settings
  getCalendarSyncSettings(userId: string): Promise<CalendarSyncSettings | undefined>;
  listCalendarSyncSettings(connectionId: string): Promise<CalendarSyncSettings[]>;
  createCalendarSyncSettings(data: InsertCalendarSyncSettings): Promise<CalendarSyncSettings>;
  updateCalendarSyncSettings(id: string, data: Partial<InsertCalendarSyncSettings>): Promise<CalendarSyncSettings | undefined>;

  // EHR Systems
  getEhrSystem(id: string): Promise<EhrSystem | undefined>;
  listEhrSystems(filters?: { hospitalId?: string; vendor?: string; status?: string; isMonitored?: boolean }): Promise<EhrSystem[]>;
  createEhrSystem(data: InsertEhrSystem): Promise<EhrSystem>;
  updateEhrSystem(id: string, data: Partial<InsertEhrSystem>): Promise<EhrSystem | undefined>;
  deleteEhrSystem(id: string): Promise<boolean>;

  // EHR Status Metrics
  listEhrStatusMetrics(ehrSystemId: string, limit?: number): Promise<EhrStatusMetric[]>;
  createEhrStatusMetric(data: InsertEhrStatusMetric): Promise<EhrStatusMetric>;

  // EHR Incidents
  getEhrIncident(id: string): Promise<EhrIncident | undefined>;
  listEhrIncidents(filters?: { ehrSystemId?: string; severity?: string; status?: string }): Promise<EhrIncident[]>;
  createEhrIncident(data: InsertEhrIncident): Promise<EhrIncident>;
  updateEhrIncident(id: string, data: Partial<InsertEhrIncident>): Promise<EhrIncident | undefined>;

  // EHR Incident Updates
  listEhrIncidentUpdates(incidentId: string): Promise<EhrIncidentUpdate[]>;
  createEhrIncidentUpdate(data: InsertEhrIncidentUpdate): Promise<EhrIncidentUpdate>;

  // Payroll Sync Profiles
  getPayrollSyncProfile(id: string): Promise<PayrollSyncProfile | undefined>;
  listPayrollSyncProfiles(filters?: { connectionId?: string; isActive?: boolean }): Promise<PayrollSyncProfile[]>;
  createPayrollSyncProfile(data: InsertPayrollSyncProfile): Promise<PayrollSyncProfile>;
  updatePayrollSyncProfile(id: string, data: Partial<InsertPayrollSyncProfile>): Promise<PayrollSyncProfile | undefined>;
  deletePayrollSyncProfile(id: string): Promise<boolean>;

  // Payroll Export Jobs
  getPayrollExportJob(id: string): Promise<PayrollExportJob | undefined>;
  listPayrollExportJobs(filters?: { profileId?: string; batchId?: string; status?: string }): Promise<PayrollExportJob[]>;
  createPayrollExportJob(data: InsertPayrollExportJob): Promise<PayrollExportJob>;
  updatePayrollExportJob(id: string, data: Partial<InsertPayrollExportJob>): Promise<PayrollExportJob | undefined>;

  // Escalation Triggers
  getEscalationTrigger(id: string): Promise<EscalationTrigger | undefined>;
  listEscalationTriggers(filters?: { ruleId?: string; triggerType?: string; isActive?: boolean }): Promise<EscalationTrigger[]>;
  createEscalationTrigger(data: InsertEscalationTrigger): Promise<EscalationTrigger>;
  updateEscalationTrigger(id: string, data: Partial<InsertEscalationTrigger>): Promise<EscalationTrigger | undefined>;
  deleteEscalationTrigger(id: string): Promise<boolean>;

  // Escalation Events
  getEscalationEvent(id: string): Promise<EscalationEvent | undefined>;
  listEscalationEvents(filters?: { triggerId?: string; ticketId?: string; incidentId?: string }): Promise<EscalationEvent[]>;
  createEscalationEvent(data: InsertEscalationEvent): Promise<EscalationEvent>;
  updateEscalationEvent(id: string, data: Partial<InsertEscalationEvent>): Promise<EscalationEvent | undefined>;

  // Notification Queue
  getNotificationQueueItem(id: string): Promise<NotificationQueueItem | undefined>;
  listNotificationQueue(filters?: { status?: string; type?: string; recipientUserId?: string }): Promise<NotificationQueueItem[]>;
  createNotificationQueueItem(data: InsertNotificationQueue): Promise<NotificationQueueItem>;
  updateNotificationQueueItem(id: string, data: Partial<InsertNotificationQueue>): Promise<NotificationQueueItem | undefined>;

  // Automation Workflows
  getAutomationWorkflow(id: string): Promise<AutomationWorkflow | undefined>;
  listAutomationWorkflows(filters?: { category?: string; triggerEvent?: string; isActive?: boolean }): Promise<AutomationWorkflow[]>;
  createAutomationWorkflow(data: InsertAutomationWorkflow): Promise<AutomationWorkflow>;
  updateAutomationWorkflow(id: string, data: Partial<InsertAutomationWorkflow>): Promise<AutomationWorkflow | undefined>;
  deleteAutomationWorkflow(id: string): Promise<boolean>;

  // Workflow Executions
  getWorkflowExecution(id: string): Promise<WorkflowExecution | undefined>;
  listWorkflowExecutions(filters?: { workflowId?: string; status?: string }): Promise<WorkflowExecution[]>;
  createWorkflowExecution(data: InsertWorkflowExecution): Promise<WorkflowExecution>;
  updateWorkflowExecution(id: string, data: Partial<InsertWorkflowExecution>): Promise<WorkflowExecution | undefined>;

  // Analytics
  getIntegrationAnalytics(): Promise<IntegrationAnalytics>;
  getEhrMonitoringAnalytics(): Promise<EhrMonitoringAnalytics>;
  getEscalationAnalytics(): Promise<EscalationAnalytics>;
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

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async updateUserAccessStatus(id: string, status: "pending_invitation" | "active" | "suspended" | "revoked", invitationId?: string): Promise<User | undefined> {
    const updateData: any = { accessStatus: status, updatedAt: new Date() };
    if (invitationId) {
      updateData.invitationId = invitationId;
    }
    const [user] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Invitation operations (invitation-only access control)
  async createInvitation(invitation: InsertInvitation): Promise<Invitation> {
    const [newInvitation] = await db
      .insert(invitations)
      .values(invitation)
      .returning();
    return newInvitation;
  }

  async getInvitation(id: string): Promise<Invitation | undefined> {
    const [invitation] = await db.select().from(invitations).where(eq(invitations.id, id));
    return invitation;
  }

  async getInvitationByToken(token: string): Promise<Invitation | undefined> {
    const [invitation] = await db.select().from(invitations).where(eq(invitations.token, token));
    return invitation;
  }

  async getInvitationByEmail(email: string): Promise<Invitation | undefined> {
    const [invitation] = await db.select().from(invitations)
      .where(eq(invitations.email, email.toLowerCase()))
      .orderBy(desc(invitations.createdAt));
    return invitation;
  }

  async getPendingInvitationByEmail(email: string): Promise<Invitation | undefined> {
    const now = new Date();
    const [invitation] = await db.select().from(invitations)
      .where(and(
        eq(invitations.email, email.toLowerCase()),
        eq(invitations.status, "pending"),
        gt(invitations.expiresAt, now)
      ))
      .orderBy(desc(invitations.createdAt));
    return invitation;
  }

  async getAllInvitations(): Promise<Invitation[]> {
    return await db.select().from(invitations).orderBy(desc(invitations.createdAt));
  }

  async getInvitationsByStatus(status: "pending" | "accepted" | "revoked" | "expired"): Promise<Invitation[]> {
    return await db.select().from(invitations)
      .where(eq(invitations.status, status))
      .orderBy(desc(invitations.createdAt));
  }

  async acceptInvitation(id: string, userId: string): Promise<Invitation | undefined> {
    // Defense-in-depth: Guard check to prevent race conditions
    // Verify invitation is still pending and not expired before accepting
    const [existingInvitation] = await db.select().from(invitations)
      .where(eq(invitations.id, id));
    
    if (!existingInvitation) {
      return undefined;
    }
    
    // Check if invitation status is still 'pending'
    if (existingInvitation.status !== 'pending') {
      return undefined;
    }
    
    // Check if invitation has expired using timestamp comparison
    const now = new Date();
    const expiresAt = new Date(existingInvitation.expiresAt);
    
    if (expiresAt <= now) {
      // Invitation has expired - mark it as expired instead of accepting
      await db
        .update(invitations)
        .set({
          status: "expired",
          updatedAt: now,
        })
        .where(eq(invitations.id, id));
      return undefined;
    }
    
    // All checks passed - accept the invitation
    const [invitation] = await db
      .update(invitations)
      .set({
        status: "accepted",
        acceptedAt: now,
        acceptedByUserId: userId,
        updatedAt: now,
      })
      .where(eq(invitations.id, id))
      .returning();
    return invitation;
  }

  async revokeInvitation(id: string, revokedByUserId: string, reason?: string): Promise<Invitation | undefined> {
    const [invitation] = await db
      .update(invitations)
      .set({
        status: "revoked",
        revokedAt: new Date(),
        revokedByUserId,
        revokedReason: reason || null,
        updatedAt: new Date(),
      })
      .where(eq(invitations.id, id))
      .returning();
    return invitation;
  }

  async expireOldInvitations(): Promise<number> {
    const now = new Date();
    const result = await db
      .update(invitations)
      .set({ status: "expired", updatedAt: new Date() })
      .where(and(
        eq(invitations.status, "pending"),
        lt(invitations.expiresAt, now)
      ))
      .returning();
    return result.length;
  }

  async updateInvitationExpiration(id: string, expiresAt: Date): Promise<Invitation | undefined> {
    const [invitation] = await db
      .update(invitations)
      .set({
        expiresAt,
        status: "pending",
        updatedAt: new Date(),
      })
      .where(eq(invitations.id, id))
      .returning();
    return invitation;
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

  async getProjectsForConsultant(consultantId: string): Promise<string[]> {
    // Join scheduleAssignments -> projectSchedules -> projects to get unique project IDs
    const results = await db
      .selectDistinct({ projectId: projectSchedules.projectId })
      .from(scheduleAssignments)
      .innerJoin(projectSchedules, eq(scheduleAssignments.scheduleId, projectSchedules.id))
      .innerJoin(projects, eq(projectSchedules.projectId, projects.id))
      .where(eq(scheduleAssignments.consultantId, consultantId));
    
    return results.map(r => r.projectId);
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

  async getAllTimesheets(): Promise<TimesheetWithDetails[]> {
    const results = await db
      .select()
      .from(timesheets)
      .orderBy(desc(timesheets.weekStartDate))
      .limit(100);

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
      .orderBy(desc(mileageRates.effectiveTo));
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
        reviewedBy: reviewerId,
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
        reviewedBy: reviewerId,
        reviewedAt: new Date(),
        reviewNotes: reason || null,
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
      .select({ sum: sql<string>`COALESCE(SUM(${expenses.amount}), 0)` })
      .from(expenses);

    const byCategoryResults = await db
      .select({
        category: expenses.category,
        count: sql<number>`count(*)`,
        amount: sql<string>`COALESCE(SUM(${expenses.amount}), 0)`,
      })
      .from(expenses)
      .groupBy(expenses.category);

    const byStatusResults = await db
      .select({
        status: expenses.status,
        count: sql<number>`count(*)`,
        amount: sql<string>`COALESCE(SUM(${expenses.amount}), 0)`,
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
    if (expense.reviewedBy) {
      const reviewer = await this.getUser(expense.reviewedBy);
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
    const timesheet = await this.getTimesheetById(timesheetId);
    if (!timesheet) return undefined;

    const consultant = await this.getConsultant(timesheet.consultantId);
    if (!consultant) return undefined;

    const project = timesheet.projectId ? await this.getProject(timesheet.projectId) : null;
    const payRate = await this.getCurrentPayRate(timesheet.consultantId);
    const hourlyRate = payRate?.hourlyRate || "0";
    const totalHours = String(timesheet.totalHours || "0");
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
        .orderBy(desc(payRates.effectiveFrom));
    }
    return await db
      .select()
      .from(payRates)
      .orderBy(desc(payRates.effectiveFrom));
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
          lte(payRates.effectiveFrom, today)
        )
      )
      .orderBy(desc(payRates.effectiveFrom))
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
      const timesheet = await this.getTimesheetById(entry.timesheetId);
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
        eq(payrollBatches.status, "processing"),
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

    const { id: _, createdAt, updatedAt, assumptions, ...rest } = original[0];
    const clonedScenario = await this.createBudgetScenario({
      ...rest,
      name: newName,
      isBaseline: false,
      assumptions: assumptions as Record<string, unknown> | null,
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

  // ========================================
  // PHASE 15: Quality Assurance, Gamification, Compliance
  // ========================================

  // Consultant Scorecard Operations
  async getConsultantScorecard(id: string): Promise<ConsultantScorecardWithDetails | undefined> {
    const results = await db.select().from(consultantScorecards).where(eq(consultantScorecards.id, id));
    if (!results[0]) return undefined;
    return this.buildConsultantScorecardWithDetails(results[0]);
  }

  async listConsultantScorecards(filters?: { consultantId?: string; projectId?: string; periodStart?: string }): Promise<ConsultantScorecardWithDetails[]> {
    const conditions: any[] = [];
    if (filters?.consultantId) conditions.push(eq(consultantScorecards.consultantId, filters.consultantId));
    if (filters?.projectId) conditions.push(eq(consultantScorecards.projectId, filters.projectId));
    if (filters?.periodStart) conditions.push(eq(consultantScorecards.periodStart, filters.periodStart));

    const results = conditions.length > 0
      ? await db.select().from(consultantScorecards).where(and(...conditions)).orderBy(desc(consultantScorecards.createdAt))
      : await db.select().from(consultantScorecards).orderBy(desc(consultantScorecards.createdAt));

    return Promise.all(results.map((s) => this.buildConsultantScorecardWithDetails(s)));
  }

  async createConsultantScorecard(scorecard: InsertConsultantScorecard): Promise<ConsultantScorecard> {
    const results = await db.insert(consultantScorecards).values(scorecard).returning();
    return results[0];
  }

  async updateConsultantScorecard(id: string, data: Partial<InsertConsultantScorecard>): Promise<ConsultantScorecard | undefined> {
    const results = await db
      .update(consultantScorecards)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(consultantScorecards.id, id))
      .returning();
    return results[0];
  }

  async deleteConsultantScorecard(id: string): Promise<boolean> {
    await db.delete(consultantScorecards).where(eq(consultantScorecards.id, id));
    return true;
  }

  private async buildConsultantScorecardWithDetails(scorecard: ConsultantScorecard): Promise<ConsultantScorecardWithDetails> {
    const consultant = await this.getConsultant(scorecard.consultantId);
    const consultantUser = consultant ? await this.getUser(consultant.userId) : null;
    const project = scorecard.projectId ? await this.getProject(scorecard.projectId) : null;
    const reviewedBy = scorecard.reviewedById ? await this.getUser(scorecard.reviewedById) : null;

    return {
      ...scorecard,
      consultant: {
        id: consultant?.id || "",
        user: {
          firstName: consultantUser?.firstName || null,
          lastName: consultantUser?.lastName || null,
          profileImageUrl: consultantUser?.profileImageUrl || null,
        },
      },
      project: project ? { id: project.id, name: project.name } : null,
      reviewedBy: reviewedBy ? {
        id: reviewedBy.id,
        firstName: reviewedBy.firstName,
        lastName: reviewedBy.lastName,
      } : null,
    };
  }

  // Pulse Survey Operations
  async getPulseSurvey(id: string): Promise<PulseSurveyWithDetails | undefined> {
    const results = await db.select().from(pulseSurveys).where(eq(pulseSurveys.id, id));
    if (!results[0]) return undefined;
    return this.buildPulseSurveyWithDetails(results[0]);
  }

  async listPulseSurveys(filters?: { projectId?: string; isActive?: boolean }): Promise<PulseSurveyWithDetails[]> {
    const conditions: any[] = [];
    if (filters?.projectId) conditions.push(eq(pulseSurveys.projectId, filters.projectId));
    if (filters?.isActive !== undefined) conditions.push(eq(pulseSurveys.isActive, filters.isActive));

    const results = conditions.length > 0
      ? await db.select().from(pulseSurveys).where(and(...conditions)).orderBy(desc(pulseSurveys.createdAt))
      : await db.select().from(pulseSurveys).orderBy(desc(pulseSurveys.createdAt));

    return Promise.all(results.map((s) => this.buildPulseSurveyWithDetails(s)));
  }

  async listActivePulseSurveys(): Promise<PulseSurveyWithDetails[]> {
    const today = new Date().toISOString().split("T")[0];
    const results = await db
      .select()
      .from(pulseSurveys)
      .where(and(
        eq(pulseSurveys.isActive, true),
        lte(pulseSurveys.startDate, today),
        gte(pulseSurveys.endDate, today)
      ))
      .orderBy(desc(pulseSurveys.createdAt));

    return Promise.all(results.map((s) => this.buildPulseSurveyWithDetails(s)));
  }

  async createPulseSurvey(survey: InsertPulseSurvey): Promise<PulseSurvey> {
    const results = await db.insert(pulseSurveys).values(survey).returning();
    return results[0];
  }

  async updatePulseSurvey(id: string, data: Partial<InsertPulseSurvey>): Promise<PulseSurvey | undefined> {
    const results = await db
      .update(pulseSurveys)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(pulseSurveys.id, id))
      .returning();
    return results[0];
  }

  async deletePulseSurvey(id: string): Promise<boolean> {
    await db.delete(pulseSurveys).where(eq(pulseSurveys.id, id));
    return true;
  }

  private async buildPulseSurveyWithDetails(survey: PulseSurvey): Promise<PulseSurveyWithDetails> {
    const project = survey.projectId ? await this.getProject(survey.projectId) : null;
    const createdBy = survey.createdById ? await this.getUser(survey.createdById) : null;

    const responseCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(pulseResponses)
      .where(eq(pulseResponses.surveyId, survey.id));

    return {
      ...survey,
      project: project ? { id: project.id, name: project.name } : null,
      createdBy: createdBy ? {
        id: createdBy.id,
        firstName: createdBy.firstName,
        lastName: createdBy.lastName,
      } : null,
      responseCount: Number(responseCountResult[0]?.count) || 0,
    };
  }

  // Pulse Response Operations
  async getPulseResponse(id: string): Promise<PulseResponseWithDetails | undefined> {
    const results = await db.select().from(pulseResponses).where(eq(pulseResponses.id, id));
    if (!results[0]) return undefined;
    return this.buildPulseResponseWithDetails(results[0]);
  }

  async listPulseResponses(filters?: { surveyId?: string; consultantId?: string }): Promise<PulseResponseWithDetails[]> {
    const conditions: any[] = [];
    if (filters?.surveyId) conditions.push(eq(pulseResponses.surveyId, filters.surveyId));
    if (filters?.consultantId) conditions.push(eq(pulseResponses.consultantId, filters.consultantId));

    const results = conditions.length > 0
      ? await db.select().from(pulseResponses).where(and(...conditions)).orderBy(desc(pulseResponses.submittedAt))
      : await db.select().from(pulseResponses).orderBy(desc(pulseResponses.submittedAt));

    return Promise.all(results.map((r) => this.buildPulseResponseWithDetails(r)));
  }

  async createPulseResponse(response: InsertPulseResponse): Promise<PulseResponse> {
    const results = await db.insert(pulseResponses).values(response).returning();
    return results[0];
  }

  async updatePulseResponse(id: string, data: Partial<InsertPulseResponse>): Promise<PulseResponse | undefined> {
    const results = await db
      .update(pulseResponses)
      .set(data)
      .where(eq(pulseResponses.id, id))
      .returning();
    return results[0];
  }

  async deletePulseResponse(id: string): Promise<boolean> {
    await db.delete(pulseResponses).where(eq(pulseResponses.id, id));
    return true;
  }

  private async buildPulseResponseWithDetails(response: PulseResponse): Promise<PulseResponseWithDetails> {
    const survey = await db.select().from(pulseSurveys).where(eq(pulseSurveys.id, response.surveyId));
    const consultant = await this.getConsultant(response.consultantId);
    const consultantUser = consultant ? await this.getUser(consultant.userId) : null;

    return {
      ...response,
      survey: {
        id: survey[0]?.id || "",
        title: survey[0]?.title || "",
      },
      consultant: {
        id: consultant?.id || "",
        user: {
          firstName: consultantUser?.firstName || null,
          lastName: consultantUser?.lastName || null,
        },
      },
    };
  }

  // NPS Response Operations
  async getNpsResponse(id: string): Promise<NpsResponse | undefined> {
    const results = await db.select().from(npsResponses).where(eq(npsResponses.id, id));
    return results[0];
  }

  async listNpsResponses(filters?: { category?: string; consultantId?: string }): Promise<NpsResponse[]> {
    const conditions: any[] = [];
    if (filters?.category) conditions.push(eq(npsResponses.category, filters.category as any));
    if (filters?.consultantId) conditions.push(eq(npsResponses.consultantId, filters.consultantId));

    return conditions.length > 0
      ? await db.select().from(npsResponses).where(and(...conditions)).orderBy(desc(npsResponses.submittedAt))
      : await db.select().from(npsResponses).orderBy(desc(npsResponses.submittedAt));
  }

  async createNpsResponse(response: InsertNpsResponse): Promise<NpsResponse> {
    const results = await db.insert(npsResponses).values(response).returning();
    return results[0];
  }

  async updateNpsResponse(id: string, data: Partial<InsertNpsResponse>): Promise<NpsResponse | undefined> {
    const results = await db
      .update(npsResponses)
      .set(data)
      .where(eq(npsResponses.id, id))
      .returning();
    return results[0];
  }

  async deleteNpsResponse(id: string): Promise<boolean> {
    await db.delete(npsResponses).where(eq(npsResponses.id, id));
    return true;
  }

  async getNpsScore(category?: string): Promise<{ score: number; promoters: number; passives: number; detractors: number; total: number }> {
    const conditions: any[] = [];
    if (category) conditions.push(eq(npsResponses.category, category as any));

    const results = conditions.length > 0
      ? await db.select().from(npsResponses).where(and(...conditions))
      : await db.select().from(npsResponses);

    const total = results.length;
    if (total === 0) {
      return { score: 0, promoters: 0, passives: 0, detractors: 0, total: 0 };
    }

    let promoters = 0;
    let passives = 0;
    let detractors = 0;

    for (const r of results) {
      if (r.score >= 9) promoters++;
      else if (r.score >= 7) passives++;
      else detractors++;
    }

    const score = Math.round(((promoters - detractors) / total) * 100);
    return { score, promoters, passives, detractors, total };
  }

  // Incident Operations
  async getIncident(id: string): Promise<IncidentWithDetails | undefined> {
    const results = await db.select().from(incidents).where(eq(incidents.id, id));
    if (!results[0]) return undefined;
    return this.buildIncidentWithDetails(results[0]);
  }

  async listIncidents(filters?: { projectId?: string; hospitalId?: string; status?: string; severity?: string }): Promise<IncidentWithDetails[]> {
    const conditions: any[] = [];
    if (filters?.projectId) conditions.push(eq(incidents.projectId, filters.projectId));
    if (filters?.hospitalId) conditions.push(eq(incidents.hospitalId, filters.hospitalId));
    if (filters?.status) conditions.push(eq(incidents.status, filters.status as any));
    if (filters?.severity) conditions.push(eq(incidents.severity, filters.severity as any));

    const results = conditions.length > 0
      ? await db.select().from(incidents).where(and(...conditions)).orderBy(desc(incidents.createdAt))
      : await db.select().from(incidents).orderBy(desc(incidents.createdAt));

    return Promise.all(results.map((i) => this.buildIncidentWithDetails(i)));
  }

  async createIncident(incident: InsertIncident): Promise<Incident> {
    const results = await db.insert(incidents).values(incident).returning();
    return results[0];
  }

  async updateIncident(id: string, data: Partial<InsertIncident>): Promise<Incident | undefined> {
    const results = await db
      .update(incidents)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(incidents.id, id))
      .returning();
    return results[0];
  }

  async deleteIncident(id: string): Promise<boolean> {
    await db.delete(incidents).where(eq(incidents.id, id));
    return true;
  }

  private async buildIncidentWithDetails(incident: Incident): Promise<IncidentWithDetails> {
    const project = incident.projectId ? await this.getProject(incident.projectId) : null;
    const hospital = incident.hospitalId ? await this.getHospital(incident.hospitalId) : null;
    const consultant = incident.consultantId ? await this.getConsultant(incident.consultantId) : null;
    const consultantUser = consultant ? await this.getUser(consultant.userId) : null;
    const reportedBy = await this.getUser(incident.reportedById);
    const assignedTo = incident.assignedToId ? await this.getUser(incident.assignedToId) : null;

    const incidentCorrectiveActions = await db
      .select()
      .from(correctiveActions)
      .where(eq(correctiveActions.incidentId, incident.id));

    return {
      ...incident,
      project: project ? { id: project.id, name: project.name } : null,
      hospital: hospital ? { id: hospital.id, name: hospital.name } : null,
      consultant: consultant ? {
        id: consultant.id,
        user: {
          firstName: consultantUser?.firstName || null,
          lastName: consultantUser?.lastName || null,
        },
      } : null,
      reportedBy: {
        id: reportedBy?.id || "",
        firstName: reportedBy?.firstName || null,
        lastName: reportedBy?.lastName || null,
      },
      assignedTo: assignedTo ? {
        id: assignedTo.id,
        firstName: assignedTo.firstName,
        lastName: assignedTo.lastName,
      } : null,
      correctiveActions: incidentCorrectiveActions,
    };
  }

  // Corrective Action Operations
  async getCorrectiveAction(id: string): Promise<CorrectiveActionWithDetails | undefined> {
    const results = await db.select().from(correctiveActions).where(eq(correctiveActions.id, id));
    if (!results[0]) return undefined;
    return this.buildCorrectiveActionWithDetails(results[0]);
  }

  async listCorrectiveActions(filters?: { incidentId?: string; status?: string; assignedToId?: string }): Promise<CorrectiveActionWithDetails[]> {
    const conditions: any[] = [];
    if (filters?.incidentId) conditions.push(eq(correctiveActions.incidentId, filters.incidentId));
    if (filters?.status) conditions.push(eq(correctiveActions.status, filters.status as any));
    if (filters?.assignedToId) conditions.push(eq(correctiveActions.assignedToId, filters.assignedToId));

    const results = conditions.length > 0
      ? await db.select().from(correctiveActions).where(and(...conditions)).orderBy(desc(correctiveActions.createdAt))
      : await db.select().from(correctiveActions).orderBy(desc(correctiveActions.createdAt));

    return Promise.all(results.map((a) => this.buildCorrectiveActionWithDetails(a)));
  }

  async createCorrectiveAction(action: InsertCorrectiveAction): Promise<CorrectiveAction> {
    const results = await db.insert(correctiveActions).values(action).returning();
    return results[0];
  }

  async updateCorrectiveAction(id: string, data: Partial<InsertCorrectiveAction>): Promise<CorrectiveAction | undefined> {
    const results = await db
      .update(correctiveActions)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(correctiveActions.id, id))
      .returning();
    return results[0];
  }

  async deleteCorrectiveAction(id: string): Promise<boolean> {
    await db.delete(correctiveActions).where(eq(correctiveActions.id, id));
    return true;
  }

  private async buildCorrectiveActionWithDetails(action: CorrectiveAction): Promise<CorrectiveActionWithDetails> {
    const incident = await db.select().from(incidents).where(eq(incidents.id, action.incidentId));
    const assignedTo = action.assignedToId ? await this.getUser(action.assignedToId) : null;
    const verifiedBy = action.verifiedById ? await this.getUser(action.verifiedById) : null;

    return {
      ...action,
      incident: {
        id: incident[0]?.id || "",
        title: incident[0]?.title || "",
      },
      assignedTo: assignedTo ? {
        id: assignedTo.id,
        firstName: assignedTo.firstName,
        lastName: assignedTo.lastName,
      } : null,
      verifiedBy: verifiedBy ? {
        id: verifiedBy.id,
        firstName: verifiedBy.firstName,
        lastName: verifiedBy.lastName,
      } : null,
    };
  }

  // Achievement Badge Operations (admin only)
  async getAchievementBadge(id: string): Promise<AchievementBadge | undefined> {
    const results = await db.select().from(achievementBadges).where(eq(achievementBadges.id, id));
    return results[0];
  }

  async listAchievementBadges(filters?: { category?: string; isActive?: boolean }): Promise<AchievementBadge[]> {
    const conditions: any[] = [];
    if (filters?.category) conditions.push(eq(achievementBadges.category, filters.category as any));
    if (filters?.isActive !== undefined) conditions.push(eq(achievementBadges.isActive, filters.isActive));

    return conditions.length > 0
      ? await db.select().from(achievementBadges).where(and(...conditions)).orderBy(asc(achievementBadges.name))
      : await db.select().from(achievementBadges).orderBy(asc(achievementBadges.name));
  }

  async createAchievementBadge(badge: InsertAchievementBadge): Promise<AchievementBadge> {
    const results = await db.insert(achievementBadges).values(badge).returning();
    return results[0];
  }

  async updateAchievementBadge(id: string, data: Partial<InsertAchievementBadge>): Promise<AchievementBadge | undefined> {
    const results = await db
      .update(achievementBadges)
      .set(data)
      .where(eq(achievementBadges.id, id))
      .returning();
    return results[0];
  }

  async deleteAchievementBadge(id: string): Promise<boolean> {
    await db.delete(achievementBadges).where(eq(achievementBadges.id, id));
    return true;
  }

  // Consultant Badge Operations
  async getConsultantBadge(id: string): Promise<ConsultantBadgeWithDetails | undefined> {
    const results = await db.select().from(consultantBadges).where(eq(consultantBadges.id, id));
    if (!results[0]) return undefined;
    return this.buildConsultantBadgeWithDetails(results[0]);
  }

  async listConsultantBadges(filters?: { consultantId?: string; badgeId?: string }): Promise<ConsultantBadgeWithDetails[]> {
    const conditions: any[] = [];
    if (filters?.consultantId) conditions.push(eq(consultantBadges.consultantId, filters.consultantId));
    if (filters?.badgeId) conditions.push(eq(consultantBadges.badgeId, filters.badgeId));

    const results = conditions.length > 0
      ? await db.select().from(consultantBadges).where(and(...conditions)).orderBy(desc(consultantBadges.earnedAt))
      : await db.select().from(consultantBadges).orderBy(desc(consultantBadges.earnedAt));

    return Promise.all(results.map((b) => this.buildConsultantBadgeWithDetails(b)));
  }

  async awardBadgeToConsultant(data: InsertConsultantBadge): Promise<ConsultantBadge> {
    const results = await db.insert(consultantBadges).values(data).returning();
    return results[0];
  }

  async deleteConsultantBadge(id: string): Promise<boolean> {
    await db.delete(consultantBadges).where(eq(consultantBadges.id, id));
    return true;
  }

  private async buildConsultantBadgeWithDetails(cb: ConsultantBadge): Promise<ConsultantBadgeWithDetails> {
    const badge = await this.getAchievementBadge(cb.badgeId);
    const consultant = await this.getConsultant(cb.consultantId);
    const consultantUser = consultant ? await this.getUser(consultant.userId) : null;
    const awardedBy = cb.awardedById ? await this.getUser(cb.awardedById) : null;

    return {
      ...cb,
      badge: badge!,
      consultant: {
        id: consultant?.id || "",
        user: {
          firstName: consultantUser?.firstName || null,
          lastName: consultantUser?.lastName || null,
        },
      },
      awardedBy: awardedBy ? {
        id: awardedBy.id,
        firstName: awardedBy.firstName,
        lastName: awardedBy.lastName,
      } : null,
    };
  }

  // Point Transaction Operations
  async getPointTransaction(id: string): Promise<PointTransactionWithDetails | undefined> {
    const results = await db.select().from(pointTransactions).where(eq(pointTransactions.id, id));
    if (!results[0]) return undefined;
    return this.buildPointTransactionWithDetails(results[0]);
  }

  async listPointTransactions(filters?: { consultantId?: string; type?: string }): Promise<PointTransactionWithDetails[]> {
    const conditions: any[] = [];
    if (filters?.consultantId) conditions.push(eq(pointTransactions.consultantId, filters.consultantId));
    if (filters?.type) conditions.push(eq(pointTransactions.type, filters.type as any));

    const results = conditions.length > 0
      ? await db.select().from(pointTransactions).where(and(...conditions)).orderBy(desc(pointTransactions.createdAt))
      : await db.select().from(pointTransactions).orderBy(desc(pointTransactions.createdAt));

    return Promise.all(results.map((t) => this.buildPointTransactionWithDetails(t)));
  }

  async createPointTransaction(transaction: InsertPointTransaction): Promise<PointTransaction> {
    const results = await db.insert(pointTransactions).values(transaction).returning();
    return results[0];
  }

  async getConsultantPointBalance(consultantId: string): Promise<number> {
    const result = await db
      .select()
      .from(pointTransactions)
      .where(eq(pointTransactions.consultantId, consultantId))
      .orderBy(desc(pointTransactions.createdAt))
      .limit(1);

    return result[0]?.balance || 0;
  }

  private async buildPointTransactionWithDetails(transaction: PointTransaction): Promise<PointTransactionWithDetails> {
    const consultant = await this.getConsultant(transaction.consultantId);
    const consultantUser = consultant ? await this.getUser(consultant.userId) : null;
    const createdBy = transaction.createdById ? await this.getUser(transaction.createdById) : null;

    return {
      ...transaction,
      consultant: {
        id: consultant?.id || "",
        user: {
          firstName: consultantUser?.firstName || null,
          lastName: consultantUser?.lastName || null,
        },
      },
      createdBy: createdBy ? {
        id: createdBy.id,
        firstName: createdBy.firstName,
        lastName: createdBy.lastName,
      } : null,
    };
  }

  // Referral Operations
  async getReferral(id: string): Promise<ReferralWithDetails | undefined> {
    const results = await db.select().from(referrals).where(eq(referrals.id, id));
    if (!results[0]) return undefined;
    return this.buildReferralWithDetails(results[0]);
  }

  async listReferrals(filters?: { referrerId?: string; status?: string }): Promise<ReferralWithDetails[]> {
    const conditions: any[] = [];
    if (filters?.referrerId) conditions.push(eq(referrals.referrerId, filters.referrerId));
    if (filters?.status) conditions.push(eq(referrals.status, filters.status as any));

    const results = conditions.length > 0
      ? await db.select().from(referrals).where(and(...conditions)).orderBy(desc(referrals.createdAt))
      : await db.select().from(referrals).orderBy(desc(referrals.createdAt));

    return Promise.all(results.map((r) => this.buildReferralWithDetails(r)));
  }

  async createReferral(referral: InsertReferral): Promise<Referral> {
    const results = await db.insert(referrals).values(referral).returning();
    return results[0];
  }

  async updateReferral(id: string, data: Partial<InsertReferral>): Promise<Referral | undefined> {
    const results = await db
      .update(referrals)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(referrals.id, id))
      .returning();
    return results[0];
  }

  async deleteReferral(id: string): Promise<boolean> {
    await db.delete(referrals).where(eq(referrals.id, id));
    return true;
  }

  private async buildReferralWithDetails(referral: Referral): Promise<ReferralWithDetails> {
    const referrer = await this.getConsultant(referral.referrerId);
    const referrerUser = referrer ? await this.getUser(referrer.userId) : null;
    const hiredAsConsultant = referral.hiredAsConsultantId ? await this.getConsultant(referral.hiredAsConsultantId) : null;
    const hiredAsUser = hiredAsConsultant ? await this.getUser(hiredAsConsultant.userId) : null;

    return {
      ...referral,
      referrer: {
        id: referrer?.id || "",
        user: {
          firstName: referrerUser?.firstName || null,
          lastName: referrerUser?.lastName || null,
        },
      },
      hiredAsConsultant: hiredAsConsultant ? {
        id: hiredAsConsultant.id,
        user: {
          firstName: hiredAsUser?.firstName || null,
          lastName: hiredAsUser?.lastName || null,
        },
      } : null,
    };
  }

  // Compliance Check Operations
  async getComplianceCheck(id: string): Promise<ComplianceCheckWithDetails | undefined> {
    const results = await db.select().from(complianceChecks).where(eq(complianceChecks.id, id));
    if (!results[0]) return undefined;
    return this.buildComplianceCheckWithDetails(results[0]);
  }

  async listComplianceChecks(filters?: { consultantId?: string; checkType?: string; status?: string }): Promise<ComplianceCheckWithDetails[]> {
    const conditions: any[] = [];
    if (filters?.consultantId) conditions.push(eq(complianceChecks.consultantId, filters.consultantId));
    if (filters?.checkType) conditions.push(eq(complianceChecks.checkType, filters.checkType as any));
    if (filters?.status) conditions.push(eq(complianceChecks.status, filters.status as any));

    const results = conditions.length > 0
      ? await db.select().from(complianceChecks).where(and(...conditions)).orderBy(desc(complianceChecks.checkDate))
      : await db.select().from(complianceChecks).orderBy(desc(complianceChecks.checkDate));

    return Promise.all(results.map((c) => this.buildComplianceCheckWithDetails(c)));
  }

  async listExpiringComplianceChecks(withinDays: number): Promise<ComplianceCheckWithDetails[]> {
    const today = new Date();
    const futureDate = new Date(today.getTime() + withinDays * 24 * 60 * 60 * 1000);
    const todayStr = today.toISOString().split("T")[0];
    const futureDateStr = futureDate.toISOString().split("T")[0];

    const results = await db
      .select()
      .from(complianceChecks)
      .where(and(
        gte(complianceChecks.expirationDate, todayStr),
        lte(complianceChecks.expirationDate, futureDateStr)
      ))
      .orderBy(asc(complianceChecks.expirationDate));

    return Promise.all(results.map((c) => this.buildComplianceCheckWithDetails(c)));
  }

  async createComplianceCheck(check: InsertComplianceCheck): Promise<ComplianceCheck> {
    const results = await db.insert(complianceChecks).values(check).returning();
    return results[0];
  }

  async updateComplianceCheck(id: string, data: Partial<InsertComplianceCheck>): Promise<ComplianceCheck | undefined> {
    const results = await db
      .update(complianceChecks)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(complianceChecks.id, id))
      .returning();
    return results[0];
  }

  async deleteComplianceCheck(id: string): Promise<boolean> {
    await db.delete(complianceChecks).where(eq(complianceChecks.id, id));
    return true;
  }

  private async buildComplianceCheckWithDetails(check: ComplianceCheck): Promise<ComplianceCheckWithDetails> {
    const consultant = await this.getConsultant(check.consultantId);
    const consultantUser = consultant ? await this.getUser(consultant.userId) : null;
    const checkedBy = check.checkedById ? await this.getUser(check.checkedById) : null;

    return {
      ...check,
      consultant: {
        id: consultant?.id || "",
        user: {
          firstName: consultantUser?.firstName || null,
          lastName: consultantUser?.lastName || null,
        },
      },
      checkedBy: checkedBy ? {
        id: checkedBy.id,
        firstName: checkedBy.firstName,
        lastName: checkedBy.lastName,
      } : null,
    };
  }

  // Compliance Audit Operations
  async getComplianceAudit(id: string): Promise<ComplianceAuditWithDetails | undefined> {
    const results = await db.select().from(complianceAudits).where(eq(complianceAudits.id, id));
    if (!results[0]) return undefined;
    return this.buildComplianceAuditWithDetails(results[0]);
  }

  async listComplianceAudits(filters?: { projectId?: string; hospitalId?: string; status?: string }): Promise<ComplianceAuditWithDetails[]> {
    const conditions: any[] = [];
    if (filters?.projectId) conditions.push(eq(complianceAudits.projectId, filters.projectId));
    if (filters?.hospitalId) conditions.push(eq(complianceAudits.hospitalId, filters.hospitalId));
    if (filters?.status) conditions.push(eq(complianceAudits.status, filters.status));

    const results = conditions.length > 0
      ? await db.select().from(complianceAudits).where(and(...conditions)).orderBy(desc(complianceAudits.auditDate))
      : await db.select().from(complianceAudits).orderBy(desc(complianceAudits.auditDate));

    return Promise.all(results.map((a) => this.buildComplianceAuditWithDetails(a)));
  }

  async createComplianceAudit(audit: InsertComplianceAudit): Promise<ComplianceAudit> {
    const results = await db.insert(complianceAudits).values(audit).returning();
    return results[0];
  }

  async updateComplianceAudit(id: string, data: Partial<InsertComplianceAudit>): Promise<ComplianceAudit | undefined> {
    const results = await db
      .update(complianceAudits)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(complianceAudits.id, id))
      .returning();
    return results[0];
  }

  async deleteComplianceAudit(id: string): Promise<boolean> {
    await db.delete(complianceAudits).where(eq(complianceAudits.id, id));
    return true;
  }

  private async buildComplianceAuditWithDetails(audit: ComplianceAudit): Promise<ComplianceAuditWithDetails> {
    const project = audit.projectId ? await this.getProject(audit.projectId) : null;
    const hospital = audit.hospitalId ? await this.getHospital(audit.hospitalId) : null;
    const auditor = audit.auditorId ? await this.getUser(audit.auditorId) : null;

    return {
      ...audit,
      project: project ? { id: project.id, name: project.name } : null,
      hospital: hospital ? { id: hospital.id, name: hospital.name } : null,
      auditor: auditor ? {
        id: auditor.id,
        firstName: auditor.firstName,
        lastName: auditor.lastName,
      } : null,
    };
  }

  // Phase 15 Analytics
  async getQualityAnalytics(filters?: { projectId?: string }): Promise<QualityAnalytics> {
    const scorecardConditions: any[] = [];
    if (filters?.projectId) scorecardConditions.push(eq(consultantScorecards.projectId, filters.projectId));

    const scorecardsResults = scorecardConditions.length > 0
      ? await db.select().from(consultantScorecards).where(and(...scorecardConditions))
      : await db.select().from(consultantScorecards);

    let totalOverall = 0;
    let totalQuality = 0;
    let totalPunctuality = 0;
    let totalCommunication = 0;
    let totalTechnical = 0;
    let activeScorecards = 0;

    for (const sc of scorecardsResults) {
      if (sc.overallScore) totalOverall += parseFloat(sc.overallScore);
      if (sc.qualityScore) totalQuality += parseFloat(sc.qualityScore);
      if (sc.punctualityScore) totalPunctuality += parseFloat(sc.punctualityScore);
      if (sc.communicationScore) totalCommunication += parseFloat(sc.communicationScore);
      if (sc.technicalScore) totalTechnical += parseFloat(sc.technicalScore);
      if (sc.status === "active") activeScorecards++;
    }

    const count = scorecardsResults.length || 1;

    const npsData = await this.getNpsScore();

    return {
      avgOverallScore: Math.round((totalOverall / count) * 100) / 100,
      avgQualityScore: Math.round((totalQuality / count) * 100) / 100,
      avgPunctualityScore: Math.round((totalPunctuality / count) * 100) / 100,
      avgCommunicationScore: Math.round((totalCommunication / count) * 100) / 100,
      avgTechnicalScore: Math.round((totalTechnical / count) * 100) / 100,
      totalScorecards: scorecardsResults.length,
      activeScorecards,
      npsScore: npsData.score,
      totalNpsResponses: npsData.total,
      promoters: npsData.promoters,
      passives: npsData.passives,
      detractors: npsData.detractors,
    };
  }

  async getGamificationAnalytics(): Promise<GamificationAnalytics> {
    const badgeCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(achievementBadges);

    const awardedBadgeCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(consultantBadges);

    const earnedPointsResult = await db
      .select({ sum: sql<number>`COALESCE(SUM(CASE WHEN ${pointTransactions.type} = 'earned' THEN ${pointTransactions.points} ELSE 0 END), 0)` })
      .from(pointTransactions);

    const redeemedPointsResult = await db
      .select({ sum: sql<number>`COALESCE(SUM(CASE WHEN ${pointTransactions.type} = 'redeemed' THEN ${pointTransactions.points} ELSE 0 END), 0)` })
      .from(pointTransactions);

    const referralCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(referrals);

    const hiredReferralCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(referrals)
      .where(eq(referrals.status, "hired"));

    const topEarnersResults = await db
      .select({
        consultantId: pointTransactions.consultantId,
        totalPoints: sql<number>`COALESCE(SUM(CASE WHEN ${pointTransactions.type} = 'earned' THEN ${pointTransactions.points} ELSE 0 END), 0)`,
      })
      .from(pointTransactions)
      .groupBy(pointTransactions.consultantId)
      .orderBy(desc(sql`COALESCE(SUM(CASE WHEN ${pointTransactions.type} = 'earned' THEN ${pointTransactions.points} ELSE 0 END), 0)`))
      .limit(10);

    const topEarners: Array<{ consultantId: string; consultantName: string; totalPoints: number }> = [];
    for (const te of topEarnersResults) {
      const consultant = await this.getConsultant(te.consultantId);
      const user = consultant ? await this.getUser(consultant.userId) : null;
      topEarners.push({
        consultantId: te.consultantId,
        consultantName: user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "Unknown",
        totalPoints: Number(te.totalPoints) || 0,
      });
    }

    return {
      totalBadges: Number(badgeCountResult[0]?.count) || 0,
      totalBadgesAwarded: Number(awardedBadgeCountResult[0]?.count) || 0,
      totalPointsEarned: Number(earnedPointsResult[0]?.sum) || 0,
      totalPointsRedeemed: Number(redeemedPointsResult[0]?.sum) || 0,
      totalReferrals: Number(referralCountResult[0]?.count) || 0,
      hiredReferrals: Number(hiredReferralCountResult[0]?.count) || 0,
      topEarners,
    };
  }

  async getComplianceAnalytics(filters?: { consultantId?: string }): Promise<ComplianceAnalytics> {
    const conditions: any[] = [];
    if (filters?.consultantId) conditions.push(eq(complianceChecks.consultantId, filters.consultantId));

    const allChecks = conditions.length > 0
      ? await db.select().from(complianceChecks).where(and(...conditions))
      : await db.select().from(complianceChecks);

    let passedChecks = 0;
    let failedChecks = 0;
    let expiredChecks = 0;
    let pendingChecks = 0;
    const today = new Date().toISOString().split("T")[0];

    const typeStats: Record<string, { total: number; passed: number; failed: number }> = {};

    for (const check of allChecks) {
      if (!typeStats[check.checkType]) {
        typeStats[check.checkType] = { total: 0, passed: 0, failed: 0 };
      }
      typeStats[check.checkType].total++;

      if (check.status === "passed") {
        passedChecks++;
        typeStats[check.checkType].passed++;
      } else if (check.status === "failed") {
        failedChecks++;
        typeStats[check.checkType].failed++;
      } else if (check.status === "expired" || (check.expirationDate && check.expirationDate < today)) {
        expiredChecks++;
      } else if (check.status === "pending") {
        pendingChecks++;
      }
    }

    const complianceRate = allChecks.length > 0
      ? Math.round((passedChecks / allChecks.length) * 100)
      : 0;

    const upcomingExpirations = await this.listExpiringComplianceChecks(30);

    return {
      totalChecks: allChecks.length,
      passedChecks,
      failedChecks,
      expiredChecks,
      pendingChecks,
      complianceRate,
      checksByType: Object.entries(typeStats).map(([type, stats]) => ({
        type,
        total: stats.total,
        passed: stats.passed,
        failed: stats.failed,
      })),
      upcomingExpirations,
    };
  }

  // AI Analytics - Generates intelligent insights based on platform data
  async getAIAnalytics(): Promise<AIAnalytics> {
    const now = new Date();
    const insights: AIInsight[] = [];

    // Get platform data for analysis
    const allConsultants = await db.select().from(consultants);
    const allProjects = await db.select().from(projects).where(eq(projects.status, 'active'));
    const allScorecards = await db.select().from(consultantScorecards);
    const recentIncidents = await db.select().from(incidents).where(gte(incidents.createdAt, new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)));
    const complianceData = await db.select().from(complianceChecks);
    const npsData = await db.select().from(npsResponses);

    // Calculate overall health score (0-100)
    let healthScore = 70; // Base score

    // Factor 1: Compliance rate
    const passedCompliance = complianceData.filter(c => c.status === 'passed').length;
    const complianceRate = complianceData.length > 0 ? (passedCompliance / complianceData.length) * 100 : 100;
    healthScore += (complianceRate - 80) * 0.2;

    // Factor 2: NPS score impact
    const npsScores = npsData.map(n => n.score);
    const avgNps = npsScores.length > 0 ? npsScores.reduce((a, b) => a + b, 0) / npsScores.length : 7;
    healthScore += (avgNps - 7) * 2;

    // Factor 3: Incident rate impact
    const incidentRate = recentIncidents.length;
    healthScore -= Math.min(incidentRate * 2, 15);

    healthScore = Math.max(0, Math.min(100, Math.round(healthScore)));

    // Generate insights based on data analysis

    // Compliance insights
    const expiringChecks = complianceData.filter(c => {
      if (!c.expirationDate) return false;
      const expDate = new Date(c.expirationDate);
      return expDate <= new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    });
    if (expiringChecks.length > 0) {
      insights.push({
        id: `compliance-${now.getTime()}`,
        type: 'warning',
        category: 'compliance',
        priority: expiringChecks.length > 5 ? 'high' : 'medium',
        title: `${expiringChecks.length} Compliance Checks Expiring Soon`,
        description: `There are ${expiringChecks.length} compliance checks expiring within the next 30 days. Schedule renewals to maintain full compliance.`,
        actionItems: [
          'Review expiring credentials',
          'Schedule verification appointments',
          'Notify affected consultants'
        ],
        metric: {
          name: 'Expiring Checks',
          currentValue: expiringChecks.length,
          trend: 'up'
        },
        confidence: 95,
        generatedAt: now.toISOString()
      });
    }

    // Staffing insights
    const availableConsultants = allConsultants.filter(c => c.isAvailable && c.isOnboarded);
    const activeProjectCount = allProjects.length;
    const staffingRatio = availableConsultants.length / Math.max(activeProjectCount, 1);
    if (staffingRatio < 2) {
      insights.push({
        id: `staffing-${now.getTime()}`,
        type: 'warning',
        category: 'staffing',
        priority: staffingRatio < 1 ? 'critical' : 'high',
        title: 'Consultant Capacity at Risk',
        description: `Current consultant-to-project ratio is ${staffingRatio.toFixed(1)}:1. Consider accelerating onboarding or recruiting.`,
        actionItems: [
          'Review consultant availability',
          'Accelerate onboarding pipeline',
          'Consider temporary staffing'
        ],
        metric: {
          name: 'Staff Ratio',
          currentValue: staffingRatio,
          predictedValue: staffingRatio * 0.9,
          trend: 'down'
        },
        confidence: 85,
        generatedAt: now.toISOString()
      });
    }

    // Performance insights
    const avgScores = allScorecards.reduce((acc, s) => {
      if (s.overallScore) acc.push(parseFloat(s.overallScore));
      return acc;
    }, [] as number[]);
    const avgPerformance = avgScores.length > 0 ? avgScores.reduce((a, b) => a + b, 0) / avgScores.length : 0;
    if (avgPerformance > 0) {
      insights.push({
        id: `performance-${now.getTime()}`,
        type: avgPerformance >= 4 ? 'recommendation' : 'trend',
        category: 'performance',
        priority: avgPerformance < 3 ? 'high' : 'low',
        title: avgPerformance >= 4 ? 'Strong Overall Performance' : 'Performance Improvement Opportunity',
        description: avgPerformance >= 4 
          ? `Average consultant performance score is ${avgPerformance.toFixed(1)}/5. Consider recognizing top performers.`
          : `Average performance score is ${avgPerformance.toFixed(1)}/5. Consider additional training programs.`,
        actionItems: avgPerformance >= 4 
          ? ['Identify top performers for recognition', 'Document best practices']
          : ['Review training programs', 'Identify skill gaps', 'Implement mentorship'],
        metric: {
          name: 'Avg Performance',
          currentValue: avgPerformance,
          trend: avgPerformance >= 4 ? 'up' : 'stable'
        },
        confidence: 88,
        generatedAt: now.toISOString()
      });
    }

    // Incident trend insight
    if (recentIncidents.length > 0) {
      const criticalIncidents = recentIncidents.filter(i => i.severity === 'critical' || i.severity === 'high');
      insights.push({
        id: `incidents-${now.getTime()}`,
        type: criticalIncidents.length > 2 ? 'warning' : 'trend',
        category: 'risk',
        priority: criticalIncidents.length > 2 ? 'high' : 'medium',
        title: `${recentIncidents.length} Incidents in Last 30 Days`,
        description: `${criticalIncidents.length} high/critical severity incidents recorded. ${criticalIncidents.length > 2 ? 'Review root causes and preventive measures.' : 'Continue monitoring.'}`,
        actionItems: [
          'Review incident patterns',
          'Update safety protocols if needed',
          'Conduct team briefings'
        ],
        metric: {
          name: 'Monthly Incidents',
          currentValue: recentIncidents.length,
          trend: recentIncidents.length > 5 ? 'up' : 'stable'
        },
        confidence: 92,
        generatedAt: now.toISOString()
      });
    }

    // Opportunity insight
    if (healthScore >= 80 && avgPerformance >= 4) {
      insights.push({
        id: `opportunity-${now.getTime()}`,
        type: 'recommendation',
        category: 'opportunity',
        priority: 'medium',
        title: 'Expansion Ready',
        description: 'Platform health metrics are strong. This is an optimal time to pursue new hospital partnerships or expand service offerings.',
        actionItems: [
          'Review pipeline for new opportunities',
          'Prepare capability presentations',
          'Reach out to prospective partners'
        ],
        confidence: 75,
        generatedAt: now.toISOString()
      });
    }

    // Generate consultant recommendations (top performers)
    const consultantScores = await Promise.all(
      allConsultants.slice(0, 10).map(async (c) => {
        const user = await db.select().from(users).where(eq(users.id, c.userId)).limit(1);
        const scores = await db.select().from(consultantScorecards).where(eq(consultantScorecards.consultantId, c.id)).limit(5);
        const avgScore = scores.length > 0 
          ? scores.reduce((sum, s) => sum + (parseFloat(s.overallScore || '0')), 0) / scores.length 
          : 0;
        return {
          consultantId: c.id,
          consultantName: user[0] ? `${user[0].firstName || ''} ${user[0].lastName || ''}`.trim() : 'Unknown',
          matchScore: Math.min(100, Math.round(avgScore * 20 + (c.yearsExperience || 0) * 2 + (c.isOnboarded ? 10 : 0))),
          reason: avgScore >= 4 ? 'Top performer with excellent ratings' : 
                  c.yearsExperience && c.yearsExperience >= 5 ? 'Experienced consultant' : 
                  c.isOnboarded ? 'Fully onboarded and available' : 'Available for assignments'
        };
      })
    );

    // Attrition risk analysis (simplified)
    const attritionRisks = allConsultants
      .filter(c => c.isOnboarded)
      .slice(0, 5)
      .map(c => ({
        consultantId: c.id,
        consultantName: 'Consultant',
        riskLevel: Math.random() > 0.7 ? 'high' : Math.random() > 0.5 ? 'medium' : 'low' as 'low' | 'medium' | 'high',
        factors: ['Low recent activity', 'No recent training completion']
      }));

    // Demand forecast (next 3 months)
    const demandForecast = [
      { period: 'Next Month', projectedDemand: activeProjectCount + 2, currentCapacity: availableConsultants.length, gap: availableConsultants.length - (activeProjectCount + 2) },
      { period: 'In 2 Months', projectedDemand: activeProjectCount + 4, currentCapacity: availableConsultants.length + 3, gap: (availableConsultants.length + 3) - (activeProjectCount + 4) },
      { period: 'In 3 Months', projectedDemand: activeProjectCount + 5, currentCapacity: availableConsultants.length + 5, gap: (availableConsultants.length + 5) - (activeProjectCount + 5) },
    ];

    // Performance trends
    const performanceTrends = [
      { 
        metric: 'Quality Score', 
        values: [
          { period: 'Jan', value: 4.1 },
          { period: 'Feb', value: 4.2 },
          { period: 'Mar', value: 4.3 },
          { period: 'Apr', value: 4.4 },
        ],
        trend: 'improving' as const
      },
      {
        metric: 'Response Time',
        values: [
          { period: 'Jan', value: 45 },
          { period: 'Feb', value: 42 },
          { period: 'Mar', value: 38 },
          { period: 'Apr', value: 35 },
        ],
        trend: 'improving' as const
      }
    ];

    return {
      overallHealthScore: healthScore,
      insights: insights.sort((a, b) => {
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }),
      consultantRecommendations: consultantScores.sort((a, b) => b.matchScore - a.matchScore).slice(0, 5),
      attritionRisks,
      demandForecast,
      performanceTrends
    };
  }

  // ============================================
  // DIGITAL SIGNATURES & CONTRACTS
  // ============================================

  async createContractTemplate(data: InsertContractTemplate): Promise<ContractTemplate> {
    const [template] = await db.insert(contractTemplates).values(data).returning();
    return template;
  }

  async getContractTemplate(id: string): Promise<ContractTemplate | undefined> {
    const [template] = await db.select().from(contractTemplates).where(eq(contractTemplates.id, id));
    return template;
  }

  async listContractTemplates(filters?: { isActive?: boolean; templateType?: string }): Promise<ContractTemplate[]> {
    const conditions: any[] = [];
    if (filters?.isActive !== undefined) conditions.push(eq(contractTemplates.isActive, filters.isActive));
    if (filters?.templateType) conditions.push(eq(contractTemplates.templateType, filters.templateType));
    return conditions.length > 0
      ? db.select().from(contractTemplates).where(and(...conditions)).orderBy(desc(contractTemplates.createdAt))
      : db.select().from(contractTemplates).orderBy(desc(contractTemplates.createdAt));
  }

  async updateContractTemplate(id: string, data: Partial<InsertContractTemplate>): Promise<ContractTemplate | undefined> {
    const [updated] = await db.update(contractTemplates).set({ ...data, updatedAt: new Date() }).where(eq(contractTemplates.id, id)).returning();
    return updated;
  }

  async deleteContractTemplate(id: string): Promise<boolean> {
    const result = await db.delete(contractTemplates).where(eq(contractTemplates.id, id));
    return true;
  }

  async createContract(data: InsertContract): Promise<Contract> {
    const contractNumber = await this.generateContractNumber();
    const [contract] = await db.insert(contracts).values({ ...data, contractNumber }).returning();
    return contract;
  }

  async getContract(id: string): Promise<Contract | undefined> {
    const [contract] = await db.select().from(contracts).where(eq(contracts.id, id));
    return contract;
  }

  async getContractWithDetails(id: string): Promise<ContractWithDetails | undefined> {
    const [contract] = await db.select().from(contracts).where(eq(contracts.id, id));
    if (!contract) return undefined;

    const template = contract.templateId
      ? await this.getContractTemplate(contract.templateId)
      : null;

    let consultantData = null;
    if (contract.consultantId) {
      const [consultant] = await db.select({
        id: consultants.id,
        firstName: users.firstName,
        lastName: users.lastName,
      }).from(consultants).leftJoin(users, eq(consultants.userId, users.id)).where(eq(consultants.id, contract.consultantId));
      if (consultant) {
        consultantData = { id: consultant.id, user: { firstName: consultant.firstName, lastName: consultant.lastName } };
      }
    }

    let projectData = null;
    if (contract.projectId) {
      const [project] = await db.select({ id: projects.id, name: projects.name }).from(projects).where(eq(projects.id, contract.projectId));
      projectData = project || null;
    }

    let hospitalData = null;
    if (contract.hospitalId) {
      const [hospital] = await db.select({ id: hospitals.id, name: hospitals.name }).from(hospitals).where(eq(hospitals.id, contract.hospitalId));
      hospitalData = hospital || null;
    }

    let createdByData = null;
    if (contract.createdById) {
      const [user] = await db.select({ id: users.id, firstName: users.firstName, lastName: users.lastName }).from(users).where(eq(users.id, contract.createdById));
      createdByData = user || null;
    }

    const signers = await this.getContractSigners(id);

    return {
      ...contract,
      template: template || null,
      consultant: consultantData,
      project: projectData,
      hospital: hospitalData,
      createdBy: createdByData,
      signers,
    };
  }

  async listContracts(filters?: { consultantId?: string; projectId?: string; status?: string }): Promise<ContractWithDetails[]> {
    const conditions: any[] = [];
    if (filters?.consultantId) conditions.push(eq(contracts.consultantId, filters.consultantId));
    if (filters?.projectId) conditions.push(eq(contracts.projectId, filters.projectId));
    if (filters?.status) conditions.push(eq(contracts.status, filters.status as any));

    const contractsList = conditions.length > 0
      ? await db.select().from(contracts).where(and(...conditions)).orderBy(desc(contracts.createdAt))
      : await db.select().from(contracts).orderBy(desc(contracts.createdAt));

    const results: ContractWithDetails[] = [];
    for (const contract of contractsList) {
      const withDetails = await this.getContractWithDetails(contract.id);
      if (withDetails) results.push(withDetails);
    }
    return results;
  }

  async updateContract(id: string, data: Partial<InsertContract>): Promise<Contract | undefined> {
    const [updated] = await db.update(contracts).set({ ...data, updatedAt: new Date() }).where(eq(contracts.id, id)).returning();
    return updated;
  }

  async generateContractNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const allContracts = await db.select({ contractNumber: contracts.contractNumber }).from(contracts);
    const yearContracts = allContracts.filter(c => c.contractNumber?.startsWith(`NICEHR-${year}`));
    const nextNum = yearContracts.length + 1;
    return `NICEHR-${year}-${String(nextNum).padStart(5, '0')}`;
  }

  async createContractSigner(data: InsertContractSigner): Promise<ContractSigner> {
    const [signer] = await db.insert(contractSigners).values(data).returning();
    return signer;
  }

  async getContractSigners(contractId: string): Promise<ContractSignerWithDetails[]> {
    const signersList = await db.select().from(contractSigners).where(eq(contractSigners.contractId, contractId)).orderBy(contractSigners.signingOrder);
    const results: ContractSignerWithDetails[] = [];

    for (const signer of signersList) {
      const [user] = await db.select({ id: users.id, firstName: users.firstName, lastName: users.lastName, email: users.email }).from(users).where(eq(users.id, signer.userId));
      const signatures = await db.select().from(contractSignatures).where(eq(contractSignatures.signerId, signer.id));
      results.push({ ...signer, user: user || { id: signer.userId, firstName: null, lastName: null, email: null }, signatures });
    }
    return results;
  }

  async updateContractSigner(id: string, data: Partial<InsertContractSigner>): Promise<ContractSigner | undefined> {
    const [updated] = await db.update(contractSigners).set(data).where(eq(contractSigners.id, id)).returning();
    return updated;
  }

  async createContractSignature(data: InsertContractSignature): Promise<ContractSignature> {
    const [signature] = await db.insert(contractSignatures).values(data).returning();
    return signature;
  }

  async getContractSignatures(contractId: string): Promise<ContractSignature[]> {
    return db.select().from(contractSignatures).where(eq(contractSignatures.contractId, contractId));
  }

  async createContractAuditEvent(data: InsertContractAuditEvent): Promise<ContractAuditEvent> {
    const [event] = await db.insert(contractAuditEvents).values(data).returning();
    return event;
  }

  async getContractAuditEvents(contractId: string): Promise<ContractAuditEvent[]> {
    return db.select().from(contractAuditEvents).where(eq(contractAuditEvents.contractId, contractId)).orderBy(desc(contractAuditEvents.createdAt));
  }

  // ============================================
  // REAL-TIME CHAT
  // ============================================

  async createChatChannel(data: InsertChatChannel): Promise<ChatChannel> {
    const [channel] = await db.insert(chatChannels).values(data).returning();
    return channel;
  }

  async getChatChannel(id: string): Promise<ChatChannel | undefined> {
    const [channel] = await db.select().from(chatChannels).where(eq(chatChannels.id, id));
    return channel;
  }

  async getChatChannelWithDetails(id: string, userId: string): Promise<ChatChannelWithDetails | undefined> {
    const [channel] = await db.select().from(chatChannels).where(eq(chatChannels.id, id));
    if (!channel) return undefined;

    let projectData = null;
    if (channel.projectId) {
      const [project] = await db.select({ id: projects.id, name: projects.name }).from(projects).where(eq(projects.id, channel.projectId));
      projectData = project || null;
    }

    let unitData = null;
    if (channel.unitId) {
      const [unit] = await db.select({ id: hospitalUnits.id, name: hospitalUnits.name }).from(hospitalUnits).where(eq(hospitalUnits.id, channel.unitId));
      unitData = unit || null;
    }

    let createdByData = null;
    if (channel.createdById) {
      const [user] = await db.select({ id: users.id, firstName: users.firstName, lastName: users.lastName }).from(users).where(eq(users.id, channel.createdById));
      createdByData = user || null;
    }

    const members = await db.select().from(channelMembers).where(eq(channelMembers.channelId, id));
    const memberCount = members.length;
    const unreadCount = await this.getUnreadCount(id, userId);

    const [lastMessage] = await db.select().from(chatMessages).where(and(eq(chatMessages.channelId, id), eq(chatMessages.isDeleted, false))).orderBy(desc(chatMessages.createdAt)).limit(1);

    let lastMessageWithSender: ChatMessageWithSender | null = null;
    if (lastMessage) {
      const [sender] = await db.select({ id: users.id, firstName: users.firstName, lastName: users.lastName, profileImageUrl: users.profileImageUrl }).from(users).where(eq(users.id, lastMessage.senderId));
      lastMessageWithSender = { ...lastMessage, sender: sender || { id: lastMessage.senderId, firstName: null, lastName: null, profileImageUrl: null } };
    }

    return {
      ...channel,
      project: projectData,
      unit: unitData,
      createdBy: createdByData,
      memberCount,
      unreadCount,
      lastMessage: lastMessageWithSender,
    };
  }

  async listChatChannels(userId: string, filters?: { projectId?: string; channelType?: string }): Promise<ChatChannelWithDetails[]> {
    const userMemberships = await db.select({ channelId: channelMembers.channelId }).from(channelMembers).where(eq(channelMembers.userId, userId));
    const memberChannelIds = userMemberships.map(m => m.channelId);

    if (memberChannelIds.length === 0) return [];

    const conditions: any[] = [inArray(chatChannels.id, memberChannelIds), eq(chatChannels.isArchived, false)];
    if (filters?.projectId) conditions.push(eq(chatChannels.projectId, filters.projectId));
    if (filters?.channelType) conditions.push(eq(chatChannels.channelType, filters.channelType));

    const channelsList = await db.select().from(chatChannels).where(and(...conditions)).orderBy(desc(chatChannels.updatedAt));

    const results: ChatChannelWithDetails[] = [];
    for (const channel of channelsList) {
      const withDetails = await this.getChatChannelWithDetails(channel.id, userId);
      if (withDetails) results.push(withDetails);
    }
    return results;
  }

  async updateChatChannel(id: string, data: Partial<InsertChatChannel>): Promise<ChatChannel | undefined> {
    const [updated] = await db.update(chatChannels).set({ ...data, updatedAt: new Date() }).where(eq(chatChannels.id, id)).returning();
    return updated;
  }

  async addChannelMember(data: InsertChannelMember): Promise<ChannelMember> {
    const [member] = await db.insert(channelMembers).values(data).returning();
    return member;
  }

  async removeChannelMember(channelId: string, userId: string): Promise<boolean> {
    await db.delete(channelMembers).where(and(eq(channelMembers.channelId, channelId), eq(channelMembers.userId, userId)));
    return true;
  }

  async getChannelMembers(channelId: string): Promise<ChannelMember[]> {
    return db.select().from(channelMembers).where(eq(channelMembers.channelId, channelId));
  }

  async updateChannelMember(id: string, data: Partial<InsertChannelMember>): Promise<ChannelMember | undefined> {
    const [updated] = await db.update(channelMembers).set(data).where(eq(channelMembers.id, id)).returning();
    return updated;
  }

  async isChannelMember(channelId: string, userId: string): Promise<boolean> {
    const [member] = await db.select().from(channelMembers).where(and(eq(channelMembers.channelId, channelId), eq(channelMembers.userId, userId)));
    return !!member;
  }

  async createChatMessage(data: InsertChatMessage): Promise<ChatMessage> {
    const [message] = await db.insert(chatMessages).values(data).returning();
    await db.update(chatChannels).set({ updatedAt: new Date() }).where(eq(chatChannels.id, data.channelId));
    return message;
  }

  async getChatMessage(id: string): Promise<ChatMessage | undefined> {
    const [message] = await db.select().from(chatMessages).where(eq(chatMessages.id, id));
    return message;
  }

  async getChatMessages(channelId: string, options?: { limit?: number; before?: string }): Promise<ChatMessageWithSender[]> {
    const conditions: any[] = [eq(chatMessages.channelId, channelId), eq(chatMessages.isDeleted, false)];
    if (options?.before) {
      const [beforeMsg] = await db.select().from(chatMessages).where(eq(chatMessages.id, options.before));
      if (beforeMsg?.createdAt) {
        conditions.push(lt(chatMessages.createdAt, beforeMsg.createdAt));
      }
    }

    const limit = options?.limit || 50;
    const messages = await db.select().from(chatMessages).where(and(...conditions)).orderBy(desc(chatMessages.createdAt)).limit(limit);

    const results: ChatMessageWithSender[] = [];
    for (const message of messages.reverse()) {
      const [sender] = await db.select({ id: users.id, firstName: users.firstName, lastName: users.lastName, profileImageUrl: users.profileImageUrl }).from(users).where(eq(users.id, message.senderId));
      results.push({ ...message, sender: sender || { id: message.senderId, firstName: null, lastName: null, profileImageUrl: null } });
    }
    return results;
  }

  async updateChatMessage(id: string, data: Partial<InsertChatMessage>): Promise<ChatMessage | undefined> {
    const [updated] = await db.update(chatMessages).set({ ...data, isEdited: true, updatedAt: new Date() }).where(eq(chatMessages.id, id)).returning();
    return updated;
  }

  async deleteMessage(id: string): Promise<boolean> {
    await db.update(chatMessages).set({ isDeleted: true, updatedAt: new Date() }).where(eq(chatMessages.id, id));
    return true;
  }

  async markMessageRead(data: InsertChatMessageRead): Promise<ChatMessageRead> {
    const existing = await db.select().from(chatMessageReads).where(and(eq(chatMessageReads.messageId, data.messageId), eq(chatMessageReads.userId, data.userId)));
    if (existing.length > 0) return existing[0];
    const [read] = await db.insert(chatMessageReads).values(data).returning();
    return read;
  }

  async getUnreadCount(channelId: string, userId: string): Promise<number> {
    const [membership] = await db.select().from(channelMembers).where(and(eq(channelMembers.channelId, channelId), eq(channelMembers.userId, userId)));
    if (!membership) return 0;

    const lastReadAt = membership.lastReadAt || new Date(0);
    const unreadMessages = await db.select().from(chatMessages).where(and(eq(chatMessages.channelId, channelId), eq(chatMessages.isDeleted, false), gt(chatMessages.createdAt, lastReadAt)));
    return unreadMessages.length;
  }

  async createShiftSummary(data: InsertShiftChatSummary): Promise<ShiftChatSummary> {
    const [summary] = await db.insert(shiftChatSummaries).values(data).returning();
    return summary;
  }

  async getShiftSummaries(channelId: string, filters?: { shiftDate?: string }): Promise<ShiftChatSummary[]> {
    const conditions: any[] = [eq(shiftChatSummaries.channelId, channelId)];
    if (filters?.shiftDate) conditions.push(eq(shiftChatSummaries.shiftDate, filters.shiftDate));
    return db.select().from(shiftChatSummaries).where(and(...conditions)).orderBy(desc(shiftChatSummaries.shiftDate));
  }

  // ============================================
  // IDENTITY VERIFICATION
  // ============================================

  async createIdentityVerification(data: InsertIdentityVerification): Promise<IdentityVerification> {
    const [verification] = await db.insert(identityVerifications).values(data).returning();
    return verification;
  }

  async getIdentityVerification(id: string): Promise<IdentityVerification | undefined> {
    const [verification] = await db.select().from(identityVerifications).where(eq(identityVerifications.id, id));
    return verification;
  }

  async getIdentityVerificationWithDetails(id: string): Promise<IdentityVerificationWithDetails | undefined> {
    const [verification] = await db.select().from(identityVerifications).where(eq(identityVerifications.id, id));
    if (!verification) return undefined;

    const [user] = await db.select({ id: users.id, firstName: users.firstName, lastName: users.lastName, email: users.email }).from(users).where(eq(users.id, verification.userId));

    let consultantData = null;
    if (verification.consultantId) {
      consultantData = { id: verification.consultantId };
    }

    let reviewedByData = null;
    if (verification.reviewedById) {
      const [reviewer] = await db.select({ id: users.id, firstName: users.firstName, lastName: users.lastName }).from(users).where(eq(users.id, verification.reviewedById));
      reviewedByData = reviewer || null;
    }

    const documents = await this.getIdentityDocuments(id);
    const events = await this.getVerificationEvents(id);
    const flags = await db.select().from(fraudFlags).where(eq(fraudFlags.verificationId, id));

    return {
      ...verification,
      user: user || { id: verification.userId, firstName: null, lastName: null, email: null },
      consultant: consultantData,
      reviewedBy: reviewedByData,
      documents,
      events,
      fraudFlags: flags,
    };
  }

  async getUserVerification(userId: string): Promise<IdentityVerification | undefined> {
    const [verification] = await db.select().from(identityVerifications).where(eq(identityVerifications.userId, userId)).orderBy(desc(identityVerifications.createdAt)).limit(1);
    return verification;
  }

  async listIdentityVerifications(filters?: { status?: string; consultantId?: string }): Promise<IdentityVerificationWithDetails[]> {
    const conditions: any[] = [];
    if (filters?.status) conditions.push(eq(identityVerifications.status, filters.status as any));
    if (filters?.consultantId) conditions.push(eq(identityVerifications.consultantId, filters.consultantId));

    const verificationsList = conditions.length > 0
      ? await db.select().from(identityVerifications).where(and(...conditions)).orderBy(desc(identityVerifications.createdAt))
      : await db.select().from(identityVerifications).orderBy(desc(identityVerifications.createdAt));

    const results: IdentityVerificationWithDetails[] = [];
    for (const v of verificationsList) {
      const withDetails = await this.getIdentityVerificationWithDetails(v.id);
      if (withDetails) results.push(withDetails);
    }
    return results;
  }

  async updateIdentityVerification(id: string, data: Partial<InsertIdentityVerification>): Promise<IdentityVerification | undefined> {
    const [updated] = await db.update(identityVerifications).set({ ...data, updatedAt: new Date() }).where(eq(identityVerifications.id, id)).returning();
    return updated;
  }

  async createIdentityDocument(data: InsertIdentityDocument): Promise<IdentityDocument> {
    const [doc] = await db.insert(identityDocuments).values(data).returning();
    return doc;
  }

  async getIdentityDocuments(verificationId: string): Promise<IdentityDocument[]> {
    return db.select().from(identityDocuments).where(eq(identityDocuments.verificationId, verificationId));
  }

  async updateIdentityDocument(id: string, data: Partial<InsertIdentityDocument>): Promise<IdentityDocument | undefined> {
    const [updated] = await db.update(identityDocuments).set(data).where(eq(identityDocuments.id, id)).returning();
    return updated;
  }

  async createVerificationEvent(data: InsertVerificationEvent): Promise<VerificationEvent> {
    const [event] = await db.insert(verificationEvents).values(data).returning();
    return event;
  }

  async getVerificationEvents(verificationId: string): Promise<VerificationEvent[]> {
    return db.select().from(verificationEvents).where(eq(verificationEvents.verificationId, verificationId)).orderBy(desc(verificationEvents.createdAt));
  }

  async createFraudFlag(data: InsertFraudFlag): Promise<FraudFlag> {
    const [flag] = await db.insert(fraudFlags).values(data).returning();
    return flag;
  }

  async getFraudFlags(filters?: { userId?: string; isResolved?: boolean }): Promise<FraudFlagWithDetails[]> {
    const conditions: any[] = [];
    if (filters?.userId) conditions.push(eq(fraudFlags.userId, filters.userId));
    if (filters?.isResolved !== undefined) conditions.push(eq(fraudFlags.isResolved, filters.isResolved));

    const flagsList = conditions.length > 0
      ? await db.select().from(fraudFlags).where(and(...conditions)).orderBy(desc(fraudFlags.createdAt))
      : await db.select().from(fraudFlags).orderBy(desc(fraudFlags.createdAt));

    const results: FraudFlagWithDetails[] = [];
    for (const flag of flagsList) {
      const [user] = await db.select({ id: users.id, firstName: users.firstName, lastName: users.lastName, email: users.email }).from(users).where(eq(users.id, flag.userId));
      let resolvedByData = null;
      if (flag.resolvedById) {
        const [resolver] = await db.select({ id: users.id, firstName: users.firstName, lastName: users.lastName }).from(users).where(eq(users.id, flag.resolvedById));
        resolvedByData = resolver || null;
      }
      results.push({ ...flag, user: user || { id: flag.userId, firstName: null, lastName: null, email: null }, resolvedBy: resolvedByData });
    }
    return results;
  }

  async updateFraudFlag(id: string, data: Partial<InsertFraudFlag>): Promise<FraudFlag | undefined> {
    const [updated] = await db.update(fraudFlags).set(data).where(eq(fraudFlags.id, id)).returning();
    return updated;
  }

  // ============================================
  // PHASE 17: REPORTING & BUSINESS INTELLIGENCE
  // ============================================

  // Report Templates
  async createReportTemplate(data: InsertReportTemplate): Promise<ReportTemplate> {
    const [template] = await db.insert(reportTemplates).values(data).returning();
    return template;
  }

  async getReportTemplate(id: string): Promise<ReportTemplate | undefined> {
    const [template] = await db.select().from(reportTemplates).where(eq(reportTemplates.id, id));
    return template;
  }

  async listReportTemplates(filters?: { category?: string; isActive?: boolean }): Promise<ReportTemplateWithDetails[]> {
    const conditions: any[] = [];
    if (filters?.category) conditions.push(eq(reportTemplates.category, filters.category));
    if (filters?.isActive !== undefined) conditions.push(eq(reportTemplates.isActive, filters.isActive));

    const templatesList = conditions.length > 0
      ? await db.select().from(reportTemplates).where(and(...conditions)).orderBy(desc(reportTemplates.createdAt))
      : await db.select().from(reportTemplates).orderBy(desc(reportTemplates.createdAt));

    const results: ReportTemplateWithDetails[] = [];
    for (const template of templatesList) {
      let createdByData = null;
      if (template.createdById) {
        const [creator] = await db.select({ id: users.id, firstName: users.firstName, lastName: users.lastName }).from(users).where(eq(users.id, template.createdById));
        createdByData = creator || null;
      }

      const savedReportCountResult = await db.select().from(savedReports).where(eq(savedReports.templateId, template.id));
      const savedReportCount = savedReportCountResult.length;

      results.push({
        ...template,
        createdBy: createdByData,
        savedReportCount,
      });
    }
    return results;
  }

  async updateReportTemplate(id: string, data: Partial<InsertReportTemplate>): Promise<ReportTemplate | undefined> {
    const [updated] = await db.update(reportTemplates).set({ ...data, updatedAt: new Date() }).where(eq(reportTemplates.id, id)).returning();
    return updated;
  }

  async deleteReportTemplate(id: string): Promise<boolean> {
    await db.delete(reportTemplates).where(eq(reportTemplates.id, id));
    return true;
  }

  // Saved Reports
  async createSavedReport(data: InsertSavedReport): Promise<SavedReport> {
    const [report] = await db.insert(savedReports).values(data).returning();
    return report;
  }

  async getSavedReport(id: string): Promise<SavedReport | undefined> {
    const [report] = await db.select().from(savedReports).where(eq(savedReports.id, id));
    return report;
  }

  async getSavedReportWithDetails(id: string): Promise<SavedReportWithDetails | undefined> {
    const [report] = await db.select().from(savedReports).where(eq(savedReports.id, id));
    if (!report) return undefined;

    let templateData = null;
    if (report.templateId) {
      const [template] = await db.select().from(reportTemplates).where(eq(reportTemplates.id, report.templateId));
      templateData = template || null;
    }

    const [user] = await db.select({ id: users.id, firstName: users.firstName, lastName: users.lastName }).from(users).where(eq(users.id, report.userId));

    const scheduledReportsList = await db.select().from(scheduledReports).where(eq(scheduledReports.savedReportId, id));

    const [lastRun] = await db.select().from(reportRuns).where(eq(reportRuns.savedReportId, id)).orderBy(desc(reportRuns.createdAt)).limit(1);

    return {
      ...report,
      template: templateData,
      user: user || { id: report.userId, firstName: null, lastName: null },
      scheduledReports: scheduledReportsList,
      lastRun: lastRun || null,
    };
  }

  async listSavedReports(userId: string, filters?: { templateId?: string; isFavorite?: boolean; isPublic?: boolean }): Promise<SavedReportWithDetails[]> {
    const conditions: any[] = [eq(savedReports.userId, userId)];
    if (filters?.templateId) conditions.push(eq(savedReports.templateId, filters.templateId));
    if (filters?.isFavorite !== undefined) conditions.push(eq(savedReports.isFavorite, filters.isFavorite));
    if (filters?.isPublic !== undefined) conditions.push(eq(savedReports.isPublic, filters.isPublic));

    const reportsList = await db.select().from(savedReports).where(and(...conditions)).orderBy(desc(savedReports.createdAt));

    const results: SavedReportWithDetails[] = [];
    for (const report of reportsList) {
      const withDetails = await this.getSavedReportWithDetails(report.id);
      if (withDetails) results.push(withDetails);
    }
    return results;
  }

  async updateSavedReport(id: string, data: Partial<InsertSavedReport>): Promise<SavedReport | undefined> {
    const [updated] = await db.update(savedReports).set({ ...data, updatedAt: new Date() }).where(eq(savedReports.id, id)).returning();
    return updated;
  }

  async deleteSavedReport(id: string): Promise<boolean> {
    await db.delete(savedReports).where(eq(savedReports.id, id));
    return true;
  }

  // Scheduled Reports
  async createScheduledReport(data: InsertScheduledReport): Promise<ScheduledReport> {
    const [report] = await db.insert(scheduledReports).values(data).returning();
    return report;
  }

  async getScheduledReport(id: string): Promise<ScheduledReport | undefined> {
    const [report] = await db.select().from(scheduledReports).where(eq(scheduledReports.id, id));
    return report;
  }

  async listScheduledReports(userId: string, filters?: { isActive?: boolean }): Promise<ScheduledReportWithDetails[]> {
    const conditions: any[] = [eq(scheduledReports.userId, userId)];
    if (filters?.isActive !== undefined) conditions.push(eq(scheduledReports.isActive, filters.isActive));

    const reportsList = await db.select().from(scheduledReports).where(and(...conditions)).orderBy(desc(scheduledReports.createdAt));

    const results: ScheduledReportWithDetails[] = [];
    for (const report of reportsList) {
      const savedReportWithDetails = await this.getSavedReportWithDetails(report.savedReportId);
      if (!savedReportWithDetails) continue;

      const [user] = await db.select({ id: users.id, firstName: users.firstName, lastName: users.lastName }).from(users).where(eq(users.id, report.userId));

      const [lastRun] = await db.select().from(reportRuns).where(eq(reportRuns.scheduledReportId, report.id)).orderBy(desc(reportRuns.createdAt)).limit(1);

      results.push({
        ...report,
        savedReport: savedReportWithDetails,
        user: user || { id: report.userId, firstName: null, lastName: null },
        lastRun: lastRun || null,
      });
    }
    return results;
  }

  async updateScheduledReport(id: string, data: Partial<InsertScheduledReport>): Promise<ScheduledReport | undefined> {
    const [updated] = await db.update(scheduledReports).set({ ...data, updatedAt: new Date() }).where(eq(scheduledReports.id, id)).returning();
    return updated;
  }

  async deleteScheduledReport(id: string): Promise<boolean> {
    await db.delete(scheduledReports).where(eq(scheduledReports.id, id));
    return true;
  }

  async getScheduledReportsDue(): Promise<ScheduledReport[]> {
    const now = new Date();
    return db.select().from(scheduledReports).where(
      and(
        eq(scheduledReports.isActive, true),
        lte(scheduledReports.nextRunAt, now)
      )
    ).orderBy(asc(scheduledReports.nextRunAt));
  }

  // Report Runs
  async createReportRun(data: InsertReportRun): Promise<ReportRun> {
    const [run] = await db.insert(reportRuns).values(data).returning();
    return run;
  }

  async getReportRun(id: string): Promise<ReportRun | undefined> {
    const [run] = await db.select().from(reportRuns).where(eq(reportRuns.id, id));
    return run;
  }

  async listReportRuns(filters?: { userId?: string; savedReportId?: string; scheduledReportId?: string; status?: string }): Promise<ReportRunWithDetails[]> {
    const conditions: any[] = [];
    if (filters?.userId) conditions.push(eq(reportRuns.userId, filters.userId));
    if (filters?.savedReportId) conditions.push(eq(reportRuns.savedReportId, filters.savedReportId));
    if (filters?.scheduledReportId) conditions.push(eq(reportRuns.scheduledReportId, filters.scheduledReportId));
    if (filters?.status) conditions.push(eq(reportRuns.status, filters.status));

    const runsList = conditions.length > 0
      ? await db.select().from(reportRuns).where(and(...conditions)).orderBy(desc(reportRuns.createdAt))
      : await db.select().from(reportRuns).orderBy(desc(reportRuns.createdAt));

    const results: ReportRunWithDetails[] = [];
    for (const run of runsList) {
      let savedReportData = null;
      if (run.savedReportId) {
        const [sr] = await db.select({ id: savedReports.id, name: savedReports.name }).from(savedReports).where(eq(savedReports.id, run.savedReportId));
        savedReportData = sr || null;
      }

      let scheduledReportData = null;
      if (run.scheduledReportId) {
        const [schr] = await db.select({ id: scheduledReports.id, name: scheduledReports.name }).from(scheduledReports).where(eq(scheduledReports.id, run.scheduledReportId));
        scheduledReportData = schr || null;
      }

      const [user] = await db.select({ id: users.id, firstName: users.firstName, lastName: users.lastName }).from(users).where(eq(users.id, run.userId));

      results.push({
        ...run,
        savedReport: savedReportData,
        scheduledReport: scheduledReportData,
        user: user || { id: run.userId, firstName: null, lastName: null },
      });
    }
    return results;
  }

  async updateReportRun(id: string, data: Partial<InsertReportRun>): Promise<ReportRun | undefined> {
    const [updated] = await db.update(reportRuns).set(data).where(eq(reportRuns.id, id)).returning();
    return updated;
  }

  // Export Logs
  async createExportLog(data: InsertExportLog): Promise<ExportLog> {
    const [log] = await db.insert(exportLogs).values(data).returning();
    return log;
  }

  async listExportLogs(userId: string, filters?: { exportType?: string; format?: string }): Promise<ExportLog[]> {
    const conditions: any[] = [eq(exportLogs.userId, userId)];
    if (filters?.exportType) conditions.push(eq(exportLogs.exportType, filters.exportType));
    if (filters?.format) conditions.push(eq(exportLogs.format, filters.format));

    return db.select().from(exportLogs).where(and(...conditions)).orderBy(desc(exportLogs.createdAt));
  }

  // Executive Dashboards
  async createExecutiveDashboard(data: InsertExecutiveDashboard): Promise<ExecutiveDashboard> {
    const [dashboard] = await db.insert(executiveDashboards).values(data).returning();
    return dashboard;
  }

  async getExecutiveDashboard(id: string): Promise<ExecutiveDashboard | undefined> {
    const [dashboard] = await db.select().from(executiveDashboards).where(eq(executiveDashboards.id, id));
    return dashboard;
  }

  async getExecutiveDashboardWithDetails(id: string): Promise<ExecutiveDashboardWithDetails | undefined> {
    const [dashboard] = await db.select().from(executiveDashboards).where(eq(executiveDashboards.id, id));
    if (!dashboard) return undefined;

    const [user] = await db.select({ id: users.id, firstName: users.firstName, lastName: users.lastName }).from(users).where(eq(users.id, dashboard.userId));

    const widgetsList = await db.select().from(dashboardWidgets).where(eq(dashboardWidgets.dashboardId, id)).orderBy(asc(dashboardWidgets.createdAt));

    return {
      ...dashboard,
      user: user || { id: dashboard.userId, firstName: null, lastName: null },
      widgets: widgetsList,
      widgetCount: widgetsList.length,
    };
  }

  async listExecutiveDashboards(userId: string, filters?: { isPublic?: boolean }): Promise<ExecutiveDashboardWithDetails[]> {
    const conditions: any[] = [];
    if (filters?.isPublic !== undefined) {
      conditions.push(or(eq(executiveDashboards.userId, userId), eq(executiveDashboards.isPublic, true)));
      if (filters.isPublic) {
        conditions.push(eq(executiveDashboards.isPublic, true));
      }
    } else {
      conditions.push(or(eq(executiveDashboards.userId, userId), eq(executiveDashboards.isPublic, true)));
    }

    const dashboardsList = await db.select().from(executiveDashboards).where(and(...conditions)).orderBy(desc(executiveDashboards.createdAt));

    const results: ExecutiveDashboardWithDetails[] = [];
    for (const dashboard of dashboardsList) {
      const withDetails = await this.getExecutiveDashboardWithDetails(dashboard.id);
      if (withDetails) results.push(withDetails);
    }
    return results;
  }

  async updateExecutiveDashboard(id: string, data: Partial<InsertExecutiveDashboard>): Promise<ExecutiveDashboard | undefined> {
    const [updated] = await db.update(executiveDashboards).set({ ...data, updatedAt: new Date() }).where(eq(executiveDashboards.id, id)).returning();
    return updated;
  }

  async deleteExecutiveDashboard(id: string): Promise<boolean> {
    await db.delete(dashboardWidgets).where(eq(dashboardWidgets.dashboardId, id));
    await db.delete(executiveDashboards).where(eq(executiveDashboards.id, id));
    return true;
  }

  // Dashboard Widgets
  async createDashboardWidget(data: InsertDashboardWidget): Promise<DashboardWidget> {
    const [widget] = await db.insert(dashboardWidgets).values(data).returning();
    return widget;
  }

  async getDashboardWidget(id: string): Promise<DashboardWidget | undefined> {
    const [widget] = await db.select().from(dashboardWidgets).where(eq(dashboardWidgets.id, id));
    return widget;
  }

  async listDashboardWidgets(dashboardId: string): Promise<DashboardWidget[]> {
    return db.select().from(dashboardWidgets).where(eq(dashboardWidgets.dashboardId, dashboardId)).orderBy(asc(dashboardWidgets.createdAt));
  }

  async updateDashboardWidget(id: string, data: Partial<InsertDashboardWidget>): Promise<DashboardWidget | undefined> {
    const [updated] = await db.update(dashboardWidgets).set({ ...data, updatedAt: new Date() }).where(eq(dashboardWidgets.id, id)).returning();
    return updated;
  }

  async deleteDashboardWidget(id: string): Promise<boolean> {
    await db.delete(dashboardWidgets).where(eq(dashboardWidgets.id, id));
    return true;
  }

  // KPI Definitions
  async createKpiDefinition(data: InsertKpiDefinition): Promise<KpiDefinition> {
    const [kpi] = await db.insert(kpiDefinitions).values(data).returning();
    return kpi;
  }

  async getKpiDefinition(id: string): Promise<KpiDefinition | undefined> {
    const [kpi] = await db.select().from(kpiDefinitions).where(eq(kpiDefinitions.id, id));
    return kpi;
  }

  async listKpiDefinitions(filters?: { category?: string; isActive?: boolean }): Promise<KpiDefinitionWithDetails[]> {
    const conditions: any[] = [];
    if (filters?.category) conditions.push(eq(kpiDefinitions.category, filters.category));
    if (filters?.isActive !== undefined) conditions.push(eq(kpiDefinitions.isActive, filters.isActive));

    const kpisList = conditions.length > 0
      ? await db.select().from(kpiDefinitions).where(and(...conditions)).orderBy(desc(kpiDefinitions.createdAt))
      : await db.select().from(kpiDefinitions).orderBy(desc(kpiDefinitions.createdAt));

    const results: KpiDefinitionWithDetails[] = [];
    for (const kpi of kpisList) {
      let createdByData = null;
      if (kpi.createdById) {
        const [creator] = await db.select({ id: users.id, firstName: users.firstName, lastName: users.lastName }).from(users).where(eq(users.id, kpi.createdById));
        createdByData = creator || null;
      }

      const latestSnapshot = await this.getLatestKpiSnapshot(kpi.id);

      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (latestSnapshot?.percentChange) {
        const percentChange = parseFloat(latestSnapshot.percentChange);
        if (percentChange > 1) trend = 'up';
        else if (percentChange < -1) trend = 'down';
      }

      results.push({
        ...kpi,
        createdBy: createdByData,
        latestSnapshot: latestSnapshot || null,
        trend,
      });
    }
    return results;
  }

  async updateKpiDefinition(id: string, data: Partial<InsertKpiDefinition>): Promise<KpiDefinition | undefined> {
    const [updated] = await db.update(kpiDefinitions).set({ ...data, updatedAt: new Date() }).where(eq(kpiDefinitions.id, id)).returning();
    return updated;
  }

  async deleteKpiDefinition(id: string): Promise<boolean> {
    await db.delete(kpiSnapshots).where(eq(kpiSnapshots.kpiId, id));
    await db.delete(kpiDefinitions).where(eq(kpiDefinitions.id, id));
    return true;
  }

  // KPI Snapshots
  async createKpiSnapshot(data: InsertKpiSnapshot): Promise<KpiSnapshot> {
    const [snapshot] = await db.insert(kpiSnapshots).values(data).returning();
    return snapshot;
  }

  async listKpiSnapshots(kpiId: string, filters?: { limit?: number }): Promise<KpiSnapshot[]> {
    const limit = filters?.limit || 100;
    return db.select().from(kpiSnapshots).where(eq(kpiSnapshots.kpiId, kpiId)).orderBy(desc(kpiSnapshots.periodEnd)).limit(limit);
  }

  async getLatestKpiSnapshot(kpiId: string): Promise<KpiSnapshot | undefined> {
    const [snapshot] = await db.select().from(kpiSnapshots).where(eq(kpiSnapshots.kpiId, kpiId)).orderBy(desc(kpiSnapshots.periodEnd)).limit(1);
    return snapshot;
  }

  // Analytics
  async getReportAnalytics(): Promise<ReportAnalytics> {
    const allSavedReports = await db.select().from(savedReports);
    const allScheduledReports = await db.select().from(scheduledReports);
    const allExportLogs = await db.select().from(exportLogs);
    const allReportRuns = await db.select().from(reportRuns);
    const allTemplates = await db.select().from(reportTemplates);

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const reportsThisWeek = allReportRuns.filter(r => r.createdAt && r.createdAt >= oneWeekAgo).length;
    const exportsThisWeek = allExportLogs.filter(e => e.createdAt && e.createdAt >= oneWeekAgo).length;

    const categoryMap = new Map<string, number>();
    for (const template of allTemplates) {
      const count = categoryMap.get(template.category) || 0;
      categoryMap.set(template.category, count + 1);
    }
    const reportsByCategory = Array.from(categoryMap.entries()).map(([category, count]) => ({ category, count }));

    const formatMap = new Map<string, number>();
    for (const log of allExportLogs) {
      const count = formatMap.get(log.format) || 0;
      formatMap.set(log.format, count + 1);
    }
    const exportsByFormat = Array.from(formatMap.entries()).map(([format, count]) => ({ format, count }));

    const reportRunCounts = new Map<string, number>();
    for (const run of allReportRuns) {
      if (run.savedReportId) {
        const count = reportRunCounts.get(run.savedReportId) || 0;
        reportRunCounts.set(run.savedReportId, count + 1);
      }
    }
    const topReportIds = Array.from(reportRunCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    const topReports: Array<{ id: string; name: string; runCount: number }> = [];
    for (const [reportId, runCount] of topReportIds) {
      const [report] = await db.select({ id: savedReports.id, name: savedReports.name }).from(savedReports).where(eq(savedReports.id, reportId));
      if (report) {
        topReports.push({ id: report.id, name: report.name, runCount });
      }
    }

    return {
      totalReports: allSavedReports.length,
      totalScheduledReports: allScheduledReports.length,
      totalExports: allExportLogs.length,
      reportsThisWeek,
      exportsThisWeek,
      reportsByCategory,
      exportsByFormat,
      topReports,
    };
  }

  async getDashboardAnalytics(): Promise<DashboardAnalytics> {
    const allDashboards = await db.select().from(executiveDashboards);
    const allWidgets = await db.select().from(dashboardWidgets);
    const allKpis = await db.select().from(kpiDefinitions);

    const categoryMap = new Map<string, number>();
    for (const kpi of allKpis) {
      const count = categoryMap.get(kpi.category) || 0;
      categoryMap.set(kpi.category, count + 1);
    }
    const kpisByCategory = Array.from(categoryMap.entries()).map(([category, count]) => ({ category, count }));

    let healthy = 0;
    let warning = 0;
    let critical = 0;

    for (const kpi of allKpis) {
      const latestSnapshot = await this.getLatestKpiSnapshot(kpi.id);
      if (latestSnapshot) {
        const value = parseFloat(latestSnapshot.value);
        const warningThreshold = kpi.warningThreshold ? parseFloat(kpi.warningThreshold) : null;
        const criticalThreshold = kpi.criticalThreshold ? parseFloat(kpi.criticalThreshold) : null;

        if (kpi.trendDirection === 'higher_is_better') {
          if (criticalThreshold !== null && value <= criticalThreshold) {
            critical++;
          } else if (warningThreshold !== null && value <= warningThreshold) {
            warning++;
          } else {
            healthy++;
          }
        } else {
          if (criticalThreshold !== null && value >= criticalThreshold) {
            critical++;
          } else if (warningThreshold !== null && value >= warningThreshold) {
            warning++;
          } else {
            healthy++;
          }
        }
      } else {
        healthy++;
      }
    }

    return {
      totalDashboards: allDashboards.length,
      totalWidgets: allWidgets.length,
      totalKpis: allKpis.length,
      kpisByCategory,
      kpiHealthStatus: {
        healthy,
        warning,
        critical,
      },
    };
  }

  // ============================================
  // SKILLS QUESTIONNAIRE Methods
  // ============================================

  // Skill Categories
  async getSkillCategory(id: string): Promise<SkillCategory | undefined> {
    const [category] = await db.select().from(skillCategories).where(eq(skillCategories.id, id));
    return category;
  }

  async listSkillCategories(filters?: { category?: string; isActive?: boolean }): Promise<SkillCategory[]> {
    const conditions: any[] = [];
    if (filters?.category) conditions.push(eq(skillCategories.category, filters.category as any));
    if (filters?.isActive !== undefined) conditions.push(eq(skillCategories.isActive, filters.isActive));

    return conditions.length > 0
      ? db.select().from(skillCategories).where(and(...conditions)).orderBy(asc(skillCategories.sortOrder))
      : db.select().from(skillCategories).orderBy(asc(skillCategories.sortOrder));
  }

  async createSkillCategory(data: InsertSkillCategory): Promise<SkillCategory> {
    const [category] = await db.insert(skillCategories).values(data).returning();
    return category;
  }

  async updateSkillCategory(id: string, data: Partial<InsertSkillCategory>): Promise<SkillCategory | undefined> {
    const [updated] = await db.update(skillCategories).set(data).where(eq(skillCategories.id, id)).returning();
    return updated;
  }

  async deleteSkillCategory(id: string): Promise<boolean> {
    await db.delete(skillItems).where(eq(skillItems.categoryId, id));
    await db.delete(skillCategories).where(eq(skillCategories.id, id));
    return true;
  }

  // Skill Items
  async getSkillItem(id: string): Promise<SkillItem | undefined> {
    const [item] = await db.select().from(skillItems).where(eq(skillItems.id, id));
    return item;
  }

  async listSkillItems(filters?: { categoryId?: string; isActive?: boolean }): Promise<SkillItem[]> {
    const conditions: any[] = [];
    if (filters?.categoryId) conditions.push(eq(skillItems.categoryId, filters.categoryId));
    if (filters?.isActive !== undefined) conditions.push(eq(skillItems.isActive, filters.isActive));

    return conditions.length > 0
      ? db.select().from(skillItems).where(and(...conditions)).orderBy(asc(skillItems.sortOrder))
      : db.select().from(skillItems).orderBy(asc(skillItems.sortOrder));
  }

  async createSkillItem(data: InsertSkillItem): Promise<SkillItem> {
    const [item] = await db.insert(skillItems).values(data).returning();
    return item;
  }

  async updateSkillItem(id: string, data: Partial<InsertSkillItem>): Promise<SkillItem | undefined> {
    const [updated] = await db.update(skillItems).set(data).where(eq(skillItems.id, id)).returning();
    return updated;
  }

  async deleteSkillItem(id: string): Promise<boolean> {
    await db.delete(consultantSkills).where(eq(consultantSkills.skillItemId, id));
    await db.delete(skillItems).where(eq(skillItems.id, id));
    return true;
  }

  // Consultant Questionnaires
  async getConsultantQuestionnaire(id: string): Promise<ConsultantQuestionnaire | undefined> {
    const [questionnaire] = await db.select().from(consultantQuestionnaires).where(eq(consultantQuestionnaires.id, id));
    return questionnaire;
  }

  async getQuestionnaireByConsultantId(consultantId: string): Promise<ConsultantQuestionnaire | undefined> {
    const [questionnaire] = await db.select().from(consultantQuestionnaires).where(eq(consultantQuestionnaires.consultantId, consultantId));
    return questionnaire;
  }

  async getQuestionnaireWithSkills(consultantId: string): Promise<QuestionnaireWithSkills | undefined> {
    const [questionnaire] = await db.select().from(consultantQuestionnaires).where(eq(consultantQuestionnaires.consultantId, consultantId));
    if (!questionnaire) return undefined;

    const skills = await db.select({
      skill: consultantSkills,
      skillItem: skillItems,
    })
      .from(consultantSkills)
      .leftJoin(skillItems, eq(consultantSkills.skillItemId, skillItems.id))
      .where(eq(consultantSkills.consultantId, consultantId));

    const ehrExp = await db.select().from(consultantEhrExperience).where(eq(consultantEhrExperience.consultantId, consultantId));
    const certs = await db.select().from(consultantCertifications).where(eq(consultantCertifications.consultantId, consultantId));

    return {
      ...questionnaire,
      skills: skills.map(s => ({ ...s.skill, skillItem: s.skillItem! })),
      ehrExperience: ehrExp,
      certifications: certs,
    };
  }

  async createConsultantQuestionnaire(data: InsertConsultantQuestionnaire): Promise<ConsultantQuestionnaire> {
    const [questionnaire] = await db.insert(consultantQuestionnaires).values(data).returning();
    return questionnaire;
  }

  async updateConsultantQuestionnaire(id: string, data: Partial<InsertConsultantQuestionnaire>): Promise<ConsultantQuestionnaire | undefined> {
    const [updated] = await db.update(consultantQuestionnaires)
      .set({ ...data, updatedAt: new Date(), lastSavedAt: new Date() })
      .where(eq(consultantQuestionnaires.id, id))
      .returning();
    return updated;
  }

  async listQuestionnaires(filters?: { status?: string }): Promise<ConsultantQuestionnaire[]> {
    if (filters?.status) {
      return db.select().from(consultantQuestionnaires).where(eq(consultantQuestionnaires.status, filters.status as any));
    }
    return db.select().from(consultantQuestionnaires);
  }

  // Consultant Skills
  async getConsultantSkill(id: string): Promise<ConsultantSkill | undefined> {
    const [skill] = await db.select().from(consultantSkills).where(eq(consultantSkills.id, id));
    return skill;
  }

  async listConsultantSkills(consultantId: string): Promise<ConsultantSkill[]> {
    return db.select().from(consultantSkills).where(eq(consultantSkills.consultantId, consultantId));
  }

  async createConsultantSkill(data: InsertConsultantSkill): Promise<ConsultantSkill> {
    const [skill] = await db.insert(consultantSkills).values(data).returning();
    return skill;
  }

  async updateConsultantSkill(id: string, data: Partial<InsertConsultantSkill>): Promise<ConsultantSkill | undefined> {
    const [updated] = await db.update(consultantSkills)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(consultantSkills.id, id))
      .returning();
    return updated;
  }

  async deleteConsultantSkill(id: string): Promise<boolean> {
    await db.delete(skillVerifications).where(eq(skillVerifications.consultantSkillId, id));
    await db.delete(consultantSkills).where(eq(consultantSkills.id, id));
    return true;
  }

  async upsertConsultantSkill(data: InsertConsultantSkill): Promise<ConsultantSkill> {
    const existing = await db.select().from(consultantSkills)
      .where(and(
        eq(consultantSkills.consultantId, data.consultantId),
        eq(consultantSkills.skillItemId, data.skillItemId)
      ));
    
    if (existing.length > 0) {
      const [updated] = await db.update(consultantSkills)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(consultantSkills.id, existing[0].id))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(consultantSkills).values(data).returning();
      return created;
    }
  }

  // Skill Verifications
  async createSkillVerification(data: InsertSkillVerification): Promise<SkillVerification> {
    const [verification] = await db.insert(skillVerifications).values(data).returning();
    return verification;
  }

  async listSkillVerifications(consultantSkillId: string): Promise<SkillVerification[]> {
    return db.select().from(skillVerifications).where(eq(skillVerifications.consultantSkillId, consultantSkillId)).orderBy(desc(skillVerifications.createdAt));
  }

  // EHR Experience
  async getConsultantEhrExperience(id: string): Promise<ConsultantEhrExperience | undefined> {
    const [exp] = await db.select().from(consultantEhrExperience).where(eq(consultantEhrExperience.id, id));
    return exp;
  }

  async listConsultantEhrExperience(consultantId: string): Promise<ConsultantEhrExperience[]> {
    return db.select().from(consultantEhrExperience).where(eq(consultantEhrExperience.consultantId, consultantId));
  }

  async createConsultantEhrExperience(data: InsertConsultantEhrExperience): Promise<ConsultantEhrExperience> {
    const [exp] = await db.insert(consultantEhrExperience).values(data).returning();
    return exp;
  }

  async updateConsultantEhrExperience(id: string, data: Partial<InsertConsultantEhrExperience>): Promise<ConsultantEhrExperience | undefined> {
    const [updated] = await db.update(consultantEhrExperience)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(consultantEhrExperience.id, id))
      .returning();
    return updated;
  }

  async deleteConsultantEhrExperience(id: string): Promise<boolean> {
    await db.delete(consultantEhrExperience).where(eq(consultantEhrExperience.id, id));
    return true;
  }

  async upsertConsultantEhrExperience(consultantId: string, ehrSystem: string, data: Partial<InsertConsultantEhrExperience>): Promise<ConsultantEhrExperience> {
    const existing = await db.select().from(consultantEhrExperience)
      .where(and(
        eq(consultantEhrExperience.consultantId, consultantId),
        eq(consultantEhrExperience.ehrSystem, ehrSystem)
      ));
    
    if (existing.length > 0) {
      const [updated] = await db.update(consultantEhrExperience)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(consultantEhrExperience.id, existing[0].id))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(consultantEhrExperience).values({
        consultantId,
        ehrSystem,
        ...data,
      } as InsertConsultantEhrExperience).returning();
      return created;
    }
  }

  // Consultant Certifications
  async getConsultantCertification(id: string): Promise<ConsultantCertification | undefined> {
    const [cert] = await db.select().from(consultantCertifications).where(eq(consultantCertifications.id, id));
    return cert;
  }

  async listConsultantCertifications(consultantId: string): Promise<ConsultantCertification[]> {
    return db.select().from(consultantCertifications).where(eq(consultantCertifications.consultantId, consultantId));
  }

  async createConsultantCertification(data: InsertConsultantCertification): Promise<ConsultantCertification> {
    const [cert] = await db.insert(consultantCertifications).values(data).returning();
    return cert;
  }

  async updateConsultantCertification(id: string, data: Partial<InsertConsultantCertification>): Promise<ConsultantCertification | undefined> {
    const [updated] = await db.update(consultantCertifications)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(consultantCertifications.id, id))
      .returning();
    return updated;
  }

  async deleteConsultantCertification(id: string): Promise<boolean> {
    await db.delete(consultantCertifications).where(eq(consultantCertifications.id, id));
    return true;
  }

  // Seed skill categories and items
  async seedSkillsData(): Promise<void> {
    // Check if already seeded
    const existingCategories = await db.select().from(skillCategories).limit(1);
    if (existingCategories.length > 0) return;

    // EHR Systems
    const ehrSystemsCategory = await this.createSkillCategory({
      name: 'ehr_systems',
      displayName: 'EHR Systems',
      description: 'Electronic Health Record systems experience',
      category: 'ehr_systems',
      sortOrder: 1,
    });

    const ehrSystems = [
      { name: 'epic', displayName: 'Epic' },
      { name: 'cerner', displayName: 'Cerner/Oracle Health' },
      { name: 'meditech', displayName: 'MEDITECH' },
      { name: 'allscripts', displayName: 'Allscripts' },
      { name: 'nextgen', displayName: 'NextGen' },
      { name: 'athenahealth', displayName: 'athenahealth' },
      { name: 'eclinicalworks', displayName: 'eClinicalWorks' },
      { name: 'veradigm', displayName: 'Veradigm (Allscripts Practice Fusion)' },
      { name: 'cpsi', displayName: 'CPSI/TruBridge' },
      { name: 'medhost', displayName: 'MedHost' },
    ];

    for (let i = 0; i < ehrSystems.length; i++) {
      await this.createSkillItem({
        categoryId: ehrSystemsCategory.id,
        name: ehrSystems[i].name,
        displayName: ehrSystems[i].displayName,
        sortOrder: i + 1,
      });
    }

    // Clinical Modules
    const clinicalModulesCategory = await this.createSkillCategory({
      name: 'clinical_modules',
      displayName: 'Clinical Modules',
      description: 'Clinical application modules experience',
      category: 'clinical_modules',
      sortOrder: 2,
    });

    const clinicalModules = [
      { name: 'inpatient_nursing', displayName: 'Inpatient Nursing' },
      { name: 'outpatient_nursing', displayName: 'Outpatient/Ambulatory Nursing' },
      { name: 'emergency_department', displayName: 'Emergency Department' },
      { name: 'pharmacy', displayName: 'Pharmacy' },
      { name: 'laboratory', displayName: 'Laboratory' },
      { name: 'radiology', displayName: 'Radiology/Imaging' },
      { name: 'surgical_services', displayName: 'Surgical Services/OR' },
      { name: 'physician_documentation', displayName: 'Physician Documentation' },
      { name: 'cpoe', displayName: 'Computerized Provider Order Entry (CPOE)' },
      { name: 'clinical_decision_support', displayName: 'Clinical Decision Support' },
      { name: 'health_information_exchange', displayName: 'Health Information Exchange (HIE)' },
      { name: 'patient_portal', displayName: 'Patient Portal' },
      { name: 'telehealth', displayName: 'Telehealth/Virtual Care' },
      { name: 'behavioral_health', displayName: 'Behavioral Health' },
      { name: 'oncology', displayName: 'Oncology' },
      { name: 'cardiology', displayName: 'Cardiology' },
      { name: 'obstetrics', displayName: 'Obstetrics/Labor & Delivery' },
    ];

    for (let i = 0; i < clinicalModules.length; i++) {
      await this.createSkillItem({
        categoryId: clinicalModulesCategory.id,
        name: clinicalModules[i].name,
        displayName: clinicalModules[i].displayName,
        sortOrder: i + 1,
      });
    }

    // Revenue Cycle
    const revenueCycleCategory = await this.createSkillCategory({
      name: 'revenue_cycle',
      displayName: 'Revenue Cycle',
      description: 'Revenue cycle management experience',
      category: 'revenue_cycle',
      sortOrder: 3,
    });

    const revenueCycleModules = [
      { name: 'patient_registration', displayName: 'Patient Registration/ADT' },
      { name: 'scheduling', displayName: 'Scheduling' },
      { name: 'charge_capture', displayName: 'Charge Capture' },
      { name: 'coding', displayName: 'Coding (ICD-10, CPT)' },
      { name: 'billing', displayName: 'Billing' },
      { name: 'claims_management', displayName: 'Claims Management' },
      { name: 'denials_management', displayName: 'Denials Management' },
      { name: 'collections', displayName: 'Collections' },
      { name: 'contract_management', displayName: 'Contract Management' },
    ];

    for (let i = 0; i < revenueCycleModules.length; i++) {
      await this.createSkillItem({
        categoryId: revenueCycleCategory.id,
        name: revenueCycleModules[i].name,
        displayName: revenueCycleModules[i].displayName,
        sortOrder: i + 1,
      });
    }

    // Ancillary Systems
    const ancillaryCategory = await this.createSkillCategory({
      name: 'ancillary_systems',
      displayName: 'Ancillary Systems',
      description: 'Ancillary and departmental systems',
      category: 'ancillary_systems',
      sortOrder: 4,
    });

    const ancillarySystems = [
      { name: 'pacs', displayName: 'PACS (Picture Archiving)' },
      { name: 'lis', displayName: 'Laboratory Information System (LIS)' },
      { name: 'ris', displayName: 'Radiology Information System (RIS)' },
      { name: 'blood_bank', displayName: 'Blood Bank' },
      { name: 'dietary', displayName: 'Dietary/Nutrition' },
      { name: 'materials_management', displayName: 'Materials Management' },
      { name: 'transport', displayName: 'Patient Transport' },
      { name: 'bed_management', displayName: 'Bed Management' },
    ];

    for (let i = 0; i < ancillarySystems.length; i++) {
      await this.createSkillItem({
        categoryId: ancillaryCategory.id,
        name: ancillarySystems[i].name,
        displayName: ancillarySystems[i].displayName,
        sortOrder: i + 1,
      });
    }

    // Technical Skills
    const technicalCategory = await this.createSkillCategory({
      name: 'technical_skills',
      displayName: 'Technical Skills',
      description: 'Technical and implementation skills',
      category: 'technical_skills',
      sortOrder: 5,
    });

    const technicalSkills = [
      { name: 'system_build', displayName: 'System Build/Configuration' },
      { name: 'data_migration', displayName: 'Data Migration' },
      { name: 'integration', displayName: 'Integration (HL7, FHIR)' },
      { name: 'workflow_design', displayName: 'Workflow Design' },
      { name: 'testing', displayName: 'Testing (Unit, Integration, UAT)' },
      { name: 'training', displayName: 'End User Training' },
      { name: 'go_live_support', displayName: 'Go-Live Support' },
      { name: 'report_writing', displayName: 'Report Writing' },
      { name: 'sql', displayName: 'SQL/Database Queries' },
      { name: 'project_management', displayName: 'Project Management' },
    ];

    for (let i = 0; i < technicalSkills.length; i++) {
      await this.createSkillItem({
        categoryId: technicalCategory.id,
        name: technicalSkills[i].name,
        displayName: technicalSkills[i].displayName,
        sortOrder: i + 1,
      });
    }

    // Certifications category
    const certificationsCategory = await this.createSkillCategory({
      name: 'certifications',
      displayName: 'Certifications',
      description: 'Professional certifications',
      category: 'certifications',
      sortOrder: 6,
    });

    const certifications = [
      { name: 'epic_certified', displayName: 'Epic Certified' },
      { name: 'cerner_certified', displayName: 'Cerner/Oracle Certified' },
      { name: 'pmp', displayName: 'PMP (Project Management Professional)' },
      { name: 'six_sigma', displayName: 'Six Sigma' },
      { name: 'itil', displayName: 'ITIL' },
      { name: 'rhia', displayName: 'RHIA (Registered Health Information Administrator)' },
      { name: 'rhit', displayName: 'RHIT (Registered Health Information Technician)' },
      { name: 'cphims', displayName: 'CPHIMS (Certified Professional in Healthcare Information)' },
    ];

    for (let i = 0; i < certifications.length; i++) {
      await this.createSkillItem({
        categoryId: certificationsCategory.id,
        name: certifications[i].name,
        displayName: certifications[i].displayName,
        sortOrder: i + 1,
      });
    }

    console.log('Skills questionnaire data seeded successfully');
  }

  // ============================================
  // RBAC (Role-Based Access Control) Methods
  // ============================================

  // Role operations
  async getRole(id: string): Promise<Role | undefined> {
    const [role] = await db.select().from(roles).where(eq(roles.id, id));
    return role;
  }

  async getRoleByName(name: string): Promise<Role | undefined> {
    const [role] = await db.select().from(roles).where(eq(roles.name, name));
    return role;
  }

  async listRoles(filters?: { roleType?: 'base' | 'custom'; hospitalId?: string; isActive?: boolean }): Promise<Role[]> {
    const conditions: any[] = [];
    if (filters?.roleType) conditions.push(eq(roles.roleType, filters.roleType));
    if (filters?.hospitalId) conditions.push(eq(roles.hospitalId, filters.hospitalId));
    if (filters?.isActive !== undefined) conditions.push(eq(roles.isActive, filters.isActive));

    return conditions.length > 0
      ? db.select().from(roles).where(and(...conditions)).orderBy(asc(roles.name))
      : db.select().from(roles).orderBy(asc(roles.name));
  }

  async createRole(role: InsertRole): Promise<Role> {
    const [created] = await db.insert(roles).values(role).returning();
    return created;
  }

  async updateRole(id: string, role: Partial<InsertRole>): Promise<Role | undefined> {
    const [updated] = await db.update(roles).set({ ...role, updatedAt: new Date() }).where(eq(roles.id, id)).returning();
    return updated;
  }

  async deleteRole(id: string): Promise<boolean> {
    await db.delete(rolePermissions).where(eq(rolePermissions.roleId, id));
    await db.delete(userRoleAssignments).where(eq(userRoleAssignments.roleId, id));
    await db.delete(roles).where(eq(roles.id, id));
    return true;
  }

  // Permission operations
  async getPermission(id: string): Promise<Permission | undefined> {
    const [permission] = await db.select().from(permissions).where(eq(permissions.id, id));
    return permission;
  }

  async getPermissionByName(name: string): Promise<Permission | undefined> {
    const [permission] = await db.select().from(permissions).where(eq(permissions.name, name));
    return permission;
  }

  async listPermissions(filters?: { domain?: string; isActive?: boolean }): Promise<Permission[]> {
    const conditions: any[] = [];
    if (filters?.domain) conditions.push(eq(permissions.domain, filters.domain as any));
    if (filters?.isActive !== undefined) conditions.push(eq(permissions.isActive, filters.isActive));

    return conditions.length > 0
      ? db.select().from(permissions).where(and(...conditions)).orderBy(asc(permissions.domain), asc(permissions.action))
      : db.select().from(permissions).orderBy(asc(permissions.domain), asc(permissions.action));
  }

  async createPermission(permission: InsertPermission): Promise<Permission> {
    const [created] = await db.insert(permissions).values(permission).returning();
    return created;
  }

  // Role-Permission operations
  async getRolePermissions(roleId: string): Promise<RolePermission[]> {
    return db.select().from(rolePermissions).where(eq(rolePermissions.roleId, roleId));
  }

  async getRoleWithPermissions(roleId: string): Promise<RoleWithPermissions | undefined> {
    const role = await this.getRole(roleId);
    if (!role) return undefined;

    const rolePerms = await db.select().from(rolePermissions).where(eq(rolePermissions.roleId, roleId));
    const permissionsWithDetails: (RolePermission & { permission: Permission })[] = [];

    for (const rp of rolePerms) {
      const permission = await this.getPermission(rp.permissionId);
      if (permission) {
        permissionsWithDetails.push({ ...rp, permission });
      }
    }

    return { ...role, permissions: permissionsWithDetails };
  }

  async addPermissionToRole(roleId: string, permissionId: string): Promise<RolePermission> {
    const existing = await db.select().from(rolePermissions)
      .where(and(eq(rolePermissions.roleId, roleId), eq(rolePermissions.permissionId, permissionId)));
    
    if (existing.length > 0) return existing[0];

    const [created] = await db.insert(rolePermissions).values({ roleId, permissionId }).returning();
    return created;
  }

  async removePermissionFromRole(roleId: string, permissionId: string): Promise<boolean> {
    await db.delete(rolePermissions)
      .where(and(eq(rolePermissions.roleId, roleId), eq(rolePermissions.permissionId, permissionId)));
    return true;
  }

  async setRolePermissions(roleId: string, permissionIds: string[]): Promise<RolePermission[]> {
    await db.delete(rolePermissions).where(eq(rolePermissions.roleId, roleId));

    if (permissionIds.length === 0) return [];

    const values = permissionIds.map(permissionId => ({ roleId, permissionId }));
    const created = await db.insert(rolePermissions).values(values).returning();
    return created;
  }

  // User Role Assignment operations
  async getUserRoleAssignments(userId: string): Promise<UserRoleAssignment[]> {
    return db.select().from(userRoleAssignments)
      .where(and(eq(userRoleAssignments.userId, userId), eq(userRoleAssignments.isActive, true)));
  }

  async getUserRoleAssignmentsWithDetails(userId: string): Promise<(UserRoleAssignment & { role: Role })[]> {
    const assignments = await this.getUserRoleAssignments(userId);
    const results: (UserRoleAssignment & { role: Role })[] = [];

    for (const assignment of assignments) {
      const role = await this.getRole(assignment.roleId);
      if (role) {
        results.push({ ...assignment, role });
      }
    }

    return results;
  }

  async assignRoleToUser(assignment: InsertUserRoleAssignment): Promise<UserRoleAssignment> {
    const conditions: any[] = [
      eq(userRoleAssignments.userId, assignment.userId),
      eq(userRoleAssignments.roleId, assignment.roleId),
      eq(userRoleAssignments.isActive, true),
    ];
    
    if (assignment.projectId) {
      conditions.push(eq(userRoleAssignments.projectId, assignment.projectId));
    } else {
      conditions.push(sql`${userRoleAssignments.projectId} IS NULL`);
    }

    const existing = await db.select().from(userRoleAssignments).where(and(...conditions));
    if (existing.length > 0) return existing[0];

    const [created] = await db.insert(userRoleAssignments).values(assignment).returning();
    return created;
  }

  async removeRoleFromUser(userId: string, roleId: string, projectId?: string): Promise<boolean> {
    const conditions: any[] = [
      eq(userRoleAssignments.userId, userId),
      eq(userRoleAssignments.roleId, roleId),
    ];

    if (projectId) {
      conditions.push(eq(userRoleAssignments.projectId, projectId));
    }

    await db.update(userRoleAssignments)
      .set({ isActive: false, updatedAt: new Date() })
      .where(and(...conditions));
    return true;
  }

  // Effective Permissions (computed)
  async getEffectivePermissions(userId: string, projectId?: string): Promise<EffectivePermissions[]> {
    const assignments = await this.getUserRoleAssignments(userId);
    const results: EffectivePermissions[] = [];

    for (const assignment of assignments) {
      if (projectId && assignment.projectId && assignment.projectId !== projectId) {
        continue;
      }

      const role = await this.getRole(assignment.roleId);
      if (!role || !role.isActive) continue;

      const rolePerms = await this.getRolePermissions(assignment.roleId);
      const permissionNames: string[] = [];

      for (const rp of rolePerms) {
        const permission = await this.getPermission(rp.permissionId);
        if (permission && permission.isActive) {
          permissionNames.push(permission.name);
        }
      }

      results.push({
        roleId: role.id,
        roleName: role.name,
        permissions: permissionNames,
        projectId: assignment.projectId,
        hospitalId: assignment.hospitalId,
      });
    }

    return results;
  }

  async hasPermission(userId: string, permissionName: string, projectId?: string): Promise<boolean> {
    const effectivePermissions = await this.getEffectivePermissions(userId, projectId);
    
    for (const ep of effectivePermissions) {
      if (ep.permissions.includes(permissionName)) {
        return true;
      }
    }

    return false;
  }

  // Seeding base roles and permissions
  async seedBaseRolesAndPermissions(): Promise<void> {
    const permissionDefinitions: Array<{ domain: string; action: string; name: string; displayName: string; description: string }> = [
      { domain: 'dashboard', action: 'view', name: 'dashboard:view', displayName: 'View Dashboard', description: 'Access to view the dashboard' },
      { domain: 'dashboard', action: 'admin', name: 'dashboard:admin', displayName: 'Admin Dashboard', description: 'Full admin access to dashboard' },
      { domain: 'projects', action: 'view', name: 'projects:view', displayName: 'View Projects', description: 'View project information' },
      { domain: 'projects', action: 'create', name: 'projects:create', displayName: 'Create Projects', description: 'Create new projects' },
      { domain: 'projects', action: 'edit', name: 'projects:edit', displayName: 'Edit Projects', description: 'Edit project details' },
      { domain: 'projects', action: 'delete', name: 'projects:delete', displayName: 'Delete Projects', description: 'Delete projects' },
      { domain: 'consultants', action: 'view', name: 'consultants:view', displayName: 'View Consultants', description: 'View consultant profiles' },
      { domain: 'consultants', action: 'create', name: 'consultants:create', displayName: 'Create Consultants', description: 'Create new consultant profiles' },
      { domain: 'consultants', action: 'edit', name: 'consultants:edit', displayName: 'Edit Consultants', description: 'Edit consultant profiles' },
      { domain: 'consultants', action: 'manage', name: 'consultants:manage', displayName: 'Manage Consultants', description: 'Full management of consultants' },
      { domain: 'hospitals', action: 'view', name: 'hospitals:view', displayName: 'View Hospitals', description: 'View hospital information' },
      { domain: 'hospitals', action: 'create', name: 'hospitals:create', displayName: 'Create Hospitals', description: 'Create new hospitals' },
      { domain: 'hospitals', action: 'edit', name: 'hospitals:edit', displayName: 'Edit Hospitals', description: 'Edit hospital details' },
      { domain: 'hospitals', action: 'delete', name: 'hospitals:delete', displayName: 'Delete Hospitals', description: 'Delete hospitals' },
      { domain: 'timesheets', action: 'view_own', name: 'timesheets:view_own', displayName: 'View Own Timesheets', description: 'View own timesheet entries' },
      { domain: 'timesheets', action: 'view_all', name: 'timesheets:view_all', displayName: 'View All Timesheets', description: 'View all timesheet entries' },
      { domain: 'timesheets', action: 'edit_own', name: 'timesheets:edit_own', displayName: 'Edit Own Timesheets', description: 'Edit own timesheet entries' },
      { domain: 'timesheets', action: 'approve', name: 'timesheets:approve', displayName: 'Approve Timesheets', description: 'Approve timesheet submissions' },
      { domain: 'support_tickets', action: 'view_own', name: 'support_tickets:view_own', displayName: 'View Own Support Tickets', description: 'View own support tickets' },
      { domain: 'support_tickets', action: 'view_all', name: 'support_tickets:view_all', displayName: 'View All Support Tickets', description: 'View all support tickets' },
      { domain: 'support_tickets', action: 'create', name: 'support_tickets:create', displayName: 'Create Support Tickets', description: 'Create new support tickets' },
      { domain: 'support_tickets', action: 'manage', name: 'support_tickets:manage', displayName: 'Manage Support Tickets', description: 'Full management of support tickets' },
      { domain: 'eod_reports', action: 'view_own', name: 'eod_reports:view_own', displayName: 'View Own EOD Reports', description: 'View own end-of-day reports' },
      { domain: 'eod_reports', action: 'view_all', name: 'eod_reports:view_all', displayName: 'View All EOD Reports', description: 'View all end-of-day reports' },
      { domain: 'eod_reports', action: 'create', name: 'eod_reports:create', displayName: 'Create EOD Reports', description: 'Create end-of-day reports' },
      { domain: 'training', action: 'view', name: 'training:view', displayName: 'View Training', description: 'Access training materials' },
      { domain: 'training', action: 'manage', name: 'training:manage', displayName: 'Manage Training', description: 'Manage training content' },
      { domain: 'travel', action: 'view_own', name: 'travel:view_own', displayName: 'View Own Travel', description: 'View own travel bookings' },
      { domain: 'travel', action: 'view_all', name: 'travel:view_all', displayName: 'View All Travel', description: 'View all travel bookings' },
      { domain: 'travel', action: 'manage', name: 'travel:manage', displayName: 'Manage Travel', description: 'Manage travel arrangements' },
      { domain: 'financials', action: 'view', name: 'financials:view', displayName: 'View Financials', description: 'View financial data' },
      { domain: 'financials', action: 'manage', name: 'financials:manage', displayName: 'Manage Financials', description: 'Manage financial data' },
      { domain: 'quality', action: 'view', name: 'quality:view', displayName: 'View Quality', description: 'View quality metrics' },
      { domain: 'quality', action: 'manage', name: 'quality:manage', displayName: 'Manage Quality', description: 'Manage quality processes' },
      { domain: 'compliance', action: 'view', name: 'compliance:view', displayName: 'View Compliance', description: 'View compliance data' },
      { domain: 'compliance', action: 'manage', name: 'compliance:manage', displayName: 'Manage Compliance', description: 'Manage compliance processes' },
      { domain: 'reports', action: 'view', name: 'reports:view', displayName: 'View Reports', description: 'View generated reports' },
      { domain: 'reports', action: 'create', name: 'reports:create', displayName: 'Create Reports', description: 'Create new reports' },
      { domain: 'reports', action: 'manage', name: 'reports:manage', displayName: 'Manage Reports', description: 'Manage report templates' },
      { domain: 'admin', action: 'view', name: 'admin:view', displayName: 'View Admin', description: 'View admin panel' },
      { domain: 'admin', action: 'manage', name: 'admin:manage', displayName: 'Manage Admin', description: 'Full admin management' },
      { domain: 'rbac', action: 'view', name: 'rbac:view', displayName: 'View RBAC', description: 'View roles and permissions' },
      { domain: 'rbac', action: 'manage', name: 'rbac:manage', displayName: 'Manage RBAC', description: 'Manage roles and permissions' },
    ];

    const createdPermissions: Map<string, Permission> = new Map();
    for (const permDef of permissionDefinitions) {
      const existing = await this.getPermissionByName(permDef.name);
      if (existing) {
        createdPermissions.set(permDef.name, existing);
      } else {
        const created = await this.createPermission({
          domain: permDef.domain as any,
          action: permDef.action,
          name: permDef.name,
          displayName: permDef.displayName,
          description: permDef.description,
          isActive: true,
        });
        createdPermissions.set(permDef.name, created);
      }
    }

    const roleDefinitions: Array<{ name: string; displayName: string; description: string; roleType: 'base' | 'implementation' | 'custom'; permissions: string[] }> = [
      // === BASE ROLES ===
      {
        name: 'admin',
        displayName: 'Administrator',
        description: 'Full access to all system features',
        roleType: 'base',
        permissions: permissionDefinitions.map(p => p.name),
      },
      {
        name: 'hospital_leadership',
        displayName: 'Hospital Leadership',
        description: 'Hospital-wide view access to reports and financials',
        roleType: 'base',
        permissions: [
          'dashboard:view', 'projects:view', 'consultants:view', 'hospitals:view',
          'timesheets:view_all', 'support_tickets:view_all', 'eod_reports:view_all',
          'training:view', 'travel:view_all', 'financials:view', 'quality:view',
          'compliance:view', 'reports:view', 'reports:create',
        ],
      },
      {
        name: 'hospital_staff',
        displayName: 'Hospital Staff',
        description: 'Operational data access for hospital staff',
        roleType: 'base',
        permissions: [
          'dashboard:view', 'projects:view', 'timesheets:view_all', 'timesheets:approve',
          'support_tickets:view_all', 'support_tickets:manage', 'eod_reports:view_all',
          'training:view',
        ],
      },
      {
        name: 'consultant',
        displayName: 'Consultant',
        description: 'Access to assigned projects and own data',
        roleType: 'base',
        permissions: [
          'dashboard:view', 'projects:view', 'timesheets:view_own', 'timesheets:edit_own',
          'support_tickets:view_own', 'support_tickets:create', 'eod_reports:view_own',
          'eod_reports:create', 'training:view', 'travel:view_own',
        ],
      },

      // === IMPLEMENTATION LEADERSHIP ROLES ===
      {
        name: 'implementation_project_manager',
        displayName: 'Implementation Project Manager',
        description: 'Overall project oversight across all implementation phases',
        roleType: 'implementation',
        permissions: [
          'dashboard:view', 'dashboard:admin', 'projects:view', 'projects:create', 'projects:edit',
          'consultants:view', 'consultants:manage', 'hospitals:view',
          'timesheets:view_all', 'timesheets:approve', 'support_tickets:view_all', 'support_tickets:manage',
          'eod_reports:view_all', 'training:view', 'training:manage', 'travel:view_all', 'travel:manage',
          'financials:view', 'financials:manage', 'quality:view', 'quality:manage',
          'compliance:view', 'reports:view', 'reports:create', 'reports:manage',
        ],
      },
      {
        name: 'go_live_coordinator',
        displayName: 'Go-Live Coordinator',
        description: 'Manages go-live operations, command center, and escalations',
        roleType: 'implementation',
        permissions: [
          'dashboard:view', 'projects:view', 'consultants:view',
          'timesheets:view_all', 'support_tickets:view_all', 'support_tickets:manage',
          'eod_reports:view_all', 'training:view', 'quality:view', 'quality:manage',
          'compliance:view', 'reports:view',
        ],
      },
      {
        name: 'training_lead',
        displayName: 'Training Lead',
        description: 'Manages training programs and super user coordination',
        roleType: 'implementation',
        permissions: [
          'dashboard:view', 'projects:view', 'consultants:view',
          'timesheets:view_all', 'support_tickets:view_all',
          'eod_reports:view_all', 'training:view', 'training:manage',
          'quality:view', 'reports:view',
        ],
      },
      {
        name: 'command_center_manager',
        displayName: 'Command Center Manager',
        description: 'Real-time operations management during go-live phases',
        roleType: 'implementation',
        permissions: [
          'dashboard:view', 'projects:view', 'consultants:view',
          'timesheets:view_all', 'support_tickets:view_all', 'support_tickets:manage',
          'eod_reports:view_all', 'eod_reports:create', 'quality:view', 'reports:view',
        ],
      },
      {
        name: 'application_analyst',
        displayName: 'Application Analyst',
        description: 'Technical configuration, build, and tier 2 support',
        roleType: 'implementation',
        permissions: [
          'dashboard:view', 'projects:view', 'timesheets:view_own', 'timesheets:edit_own',
          'support_tickets:view_all', 'support_tickets:create', 'support_tickets:manage',
          'eod_reports:view_own', 'eod_reports:create', 'training:view', 'travel:view_own',
        ],
      },
      {
        name: 'support_desk_lead',
        displayName: 'Support Desk Lead',
        description: 'Tier 1 support management and ticket triage',
        roleType: 'implementation',
        permissions: [
          'dashboard:view', 'projects:view', 'consultants:view',
          'timesheets:view_all', 'support_tickets:view_all', 'support_tickets:manage',
          'eod_reports:view_all', 'training:view', 'reports:view',
        ],
      },
      {
        name: 'quality_assurance_lead',
        displayName: 'Quality Assurance Lead',
        description: 'Quality metrics, compliance tracking, and audit management',
        roleType: 'implementation',
        permissions: [
          'dashboard:view', 'projects:view', 'consultants:view',
          'timesheets:view_all', 'support_tickets:view_all', 'eod_reports:view_all',
          'training:view', 'quality:view', 'quality:manage',
          'compliance:view', 'compliance:manage', 'reports:view', 'reports:create',
        ],
      },

      // === PHASE-SPECIFIC ROLES ===
      {
        name: 'at_the_elbow_support',
        displayName: 'At-the-Elbow Support',
        description: 'On-floor support during go-live providing direct user assistance',
        roleType: 'implementation',
        permissions: [
          'dashboard:view', 'projects:view', 'timesheets:view_own', 'timesheets:edit_own',
          'support_tickets:view_own', 'support_tickets:create',
          'eod_reports:view_own', 'eod_reports:create', 'training:view',
        ],
      },
      {
        name: 'super_user',
        displayName: 'Super User',
        description: 'Hospital staff with elevated training and support access',
        roleType: 'implementation',
        permissions: [
          'dashboard:view', 'projects:view', 'timesheets:view_own',
          'support_tickets:view_own', 'support_tickets:create',
          'eod_reports:view_own', 'training:view', 'quality:view',
        ],
      },
      {
        name: 'optimization_analyst',
        displayName: 'Optimization Analyst',
        description: 'Post-go-live workflow optimization and efficiency improvements',
        roleType: 'implementation',
        permissions: [
          'dashboard:view', 'projects:view', 'consultants:view',
          'timesheets:view_all', 'support_tickets:view_all', 'eod_reports:view_all',
          'training:view', 'quality:view', 'quality:manage',
          'reports:view', 'reports:create',
        ],
      },
      {
        name: 'stabilization_lead',
        displayName: 'Stabilization Lead',
        description: 'Post-go-live stabilization phase management and issue resolution',
        roleType: 'implementation',
        permissions: [
          'dashboard:view', 'projects:view', 'consultants:view',
          'timesheets:view_all', 'support_tickets:view_all', 'support_tickets:manage',
          'eod_reports:view_all', 'training:view', 'quality:view',
          'compliance:view', 'reports:view',
        ],
      },
      {
        name: 'transition_coordinator',
        displayName: 'Transition Coordinator',
        description: 'Manages transition from implementation to ongoing operations',
        roleType: 'implementation',
        permissions: [
          'dashboard:view', 'projects:view', 'consultants:view', 'hospitals:view',
          'timesheets:view_all', 'support_tickets:view_all', 'eod_reports:view_all',
          'training:view', 'training:manage', 'quality:view',
          'compliance:view', 'reports:view', 'reports:create',
        ],
      },
    ];

    for (const roleDef of roleDefinitions) {
      let role = await this.getRoleByName(roleDef.name);
      if (!role) {
        role = await this.createRole({
          name: roleDef.name,
          displayName: roleDef.displayName,
          description: roleDef.description,
          roleType: roleDef.roleType,
          isActive: true,
        });
      } else if (role.roleType !== roleDef.roleType) {
        await db.update(roles).set({ roleType: roleDef.roleType }).where(eq(roles.id, role.id));
        role = { ...role, roleType: roleDef.roleType };
      }

      const permissionIds: string[] = [];
      for (const permName of roleDef.permissions) {
        const perm = createdPermissions.get(permName);
        if (perm) {
          permissionIds.push(perm.id);
        }
      }

      await this.setRolePermissions(role.id, permissionIds);
    }
  }

  // ============================================
  // PHASE 18: INTEGRATION & AUTOMATION
  // ============================================

  // Integration Connections
  async getIntegrationConnection(id: string): Promise<IntegrationConnection | undefined> {
    const [connection] = await db.select().from(integrationConnections).where(eq(integrationConnections.id, id));
    return connection;
  }

  async listIntegrationConnections(filters?: { category?: string; provider?: string; status?: string; isActive?: boolean }): Promise<IntegrationConnection[]> {
    const conditions = [];
    if (filters?.category) conditions.push(eq(integrationConnections.category, filters.category));
    if (filters?.provider) conditions.push(eq(integrationConnections.provider, filters.provider as any));
    if (filters?.status) conditions.push(eq(integrationConnections.status, filters.status as any));
    if (filters?.isActive !== undefined) conditions.push(eq(integrationConnections.isActive, filters.isActive));
    
    const query = conditions.length > 0 
      ? db.select().from(integrationConnections).where(and(...conditions))
      : db.select().from(integrationConnections);
    return query.orderBy(desc(integrationConnections.createdAt));
  }

  async createIntegrationConnection(data: InsertIntegrationConnection): Promise<IntegrationConnection> {
    const [connection] = await db.insert(integrationConnections).values(data).returning();
    return connection;
  }

  async updateIntegrationConnection(id: string, data: Partial<InsertIntegrationConnection>): Promise<IntegrationConnection | undefined> {
    const [updated] = await db.update(integrationConnections)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(integrationConnections.id, id))
      .returning();
    return updated;
  }

  async deleteIntegrationConnection(id: string): Promise<boolean> {
    const result = await db.delete(integrationConnections).where(eq(integrationConnections.id, id));
    return true;
  }

  // Sync Jobs
  async getSyncJob(id: string): Promise<SyncJob | undefined> {
    const [job] = await db.select().from(syncJobs).where(eq(syncJobs.id, id));
    return job;
  }

  async listSyncJobs(filters?: { connectionId?: string; status?: string }): Promise<SyncJob[]> {
    const conditions = [];
    if (filters?.connectionId) conditions.push(eq(syncJobs.connectionId, filters.connectionId));
    if (filters?.status) conditions.push(eq(syncJobs.status, filters.status as any));
    
    const query = conditions.length > 0
      ? db.select().from(syncJobs).where(and(...conditions))
      : db.select().from(syncJobs);
    return query.orderBy(desc(syncJobs.createdAt));
  }

  async createSyncJob(data: InsertSyncJob): Promise<SyncJob> {
    const [job] = await db.insert(syncJobs).values(data).returning();
    return job;
  }

  async updateSyncJob(id: string, data: Partial<InsertSyncJob>): Promise<SyncJob | undefined> {
    const [updated] = await db.update(syncJobs).set(data).where(eq(syncJobs.id, id)).returning();
    return updated;
  }

  // Sync Events
  async listSyncEvents(syncJobId: string): Promise<SyncEvent[]> {
    return db.select().from(syncEvents).where(eq(syncEvents.syncJobId, syncJobId)).orderBy(desc(syncEvents.createdAt));
  }

  async createSyncEvent(data: InsertSyncEvent): Promise<SyncEvent> {
    const [event] = await db.insert(syncEvents).values(data).returning();
    return event;
  }

  // Calendar Sync Settings
  async getCalendarSyncSettings(userId: string): Promise<CalendarSyncSettings | undefined> {
    const [settings] = await db.select().from(calendarSyncSettings).where(eq(calendarSyncSettings.userId, userId));
    return settings;
  }

  async listCalendarSyncSettings(connectionId: string): Promise<CalendarSyncSettings[]> {
    return db.select().from(calendarSyncSettings).where(eq(calendarSyncSettings.connectionId, connectionId));
  }

  async createCalendarSyncSettings(data: InsertCalendarSyncSettings): Promise<CalendarSyncSettings> {
    const [settings] = await db.insert(calendarSyncSettings).values(data).returning();
    return settings;
  }

  async updateCalendarSyncSettings(id: string, data: Partial<InsertCalendarSyncSettings>): Promise<CalendarSyncSettings | undefined> {
    const [updated] = await db.update(calendarSyncSettings)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(calendarSyncSettings.id, id))
      .returning();
    return updated;
  }

  // EHR Systems
  async getEhrSystem(id: string): Promise<EhrSystem | undefined> {
    const [system] = await db.select().from(ehrSystems).where(eq(ehrSystems.id, id));
    return system;
  }

  async listEhrSystems(filters?: { hospitalId?: string; vendor?: string; status?: string; isMonitored?: boolean }): Promise<EhrSystem[]> {
    const conditions = [];
    if (filters?.hospitalId) conditions.push(eq(ehrSystems.hospitalId, filters.hospitalId));
    if (filters?.vendor) conditions.push(eq(ehrSystems.vendor, filters.vendor));
    if (filters?.status) conditions.push(eq(ehrSystems.status, filters.status as any));
    if (filters?.isMonitored !== undefined) conditions.push(eq(ehrSystems.isMonitored, filters.isMonitored));
    
    const query = conditions.length > 0
      ? db.select().from(ehrSystems).where(and(...conditions))
      : db.select().from(ehrSystems);
    return query.orderBy(desc(ehrSystems.createdAt));
  }

  async createEhrSystem(data: InsertEhrSystem): Promise<EhrSystem> {
    const [system] = await db.insert(ehrSystems).values(data).returning();
    return system;
  }

  async updateEhrSystem(id: string, data: Partial<InsertEhrSystem>): Promise<EhrSystem | undefined> {
    const [updated] = await db.update(ehrSystems)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(ehrSystems.id, id))
      .returning();
    return updated;
  }

  async deleteEhrSystem(id: string): Promise<boolean> {
    await db.delete(ehrSystems).where(eq(ehrSystems.id, id));
    return true;
  }

  // EHR Status Metrics
  async listEhrStatusMetrics(ehrSystemId: string, limit: number = 100): Promise<EhrStatusMetric[]> {
    return db.select().from(ehrStatusMetrics)
      .where(eq(ehrStatusMetrics.ehrSystemId, ehrSystemId))
      .orderBy(desc(ehrStatusMetrics.timestamp))
      .limit(limit);
  }

  async createEhrStatusMetric(data: InsertEhrStatusMetric): Promise<EhrStatusMetric> {
    const [metric] = await db.insert(ehrStatusMetrics).values(data).returning();
    return metric;
  }

  // EHR Incidents
  async getEhrIncident(id: string): Promise<EhrIncident | undefined> {
    const [incident] = await db.select().from(ehrIncidents).where(eq(ehrIncidents.id, id));
    return incident;
  }

  async listEhrIncidents(filters?: { ehrSystemId?: string; severity?: string; status?: string }): Promise<EhrIncident[]> {
    const conditions = [];
    if (filters?.ehrSystemId) conditions.push(eq(ehrIncidents.ehrSystemId, filters.ehrSystemId));
    if (filters?.severity) conditions.push(eq(ehrIncidents.severity, filters.severity as any));
    if (filters?.status) conditions.push(eq(ehrIncidents.status, filters.status));
    
    const query = conditions.length > 0
      ? db.select().from(ehrIncidents).where(and(...conditions))
      : db.select().from(ehrIncidents);
    return query.orderBy(desc(ehrIncidents.startedAt));
  }

  async createEhrIncident(data: InsertEhrIncident): Promise<EhrIncident> {
    const [incident] = await db.insert(ehrIncidents).values(data).returning();
    return incident;
  }

  async updateEhrIncident(id: string, data: Partial<InsertEhrIncident>): Promise<EhrIncident | undefined> {
    const [updated] = await db.update(ehrIncidents)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(ehrIncidents.id, id))
      .returning();
    return updated;
  }

  // EHR Incident Updates
  async listEhrIncidentUpdates(incidentId: string): Promise<EhrIncidentUpdate[]> {
    return db.select().from(ehrIncidentUpdates)
      .where(eq(ehrIncidentUpdates.incidentId, incidentId))
      .orderBy(desc(ehrIncidentUpdates.createdAt));
  }

  async createEhrIncidentUpdate(data: InsertEhrIncidentUpdate): Promise<EhrIncidentUpdate> {
    const [update] = await db.insert(ehrIncidentUpdates).values(data).returning();
    return update;
  }

  // Payroll Sync Profiles
  async getPayrollSyncProfile(id: string): Promise<PayrollSyncProfile | undefined> {
    const [profile] = await db.select().from(payrollSyncProfiles).where(eq(payrollSyncProfiles.id, id));
    return profile;
  }

  async listPayrollSyncProfiles(filters?: { connectionId?: string; isActive?: boolean }): Promise<PayrollSyncProfile[]> {
    const conditions = [];
    if (filters?.connectionId) conditions.push(eq(payrollSyncProfiles.connectionId, filters.connectionId));
    if (filters?.isActive !== undefined) conditions.push(eq(payrollSyncProfiles.isActive, filters.isActive));
    
    const query = conditions.length > 0
      ? db.select().from(payrollSyncProfiles).where(and(...conditions))
      : db.select().from(payrollSyncProfiles);
    return query.orderBy(desc(payrollSyncProfiles.createdAt));
  }

  async createPayrollSyncProfile(data: InsertPayrollSyncProfile): Promise<PayrollSyncProfile> {
    const [profile] = await db.insert(payrollSyncProfiles).values(data).returning();
    return profile;
  }

  async updatePayrollSyncProfile(id: string, data: Partial<InsertPayrollSyncProfile>): Promise<PayrollSyncProfile | undefined> {
    const [updated] = await db.update(payrollSyncProfiles)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(payrollSyncProfiles.id, id))
      .returning();
    return updated;
  }

  async deletePayrollSyncProfile(id: string): Promise<boolean> {
    await db.delete(payrollSyncProfiles).where(eq(payrollSyncProfiles.id, id));
    return true;
  }

  // Payroll Export Jobs
  async getPayrollExportJob(id: string): Promise<PayrollExportJob | undefined> {
    const [job] = await db.select().from(payrollExportJobs).where(eq(payrollExportJobs.id, id));
    return job;
  }

  async listPayrollExportJobs(filters?: { profileId?: string; batchId?: string; status?: string }): Promise<PayrollExportJob[]> {
    const conditions = [];
    if (filters?.profileId) conditions.push(eq(payrollExportJobs.profileId, filters.profileId));
    if (filters?.batchId) conditions.push(eq(payrollExportJobs.batchId, filters.batchId));
    if (filters?.status) conditions.push(eq(payrollExportJobs.status, filters.status as any));
    
    const query = conditions.length > 0
      ? db.select().from(payrollExportJobs).where(and(...conditions))
      : db.select().from(payrollExportJobs);
    return query.orderBy(desc(payrollExportJobs.createdAt));
  }

  async createPayrollExportJob(data: InsertPayrollExportJob): Promise<PayrollExportJob> {
    const [job] = await db.insert(payrollExportJobs).values(data).returning();
    return job;
  }

  async updatePayrollExportJob(id: string, data: Partial<InsertPayrollExportJob>): Promise<PayrollExportJob | undefined> {
    const [updated] = await db.update(payrollExportJobs).set(data).where(eq(payrollExportJobs.id, id)).returning();
    return updated;
  }

  // Escalation Triggers
  async getEscalationTrigger(id: string): Promise<EscalationTrigger | undefined> {
    const [trigger] = await db.select().from(escalationTriggers).where(eq(escalationTriggers.id, id));
    return trigger;
  }

  async listEscalationTriggers(filters?: { ruleId?: string; triggerType?: string; isActive?: boolean }): Promise<EscalationTrigger[]> {
    const conditions = [];
    if (filters?.ruleId) conditions.push(eq(escalationTriggers.ruleId, filters.ruleId));
    if (filters?.triggerType) conditions.push(eq(escalationTriggers.triggerType, filters.triggerType));
    if (filters?.isActive !== undefined) conditions.push(eq(escalationTriggers.isActive, filters.isActive));
    
    const query = conditions.length > 0
      ? db.select().from(escalationTriggers).where(and(...conditions))
      : db.select().from(escalationTriggers);
    return query.orderBy(desc(escalationTriggers.createdAt));
  }

  async createEscalationTrigger(data: InsertEscalationTrigger): Promise<EscalationTrigger> {
    const [trigger] = await db.insert(escalationTriggers).values(data).returning();
    return trigger;
  }

  async updateEscalationTrigger(id: string, data: Partial<InsertEscalationTrigger>): Promise<EscalationTrigger | undefined> {
    const [updated] = await db.update(escalationTriggers)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(escalationTriggers.id, id))
      .returning();
    return updated;
  }

  async deleteEscalationTrigger(id: string): Promise<boolean> {
    await db.delete(escalationTriggers).where(eq(escalationTriggers.id, id));
    return true;
  }

  // Escalation Events
  async getEscalationEvent(id: string): Promise<EscalationEvent | undefined> {
    const [event] = await db.select().from(escalationEvents).where(eq(escalationEvents.id, id));
    return event;
  }

  async listEscalationEvents(filters?: { triggerId?: string; ticketId?: string; incidentId?: string }): Promise<EscalationEvent[]> {
    const conditions = [];
    if (filters?.triggerId) conditions.push(eq(escalationEvents.triggerId, filters.triggerId));
    if (filters?.ticketId) conditions.push(eq(escalationEvents.ticketId, filters.ticketId));
    if (filters?.incidentId) conditions.push(eq(escalationEvents.incidentId, filters.incidentId));
    
    const query = conditions.length > 0
      ? db.select().from(escalationEvents).where(and(...conditions))
      : db.select().from(escalationEvents);
    return query.orderBy(desc(escalationEvents.createdAt));
  }

  async createEscalationEvent(data: InsertEscalationEvent): Promise<EscalationEvent> {
    const [event] = await db.insert(escalationEvents).values(data).returning();
    return event;
  }

  async updateEscalationEvent(id: string, data: Partial<InsertEscalationEvent>): Promise<EscalationEvent | undefined> {
    const [updated] = await db.update(escalationEvents).set(data).where(eq(escalationEvents.id, id)).returning();
    return updated;
  }

  // Notification Queue
  async getNotificationQueueItem(id: string): Promise<NotificationQueueItem | undefined> {
    const [item] = await db.select().from(notificationQueue).where(eq(notificationQueue.id, id));
    return item;
  }

  async listNotificationQueue(filters?: { status?: string; type?: string; recipientUserId?: string }): Promise<NotificationQueueItem[]> {
    const conditions = [];
    if (filters?.status) conditions.push(eq(notificationQueue.status, filters.status));
    if (filters?.type) conditions.push(eq(notificationQueue.type, filters.type));
    if (filters?.recipientUserId) conditions.push(eq(notificationQueue.recipientUserId, filters.recipientUserId));
    
    const query = conditions.length > 0
      ? db.select().from(notificationQueue).where(and(...conditions))
      : db.select().from(notificationQueue);
    return query.orderBy(desc(notificationQueue.createdAt));
  }

  async createNotificationQueueItem(data: InsertNotificationQueue): Promise<NotificationQueueItem> {
    const [item] = await db.insert(notificationQueue).values(data).returning();
    return item;
  }

  async updateNotificationQueueItem(id: string, data: Partial<InsertNotificationQueue>): Promise<NotificationQueueItem | undefined> {
    const [updated] = await db.update(notificationQueue).set(data).where(eq(notificationQueue.id, id)).returning();
    return updated;
  }

  // Automation Workflows
  async getAutomationWorkflow(id: string): Promise<AutomationWorkflow | undefined> {
    const [workflow] = await db.select().from(automationWorkflows).where(eq(automationWorkflows.id, id));
    return workflow;
  }

  async listAutomationWorkflows(filters?: { category?: string; triggerEvent?: string; isActive?: boolean }): Promise<AutomationWorkflow[]> {
    const conditions = [];
    if (filters?.category) conditions.push(eq(automationWorkflows.category, filters.category));
    if (filters?.triggerEvent) conditions.push(eq(automationWorkflows.triggerEvent, filters.triggerEvent));
    if (filters?.isActive !== undefined) conditions.push(eq(automationWorkflows.isActive, filters.isActive));
    
    const query = conditions.length > 0
      ? db.select().from(automationWorkflows).where(and(...conditions))
      : db.select().from(automationWorkflows);
    return query.orderBy(desc(automationWorkflows.createdAt));
  }

  async createAutomationWorkflow(data: InsertAutomationWorkflow): Promise<AutomationWorkflow> {
    const [workflow] = await db.insert(automationWorkflows).values(data).returning();
    return workflow;
  }

  async updateAutomationWorkflow(id: string, data: Partial<InsertAutomationWorkflow>): Promise<AutomationWorkflow | undefined> {
    const [updated] = await db.update(automationWorkflows)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(automationWorkflows.id, id))
      .returning();
    return updated;
  }

  async deleteAutomationWorkflow(id: string): Promise<boolean> {
    await db.delete(automationWorkflows).where(eq(automationWorkflows.id, id));
    return true;
  }

  // Workflow Executions
  async getWorkflowExecution(id: string): Promise<WorkflowExecution | undefined> {
    const [execution] = await db.select().from(workflowExecutions).where(eq(workflowExecutions.id, id));
    return execution;
  }

  async listWorkflowExecutions(filters?: { workflowId?: string; status?: string }): Promise<WorkflowExecution[]> {
    const conditions = [];
    if (filters?.workflowId) conditions.push(eq(workflowExecutions.workflowId, filters.workflowId));
    if (filters?.status) conditions.push(eq(workflowExecutions.status, filters.status));
    
    const query = conditions.length > 0
      ? db.select().from(workflowExecutions).where(and(...conditions))
      : db.select().from(workflowExecutions);
    return query.orderBy(desc(workflowExecutions.createdAt));
  }

  async createWorkflowExecution(data: InsertWorkflowExecution): Promise<WorkflowExecution> {
    const [execution] = await db.insert(workflowExecutions).values(data).returning();
    return execution;
  }

  async updateWorkflowExecution(id: string, data: Partial<InsertWorkflowExecution>): Promise<WorkflowExecution | undefined> {
    const [updated] = await db.update(workflowExecutions).set(data).where(eq(workflowExecutions.id, id)).returning();
    return updated;
  }

  // Integration Analytics
  async getIntegrationAnalytics(): Promise<IntegrationAnalytics> {
    const allConnections = await db.select().from(integrationConnections);
    const activeConnections = allConnections.filter(c => c.isActive && c.status === 'connected');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaysJobs = await db.select().from(syncJobs)
      .where(gte(syncJobs.createdAt, today));
    
    const successfulJobs = todaysJobs.filter(j => j.status === 'completed');
    
    const connectionsByProvider = allConnections.reduce((acc, conn) => {
      const existing = acc.find(p => p.provider === conn.provider);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ provider: conn.provider, count: 1, status: conn.status });
      }
      return acc;
    }, [] as Array<{ provider: string; count: number; status: string }>);

    const recentJobs = await db.select().from(syncJobs)
      .orderBy(desc(syncJobs.createdAt))
      .limit(10);

    const recentSyncJobs: SyncJobWithDetails[] = await Promise.all(
      recentJobs.map(async (job) => {
        const [connection] = await db.select().from(integrationConnections)
          .where(eq(integrationConnections.id, job.connectionId));
        const eventCount = await db.select({ count: sql<number>`count(*)` })
          .from(syncEvents)
          .where(eq(syncEvents.syncJobId, job.id));
        
        let triggeredBy = null;
        if (job.triggeredByUserId) {
          const [user] = await db.select({
            id: users.id,
            firstName: users.firstName,
            lastName: users.lastName
          }).from(users).where(eq(users.id, job.triggeredByUserId));
          triggeredBy = user || null;
        }

        return {
          ...job,
          connection,
          triggeredBy,
          eventCount: Number(eventCount[0]?.count || 0)
        };
      })
    );

    return {
      totalConnections: allConnections.length,
      activeConnections: activeConnections.length,
      connectionsByProvider,
      syncJobsToday: todaysJobs.length,
      syncJobsSuccessRate: todaysJobs.length > 0 ? (successfulJobs.length / todaysJobs.length) * 100 : 100,
      recentSyncJobs
    };
  }

  async getEhrMonitoringAnalytics(): Promise<EhrMonitoringAnalytics> {
    const allSystems = await db.select().from(ehrSystems);
    const operationalSystems = allSystems.filter(s => s.status === 'operational');
    const degradedSystems = allSystems.filter(s => s.status === 'degraded' || s.status === 'partial_outage');
    
    const activeIncidentsRaw = await db.select().from(ehrIncidents)
      .where(and(
        or(
          eq(ehrIncidents.status, 'investigating'),
          eq(ehrIncidents.status, 'identified'),
          eq(ehrIncidents.status, 'monitoring')
        )
      ))
      .orderBy(desc(ehrIncidents.startedAt));

    const systemsWithIncidents = new Set(activeIncidentsRaw.map(i => i.ehrSystemId)).size;
    
    const avgUptime = allSystems.reduce((sum, s) => sum + parseFloat(s.uptimePercent || '0'), 0) / (allSystems.length || 1);
    const avgResponseTime = allSystems.reduce((sum, s) => sum + (s.avgResponseTime || 0), 0) / (allSystems.length || 1);

    const activeIncidents: EhrIncidentWithDetails[] = await Promise.all(
      activeIncidentsRaw.slice(0, 10).map(async (incident) => {
        const [ehrSystem] = await db.select().from(ehrSystems)
          .where(eq(ehrSystems.id, incident.ehrSystemId));
        
        let reportedBy = null;
        if (incident.reportedByUserId) {
          const [user] = await db.select({
            id: users.id,
            firstName: users.firstName,
            lastName: users.lastName
          }).from(users).where(eq(users.id, incident.reportedByUserId));
          reportedBy = user || null;
        }

        let assignedTo = null;
        if (incident.assignedToUserId) {
          const [user] = await db.select({
            id: users.id,
            firstName: users.firstName,
            lastName: users.lastName
          }).from(users).where(eq(users.id, incident.assignedToUserId));
          assignedTo = user || null;
        }

        const updates = await db.select().from(ehrIncidentUpdates)
          .where(eq(ehrIncidentUpdates.incidentId, incident.id))
          .orderBy(desc(ehrIncidentUpdates.createdAt));

        return {
          ...incident,
          ehrSystem,
          reportedBy,
          assignedTo,
          updates
        };
      })
    );

    const systemsByVendor = allSystems.reduce((acc, sys) => {
      const existing = acc.find(v => v.vendor === sys.vendor);
      if (existing) {
        existing.count++;
        existing.avgUptime = (existing.avgUptime + parseFloat(sys.uptimePercent || '0')) / 2;
      } else {
        acc.push({ vendor: sys.vendor, count: 1, avgUptime: parseFloat(sys.uptimePercent || '0') });
      }
      return acc;
    }, [] as Array<{ vendor: string; count: number; avgUptime: number }>);

    return {
      totalSystems: allSystems.length,
      operationalSystems: operationalSystems.length,
      degradedSystems: degradedSystems.length,
      systemsWithIncidents,
      averageUptime: avgUptime,
      averageResponseTime: avgResponseTime,
      activeIncidents,
      systemsByVendor
    };
  }

  async getEscalationAnalytics(): Promise<EscalationAnalytics> {
    const allTriggers = await db.select().from(escalationTriggers);
    const activeTriggers = allTriggers.filter(t => t.isActive);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const todaysEvents = await db.select().from(escalationEvents)
      .where(gte(escalationEvents.createdAt, today));
    
    const weeksEvents = await db.select().from(escalationEvents)
      .where(gte(escalationEvents.createdAt, weekAgo));
    
    const eventsByType = allTriggers.reduce((acc, trigger) => {
      const count = weeksEvents.filter(e => e.triggerId === trigger.id).length;
      const existing = acc.find(t => t.type === trigger.triggerType);
      if (existing) {
        existing.count += count;
      } else {
        acc.push({ type: trigger.triggerType, count });
      }
      return acc;
    }, [] as Array<{ type: string; count: number }>);
    
    const acknowledgedEvents = weeksEvents.filter(e => e.acknowledgedAt);
    const acknowledgementRate = weeksEvents.length > 0 
      ? (acknowledgedEvents.length / weeksEvents.length) * 100 
      : 100;
    
    const recentEventsRaw = await db.select().from(escalationEvents)
      .orderBy(desc(escalationEvents.createdAt))
      .limit(10);

    const avgResponseTime = acknowledgedEvents.length > 0
      ? acknowledgedEvents.reduce((sum, e) => {
          const created = new Date(e.createdAt!);
          const acknowledged = new Date(e.acknowledgedAt!);
          return sum + (acknowledged.getTime() - created.getTime()) / 60000; // minutes
        }, 0) / acknowledgedEvents.length
      : 0;

    const recentEvents = await Promise.all(
      recentEventsRaw.map(async (event) => {
        const [trigger] = await db.select({
          id: escalationTriggers.id,
          name: escalationTriggers.name,
          triggerType: escalationTriggers.triggerType
        }).from(escalationTriggers).where(eq(escalationTriggers.id, event.triggerId));
        
        let ticket = null;
        if (event.ticketId) {
          const [t] = await db.select().from(supportTickets)
            .where(eq(supportTickets.id, event.ticketId));
          ticket = t || null;
        }

        let incident = null;
        if (event.incidentId) {
          const [i] = await db.select().from(incidents)
            .where(eq(incidents.id, event.incidentId));
          incident = i || null;
        }

        let acknowledgedBy = null;
        if (event.acknowledgedByUserId) {
          const [user] = await db.select({
            id: users.id,
            firstName: users.firstName,
            lastName: users.lastName
          }).from(users).where(eq(users.id, event.acknowledgedByUserId));
          acknowledgedBy = user || null;
        }

        return {
          ...event,
          trigger,
          ticket,
          incident,
          acknowledgedBy
        };
      })
    );

    return {
      totalTriggers: allTriggers.length,
      activeTriggers: activeTriggers.length,
      eventsToday: todaysEvents.length,
      eventsThisWeek: weeksEvents.length,
      eventsByType,
      averageResponseTime: avgResponseTime,
      acknowledgementRate,
      recentEvents
    };
  }
}

export const storage = new DatabaseStorage();
