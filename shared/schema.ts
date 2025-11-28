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
  real,
  time,
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
  } | null;
}

// ============================================
// ANALYTICS TYPES
// ============================================

// Platform-wide analytics (Admin view)
export interface PlatformAnalytics {
  overview: {
    totalConsultants: number;
    activeConsultants: number;
    totalHospitals: number;
    activeHospitals: number;
    totalProjects: number;
    activeProjects: number;
    totalUsers: number;
    totalSavings: string;
  };
  consultantsByStatus: {
    onboarded: number;
    pending: number;
    available: number;
    unavailable: number;
  };
  projectsByStatus: {
    draft: number;
    active: number;
    completed: number;
    cancelled: number;
  };
  documentCompliance: {
    approved: number;
    pending: number;
    rejected: number;
    expired: number;
    total: number;
    complianceRate: number;
  };
  activityTrend: Array<{
    date: string;
    count: number;
  }>;
  usersByRole: {
    admin: number;
    hospital_staff: number;
    consultant: number;
  };
  recentActivity: Array<{
    date: string;
    logins: number;
    actions: number;
  }>;
}

// Hospital-specific analytics (Hospital Staff view)
export interface HospitalAnalytics {
  hospitalId: string;
  hospitalName: string;
  overview: {
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    totalBudget: string;
    totalSpent: string;
    totalSavings: string;
    averageRoi: number;
  };
  projectBreakdown: Array<{
    id: string;
    name: string;
    status: string;
    budget: string;
    spent: string;
    consultantsAssigned: number;
    startDate: string | null;
    endDate: string | null;
  }>;
  consultantPerformance: Array<{
    consultantId: string;
    name: string;
    shiftsCompleted: number;
    averageRating: number;
    totalHours: number;
  }>;
  monthlySpending: Array<{
    month: string;
    amount: number;
  }>;
  savingsBreakdown: {
    laborSavings: string;
    benefitsSavings: string;
    overheadSavings: string;
    totalSavings: string;
  };
}

// Consultant-specific analytics (Consultant view)
export interface ConsultantAnalytics {
  consultantId: string;
  consultantName: string;
  overview: {
    totalShifts: number;
    completedShifts: number;
    upcomingShifts: number;
    totalEarnings: string;
    averageRating: number;
    totalRatings: number;
    utilizationRate: number;
  };
  documentStatus: {
    approved: number;
    pending: number;
    rejected: number;
    expired: number;
    expiringSoon: number;
    total: number;
    complianceRate: number;
  };
  expiringDocuments: Array<{
    id: string;
    name: string;
    typeName: string;
    expirationDate: string;
    daysUntilExpiry: number;
  }>;
  earningsByMonth: Array<{
    month: string;
    amount: number;
  }>;
  shiftHistory: Array<{
    id: string;
    projectName: string;
    hospitalName: string;
    date: string;
    shiftType: string;
    status: string;
  }>;
  skillsUtilization: Array<{
    skill: string;
    projectsUsed: number;
  }>;
}

// Training & Certification tracking
export interface TrainingStatus {
  consultantId: string;
  requiredDocuments: Array<{
    typeId: string;
    typeName: string;
    isRequired: boolean;
    status: "missing" | "pending" | "approved" | "expired" | "expiring_soon";
    expirationDate: string | null;
    daysUntilExpiry: number | null;
  }>;
  complianceScore: number;
  nextRenewalDate: string | null;
  overallStatus: "compliant" | "action_required" | "non_compliant";
}

// ============================================
// PHASE 8: PROJECT LIFECYCLE & ONBOARDING
// ============================================

// New Enums for Phase 8
export const projectPhaseStatusEnum = pgEnum("project_phase_status", ["not_started", "in_progress", "completed", "skipped"]);
export const taskPriorityEnum = pgEnum("task_priority", ["low", "medium", "high", "critical"]);
export const taskStatusEnum = pgEnum("task_status", ["pending", "in_progress", "completed", "blocked", "cancelled"]);
export const riskProbabilityEnum = pgEnum("risk_probability", ["low", "medium", "high"]);
export const riskImpactEnum = pgEnum("risk_impact", ["low", "medium", "high", "critical"]);
export const riskStatusEnum = pgEnum("risk_status", ["identified", "mitigating", "resolved", "accepted"]);
export const onboardingTaskStatusEnum = pgEnum("onboarding_task_status", ["pending", "submitted", "under_review", "approved", "rejected"]);
export const teamRoleCategoryEnum = pgEnum("team_role_category", ["nicehr", "hospital"]);

