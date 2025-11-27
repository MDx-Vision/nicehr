import { sql, relations } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  timestamp,
  integer,
  boolean,
  decimal,
  date,
  jsonb,
  index,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const userRoleEnum = pgEnum("user_role", ["admin", "hospital_staff", "consultant"]);
export const documentStatusEnum = pgEnum("document_status", ["pending", "approved", "rejected", "expired"]);
export const projectStatusEnum = pgEnum("project_status", ["draft", "active", "completed", "cancelled"]);
export const scheduleStatusEnum = pgEnum("schedule_status", ["pending", "approved", "rejected"]);
export const shiftTypeEnum = pgEnum("shift_type", ["day", "night", "swing"]);
export const profileVisibilityEnum = pgEnum("profile_visibility", ["public", "members_only", "private"]);

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);

// Users table with role-based access
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  coverPhotoUrl: varchar("cover_photo_url"),
  linkedinUrl: varchar("linkedin_url"),
  websiteUrl: varchar("website_url"),
  role: userRoleEnum("role").default("consultant").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  profileVisibility: profileVisibilityEnum("profile_visibility").default("public").notNull(),
  emailNotifications: boolean("email_notifications").default(true).notNull(),
  showEmail: boolean("show_email").default(false).notNull(),
  showPhone: boolean("show_phone").default(false).notNull(),
  deletionRequestedAt: timestamp("deletion_requested_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const usersRelations = relations(users, ({ one }) => ({
  consultant: one(consultants, {
    fields: [users.id],
    references: [consultants.userId],
  }),
  hospitalStaff: one(hospitalStaff, {
    fields: [users.id],
    references: [hospitalStaff.userId],
  }),
}));