// Project Phases - Tracking the 11 EHR implementation phases
export const projectPhases = pgTable("project_phases", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").references(() => projects.id).notNull(),
  phaseName: varchar("phase_name").notNull(),
  phaseNumber: integer("phase_number").notNull(),
  description: text("description"),
  status: projectPhaseStatusEnum("status").default("not_started").notNull(),
  plannedStartDate: date("planned_start_date"),
  plannedEndDate: date("planned_end_date"),
  actualStartDate: date("actual_start_date"),
  actualEndDate: date("actual_end_date"),
  completionPercentage: integer("completion_percentage").default(0),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const projectPhasesRelations = relations(projectPhases, ({ one, many }) => ({
  project: one(projects, {
    fields: [projectPhases.projectId],
    references: [projects.id],
  }),
  tasks: many(projectTasks),
  deliverables: many(phaseDeliverables),
}));

// Project Tasks - Tasks within each phase
export const projectTasks = pgTable("project_tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").references(() => projects.id).notNull(),
  phaseId: varchar("phase_id").references(() => projectPhases.id),
  title: varchar("title").notNull(),
  description: text("description"),
  assignedTo: varchar("assigned_to").references(() => users.id),
  priority: taskPriorityEnum("priority").default("medium").notNull(),
  status: taskStatusEnum("status").default("pending").notNull(),
  dueDate: date("due_date"),
  completedAt: timestamp("completed_at"),
  estimatedHours: decimal("estimated_hours", { precision: 6, scale: 2 }),
  actualHours: decimal("actual_hours", { precision: 6, scale: 2 }),
  orderIndex: integer("order_index").default(0),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const projectTasksRelations = relations(projectTasks, ({ one }) => ({
  project: one(projects, {
    fields: [projectTasks.projectId],
    references: [projects.id],
  }),
  phase: one(projectPhases, {
    fields: [projectTasks.phaseId],
    references: [projectPhases.id],
  }),
  assignee: one(users, {
    fields: [projectTasks.assignedTo],
    references: [users.id],
  }),
  creator: one(users, {
    fields: [projectTasks.createdBy],
    references: [users.id],
  }),
}));

// Project Milestones - Key dates and deliverables
export const projectMilestones = pgTable("project_milestones", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").references(() => projects.id).notNull(),
  phaseId: varchar("phase_id").references(() => projectPhases.id),
  title: varchar("title").notNull(),
  description: text("description"),
  dueDate: date("due_date").notNull(),
  completedDate: date("completed_date"),
  isCompleted: boolean("is_completed").default(false).notNull(),
  isCritical: boolean("is_critical").default(false).notNull(),
  reminderDays: integer("reminder_days").default(7),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const projectMilestonesRelations = relations(projectMilestones, ({ one }) => ({
  project: one(projects, {
    fields: [projectMilestones.projectId],
    references: [projects.id],
  }),
  phase: one(projectPhases, {
    fields: [projectMilestones.phaseId],
    references: [projectPhases.id],
  }),
  creator: one(users, {
    fields: [projectMilestones.createdBy],
    references: [users.id],
  }),
}));

// Phase Deliverables - Documents/outputs per phase
export const phaseDeliverables = pgTable("phase_deliverables", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  phaseId: varchar("phase_id").references(() => projectPhases.id).notNull(),
  title: varchar("title").notNull(),
  description: text("description"),
  fileUrl: varchar("file_url"),
  fileName: varchar("file_name"),
  isRequired: boolean("is_required").default(true).notNull(),
  isSubmitted: boolean("is_submitted").default(false).notNull(),
  submittedAt: timestamp("submitted_at"),
  submittedBy: varchar("submitted_by").references(() => users.id),
  isApproved: boolean("is_approved").default(false).notNull(),
  approvedAt: timestamp("approved_at"),
  approvedBy: varchar("approved_by").references(() => users.id),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const phaseDeliverablesRelations = relations(phaseDeliverables, ({ one }) => ({
  phase: one(projectPhases, {
    fields: [phaseDeliverables.phaseId],
    references: [projectPhases.id],
  }),
  submitter: one(users, {
    fields: [phaseDeliverables.submittedBy],
    references: [users.id],
  }),
  approver: one(users, {
    fields: [phaseDeliverables.approvedBy],
    references: [users.id],
  }),
}));

// Project Risks - Risk register
export const projectRisks = pgTable("project_risks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").references(() => projects.id).notNull(),
  phaseId: varchar("phase_id").references(() => projectPhases.id),
  title: varchar("title").notNull(),
  description: text("description"),
  probability: riskProbabilityEnum("probability").default("medium").notNull(),
  impact: riskImpactEnum("impact").default("medium").notNull(),
  riskScore: integer("risk_score"),
  mitigation: text("mitigation"),
  contingency: text("contingency"),
  status: riskStatusEnum("status").default("identified").notNull(),
  ownerId: varchar("owner_id").references(() => users.id),
  identifiedDate: date("identified_date").defaultNow(),
  resolvedDate: date("resolved_date"),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const projectRisksRelations = relations(projectRisks, ({ one }) => ({
  project: one(projects, {
    fields: [projectRisks.projectId],
    references: [projects.id],
  }),
  phase: one(projectPhases, {
    fields: [projectRisks.phaseId],
    references: [projectPhases.id],
  }),
  owner: one(users, {
    fields: [projectRisks.ownerId],
    references: [users.id],
  }),
  creator: one(users, {
    fields: [projectRisks.createdBy],
    references: [users.id],
  }),
}));

// Team Role Templates - Predefined roles for NICEHR and Hospital teams
export const teamRoleTemplates = pgTable("team_role_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  category: teamRoleCategoryEnum("category").notNull(),
  responsibilities: text("responsibilities").array(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Project Team Assignments - Who is assigned to which project in what role
export const projectTeamAssignments = pgTable("project_team_assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").references(() => projects.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  roleTemplateId: varchar("role_template_id").references(() => teamRoleTemplates.id),
  customRoleName: varchar("custom_role_name"),
  startDate: date("start_date"),
  endDate: date("end_date"),
  isActive: boolean("is_active").default(true).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const projectTeamAssignmentsRelations = relations(projectTeamAssignments, ({ one }) => ({
  project: one(projects, {
    fields: [projectTeamAssignments.projectId],
    references: [projects.id],
  }),
  user: one(users, {
    fields: [projectTeamAssignments.userId],
    references: [users.id],
  }),
  roleTemplate: one(teamRoleTemplates, {
    fields: [projectTeamAssignments.roleTemplateId],
    references: [teamRoleTemplates.id],
  }),
}));

// Onboarding Tasks - Consultant onboarding checklist
export const onboardingTasks = pgTable("onboarding_tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  consultantId: varchar("consultant_id").references(() => consultants.id).notNull(),
  taskType: varchar("task_type").notNull(),
  title: varchar("title").notNull(),
  description: text("description"),
  documentTypeId: varchar("document_type_id").references(() => documentTypes.id),
  isRequired: boolean("is_required").default(true).notNull(),
  status: onboardingTaskStatusEnum("status").default("pending").notNull(),
  dueDate: date("due_date"),
  submittedAt: timestamp("submitted_at"),
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  rejectionReason: text("rejection_reason"),
  orderIndex: integer("order_index").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const onboardingTasksRelations = relations(onboardingTasks, ({ one }) => ({
  consultant: one(consultants, {
    fields: [onboardingTasks.consultantId],
    references: [consultants.id],
  }),
  documentType: one(documentTypes, {
    fields: [onboardingTasks.documentTypeId],
    references: [documentTypes.id],
  }),
  reviewer: one(users, {
    fields: [onboardingTasks.reviewedBy],
    references: [users.id],
  }),
}));

// ============================================
// PHASE 8 INSERT SCHEMAS
// ============================================

export const insertProjectPhaseSchema = createInsertSchema(projectPhases).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProjectTaskSchema = createInsertSchema(projectTasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProjectMilestoneSchema = createInsertSchema(projectMilestones).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPhaseDeliverableSchema = createInsertSchema(phaseDeliverables).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProjectRiskSchema = createInsertSchema(projectRisks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTeamRoleTemplateSchema = createInsertSchema(teamRoleTemplates).omit({
  id: true,
  createdAt: true,
});

export const insertProjectTeamAssignmentSchema = createInsertSchema(projectTeamAssignments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOnboardingTaskSchema = createInsertSchema(onboardingTasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// ============================================
// PHASE 8 TYPES
// ============================================

export type ProjectPhase = typeof projectPhases.$inferSelect;
export type InsertProjectPhase = z.infer<typeof insertProjectPhaseSchema>;

export type ProjectTask = typeof projectTasks.$inferSelect;
export type InsertProjectTask = z.infer<typeof insertProjectTaskSchema>;

export type ProjectMilestone = typeof projectMilestones.$inferSelect;
export type InsertProjectMilestone = z.infer<typeof insertProjectMilestoneSchema>;

export type PhaseDeliverable = typeof phaseDeliverables.$inferSelect;
export type InsertPhaseDeliverable = z.infer<typeof insertPhaseDeliverableSchema>;

export type ProjectRisk = typeof projectRisks.$inferSelect;
export type InsertProjectRisk = z.infer<typeof insertProjectRiskSchema>;

export type TeamRoleTemplate = typeof teamRoleTemplates.$inferSelect;
export type InsertTeamRoleTemplate = z.infer<typeof insertTeamRoleTemplateSchema>;

export type ProjectTeamAssignment = typeof projectTeamAssignments.$inferSelect;
export type InsertProjectTeamAssignment = z.infer<typeof insertProjectTeamAssignmentSchema>;

export type OnboardingTask = typeof onboardingTasks.$inferSelect;
export type InsertOnboardingTask = z.infer<typeof insertOnboardingTaskSchema>;

// Extended types for API responses
export interface ProjectPhaseWithTasks extends ProjectPhase {
  tasks: ProjectTask[];
  deliverables: PhaseDeliverable[];
}

export interface ProjectLifecycle {
  projectId: string;
  projectName: string;
  phases: ProjectPhaseWithTasks[];
  milestones: ProjectMilestone[];
  risks: ProjectRisk[];
  teamAssignments: ProjectTeamAssignmentWithUser[];
  overallProgress: number;
}

export interface ProjectTeamAssignmentWithUser extends ProjectTeamAssignment {
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    profileImageUrl: string | null;
  };
  roleTemplate: TeamRoleTemplate | null;
}

export interface OnboardingProgress {
  consultantId: string;
  consultantName: string;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  rejectedTasks: number;
  progressPercentage: number;
  tasks: OnboardingTask[];
  isComplete: boolean;
  nextDueDate: string | null;
}

// The 11 EHR Implementation Phases
export const EHR_IMPLEMENTATION_PHASES = [
  { number: 1, name: "Discovery and Needs Assessment", description: "Stakeholder engagement, project scope definition, workflow analysis, and technical infrastructure review" },
  { number: 2, name: "Project Planning", description: "Scope definition, timeline and milestones, resource allocation, roles and responsibilities, communication strategy, risk management" },
  { number: 3, name: "System Design and Customization", description: "Collaborate with stakeholders, review workflows/templates/forms, design clinical decision support tools, department-specific workflow development" },
  { number: 4, name: "Build Phase", description: "Configure the system, develop custom templates/alerts/clinical decision support, set up user roles/permissions/access levels" },
  { number: 5, name: "Data Migration Planning and Execution", description: "Develop data migration plan, extract/clean/validate data, test data migration, conduct data validation and integrity checks" },
  { number: 6, name: "System Configuration and Integration", description: "Configure system settings, integrate EHR with existing systems, test interfaces for seamless data exchange" },
  { number: 7, name: "Testing", description: "Unit testing, integrated testing, user acceptance testing (UAT), regression and volume testing, technical dress rehearsal, go/no-go decision making" },
  { number: 8, name: "Training and Change Management", description: "Develop training materials, conduct training sessions, login labs, implement change management strategies, audit project work" },
  { number: 9, name: "Go-Live Preparation", description: "Finalize data migration, create support plan, final system backup, create cutover plan, conduct technical dress rehearsal" },
  { number: 10, name: "Go-Live Execution", description: "Execute go-live plan, provide on-site and remote support, monitor system performance and user feedback" },
  { number: 11, name: "Post-Implementation Support", description: "Post-go-live support, gather user feedback, system performance reviews, develop long-term maintenance plan" },
] as const;

// Team Role Templates
export const NICEHR_TEAM_ROLES = [
  { name: "Sr. Program and Portfolio Manager", description: "Develops the project plan, assigns tasks, and oversees timelines", category: "nicehr" as const },
  { name: "Risk Manager", description: "Identifies risks and creates mitigation strategies", category: "nicehr" as const },
  { name: "Business Process Specialist", description: "Optimizes, automates, and oversees workflows to improve efficiency and ensure compliance", category: "nicehr" as const },
  { name: "Program Manager", description: "Overall project oversight and stakeholder management", category: "nicehr" as const },
  { name: "Clinical Analyst", description: "Workflow assessment and requirements gathering, supports UAT and validates clinical workflows", category: "nicehr" as const },
  { name: "Implementation Consultant", description: "Technical and operational support", category: "nicehr" as const },
  { name: "Technical Specialist", description: "Infrastructure assessment, planning and solution deliverables", category: "nicehr" as const },
  { name: "Test Manager", description: "Coordinates all testing activities and documents results", category: "nicehr" as const },
  { name: "Cutover Lead", description: "Coordinates and manages all activities related to cutover including any 3rd Party Vendors", category: "nicehr" as const },
  { name: "Data Migration Lead", description: "Coordinates and manages all activities related to data migration including any 3rd Party Vendors", category: "nicehr" as const },
  { name: "Technical Implementation Consultant", description: "Provides technical expertise during testing", category: "nicehr" as const },
  { name: "Go-Live Coordinator", description: "Manages go-live activities and troubleshooting", category: "nicehr" as const },
  { name: "Support Staff", description: "Provide on-site assistance to end-users", category: "nicehr" as const },
  { name: "Training Coordinator", description: "Develops training materials and conducts sessions", category: "nicehr" as const },
  { name: "Change Management Specialist", description: "Manages user engagement and communication", category: "nicehr" as const },
  { name: "Trainer/Instructional Designer", description: "Assists the Training Coordinator and works with stakeholders", category: "nicehr" as const },
] as const;

export const HOSPITAL_TEAM_ROLES = [
  { name: "Executive Leadership/Sponsor", description: "Approves the project plan and allocates resources", category: "hospital" as const },
  { name: "Project Manager", description: "Collaborates with the NICEHR Senior Portfolio Manager", category: "hospital" as const },
  { name: "Department Manager/Leader", description: "Provides operational input for planning, align departmental resources and change management", category: "hospital" as const },
  { name: "Clinical Champion", description: "Workflow expertise and staff liaison, provides feedback on system design and customization", category: "hospital" as const },
  { name: "Revenue Champion", description: "Revenue cycle workflow expertise and liaison", category: "hospital" as const },
  { name: "IT Leadership", description: "Technical coordination and system integration, validates technical feasibility", category: "hospital" as const },
  { name: "Integration Engineer", description: "Provides expertise for each module and legacy system", category: "hospital" as const },
  { name: "Super User", description: "Validates functionality and provides feedback", category: "hospital" as const },
  { name: "IT Specialist", description: "Addresses technical issues during go-live", category: "hospital" as const },
  { name: "Executive Decision-Making Team", description: "Handles escalations and critical decisions", category: "hospital" as const },
] as const;

// ============================================
// PHASE 9: GO-LIVE COMMAND CENTER
// ============================================

// Enums for Phase 9
export const signInStatusEnum = pgEnum("sign_in_status", ["checked_in", "checked_out", "no_show"]);
export const ticketPriorityEnum = pgEnum("ticket_priority", ["low", "medium", "high", "critical"]);
export const ticketStatusEnum = pgEnum("ticket_status", ["open", "in_progress", "escalated", "resolved", "closed"]);
export const ticketCategoryEnum = pgEnum("ticket_category", ["technical", "clinical", "workflow", "training", "access", "integration", "other"]);
export const handoffStatusEnum = pgEnum("handoff_status", ["pending", "acknowledged", "completed"]);

// Go-Live Sign-Ins - Track consultant check-in/check-out at go-live sites
export const goLiveSignIns = pgTable("go_live_signins", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").references(() => projects.id).notNull(),
  consultantId: varchar("consultant_id").references(() => consultants.id).notNull(),
  scheduleId: varchar("schedule_id").references(() => projectSchedules.id),
  signInTime: timestamp("sign_in_time"),
  signOutTime: timestamp("sign_out_time"),
  status: signInStatusEnum("status").default("checked_in").notNull(),
  location: varchar("location"),
  unit: varchar("unit"),
  badgeNumber: varchar("badge_number"),
  notes: text("notes"),
  lateArrival: boolean("late_arrival").default(false),
  lateMinutes: integer("late_minutes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const goLiveSignInsRelations = relations(goLiveSignIns, ({ one }) => ({
  project: one(projects, {
    fields: [goLiveSignIns.projectId],
    references: [projects.id],
  }),
  consultant: one(consultants, {
    fields: [goLiveSignIns.consultantId],
    references: [consultants.id],
  }),
  schedule: one(projectSchedules, {
    fields: [goLiveSignIns.scheduleId],
    references: [projectSchedules.id],
  }),
}));

export const insertGoLiveSignInSchema = createInsertSchema(goLiveSignIns).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Support Tickets - Track issues during go-live
export const supportTickets = pgTable("support_tickets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ticketNumber: varchar("ticket_number").unique(),
  projectId: varchar("project_id").references(() => projects.id).notNull(),
  reportedById: varchar("reported_by_id").references(() => users.id),
  assignedToId: varchar("assigned_to_id").references(() => consultants.id),
  title: varchar("title").notNull(),
  description: text("description"),
  category: ticketCategoryEnum("category").default("other").notNull(),
  priority: ticketPriorityEnum("priority").default("medium").notNull(),
  status: ticketStatusEnum("status").default("open").notNull(),
  unit: varchar("unit"),
  module: varchar("module"),
  affectedUsers: integer("affected_users"),
  resolution: text("resolution"),
  responseTime: integer("response_time_minutes"),
  resolutionTime: integer("resolution_time_minutes"),
  escalatedAt: timestamp("escalated_at"),
  resolvedAt: timestamp("resolved_at"),
  closedAt: timestamp("closed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const supportTicketsRelations = relations(supportTickets, ({ one }) => ({
  project: one(projects, {
    fields: [supportTickets.projectId],
    references: [projects.id],
  }),
  reportedBy: one(users, {
    fields: [supportTickets.reportedById],
    references: [users.id],
  }),
  assignedTo: one(consultants, {
    fields: [supportTickets.assignedToId],
    references: [consultants.id],
  }),
}));

export const insertSupportTicketSchema = createInsertSchema(supportTickets).omit({
  id: true,
  ticketNumber: true,
  createdAt: true,
  updatedAt: true,
});

// Shift Handoffs - Track shift-to-shift communication
export const shiftHandoffs = pgTable("shift_handoffs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").references(() => projects.id).notNull(),
  outgoingConsultantId: varchar("outgoing_consultant_id").references(() => consultants.id).notNull(),
  incomingConsultantId: varchar("incoming_consultant_id").references(() => consultants.id),
  shiftDate: date("shift_date").notNull(),
  outgoingShiftType: shiftTypeEnum("outgoing_shift_type").notNull(),
  incomingShiftType: shiftTypeEnum("incoming_shift_type"),
  activeIssues: text("active_issues"),
  pendingTasks: text("pending_tasks"),
  escalations: text("escalations"),
  generalNotes: text("general_notes"),
  unitsCoovered: text("units_covered").array(),
  status: handoffStatusEnum("status").default("pending").notNull(),
  acknowledgedAt: timestamp("acknowledged_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const shiftHandoffsRelations = relations(shiftHandoffs, ({ one }) => ({
  project: one(projects, {
    fields: [shiftHandoffs.projectId],
    references: [projects.id],
  }),
  outgoingConsultant: one(consultants, {
    fields: [shiftHandoffs.outgoingConsultantId],
    references: [consultants.id],
  }),
  incomingConsultant: one(consultants, {
    fields: [shiftHandoffs.incomingConsultantId],
    references: [consultants.id],
  }),
}));

export const insertShiftHandoffSchema = createInsertSchema(shiftHandoffs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Phase 9 Types
export type GoLiveSignIn = typeof goLiveSignIns.$inferSelect;
export type InsertGoLiveSignIn = z.infer<typeof insertGoLiveSignInSchema>;

export type SupportTicket = typeof supportTickets.$inferSelect;
export type InsertSupportTicket = z.infer<typeof insertSupportTicketSchema>;

export type ShiftHandoff = typeof shiftHandoffs.$inferSelect;
export type InsertShiftHandoff = z.infer<typeof insertShiftHandoffSchema>;

// Extended types for Command Center
export interface GoLiveSignInWithDetails extends GoLiveSignIn {
  consultant: {
    id: string;
    userId: string;
    tngId: string | null;
  };
  user: {
    firstName: string | null;
    lastName: string | null;
    profileImageUrl: string | null;
  };
}

export interface SupportTicketWithDetails extends SupportTicket {
  reportedBy: {
    firstName: string | null;
    lastName: string | null;
  } | null;
  assignedTo: {
    id: string;
    user: {
      firstName: string | null;
      lastName: string | null;
    };
  } | null;
}

export interface ShiftHandoffWithDetails extends ShiftHandoff {
  outgoingConsultant: {
    id: string;
    user: {
      firstName: string | null;
      lastName: string | null;
    };
  };
  incomingConsultant: {
    id: string;
    user: {
      firstName: string | null;
      lastName: string | null;
    };
  } | null;
}

export interface CommandCenterStats {
  activeConsultants: number;
  checkedInToday: number;
  openTickets: number;
  criticalTickets: number;
  pendingHandoffs: number;
  averageResponseTime: number;
}

// ============================================
// PHASE 10: SCHEDULING & TIME MANAGEMENT
// ============================================

// Timesheet status enum
export const timesheetStatusEnum = pgEnum("timesheet_status", [
  "draft",
  "submitted",
  "approved",
  "rejected",
  "paid"
]);

// Availability type enum
export const availabilityTypeEnum = pgEnum("availability_type", [
  "available",
  "unavailable",
  "vacation",
  "sick",
  "training",
  "other"
]);

// Swap request status enum
export const swapRequestStatusEnum = pgEnum("swap_request_status", [
  "pending",
  "approved",
  "rejected",
  "cancelled"
]);

// Timesheets table - tracks hours worked by consultants
export const timesheets = pgTable("timesheets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  consultantId: varchar("consultant_id").references(() => consultants.id).notNull(),
  projectId: varchar("project_id").references(() => projects.id),
  scheduleId: varchar("schedule_id").references(() => projectSchedules.id),
  weekStartDate: date("week_start_date").notNull(),
  weekEndDate: date("week_end_date").notNull(),
  status: timesheetStatusEnum("status").default("draft").notNull(),
  totalHours: real("total_hours").default(0).notNull(),
  regularHours: real("regular_hours").default(0).notNull(),
  overtimeHours: real("overtime_hours").default(0).notNull(),
  submittedAt: timestamp("submitted_at"),
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  rejectionReason: text("rejection_reason"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_timesheets_consultant").on(table.consultantId),
  index("idx_timesheets_project").on(table.projectId),
  index("idx_timesheets_week").on(table.weekStartDate),
  index("idx_timesheets_status").on(table.status),
]);

// Timesheet entries - individual clock in/out records
export const timesheetEntries = pgTable("timesheet_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  timesheetId: varchar("timesheet_id").references(() => timesheets.id).notNull(),
  entryDate: date("entry_date").notNull(),
  clockIn: timestamp("clock_in"),
  clockOut: timestamp("clock_out"),
  breakMinutes: integer("break_minutes").default(0),
  totalHours: real("total_hours").default(0),
  location: varchar("location"),
  notes: text("notes"),
  isManualEntry: boolean("is_manual_entry").default(false),
  editedBy: varchar("edited_by").references(() => users.id),
  editReason: text("edit_reason"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_timesheet_entries_timesheet").on(table.timesheetId),
  index("idx_timesheet_entries_date").on(table.entryDate),
]);

export const timesheetsRelations = relations(timesheets, ({ one, many }) => ({
  consultant: one(consultants, {
    fields: [timesheets.consultantId],
    references: [consultants.id],
  }),
  project: one(projects, {
    fields: [timesheets.projectId],
    references: [projects.id],
  }),
  schedule: one(projectSchedules, {
    fields: [timesheets.scheduleId],
    references: [projectSchedules.id],
  }),
  approver: one(users, {
    fields: [timesheets.approvedBy],
    references: [users.id],
  }),
  entries: many(timesheetEntries),
}));

export const timesheetEntriesRelations = relations(timesheetEntries, ({ one }) => ({
  timesheet: one(timesheets, {
    fields: [timesheetEntries.timesheetId],
    references: [timesheets.id],
  }),
  editor: one(users, {
    fields: [timesheetEntries.editedBy],
    references: [users.id],
  }),
}));

// Availability blocks - consultants mark their availability
export const availabilityBlocks = pgTable("availability_blocks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  consultantId: varchar("consultant_id").references(() => consultants.id).notNull(),
  type: availabilityTypeEnum("type").default("available").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  startTime: time("start_time"),
  endTime: time("end_time"),
  isAllDay: boolean("is_all_day").default(true),
  isRecurring: boolean("is_recurring").default(false),
  recurringPattern: varchar("recurring_pattern"),
  title: varchar("title"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_availability_consultant").on(table.consultantId),
  index("idx_availability_dates").on(table.startDate, table.endDate),
  index("idx_availability_type").on(table.type),
]);

export const availabilityBlocksRelations = relations(availabilityBlocks, ({ one }) => ({
  consultant: one(consultants, {
    fields: [availabilityBlocks.consultantId],
    references: [consultants.id],
  }),
}));

// Shift swap requests - consultants can request to swap shifts
export const shiftSwapRequests = pgTable("shift_swap_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  requesterId: varchar("requester_id").references(() => consultants.id).notNull(),
  targetConsultantId: varchar("target_consultant_id").references(() => consultants.id),
  originalAssignmentId: varchar("original_assignment_id").references(() => scheduleAssignments.id).notNull(),
  targetAssignmentId: varchar("target_assignment_id").references(() => scheduleAssignments.id),
  status: swapRequestStatusEnum("status").default("pending").notNull(),
  reason: text("reason"),
  requestedAt: timestamp("requested_at").defaultNow(),
  respondedAt: timestamp("responded_at"),
  respondedBy: varchar("responded_by").references(() => users.id),
  responseNotes: text("response_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_swap_requester").on(table.requesterId),
  index("idx_swap_target").on(table.targetConsultantId),
  index("idx_swap_status").on(table.status),
]);

export const shiftSwapRequestsRelations = relations(shiftSwapRequests, ({ one }) => ({
  requester: one(consultants, {
    fields: [shiftSwapRequests.requesterId],
    references: [consultants.id],
  }),
  targetConsultant: one(consultants, {
    fields: [shiftSwapRequests.targetConsultantId],
    references: [consultants.id],
  }),
  originalAssignment: one(scheduleAssignments, {
    fields: [shiftSwapRequests.originalAssignmentId],
    references: [scheduleAssignments.id],
  }),
  targetAssignment: one(scheduleAssignments, {
    fields: [shiftSwapRequests.targetAssignmentId],
    references: [scheduleAssignments.id],
  }),
  responder: one(users, {
    fields: [shiftSwapRequests.respondedBy],
    references: [users.id],
  }),
}));

// Insert schemas for Phase 10
export const insertTimesheetSchema = createInsertSchema(timesheets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTimesheetEntrySchema = createInsertSchema(timesheetEntries).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAvailabilityBlockSchema = createInsertSchema(availabilityBlocks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertShiftSwapRequestSchema = createInsertSchema(shiftSwapRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Phase 10 Types
export type Timesheet = typeof timesheets.$inferSelect;
export type InsertTimesheet = z.infer<typeof insertTimesheetSchema>;

export type TimesheetEntry = typeof timesheetEntries.$inferSelect;
export type InsertTimesheetEntry = z.infer<typeof insertTimesheetEntrySchema>;

export type AvailabilityBlock = typeof availabilityBlocks.$inferSelect;
export type InsertAvailabilityBlock = z.infer<typeof insertAvailabilityBlockSchema>;

export type ShiftSwapRequest = typeof shiftSwapRequests.$inferSelect;
export type InsertShiftSwapRequest = z.infer<typeof insertShiftSwapRequestSchema>;

// Extended types for Phase 10
export interface TimesheetWithDetails extends Timesheet {
  consultant: {
    id: string;
    userId: string;
    user: {
      firstName: string | null;
      lastName: string | null;
    };
  };
  project: {
    id: string;
    name: string;
  } | null;
  approver: {
    firstName: string | null;
    lastName: string | null;
  } | null;
  entries: TimesheetEntry[];
}

export interface AvailabilityBlockWithDetails extends AvailabilityBlock {
  consultant: {
    id: string;
    user: {
      firstName: string | null;
      lastName: string | null;
    };
  };
}

export interface ShiftSwapRequestWithDetails extends ShiftSwapRequest {
  requester: {
    id: string;
    user: {
      firstName: string | null;
      lastName: string | null;
    };
  };
  targetConsultant: {
    id: string;
    user: {
      firstName: string | null;
      lastName: string | null;
    };
  } | null;
  originalAssignment: {
    id: string;
    schedule: {
      scheduleDate: string;
      shiftType: string;
    };
  };
  responder: {
    firstName: string | null;
    lastName: string | null;
  } | null;
}

// ============================================
// PHASE 11: TRAINING & COMPETENCY
// ============================================

// Enums for Phase 11
export const courseStatusEnum = pgEnum("course_status", ["draft", "published", "archived"]);
export const courseLevelEnum = pgEnum("course_level", ["beginner", "intermediate", "advanced"]);
export const courseTypeEnum = pgEnum("course_type", ["online", "in_person", "hybrid"]);
export const enrollmentStatusEnum = pgEnum("enrollment_status", ["enrolled", "in_progress", "completed", "dropped"]);
export const questionTypeEnum = pgEnum("question_type", ["multiple_choice", "true_false", "short_answer"]);
export const assessmentStatusEnum = pgEnum("assessment_status", ["not_started", "in_progress", "passed", "failed"]);
export const labSessionStatusEnum = pgEnum("lab_session_status", ["scheduled", "in_progress", "completed", "cancelled"]);
export const articleStatusEnum = pgEnum("article_status", ["draft", "published", "archived"]);

// Training courses
export const courses = pgTable("courses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description"),
  courseType: courseTypeEnum("course_type").default("online").notNull(),
  level: courseLevelEnum("level").default("beginner").notNull(),
  status: courseStatusEnum("status").default("draft").notNull(),
  durationMinutes: integer("duration_minutes"),
  ceCredits: decimal("ce_credits", { precision: 5, scale: 2 }),
  moduleId: varchar("module_id").references(() => hospitalModules.id),
  hospitalId: varchar("hospital_id").references(() => hospitals.id),
  thumbnailUrl: varchar("thumbnail_url"),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_courses_status").on(table.status),
  index("idx_courses_module").on(table.moduleId),
  index("idx_courses_hospital").on(table.hospitalId),
]);

export const coursesRelations = relations(courses, ({ one, many }) => ({
  module: one(hospitalModules, {
    fields: [courses.moduleId],
    references: [hospitalModules.id],
  }),
  hospital: one(hospitals, {
    fields: [courses.hospitalId],
    references: [hospitals.id],
  }),
  creator: one(users, {
    fields: [courses.createdBy],
    references: [users.id],
  }),
  courseModules: many(courseModules),
  enrollments: many(courseEnrollments),
  assessments: many(assessments),
}));

// Course content modules/chapters
export const courseModules = pgTable("course_modules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  courseId: varchar("course_id").references(() => courses.id).notNull(),
  title: varchar("title").notNull(),
  description: text("description"),
  orderIndex: integer("order_index").default(0).notNull(),
  contentType: varchar("content_type"),
  contentUrl: varchar("content_url"),
  durationMinutes: integer("duration_minutes"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_course_modules_course").on(table.courseId),
]);

export const courseModulesRelations = relations(courseModules, ({ one, many }) => ({
  course: one(courses, {
    fields: [courseModules.courseId],
    references: [courses.id],
  }),
  assessments: many(assessments),
}));

// User enrollments in courses
export const courseEnrollments = pgTable("course_enrollments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  courseId: varchar("course_id").references(() => courses.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  status: enrollmentStatusEnum("status").default("enrolled").notNull(),
  enrolledAt: timestamp("enrolled_at").defaultNow(),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  progressPercent: integer("progress_percent").default(0),
  ceCreditsEarned: decimal("ce_credits_earned", { precision: 5, scale: 2 }),
  certificateUrl: varchar("certificate_url"),
}, (table) => [
  index("idx_enrollments_course").on(table.courseId),
  index("idx_enrollments_user").on(table.userId),
  index("idx_enrollments_status").on(table.status),
]);

export const courseEnrollmentsRelations = relations(courseEnrollments, ({ one }) => ({
  course: one(courses, {
    fields: [courseEnrollments.courseId],
    references: [courses.id],
  }),
  user: one(users, {
    fields: [courseEnrollments.userId],
    references: [users.id],
  }),
}));

// Course assessments/quizzes
export const assessments = pgTable("assessments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  courseId: varchar("course_id").references(() => courses.id).notNull(),
  courseModuleId: varchar("course_module_id").references(() => courseModules.id),
  title: varchar("title").notNull(),
  description: text("description"),
  passingScore: integer("passing_score").default(70),
  maxAttempts: integer("max_attempts").default(3),
  timeLimitMinutes: integer("time_limit_minutes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_assessments_course").on(table.courseId),
  index("idx_assessments_module").on(table.courseModuleId),
]);

export const assessmentsRelations = relations(assessments, ({ one, many }) => ({
  course: one(courses, {
    fields: [assessments.courseId],
    references: [courses.id],
  }),
  courseModule: one(courseModules, {
    fields: [assessments.courseModuleId],
    references: [courseModules.id],
  }),
  questions: many(assessmentQuestions),
  attempts: many(assessmentAttempts),
}));

// Questions for assessments
export const assessmentQuestions = pgTable("assessment_questions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  assessmentId: varchar("assessment_id").references(() => assessments.id).notNull(),
  questionType: questionTypeEnum("question_type").default("multiple_choice").notNull(),
  questionText: text("question_text").notNull(),
  options: jsonb("options"),
  correctAnswer: text("correct_answer").notNull(),
  points: integer("points").default(1),
  orderIndex: integer("order_index").default(0),
}, (table) => [
  index("idx_questions_assessment").on(table.assessmentId),
]);

export const assessmentQuestionsRelations = relations(assessmentQuestions, ({ one }) => ({
  assessment: one(assessments, {
    fields: [assessmentQuestions.assessmentId],
    references: [assessments.id],
  }),
}));

// User attempts at assessments
export const assessmentAttempts = pgTable("assessment_attempts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  assessmentId: varchar("assessment_id").references(() => assessments.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  attemptNumber: integer("attempt_number").default(1).notNull(),
  score: integer("score"),
  passed: boolean("passed").default(false),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  answers: jsonb("answers"),
}, (table) => [
  index("idx_attempts_assessment").on(table.assessmentId),
  index("idx_attempts_user").on(table.userId),
]);

export const assessmentAttemptsRelations = relations(assessmentAttempts, ({ one }) => ({
  assessment: one(assessments, {
    fields: [assessmentAttempts.assessmentId],
    references: [assessments.id],
  }),
  user: one(users, {
    fields: [assessmentAttempts.userId],
    references: [users.id],
  }),
}));

// Login lab sessions for EMR training
export const loginLabs = pgTable("login_labs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").references(() => projects.id).notNull(),
  hospitalId: varchar("hospital_id").references(() => hospitals.id).notNull(),
  moduleId: varchar("module_id").references(() => hospitalModules.id),
  title: varchar("title").notNull(),
  description: text("description"),
  facilitatorId: varchar("facilitator_id").references(() => users.id),
  scheduledAt: timestamp("scheduled_at").notNull(),
  durationMinutes: integer("duration_minutes").default(60),
  maxParticipants: integer("max_participants").default(20),
  status: labSessionStatusEnum("status").default("scheduled").notNull(),
  location: varchar("location"),
  room: varchar("room"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_login_labs_project").on(table.projectId),
  index("idx_login_labs_hospital").on(table.hospitalId),
  index("idx_login_labs_status").on(table.status),
  index("idx_login_labs_scheduled").on(table.scheduledAt),
]);

export const loginLabsRelations = relations(loginLabs, ({ one, many }) => ({
  project: one(projects, {
    fields: [loginLabs.projectId],
    references: [projects.id],
  }),
  hospital: one(hospitals, {
    fields: [loginLabs.hospitalId],
    references: [hospitals.id],
  }),
  module: one(hospitalModules, {
    fields: [loginLabs.moduleId],
    references: [hospitalModules.id],
  }),
  facilitator: one(users, {
    fields: [loginLabs.facilitatorId],
    references: [users.id],
  }),
  participants: many(loginLabParticipants),
}));

// Participants in login labs
export const loginLabParticipants = pgTable("login_lab_participants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  loginLabId: varchar("login_lab_id").references(() => loginLabs.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  accessValidated: boolean("access_validated").default(false),
  customizationNotes: text("customization_notes"),
  attendedAt: timestamp("attended_at"),
  completedAt: timestamp("completed_at"),
}, (table) => [
  index("idx_lab_participants_lab").on(table.loginLabId),
  index("idx_lab_participants_user").on(table.userId),
]);

export const loginLabParticipantsRelations = relations(loginLabParticipants, ({ one }) => ({
  loginLab: one(loginLabs, {
    fields: [loginLabParticipants.loginLabId],
    references: [loginLabs.id],
  }),
  user: one(users, {
    fields: [loginLabParticipants.userId],
    references: [users.id],
  }),
}));

// Knowledge base articles
export const knowledgeArticles = pgTable("knowledge_articles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  category: varchar("category"),
  moduleId: varchar("module_id").references(() => hospitalModules.id),
  tags: text("tags").array(),
  status: articleStatusEnum("status").default("draft").notNull(),
  authorId: varchar("author_id").references(() => users.id),
  version: integer("version").default(1),
  viewCount: integer("view_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_articles_status").on(table.status),
  index("idx_articles_module").on(table.moduleId),
  index("idx_articles_category").on(table.category),
  index("idx_articles_author").on(table.authorId),
]);

export const knowledgeArticlesRelations = relations(knowledgeArticles, ({ one }) => ({
  module: one(hospitalModules, {
    fields: [knowledgeArticles.moduleId],
    references: [hospitalModules.id],
  }),
  author: one(users, {
    fields: [knowledgeArticles.authorId],
    references: [users.id],
  }),
}));

// ============================================
// PHASE 11 INSERT SCHEMAS
// ============================================

export const insertCourseSchema = createInsertSchema(courses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCourseModuleSchema = createInsertSchema(courseModules).omit({
  id: true,
  createdAt: true,
});

export const insertCourseEnrollmentSchema = createInsertSchema(courseEnrollments).omit({
  id: true,
  enrolledAt: true,
});

export const insertAssessmentSchema = createInsertSchema(assessments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAssessmentQuestionSchema = createInsertSchema(assessmentQuestions).omit({
  id: true,
});

export const insertAssessmentAttemptSchema = createInsertSchema(assessmentAttempts).omit({
  id: true,
  startedAt: true,
});

export const insertLoginLabSchema = createInsertSchema(loginLabs).omit({
  id: true,
  createdAt: true,
});

export const insertLoginLabParticipantSchema = createInsertSchema(loginLabParticipants).omit({
  id: true,
});

export const insertKnowledgeArticleSchema = createInsertSchema(knowledgeArticles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// ============================================
// PHASE 11 TYPES
// ============================================

export type Course = typeof courses.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;

export type CourseModule = typeof courseModules.$inferSelect;
export type InsertCourseModule = z.infer<typeof insertCourseModuleSchema>;

export type CourseEnrollment = typeof courseEnrollments.$inferSelect;
export type InsertCourseEnrollment = z.infer<typeof insertCourseEnrollmentSchema>;

export type Assessment = typeof assessments.$inferSelect;
export type InsertAssessment = z.infer<typeof insertAssessmentSchema>;

export type AssessmentQuestion = typeof assessmentQuestions.$inferSelect;
export type InsertAssessmentQuestion = z.infer<typeof insertAssessmentQuestionSchema>;

export type AssessmentAttempt = typeof assessmentAttempts.$inferSelect;
export type InsertAssessmentAttempt = z.infer<typeof insertAssessmentAttemptSchema>;

export type LoginLab = typeof loginLabs.$inferSelect;
export type InsertLoginLab = z.infer<typeof insertLoginLabSchema>;

export type LoginLabParticipant = typeof loginLabParticipants.$inferSelect;
export type InsertLoginLabParticipant = z.infer<typeof insertLoginLabParticipantSchema>;

export type KnowledgeArticle = typeof knowledgeArticles.$inferSelect;
export type InsertKnowledgeArticle = z.infer<typeof insertKnowledgeArticleSchema>;

// ============================================
// PHASE 11 EXTENDED TYPES
// ============================================

export interface CourseWithDetails extends Course {
  module: {
    id: string;
    name: string;
  } | null;
  hospital: {
    id: string;
    name: string;
  } | null;
  creator: {
    id: string;
    firstName: string | null;
    lastName: string | null;
  } | null;
  courseModules: CourseModule[];
  enrollmentCount: number;
}

export interface CourseEnrollmentWithDetails extends CourseEnrollment {
  course: {
    id: string;
    title: string;
    durationMinutes: number | null;
    ceCredits: string | null;
    level: "beginner" | "intermediate" | "advanced";
  };
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
  };
}

export interface AssessmentWithDetails extends Assessment {
  course: {
    id: string;
    title: string;
  };
  courseModule: {
    id: string;
    title: string;
  } | null;
  questions: AssessmentQuestion[];
  attemptCount: number;
}

export interface AssessmentAttemptWithDetails extends AssessmentAttempt {
  assessment: {
    id: string;
    title: string;
    passingScore: number | null;
    maxAttempts: number | null;
  };
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
  };
}

export interface LoginLabWithDetails extends LoginLab {
  project: {
    id: string;
    name: string;
  };
  hospital: {
    id: string;
    name: string;
  };
  module: {
    id: string;
    name: string;
  } | null;
  facilitator: {
    id: string;
    firstName: string | null;
    lastName: string | null;
  } | null;
  participants: LoginLabParticipantWithUser[];
  participantCount: number;
}

export interface LoginLabParticipantWithUser extends LoginLabParticipant {
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
  };
}