// Consultants table
export const consultants = pgTable("consultants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull().unique(),
  tngId: varchar("tng_id").unique(),
  phone: varchar("phone"),
  address: text("address"),
  city: varchar("city"),
  state: varchar("state"),
  zipCode: varchar("zip_code"),
  location: varchar("location"),
  yearsExperience: integer("years_experience").default(0),
  emrSystems: text("emr_systems").array(),
  modules: text("modules").array(),
  units: text("units").array(),
  positions: text("positions").array(),
  certifications: text("certifications").array(),
  shiftPreference: shiftTypeEnum("shift_preference"),
  flightPreference: text("flight_preference"),
  flightRewardsNumber: varchar("flight_rewards_number"),
  hotelPreference: text("hotel_preference"),
  hotelRewardsNumber: varchar("hotel_rewards_number"),
  preferredColleagues: text("preferred_colleagues").array(),
  bio: text("bio"),
  linkedinUrl: varchar("linkedin_url"),
  twitterUrl: varchar("twitter_url"),
  websiteUrl: varchar("website_url"),
  payRate: decimal("pay_rate", { precision: 10, scale: 2 }),
  isOnboarded: boolean("is_onboarded").default(false).notNull(),
  isAvailable: boolean("is_available").default(true).notNull(),
  backgroundCheckComplete: boolean("background_check_complete").default(false),
  drugScreenComplete: boolean("drug_screen_complete").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const consultantsRelations = relations(consultants, ({ one, many }) => ({
  user: one(users, {
    fields: [consultants.userId],
    references: [users.id],
  }),
  documents: many(consultantDocuments),
  availability: many(consultantAvailability),
  schedules: many(scheduleAssignments),
  ratings: many(consultantRatings),
}));

// Consultant availability
export const consultantAvailability = pgTable("consultant_availability", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  consultantId: varchar("consultant_id").references(() => consultants.id).notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  isAvailable: boolean("is_available").default(true).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const consultantAvailabilityRelations = relations(consultantAvailability, ({ one }) => ({
  consultant: one(consultants, {
    fields: [consultantAvailability.consultantId],
    references: [consultants.id],
  }),
}));

// Document types
export const documentTypes = pgTable("document_types", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  isRequired: boolean("is_required").default(true).notNull(),
  hasExpiration: boolean("has_expiration").default(false).notNull(),
  expirationMonths: integer("expiration_months"),
  category: varchar("category"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Consultant documents
export const consultantDocuments = pgTable("consultant_documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  consultantId: varchar("consultant_id").references(() => consultants.id).notNull(),
  documentTypeId: varchar("document_type_id").references(() => documentTypes.id).notNull(),
  fileName: varchar("file_name").notNull(),
  fileUrl: varchar("file_url").notNull(),
  status: documentStatusEnum("status").default("pending").notNull(),
  expirationDate: date("expiration_date"),
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const consultantDocumentsRelations = relations(consultantDocuments, ({ one }) => ({
  consultant: one(consultants, {
    fields: [consultantDocuments.consultantId],
    references: [consultants.id],
  }),
  documentType: one(documentTypes, {
    fields: [consultantDocuments.documentTypeId],
    references: [documentTypes.id],
  }),
  reviewer: one(users, {
    fields: [consultantDocuments.reviewedBy],
    references: [users.id],
  }),
}));

// Hospitals
export const hospitals = pgTable("hospitals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  address: text("address"),
  city: varchar("city"),
  state: varchar("state"),
  zipCode: varchar("zip_code"),
  phone: varchar("phone"),
  email: varchar("email"),
  website: varchar("website"),
  emrSystem: varchar("emr_system"),
  totalStaff: integer("total_staff"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const hospitalsRelations = relations(hospitals, ({ many }) => ({
  units: many(hospitalUnits),
  staff: many(hospitalStaff),
  projects: many(projects),
}));

// Hospital units (ER, ICU, etc.)
export const hospitalUnits = pgTable("hospital_units", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  hospitalId: varchar("hospital_id").references(() => hospitals.id).notNull(),
  name: varchar("name").notNull(),
  description: text("description"),
  staffCount: integer("staff_count").default(0),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const hospitalUnitsRelations = relations(hospitalUnits, ({ one, many }) => ({
  hospital: one(hospitals, {
    fields: [hospitalUnits.hospitalId],
    references: [hospitals.id],
  }),
  modules: many(hospitalModules),
}));

// Hospital modules (EMR components)
export const hospitalModules = pgTable("hospital_modules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  unitId: varchar("unit_id").references(() => hospitalUnits.id).notNull(),
  name: varchar("name").notNull(),
  description: text("description"),
  consultantsRequired: integer("consultants_required").default(1),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const hospitalModulesRelations = relations(hospitalModules, ({ one }) => ({
  unit: one(hospitalUnits, {
    fields: [hospitalModules.unitId],
    references: [hospitalUnits.id],
  }),
}));

// Hospital staff
export const hospitalStaff = pgTable("hospital_staff", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull().unique(),
  hospitalId: varchar("hospital_id").references(() => hospitals.id).notNull(),
  position: varchar("position"),
  department: varchar("department"),
  phone: varchar("phone"),
  isLeadership: boolean("is_leadership").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const hospitalStaffRelations = relations(hospitalStaff, ({ one }) => ({
  user: one(users, {
    fields: [hospitalStaff.userId],
    references: [users.id],
  }),
  hospital: one(hospitals, {
    fields: [hospitalStaff.hospitalId],
    references: [hospitals.id],
  }),
}));

// Projects
export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  hospitalId: varchar("hospital_id").references(() => hospitals.id).notNull(),
  name: varchar("name").notNull(),
  description: text("description"),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  status: projectStatusEnum("status").default("draft").notNull(),
  estimatedConsultants: integer("estimated_consultants").default(0),
  actualConsultants: integer("actual_consultants").default(0),
  estimatedBudget: decimal("estimated_budget", { precision: 12, scale: 2 }),
  actualBudget: decimal("actual_budget", { precision: 12, scale: 2 }),
  savings: decimal("savings", { precision: 12, scale: 2 }),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const projectsRelations = relations(projects, ({ one, many }) => ({
  hospital: one(hospitals, {
    fields: [projects.hospitalId],
    references: [hospitals.id],
  }),
  creator: one(users, {
    fields: [projects.createdBy],
    references: [users.id],
  }),
  requirements: many(projectRequirements),
  schedules: many(projectSchedules),
  surveys: many(roiSurveys),
}));

// Project requirements (which modules/units need consultants)
export const projectRequirements = pgTable("project_requirements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").references(() => projects.id).notNull(),
  unitId: varchar("unit_id").references(() => hospitalUnits.id),
  moduleId: varchar("module_id").references(() => hospitalModules.id),
  consultantsNeeded: integer("consultants_needed").default(1).notNull(),
  shiftType: shiftTypeEnum("shift_type"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const projectRequirementsRelations = relations(projectRequirements, ({ one }) => ({
  project: one(projects, {
    fields: [projectRequirements.projectId],
    references: [projects.id],
  }),
  unit: one(hospitalUnits, {
    fields: [projectRequirements.unitId],
    references: [hospitalUnits.id],
  }),
  module: one(hospitalModules, {
    fields: [projectRequirements.moduleId],
    references: [hospitalModules.id],
  }),
}));

// Project schedules (shifts/assignments)
export const projectSchedules = pgTable("project_schedules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").references(() => projects.id).notNull(),
  scheduleDate: date("schedule_date").notNull(),
  shiftType: shiftTypeEnum("shift_type").notNull(),
  status: scheduleStatusEnum("status").default("pending").notNull(),
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const projectSchedulesRelations = relations(projectSchedules, ({ one, many }) => ({
  project: one(projects, {
    fields: [projectSchedules.projectId],
    references: [projects.id],
  }),
  approver: one(users, {
    fields: [projectSchedules.approvedBy],
    references: [users.id],
  }),
  assignments: many(scheduleAssignments),
}));

// Schedule assignments (consultant to position)
export const scheduleAssignments = pgTable("schedule_assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  scheduleId: varchar("schedule_id").references(() => projectSchedules.id).notNull(),
  consultantId: varchar("consultant_id").references(() => consultants.id).notNull(),
  unitId: varchar("unit_id").references(() => hospitalUnits.id),
  moduleId: varchar("module_id").references(() => hospitalModules.id),
  startTime: timestamp("start_time"),
  endTime: timestamp("end_time"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const scheduleAssignmentsRelations = relations(scheduleAssignments, ({ one }) => ({
  schedule: one(projectSchedules, {
    fields: [scheduleAssignments.scheduleId],
    references: [projectSchedules.id],
  }),
  consultant: one(consultants, {
    fields: [scheduleAssignments.consultantId],
    references: [consultants.id],
  }),
  unit: one(hospitalUnits, {
    fields: [scheduleAssignments.unitId],
    references: [hospitalUnits.id],
  }),
  module: one(hospitalModules, {
    fields: [scheduleAssignments.moduleId],
    references: [hospitalModules.id],
  }),
}));

// Consultant ratings
export const consultantRatings = pgTable("consultant_ratings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  consultantId: varchar("consultant_id").references(() => consultants.id).notNull(),
  projectId: varchar("project_id").references(() => projects.id).notNull(),
  ratedBy: varchar("rated_by").references(() => users.id).notNull(),
  mannerism: integer("mannerism"),
  professionalism: integer("professionalism"),
  knowledge: integer("knowledge"),
  overallRating: integer("overall_rating"),
  comments: text("comments"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const consultantRatingsRelations = relations(consultantRatings, ({ one }) => ({
  consultant: one(consultants, {
    fields: [consultantRatings.consultantId],
    references: [consultants.id],
  }),
  project: one(projects, {
    fields: [consultantRatings.projectId],
    references: [projects.id],
  }),
  rater: one(users, {
    fields: [consultantRatings.ratedBy],
    references: [users.id],
  }),
}));

// Budget calculations
export const budgetCalculations = pgTable("budget_calculations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").references(() => projects.id).notNull(),
  estimatedConsultants: integer("estimated_consultants").notNull(),
  optimizedConsultants: integer("optimized_consultants").notNull(),
  avgPayRate: decimal("avg_pay_rate", { precision: 10, scale: 2 }),
  avgFlightCost: decimal("avg_flight_cost", { precision: 10, scale: 2 }),
  avgHotelCost: decimal("avg_hotel_cost", { precision: 10, scale: 2 }),
  avgPerDiem: decimal("avg_per_diem", { precision: 10, scale: 2 }),
  totalEstimatedCost: decimal("total_estimated_cost", { precision: 12, scale: 2 }),
  totalOptimizedCost: decimal("total_optimized_cost", { precision: 12, scale: 2 }),
  totalSavings: decimal("total_savings", { precision: 12, scale: 2 }),
  savingsPercentage: decimal("savings_percentage", { precision: 5, scale: 2 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const budgetCalculationsRelations = relations(budgetCalculations, ({ one }) => ({
  project: one(projects, {
    fields: [budgetCalculations.projectId],
    references: [projects.id],
  }),
}));

// ROI survey questions
export const roiQuestions = pgTable("roi_questions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  question: text("question").notNull(),
  category: varchar("category"),
  questionType: varchar("question_type").default("rating"),
  isActive: boolean("is_active").default(true).notNull(),
  orderIndex: integer("order_index").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// ROI surveys
export const roiSurveys = pgTable("roi_surveys", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").references(() => projects.id).notNull(),
  respondentId: varchar("respondent_id").references(() => users.id).notNull(),
  isComplete: boolean("is_complete").default(false).notNull(),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const roiSurveysRelations = relations(roiSurveys, ({ one, many }) => ({
  project: one(projects, {
    fields: [roiSurveys.projectId],
    references: [projects.id],
  }),
  respondent: one(users, {
    fields: [roiSurveys.respondentId],
    references: [users.id],
  }),
  responses: many(roiResponses),
}));

// ROI responses
export const roiResponses = pgTable("roi_responses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  surveyId: varchar("survey_id").references(() => roiSurveys.id).notNull(),
  questionId: varchar("question_id").references(() => roiQuestions.id).notNull(),
  rating: integer("rating"),
  textResponse: text("text_response"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Email status enum
export const emailStatusEnum = pgEnum("email_status", ["sent", "failed", "pending"]);

// Email notification logs for tracking sent emails
export const emailNotifications = pgTable("email_notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  recipientEmail: varchar("recipient_email").notNull(),
  templateType: varchar("template_type").notNull(),
  subject: varchar("subject").notNull(),
  status: emailStatusEnum("status").default("pending").notNull(),
  error: text("error"),
  metadata: jsonb("metadata"),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Resource type enum for content access rules
export const resourceTypeEnum = pgEnum("resource_type", ["page", "api", "feature"]);

// Content access rules table for role-based content restriction
export const contentAccessRules = pgTable("content_access_rules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  resourceType: resourceTypeEnum("resource_type").notNull(),
  resourceKey: varchar("resource_key").notNull(),
  name: varchar("name").notNull(),
  description: text("description"),
  allowedRoles: text("allowed_roles").array().notNull(),
  deniedRoles: text("denied_roles").array(),
  restrictionMessage: text("restriction_message"),
  isActive: boolean("is_active").default(true).notNull(),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_content_access_resource").on(table.resourceType, table.resourceKey),
]);

// Content access audit log for tracking access violations
export const contentAccessAudit = pgTable("content_access_audit", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  ruleId: varchar("rule_id").references(() => contentAccessRules.id),
  resourceType: resourceTypeEnum("resource_type").notNull(),
  resourceKey: varchar("resource_key").notNull(),
  action: varchar("action").notNull(),
  allowed: boolean("allowed").notNull(),
  userRole: varchar("user_role"),
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const contentAccessRulesRelations = relations(contentAccessRules, ({ one, many }) => ({
  createdByUser: one(users, {
    fields: [contentAccessRules.createdBy],
    references: [users.id],
  }),
  auditLogs: many(contentAccessAudit),
}));

export const contentAccessAuditRelations = relations(contentAccessAudit, ({ one }) => ({
  user: one(users, {
    fields: [contentAccessAudit.userId],
    references: [users.id],
  }),
  rule: one(contentAccessRules, {
    fields: [contentAccessAudit.ruleId],
    references: [contentAccessRules.id],
  }),
}));

export const roiResponsesRelations = relations(roiResponses, ({ one }) => ({
  survey: one(roiSurveys, {
    fields: [roiResponses.surveyId],
    references: [roiSurveys.id],
  }),
  question: one(roiQuestions, {
    fields: [roiResponses.questionId],
    references: [roiQuestions.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertConsultantSchema = createInsertSchema(consultants).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertHospitalSchema = createInsertSchema(hospitals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertHospitalUnitSchema = createInsertSchema(hospitalUnits).omit({
  id: true,
  createdAt: true,
});

export const insertHospitalModuleSchema = createInsertSchema(hospitalModules).omit({
  id: true,
  createdAt: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProjectRequirementSchema = createInsertSchema(projectRequirements).omit({
  id: true,
  createdAt: true,
});

export const insertProjectScheduleSchema = createInsertSchema(projectSchedules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertScheduleAssignmentSchema = createInsertSchema(scheduleAssignments).omit({
  id: true,
  createdAt: true,
});

export const insertConsultantDocumentSchema = createInsertSchema(consultantDocuments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDocumentTypeSchema = createInsertSchema(documentTypes).omit({
  id: true,
  createdAt: true,
});

export const insertConsultantAvailabilitySchema = createInsertSchema(consultantAvailability).omit({
  id: true,
  createdAt: true,
});

export const insertConsultantRatingSchema = createInsertSchema(consultantRatings).omit({
  id: true,
  createdAt: true,
});

export const insertBudgetCalculationSchema = createInsertSchema(budgetCalculations).omit({
  id: true,
  createdAt: true,
});

export const insertRoiQuestionSchema = createInsertSchema(roiQuestions).omit({
  id: true,
  createdAt: true,
});

export const insertRoiSurveySchema = createInsertSchema(roiSurveys).omit({
  id: true,
  createdAt: true,
});

export const insertRoiResponseSchema = createInsertSchema(roiResponses).omit({
  id: true,
  createdAt: true,
});

export const insertHospitalStaffSchema = createInsertSchema(hospitalStaff).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Account settings schema for updates
export const accountSettingsSchema = z.object({
  profileVisibility: z.enum(["public", "members_only", "private"]).optional(),
  emailNotifications: z.boolean().optional(),
  showEmail: z.boolean().optional(),
  showPhone: z.boolean().optional(),
});

export type AccountSettings = z.infer<typeof accountSettingsSchema>;

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Consultant = typeof consultants.$inferSelect;
export type InsertConsultant = z.infer<typeof insertConsultantSchema>;

export type Hospital = typeof hospitals.$inferSelect;
export type InsertHospital = z.infer<typeof insertHospitalSchema>;

export type HospitalUnit = typeof hospitalUnits.$inferSelect;
export type InsertHospitalUnit = z.infer<typeof insertHospitalUnitSchema>;

export type HospitalModule = typeof hospitalModules.$inferSelect;
export type InsertHospitalModule = z.infer<typeof insertHospitalModuleSchema>;

export type HospitalStaff = typeof hospitalStaff.$inferSelect;
export type InsertHospitalStaff = z.infer<typeof insertHospitalStaffSchema>;

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type ProjectRequirement = typeof projectRequirements.$inferSelect;
export type InsertProjectRequirement = z.infer<typeof insertProjectRequirementSchema>;

export type ProjectSchedule = typeof projectSchedules.$inferSelect;
export type InsertProjectSchedule = z.infer<typeof insertProjectScheduleSchema>;

export type ScheduleAssignment = typeof scheduleAssignments.$inferSelect;
export type InsertScheduleAssignment = z.infer<typeof insertScheduleAssignmentSchema>;

export type ConsultantDocument = typeof consultantDocuments.$inferSelect;
export type InsertConsultantDocument = z.infer<typeof insertConsultantDocumentSchema>;

export type DocumentType = typeof documentTypes.$inferSelect;
export type InsertDocumentType = z.infer<typeof insertDocumentTypeSchema>;

export type ConsultantAvailability = typeof consultantAvailability.$inferSelect;
export type InsertConsultantAvailability = z.infer<typeof insertConsultantAvailabilitySchema>;

export type ConsultantRating = typeof consultantRatings.$inferSelect;
export type InsertConsultantRating = z.infer<typeof insertConsultantRatingSchema>;

export type BudgetCalculation = typeof budgetCalculations.$inferSelect;
export type InsertBudgetCalculation = z.infer<typeof insertBudgetCalculationSchema>;

export type RoiQuestion = typeof roiQuestions.$inferSelect;
export type InsertRoiQuestion = z.infer<typeof insertRoiQuestionSchema>;

export type RoiSurvey = typeof roiSurveys.$inferSelect;
export type InsertRoiSurvey = z.infer<typeof insertRoiSurveySchema>;

export type RoiResponse = typeof roiResponses.$inferSelect;
export type InsertRoiResponse = z.infer<typeof insertRoiResponseSchema>;

export type EmailNotification = typeof emailNotifications.$inferSelect;
export type InsertEmailNotification = typeof emailNotifications.$inferInsert;

export type ContentAccessRule = typeof contentAccessRules.$inferSelect;
export type InsertContentAccessRule = typeof contentAccessRules.$inferInsert;

export type ContentAccessAuditLog = typeof contentAccessAudit.$inferSelect;
export type InsertContentAccessAuditLog = typeof contentAccessAudit.$inferInsert;

// Content access rule insert schema
export const insertContentAccessRuleSchema = createInsertSchema(contentAccessRules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertContentAccessAuditSchema = createInsertSchema(contentAccessAudit).omit({
  id: true,
  createdAt: true,
});

// Activity type enum for user activity tracking
export const activityTypeEnum = pgEnum("activity_type", [
  "login",
  "logout",
  "page_view",
  "create",
  "update",
  "delete",
  "upload",
  "download",
  "approve",
  "reject",
  "assign",
  "submit"
]);

// User activities table for tracking user actions
export const userActivities = pgTable("user_activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  activityType: activityTypeEnum("activity_type").notNull(),
  resourceType: varchar("resource_type"),
  resourceId: varchar("resource_id"),
  resourceName: varchar("resource_name"),
  description: text("description"),
  metadata: jsonb("metadata"),
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_user_activities_user").on(table.userId),
  index("idx_user_activities_type").on(table.activityType),
  index("idx_user_activities_created").on(table.createdAt),
]);

export const userActivitiesRelations = relations(userActivities, ({ one }) => ({
  user: one(users, {
    fields: [userActivities.userId],
    references: [users.id],
  }),
}));

// Notification type enum
export const notificationTypeEnum = pgEnum("notification_type", [
  "info",
  "success",
  "warning",
  "error",
  "schedule",
  "document",
  "project",
  "system"
]);

// In-app notifications table
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  type: notificationTypeEnum("type").default("info").notNull(),
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  link: varchar("link"),
  isRead: boolean("is_read").default(false).notNull(),
  readAt: timestamp("read_at"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_notifications_user").on(table.userId),
  index("idx_notifications_read").on(table.isRead),
  index("idx_notifications_created").on(table.createdAt),
]);

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

// Insert schemas for new tables
export const insertUserActivitySchema = createInsertSchema(userActivities).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

// Types for new tables
export type UserActivity = typeof userActivities.$inferSelect;
export type InsertUserActivity = z.infer<typeof insertUserActivitySchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

// Extended types for API responses with joined relations
export interface UserActivityWithUser extends UserActivity {
  user: {
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    profileImageUrl: string | null;
    role: "admin" | "hospital_staff" | "consultant";
  };
}