export interface KnowledgeArticleWithDetails extends KnowledgeArticle {
  module: {
    id: string;
    name: string;
  } | null;
  author: {
    id: string;
    firstName: string | null;
    lastName: string | null;
  } | null;
}

// Training Dashboard Analytics
export interface TrainingAnalytics {
  totalCourses: number;
  publishedCourses: number;
  totalEnrollments: number;
  completedEnrollments: number;
  averageCompletionRate: number;
  averageScore: number;
  upcomingLoginLabs: number;
  totalArticles: number;
  coursesByLevel: {
    beginner: number;
    intermediate: number;
    advanced: number;
  };
  enrollmentsByStatus: {
    enrolled: number;
    in_progress: number;
    completed: number;
    dropped: number;
  };
  recentEnrollments: CourseEnrollmentWithDetails[];
  popularCourses: Array<{
    courseId: string;
    title: string;
    enrollmentCount: number;
    completionRate: number;
  }>;
}

// ============================================
// PHASE 12: TICKETING & SUPPORT
// ============================================

// Enums for Phase 12
export const eodReportStatusEnum = pgEnum("eod_report_status", ["draft", "submitted", "approved", "rejected"]);
export const escalationTriggerTypeEnum = pgEnum("escalation_trigger_type", ["time_based", "priority_based", "sla_breach", "manual"]);
export const ticketActionTypeEnum = pgEnum("ticket_action_type", ["created", "updated", "assigned", "escalated", "resolved", "closed", "commented", "reopened"]);
export const dataRetentionEntityEnum = pgEnum("data_retention_entity", ["tickets", "reports", "audit_logs", "documents", "user_data"]);

// End of Day Reports
export const eodReports = pgTable("eod_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").references(() => projects.id).notNull(),
  reportDate: date("report_date").notNull(),
  submittedById: varchar("submitted_by_id").references(() => users.id).notNull(),
  status: eodReportStatusEnum("status").default("draft").notNull(),
  issuesResolved: integer("issues_resolved").default(0),
  issuesPending: integer("issues_pending").default(0),
  issuesEscalated: integer("issues_escalated").default(0),
  resolvedSummary: text("resolved_summary"),
  pendingSummary: text("pending_summary"),
  highlights: text("highlights"),
  challenges: text("challenges"),
  tomorrowPlan: text("tomorrow_plan"),
  notes: text("notes"),
  approvedById: varchar("approved_by_id").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  submittedAt: timestamp("submitted_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_eod_reports_project").on(table.projectId),
  index("idx_eod_reports_date").on(table.reportDate),
  index("idx_eod_reports_submitted_by").on(table.submittedById),
]);

export const eodReportsRelations = relations(eodReports, ({ one }) => ({
  project: one(projects, {
    fields: [eodReports.projectId],
    references: [projects.id],
  }),
  submittedBy: one(users, {
    fields: [eodReports.submittedById],
    references: [users.id],
  }),
  approvedBy: one(users, {
    fields: [eodReports.approvedById],
    references: [users.id],
  }),
}));

// Escalation Rules Configuration
export const escalationRules = pgTable("escalation_rules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").references(() => projects.id),
  name: varchar("name").notNull(),
  description: text("description"),
  triggerType: escalationTriggerTypeEnum("trigger_type").default("time_based").notNull(),
  priority: ticketPriorityEnum("priority"),
  timeThresholdMinutes: integer("time_threshold_minutes"),
  escalateToPriority: ticketPriorityEnum("escalate_to_priority"),
  notifyRoles: text("notify_roles").array(),
  notifyUserIds: text("notify_user_ids").array(),
  isActive: boolean("is_active").default(true),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_escalation_rules_project").on(table.projectId),
  index("idx_escalation_rules_active").on(table.isActive),
]);

export const escalationRulesRelations = relations(escalationRules, ({ one }) => ({
  project: one(projects, {
    fields: [escalationRules.projectId],
    references: [projects.id],
  }),
  creator: one(users, {
    fields: [escalationRules.createdBy],
    references: [users.id],
  }),
}));

// Ticket History/Audit Trail
export const ticketHistory = pgTable("ticket_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ticketId: varchar("ticket_id").references(() => supportTickets.id).notNull(),
  action: ticketActionTypeEnum("action").notNull(),
  performedById: varchar("performed_by_id").references(() => users.id).notNull(),
  previousValue: jsonb("previous_value"),
  newValue: jsonb("new_value"),
  comment: text("comment"),
  ipAddress: varchar("ip_address"),
  userAgent: varchar("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_ticket_history_ticket").on(table.ticketId),
  index("idx_ticket_history_performed_by").on(table.performedById),
  index("idx_ticket_history_created_at").on(table.createdAt),
]);

export const ticketHistoryRelations = relations(ticketHistory, ({ one }) => ({
  ticket: one(supportTickets, {
    fields: [ticketHistory.ticketId],
    references: [supportTickets.id],
  }),
  performedBy: one(users, {
    fields: [ticketHistory.performedById],
    references: [users.id],
  }),
}));

// Data Retention Policies (HIPAA Compliance)
export const dataRetentionPolicies = pgTable("data_retention_policies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  entityType: dataRetentionEntityEnum("entity_type").notNull(),
  retentionDays: integer("retention_days").notNull(),
  description: text("description"),
  hipaaRequired: boolean("hipaa_required").default(false),
  autoDelete: boolean("auto_delete").default(false),
  archiveBeforeDelete: boolean("archive_before_delete").default(true),
  lastRunAt: timestamp("last_run_at"),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const dataRetentionPoliciesRelations = relations(dataRetentionPolicies, ({ one }) => ({
  creator: one(users, {
    fields: [dataRetentionPolicies.createdBy],
    references: [users.id],
  }),
}));

// Ticket Comments (for support threads)
export const ticketComments = pgTable("ticket_comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ticketId: varchar("ticket_id").references(() => supportTickets.id).notNull(),
  authorId: varchar("author_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  isInternal: boolean("is_internal").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_ticket_comments_ticket").on(table.ticketId),
  index("idx_ticket_comments_author").on(table.authorId),
]);

export const ticketCommentsRelations = relations(ticketComments, ({ one }) => ({
  ticket: one(supportTickets, {
    fields: [ticketComments.ticketId],
    references: [supportTickets.id],
  }),
  author: one(users, {
    fields: [ticketComments.authorId],
    references: [users.id],
  }),
}));

// Insert schemas for Phase 12
export const insertEodReportSchema = createInsertSchema(eodReports).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEscalationRuleSchema = createInsertSchema(escalationRules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTicketHistorySchema = createInsertSchema(ticketHistory).omit({
  id: true,
  createdAt: true,
});

export const insertDataRetentionPolicySchema = createInsertSchema(dataRetentionPolicies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTicketCommentSchema = createInsertSchema(ticketComments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Phase 12 Types
export type EodReport = typeof eodReports.$inferSelect;
export type InsertEodReport = z.infer<typeof insertEodReportSchema>;

export type EscalationRule = typeof escalationRules.$inferSelect;
export type InsertEscalationRule = z.infer<typeof insertEscalationRuleSchema>;

export type TicketHistory = typeof ticketHistory.$inferSelect;
export type InsertTicketHistory = z.infer<typeof insertTicketHistorySchema>;

export type DataRetentionPolicy = typeof dataRetentionPolicies.$inferSelect;
export type InsertDataRetentionPolicy = z.infer<typeof insertDataRetentionPolicySchema>;

export type TicketComment = typeof ticketComments.$inferSelect;
export type InsertTicketComment = z.infer<typeof insertTicketCommentSchema>;

// ============================================
// PHASE 12 EXTENDED TYPES
// ============================================

export interface EodReportWithDetails extends EodReport {
  project: {
    id: string;
    name: string;
  };
  submittedBy: {
    id: string;
    firstName: string | null;
    lastName: string | null;
  };
  approvedBy: {
    id: string;
    firstName: string | null;
    lastName: string | null;
  } | null;
}

export interface TicketHistoryWithDetails extends TicketHistory {
  ticket: {
    id: string;
    ticketNumber: string | null;
    title: string;
  };
  performedBy: {
    id: string;
    firstName: string | null;
    lastName: string | null;
  };
}

export interface TicketCommentWithDetails extends TicketComment {
  author: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    profileImageUrl: string | null;
  };
}

export interface SupportTicketWithHistory extends SupportTicket {
  project: {
    id: string;
    name: string;
  };
  reportedBy: {
    id: string;
    firstName: string | null;
    lastName: string | null;
  } | null;
  assignedTo: {
    id: string;
    user: {
      firstName: string | null;
      lastName: string | null;
    };
  } | null;
  history: TicketHistoryWithDetails[];
  comments: TicketCommentWithDetails[];
}

// EOD Report Analytics
export interface EodReportAnalytics {
  totalReports: number;
  submittedToday: number;
  pendingApproval: number;
  averageIssuesResolved: number;
  averageIssuesPending: number;
  recentReports: EodReportWithDetails[];
  reportsByProject: Array<{
    projectId: string;
    projectName: string;
    reportCount: number;
  }>;
}
