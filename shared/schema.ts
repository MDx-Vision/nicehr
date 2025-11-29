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
export const invitationStatusEnum = pgEnum("invitation_status", ["pending", "accepted", "revoked", "expired"]);
export const accessStatusEnum = pgEnum("access_status", ["pending_invitation", "active", "suspended", "revoked"]);

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

// Staff Invitations table - invitation-only access control
export const invitations = pgTable("invitations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").notNull(),
  token: varchar("token").notNull().unique(),
  status: invitationStatusEnum("status").default("pending").notNull(),
  role: userRoleEnum("role").default("consultant").notNull(),
  invitedByUserId: varchar("invited_by_user_id").notNull(),
  message: text("message"),
  expiresAt: timestamp("expires_at").notNull(),
  acceptedAt: timestamp("accepted_at"),
  acceptedByUserId: varchar("accepted_by_user_id"),
  revokedAt: timestamp("revoked_at"),
  revokedByUserId: varchar("revoked_by_user_id"),
  revokedReason: text("revoked_reason"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_invitations_email").on(table.email),
  index("idx_invitations_token").on(table.token),
  index("idx_invitations_status").on(table.status),
]);

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
  accessStatus: accessStatusEnum("access_status").default("pending_invitation").notNull(),
  invitationId: varchar("invitation_id"),
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
  invitation: one(invitations, {
    fields: [users.invitationId],
    references: [invitations.id],
  }),
}));

export const invitationsRelations = relations(invitations, ({ one }) => ({
  invitedBy: one(users, {
    fields: [invitations.invitedByUserId],
    references: [users.id],
    relationName: "invitedBy",
  }),
  acceptedBy: one(users, {
    fields: [invitations.acceptedByUserId],
    references: [users.id],
    relationName: "acceptedBy",
  }),
  revokedBy: one(users, {
    fields: [invitations.revokedByUserId],
    references: [users.id],
    relationName: "revokedBy",
  }),
}));

// T-shirt size enum
export const tshirtSizeEnum = pgEnum("tshirt_size", ["xs", "s", "m", "l", "xl", "2xl", "3xl", "4xl"]);

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
  // Personal Information fields
  preferredName: varchar("preferred_name"),
  birthday: date("birthday"),
  tshirtSize: tshirtSizeEnum("tshirt_size"),
  dietaryRestrictions: text("dietary_restrictions"),
  allergies: text("allergies"),
  languages: text("languages").array(),
  emergencyContactName: varchar("emergency_contact_name"),
  emergencyContactPhone: varchar("emergency_contact_phone"),
  emergencyContactRelation: varchar("emergency_contact_relation"),
  personalInfoCompleted: boolean("personal_info_completed").default(false),
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

// ==========================================
// RBAC (Role-Based Access Control) Tables
// ==========================================

// Role type enum - distinguishes base roles from custom roles
export const roleTypeEnum = pgEnum("role_type", ["base", "implementation", "custom"]);

// Roles table - stores both predefined base roles and custom roles
export const roles = pgTable("roles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull().unique(),
  displayName: varchar("display_name").notNull(),
  description: text("description"),
  roleType: roleTypeEnum("role_type").default("custom").notNull(),
  baseRoleId: varchar("base_role_id").references((): any => roles.id),
  hospitalId: varchar("hospital_id").references(() => hospitals.id),
  isActive: boolean("is_active").default(true).notNull(),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_roles_type").on(table.roleType),
  index("idx_roles_hospital").on(table.hospitalId),
]);

// Permission domains - groups of related permissions
export const permissionDomainEnum = pgEnum("permission_domain", [
  "dashboard",
  "projects",
  "consultants", 
  "hospitals",
  "timesheets",
  "support_tickets",
  "eod_reports",
  "training",
  "travel",
  "financials",
  "quality",
  "compliance",
  "reports",
  "admin",
  "rbac"
]);

// Permissions table - defines all available permissions
export const permissions = pgTable("permissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  domain: permissionDomainEnum("domain").notNull(),
  action: varchar("action").notNull(),
  name: varchar("name").notNull().unique(),
  displayName: varchar("display_name").notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_permissions_domain").on(table.domain),
  index("idx_permissions_name").on(table.name),
]);

// Role permissions junction table
export const rolePermissions = pgTable("role_permissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  roleId: varchar("role_id").references(() => roles.id, { onDelete: "cascade" }).notNull(),
  permissionId: varchar("permission_id").references(() => permissions.id, { onDelete: "cascade" }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_role_permissions_role").on(table.roleId),
  index("idx_role_permissions_permission").on(table.permissionId),
]);

// User role assignments - assigns roles to users with optional project scope
export const userRoleAssignments = pgTable("user_role_assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  roleId: varchar("role_id").references(() => roles.id, { onDelete: "cascade" }).notNull(),
  projectId: varchar("project_id").references(() => projects.id, { onDelete: "cascade" }),
  hospitalId: varchar("hospital_id").references(() => hospitals.id, { onDelete: "cascade" }),
  isActive: boolean("is_active").default(true).notNull(),
  assignedBy: varchar("assigned_by").references(() => users.id),
  assignedAt: timestamp("assigned_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_user_roles_user").on(table.userId),
  index("idx_user_roles_role").on(table.roleId),
  index("idx_user_roles_project").on(table.projectId),
  index("idx_user_roles_hospital").on(table.hospitalId),
]);

// RBAC Relations
export const rolesRelations = relations(roles, ({ one, many }) => ({
  baseRole: one(roles, {
    fields: [roles.baseRoleId],
    references: [roles.id],
    relationName: "role_inheritance",
  }),
  childRoles: many(roles, { relationName: "role_inheritance" }),
  hospital: one(hospitals, {
    fields: [roles.hospitalId],
    references: [hospitals.id],
  }),
  createdByUser: one(users, {
    fields: [roles.createdBy],
    references: [users.id],
  }),
  permissions: many(rolePermissions),
  assignments: many(userRoleAssignments),
}));

export const permissionsRelations = relations(permissions, ({ many }) => ({
  roles: many(rolePermissions),
}));

export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
  role: one(roles, {
    fields: [rolePermissions.roleId],
    references: [roles.id],
  }),
  permission: one(permissions, {
    fields: [rolePermissions.permissionId],
    references: [permissions.id],
  }),
}));

export const userRoleAssignmentsRelations = relations(userRoleAssignments, ({ one }) => ({
  user: one(users, {
    fields: [userRoleAssignments.userId],
    references: [users.id],
  }),
  role: one(roles, {
    fields: [userRoleAssignments.roleId],
    references: [roles.id],
  }),
  project: one(projects, {
    fields: [userRoleAssignments.projectId],
    references: [projects.id],
  }),
  hospital: one(hospitals, {
    fields: [userRoleAssignments.hospitalId],
    references: [hospitals.id],
  }),
  assignedByUser: one(users, {
    fields: [userRoleAssignments.assignedBy],
    references: [users.id],
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

// ==========================================
// SKILLS QUESTIONNAIRE SYSTEM
// ==========================================

export const skillCategoryEnum = pgEnum("skill_category", [
  "ehr_systems",
  "clinical_modules",
  "revenue_cycle",
  "ancillary_systems",
  "technical_skills",
  "soft_skills",
  "certifications",
  "work_preferences"
]);

export const proficiencyLevelEnum = pgEnum("proficiency_level", [
  "none",
  "beginner",
  "intermediate",
  "advanced",
  "expert"
]);

export const questionnaireStatusEnum = pgEnum("questionnaire_status", [
  "draft",
  "submitted",
  "verified"
]);

export const skillVerificationStatusEnum = pgEnum("skill_verification_status", [
  "pending",
  "verified",
  "rejected"
]);

// Skill Categories - defines the categories of skills
export const skillCategories = pgTable("skill_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull().unique(),
  displayName: varchar("display_name").notNull(),
  description: text("description"),
  category: skillCategoryEnum("category").notNull(),
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Skill Items - individual skills within categories
export const skillItems = pgTable("skill_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  categoryId: varchar("category_id").references(() => skillCategories.id).notNull(),
  name: varchar("name").notNull(),
  displayName: varchar("display_name").notNull(),
  description: text("description"),
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Consultant Questionnaires - main questionnaire record
export const consultantQuestionnaires = pgTable("consultant_questionnaires", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  consultantId: varchar("consultant_id").references(() => consultants.id).notNull().unique(),
  status: questionnaireStatusEnum("status").default("draft").notNull(),
  completedSections: text("completed_sections").array().default(sql`'{}'::text[]`),
  lastSavedAt: timestamp("last_saved_at").defaultNow(),
  submittedAt: timestamp("submitted_at"),
  verifiedAt: timestamp("verified_at"),
  verifiedBy: varchar("verified_by").references(() => users.id),
  personalInfo: jsonb("personal_info"),
  workPreferences: jsonb("work_preferences"),
  additionalNotes: text("additional_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Consultant Skills - individual skill ratings
export const consultantSkills = pgTable("consultant_skills", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  consultantId: varchar("consultant_id").references(() => consultants.id).notNull(),
  skillItemId: varchar("skill_item_id").references(() => skillItems.id).notNull(),
  proficiency: proficiencyLevelEnum("proficiency").default("none").notNull(),
  yearsExperience: integer("years_experience").default(0),
  isCertified: boolean("is_certified").default(false),
  certificationName: varchar("certification_name"),
  certificationExpiry: date("certification_expiry"),
  notes: text("notes"),
  verificationStatus: skillVerificationStatusEnum("verification_status").default("pending"),
  verifiedBy: varchar("verified_by").references(() => users.id),
  verifiedAt: timestamp("verified_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Skill Verifications - audit trail for skill verifications
export const skillVerifications = pgTable("skill_verifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  consultantSkillId: varchar("consultant_skill_id").references(() => consultantSkills.id).notNull(),
  verifiedBy: varchar("verified_by").references(() => users.id).notNull(),
  previousStatus: skillVerificationStatusEnum("previous_status"),
  newStatus: skillVerificationStatusEnum("new_status").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// EHR System Experience - specific to EHR systems
export const consultantEhrExperience = pgTable("consultant_ehr_experience", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  consultantId: varchar("consultant_id").references(() => consultants.id).notNull(),
  ehrSystem: varchar("ehr_system").notNull(),
  yearsExperience: integer("years_experience").default(0),
  proficiency: proficiencyLevelEnum("proficiency").default("none").notNull(),
  isCertified: boolean("is_certified").default(false),
  certifications: text("certifications").array().default(sql`'{}'::text[]`),
  lastUsed: date("last_used"),
  projectCount: integer("project_count").default(0),
  verificationStatus: skillVerificationStatusEnum("verification_status").default("pending"),
  verifiedBy: varchar("verified_by").references(() => users.id),
  verifiedAt: timestamp("verified_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Consultant Certifications - detailed certification records
export const consultantCertifications = pgTable("consultant_certifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  consultantId: varchar("consultant_id").references(() => consultants.id).notNull(),
  certificationType: varchar("certification_type").notNull(),
  certificationName: varchar("certification_name").notNull(),
  issuingOrganization: varchar("issuing_organization"),
  issueDate: date("issue_date"),
  expiryDate: date("expiry_date"),
  credentialId: varchar("credential_id"),
  documentId: varchar("document_id").references(() => consultantDocuments.id),
  verificationStatus: skillVerificationStatusEnum("verification_status").default("pending"),
  verifiedBy: varchar("verified_by").references(() => users.id),
  verifiedAt: timestamp("verified_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Skills Questionnaire Relations
export const skillCategoriesRelations = relations(skillCategories, ({ many }) => ({
  items: many(skillItems),
}));

export const skillItemsRelations = relations(skillItems, ({ one, many }) => ({
  category: one(skillCategories, {
    fields: [skillItems.categoryId],
    references: [skillCategories.id],
  }),
  consultantSkills: many(consultantSkills),
}));

export const consultantQuestionnairesRelations = relations(consultantQuestionnaires, ({ one }) => ({
  consultant: one(consultants, {
    fields: [consultantQuestionnaires.consultantId],
    references: [consultants.id],
  }),
  verifier: one(users, {
    fields: [consultantQuestionnaires.verifiedBy],
    references: [users.id],
  }),
}));

export const consultantSkillsRelations = relations(consultantSkills, ({ one, many }) => ({
  consultant: one(consultants, {
    fields: [consultantSkills.consultantId],
    references: [consultants.id],
  }),
  skillItem: one(skillItems, {
    fields: [consultantSkills.skillItemId],
    references: [skillItems.id],
  }),
  verifier: one(users, {
    fields: [consultantSkills.verifiedBy],
    references: [users.id],
  }),
  verifications: many(skillVerifications),
}));

export const skillVerificationsRelations = relations(skillVerifications, ({ one }) => ({
  consultantSkill: one(consultantSkills, {
    fields: [skillVerifications.consultantSkillId],
    references: [consultantSkills.id],
  }),
  verifier: one(users, {
    fields: [skillVerifications.verifiedBy],
    references: [users.id],
  }),
}));

export const consultantEhrExperienceRelations = relations(consultantEhrExperience, ({ one }) => ({
  consultant: one(consultants, {
    fields: [consultantEhrExperience.consultantId],
    references: [consultants.id],
  }),
  verifier: one(users, {
    fields: [consultantEhrExperience.verifiedBy],
    references: [users.id],
  }),
}));

export const consultantCertificationsRelations = relations(consultantCertifications, ({ one }) => ({
  consultant: one(consultants, {
    fields: [consultantCertifications.consultantId],
    references: [consultants.id],
  }),
  document: one(consultantDocuments, {
    fields: [consultantCertifications.documentId],
    references: [consultantDocuments.id],
  }),
  verifier: one(users, {
    fields: [consultantCertifications.verifiedBy],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertInvitationSchema = createInsertSchema(invitations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

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
export type Invitation = typeof invitations.$inferSelect;
export type InsertInvitation = z.infer<typeof insertInvitationSchema>;

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

// RBAC Insert Schemas
export const insertRoleSchema = createInsertSchema(roles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPermissionSchema = createInsertSchema(permissions).omit({
  id: true,
  createdAt: true,
});

export const insertRolePermissionSchema = createInsertSchema(rolePermissions).omit({
  id: true,
  createdAt: true,
});

export const insertUserRoleAssignmentSchema = createInsertSchema(userRoleAssignments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  assignedAt: true,
});

// RBAC Types
export type Role = typeof roles.$inferSelect;
export type InsertRole = z.infer<typeof insertRoleSchema>;

export type Permission = typeof permissions.$inferSelect;
export type InsertPermission = z.infer<typeof insertPermissionSchema>;

export type RolePermission = typeof rolePermissions.$inferSelect;
export type InsertRolePermission = z.infer<typeof insertRolePermissionSchema>;

export type UserRoleAssignment = typeof userRoleAssignments.$inferSelect;
export type InsertUserRoleAssignment = z.infer<typeof insertUserRoleAssignmentSchema>;

// Helper type for role with permissions
export type RoleWithPermissions = Role & {
  permissions: (RolePermission & { permission: Permission })[];
};

// Helper type for user's effective permissions
export type EffectivePermissions = {
  roleId: string;
  roleName: string;
  permissions: string[];
  projectId?: string | null;
  hospitalId?: string | null;
};

// Skills Questionnaire Insert Schemas
export const insertSkillCategorySchema = createInsertSchema(skillCategories).omit({
  id: true,
  createdAt: true,
});

export const insertSkillItemSchema = createInsertSchema(skillItems).omit({
  id: true,
  createdAt: true,
});

export const insertConsultantQuestionnaireSchema = createInsertSchema(consultantQuestionnaires).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertConsultantSkillSchema = createInsertSchema(consultantSkills).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSkillVerificationSchema = createInsertSchema(skillVerifications).omit({
  id: true,
  createdAt: true,
});

export const insertConsultantEhrExperienceSchema = createInsertSchema(consultantEhrExperience).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertConsultantCertificationSchema = createInsertSchema(consultantCertifications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Skills Questionnaire Types
export type SkillCategory = typeof skillCategories.$inferSelect;
export type InsertSkillCategory = z.infer<typeof insertSkillCategorySchema>;

export type SkillItem = typeof skillItems.$inferSelect;
export type InsertSkillItem = z.infer<typeof insertSkillItemSchema>;

export type ConsultantQuestionnaire = typeof consultantQuestionnaires.$inferSelect;
export type InsertConsultantQuestionnaire = z.infer<typeof insertConsultantQuestionnaireSchema>;

export type ConsultantSkill = typeof consultantSkills.$inferSelect;
export type InsertConsultantSkill = z.infer<typeof insertConsultantSkillSchema>;

export type SkillVerification = typeof skillVerifications.$inferSelect;
export type InsertSkillVerification = z.infer<typeof insertSkillVerificationSchema>;

export type ConsultantEhrExperience = typeof consultantEhrExperience.$inferSelect;
export type InsertConsultantEhrExperience = z.infer<typeof insertConsultantEhrExperienceSchema>;

export type ConsultantCertification = typeof consultantCertifications.$inferSelect;
export type InsertConsultantCertification = z.infer<typeof insertConsultantCertificationSchema>;

// Questionnaire with full details
export type QuestionnaireWithSkills = ConsultantQuestionnaire & {
  skills: (ConsultantSkill & { skillItem: SkillItem })[];
  ehrExperience: ConsultantEhrExperience[];
  certifications: ConsultantCertification[];
};

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

// ============================================
// PHASE 13: FINANCIAL MANAGEMENT
// ============================================

// Expense category enum
export const expenseCategoryEnum = pgEnum("expense_category", [
  "travel",
  "lodging",
  "meals",
  "transportation",
  "parking",
  "mileage",
  "per_diem",
  "equipment",
  "supplies",
  "training",
  "other"
]);

// Expense status enum
export const expenseStatusEnum = pgEnum("expense_status", [
  "draft",
  "submitted",
  "approved",
  "rejected",
  "reimbursed"
]);

// Invoice status enum
export const invoiceStatusEnum = pgEnum("invoice_status", [
  "draft",
  "pending",
  "sent",
  "paid",
  "overdue",
  "cancelled"
]);

// Payroll batch status enum
export const payrollBatchStatusEnum = pgEnum("payroll_batch_status", [
  "draft",
  "processing",
  "approved",
  "paid",
  "cancelled"
]);

// Scenario type enum
export const scenarioTypeEnum = pgEnum("scenario_type", [
  "baseline",
  "optimistic",
  "pessimistic",
  "what_if"
]);

// ============================================
// EXPENSE MANAGEMENT TABLES
// ============================================

// Per Diem Policies
export const perDiemPolicies = pgTable("per_diem_policies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  dailyRate: decimal("daily_rate", { precision: 10, scale: 2 }).notNull(),
  breakfastRate: decimal("breakfast_rate", { precision: 10, scale: 2 }),
  lunchRate: decimal("lunch_rate", { precision: 10, scale: 2 }),
  dinnerRate: decimal("dinner_rate", { precision: 10, scale: 2 }),
  incidentalRate: decimal("incidental_rate", { precision: 10, scale: 2 }),
  location: varchar("location"),
  effectiveFrom: date("effective_from").notNull(),
  effectiveTo: date("effective_to"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Mileage Rates
export const mileageRates = pgTable("mileage_rates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  ratePerMile: decimal("rate_per_mile", { precision: 10, scale: 4 }).notNull(),
  vehicleType: varchar("vehicle_type"),
  effectiveFrom: date("effective_from").notNull(),
  effectiveTo: date("effective_to"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Expenses
export const expenses = pgTable("expenses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  consultantId: varchar("consultant_id").references(() => consultants.id).notNull(),
  projectId: varchar("project_id").references(() => projects.id),
  category: expenseCategoryEnum("category").notNull(),
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency").default("USD").notNull(),
  expenseDate: date("expense_date").notNull(),
  receiptUrl: varchar("receipt_url"),
  receiptFileName: varchar("receipt_file_name"),
  status: expenseStatusEnum("status").default("draft").notNull(),
  // Mileage specific fields
  mileageStart: varchar("mileage_start"),
  mileageEnd: varchar("mileage_end"),
  mileageDistance: decimal("mileage_distance", { precision: 10, scale: 2 }),
  mileageRateId: varchar("mileage_rate_id").references(() => mileageRates.id),
  // Per diem specific fields
  perDiemPolicyId: varchar("per_diem_policy_id").references(() => perDiemPolicies.id),
  perDiemDays: integer("per_diem_days"),
  mealsIncluded: jsonb("meals_included"),
  // Approval fields
  submittedAt: timestamp("submitted_at"),
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  reviewNotes: text("review_notes"),
  reimbursedAt: timestamp("reimbursed_at"),
  invoiceId: varchar("invoice_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const expensesRelations = relations(expenses, ({ one }) => ({
  consultant: one(consultants, {
    fields: [expenses.consultantId],
    references: [consultants.id],
  }),
  project: one(projects, {
    fields: [expenses.projectId],
    references: [projects.id],
  }),
  reviewer: one(users, {
    fields: [expenses.reviewedBy],
    references: [users.id],
  }),
  mileageRate: one(mileageRates, {
    fields: [expenses.mileageRateId],
    references: [mileageRates.id],
  }),
  perDiemPolicy: one(perDiemPolicies, {
    fields: [expenses.perDiemPolicyId],
    references: [perDiemPolicies.id],
  }),
}));

// ============================================
// INVOICE MANAGEMENT TABLES
// ============================================

// Invoice Templates
export const invoiceTemplates = pgTable("invoice_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  headerText: text("header_text"),
  footerText: text("footer_text"),
  termsAndConditions: text("terms_and_conditions"),
  logoUrl: varchar("logo_url"),
  companyName: varchar("company_name"),
  companyAddress: text("company_address"),
  companyPhone: varchar("company_phone"),
  companyEmail: varchar("company_email"),
  paymentInstructions: text("payment_instructions"),
  layoutConfig: jsonb("layout_config"),
  isDefault: boolean("is_default").default(false).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Invoices
export const invoices = pgTable("invoices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  invoiceNumber: varchar("invoice_number").unique(),
  projectId: varchar("project_id").references(() => projects.id),
  hospitalId: varchar("hospital_id").references(() => hospitals.id),
  templateId: varchar("template_id").references(() => invoiceTemplates.id),
  status: invoiceStatusEnum("status").default("draft").notNull(),
  issueDate: date("issue_date"),
  dueDate: date("due_date"),
  periodStart: date("period_start"),
  periodEnd: date("period_end"),
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).default("0"),
  taxRate: decimal("tax_rate", { precision: 5, scale: 2 }).default("0"),
  taxAmount: decimal("tax_amount", { precision: 12, scale: 2 }).default("0"),
  discountAmount: decimal("discount_amount", { precision: 12, scale: 2 }).default("0"),
  totalAmount: decimal("total_amount", { precision: 12, scale: 2 }).default("0"),
  paidAmount: decimal("paid_amount", { precision: 12, scale: 2 }).default("0"),
  notes: text("notes"),
  internalNotes: text("internal_notes"),
  pdfUrl: varchar("pdf_url"),
  sentAt: timestamp("sent_at"),
  paidAt: timestamp("paid_at"),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  project: one(projects, {
    fields: [invoices.projectId],
    references: [projects.id],
  }),
  hospital: one(hospitals, {
    fields: [invoices.hospitalId],
    references: [hospitals.id],
  }),
  template: one(invoiceTemplates, {
    fields: [invoices.templateId],
    references: [invoiceTemplates.id],
  }),
  creator: one(users, {
    fields: [invoices.createdBy],
    references: [users.id],
  }),
  lineItems: many(invoiceLineItems),
}));

// Invoice Line Items
export const invoiceLineItems = pgTable("invoice_line_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  invoiceId: varchar("invoice_id").references(() => invoices.id).notNull(),
  description: text("description").notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).default("1"),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  category: varchar("category"),
  // Link to source data
  timesheetEntryId: varchar("timesheet_entry_id"),
  expenseId: varchar("expense_id").references(() => expenses.id),
  consultantId: varchar("consultant_id").references(() => consultants.id),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const invoiceLineItemsRelations = relations(invoiceLineItems, ({ one }) => ({
  invoice: one(invoices, {
    fields: [invoiceLineItems.invoiceId],
    references: [invoices.id],
  }),
  expense: one(expenses, {
    fields: [invoiceLineItems.expenseId],
    references: [expenses.id],
  }),
  consultant: one(consultants, {
    fields: [invoiceLineItems.consultantId],
    references: [consultants.id],
  }),
}));

// ============================================
// PAYROLL MANAGEMENT TABLES
// ============================================

// Pay Rates (history tracking)
export const payRates = pgTable("pay_rates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  consultantId: varchar("consultant_id").references(() => consultants.id).notNull(),
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }).notNull(),
  overtimeRate: decimal("overtime_rate", { precision: 10, scale: 2 }),
  effectiveFrom: date("effective_from").notNull(),
  effectiveTo: date("effective_to"),
  notes: text("notes"),
  approvedBy: varchar("approved_by").references(() => users.id),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const payRatesRelations = relations(payRates, ({ one }) => ({
  consultant: one(consultants, {
    fields: [payRates.consultantId],
    references: [consultants.id],
  }),
  approver: one(users, {
    fields: [payRates.approvedBy],
    references: [users.id],
  }),
}));

// Payroll Batches
export const payrollBatches = pgTable("payroll_batches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  batchNumber: varchar("batch_number").unique(),
  name: varchar("name").notNull(),
  periodStart: date("period_start").notNull(),
  periodEnd: date("period_end").notNull(),
  status: payrollBatchStatusEnum("status").default("draft").notNull(),
  totalHours: decimal("total_hours", { precision: 10, scale: 2 }).default("0"),
  totalRegularHours: decimal("total_regular_hours", { precision: 10, scale: 2 }).default("0"),
  totalOvertimeHours: decimal("total_overtime_hours", { precision: 10, scale: 2 }).default("0"),
  totalGrossPay: decimal("total_gross_pay", { precision: 12, scale: 2 }).default("0"),
  totalExpenses: decimal("total_expenses", { precision: 12, scale: 2 }).default("0"),
  totalAmount: decimal("total_amount", { precision: 12, scale: 2 }).default("0"),
  consultantCount: integer("consultant_count").default(0),
  processedAt: timestamp("processed_at"),
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  paidAt: timestamp("paid_at"),
  exportedAt: timestamp("exported_at"),
  exportFormat: varchar("export_format"),
  notes: text("notes"),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const payrollBatchesRelations = relations(payrollBatches, ({ one, many }) => ({
  approver: one(users, {
    fields: [payrollBatches.approvedBy],
    references: [users.id],
  }),
  creator: one(users, {
    fields: [payrollBatches.createdBy],
    references: [users.id],
  }),
  entries: many(payrollEntries),
}));

// Payroll Entries
export const payrollEntries = pgTable("payroll_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  batchId: varchar("batch_id").references(() => payrollBatches.id).notNull(),
  consultantId: varchar("consultant_id").references(() => consultants.id).notNull(),
  timesheetId: varchar("timesheet_id").references(() => timesheets.id),
  regularHours: decimal("regular_hours", { precision: 10, scale: 2 }).default("0"),
  overtimeHours: decimal("overtime_hours", { precision: 10, scale: 2 }).default("0"),
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }).notNull(),
  overtimeRate: decimal("overtime_rate", { precision: 10, scale: 2 }),
  regularPay: decimal("regular_pay", { precision: 12, scale: 2 }).default("0"),
  overtimePay: decimal("overtime_pay", { precision: 12, scale: 2 }).default("0"),
  grossPay: decimal("gross_pay", { precision: 12, scale: 2 }).default("0"),
  expenseReimbursement: decimal("expense_reimbursement", { precision: 12, scale: 2 }).default("0"),
  totalPay: decimal("total_pay", { precision: 12, scale: 2 }).default("0"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const payrollEntriesRelations = relations(payrollEntries, ({ one }) => ({
  batch: one(payrollBatches, {
    fields: [payrollEntries.batchId],
    references: [payrollBatches.id],
  }),
  consultant: one(consultants, {
    fields: [payrollEntries.consultantId],
    references: [consultants.id],
  }),
  timesheet: one(timesheets, {
    fields: [payrollEntries.timesheetId],
    references: [timesheets.id],
  }),
}));

// Paycheck Stubs
export const paycheckStubs = pgTable("paycheck_stubs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  payrollEntryId: varchar("payroll_entry_id").references(() => payrollEntries.id).notNull(),
  consultantId: varchar("consultant_id").references(() => consultants.id).notNull(),
  payDate: date("pay_date").notNull(),
  periodStart: date("period_start").notNull(),
  periodEnd: date("period_end").notNull(),
  regularHours: decimal("regular_hours", { precision: 10, scale: 2 }),
  overtimeHours: decimal("overtime_hours", { precision: 10, scale: 2 }),
  grossPay: decimal("gross_pay", { precision: 12, scale: 2 }),
  expenseReimbursement: decimal("expense_reimbursement", { precision: 12, scale: 2 }),
  netPay: decimal("net_pay", { precision: 12, scale: 2 }),
  pdfUrl: varchar("pdf_url"),
  details: jsonb("details"),
  viewedAt: timestamp("viewed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const paycheckStubsRelations = relations(paycheckStubs, ({ one }) => ({
  payrollEntry: one(payrollEntries, {
    fields: [paycheckStubs.payrollEntryId],
    references: [payrollEntries.id],
  }),
  consultant: one(consultants, {
    fields: [paycheckStubs.consultantId],
    references: [consultants.id],
  }),
}));

// ============================================
// BUDGET & SCENARIO MODELING TABLES
// ============================================

// Budget Scenarios
export const budgetScenarios = pgTable("budget_scenarios", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").references(() => projects.id),
  name: varchar("name").notNull(),
  description: text("description"),
  scenarioType: scenarioTypeEnum("scenario_type").default("what_if").notNull(),
  isBaseline: boolean("is_baseline").default(false).notNull(),
  // Budget parameters
  estimatedHours: decimal("estimated_hours", { precision: 10, scale: 2 }),
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }),
  consultantCount: integer("consultant_count"),
  durationWeeks: integer("duration_weeks"),
  // Cost estimates
  laborCost: decimal("labor_cost", { precision: 12, scale: 2 }),
  travelCost: decimal("travel_cost", { precision: 12, scale: 2 }),
  expenseCost: decimal("expense_cost", { precision: 12, scale: 2 }),
  overheadCost: decimal("overhead_cost", { precision: 12, scale: 2 }),
  totalBudget: decimal("total_budget", { precision: 12, scale: 2 }),
  // Actuals (for baseline comparison)
  actualLaborCost: decimal("actual_labor_cost", { precision: 12, scale: 2 }),
  actualTravelCost: decimal("actual_travel_cost", { precision: 12, scale: 2 }),
  actualExpenseCost: decimal("actual_expense_cost", { precision: 12, scale: 2 }),
  actualTotalCost: decimal("actual_total_cost", { precision: 12, scale: 2 }),
  // Variance
  budgetVariance: decimal("budget_variance", { precision: 12, scale: 2 }),
  variancePercentage: decimal("variance_percentage", { precision: 5, scale: 2 }),
  // Assumptions
  assumptions: jsonb("assumptions"),
  // Metadata
  createdBy: varchar("created_by").references(() => users.id),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const budgetScenariosRelations = relations(budgetScenarios, ({ one, many }) => ({
  project: one(projects, {
    fields: [budgetScenarios.projectId],
    references: [projects.id],
  }),
  creator: one(users, {
    fields: [budgetScenarios.createdBy],
    references: [users.id],
  }),
  metrics: many(scenarioMetrics),
}));

// Scenario Metrics (for tracking forecasts over time)
export const scenarioMetrics = pgTable("scenario_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  scenarioId: varchar("scenario_id").references(() => budgetScenarios.id).notNull(),
  metricDate: date("metric_date").notNull(),
  metricType: varchar("metric_type").notNull(),
  metricName: varchar("metric_name").notNull(),
  plannedValue: decimal("planned_value", { precision: 12, scale: 2 }),
  actualValue: decimal("actual_value", { precision: 12, scale: 2 }),
  forecastValue: decimal("forecast_value", { precision: 12, scale: 2 }),
  variance: decimal("variance", { precision: 12, scale: 2 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const scenarioMetricsRelations = relations(scenarioMetrics, ({ one }) => ({
  scenario: one(budgetScenarios, {
    fields: [scenarioMetrics.scenarioId],
    references: [budgetScenarios.id],
  }),
}));

// ============================================
// PHASE 13 INSERT SCHEMAS
// ============================================

export const insertPerDiemPolicySchema = createInsertSchema(perDiemPolicies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMileageRateSchema = createInsertSchema(mileageRates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertExpenseSchema = createInsertSchema(expenses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInvoiceTemplateSchema = createInsertSchema(invoiceTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInvoiceLineItemSchema = createInsertSchema(invoiceLineItems).omit({
  id: true,
  createdAt: true,
});

export const insertPayRateSchema = createInsertSchema(payRates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPayrollBatchSchema = createInsertSchema(payrollBatches).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPayrollEntrySchema = createInsertSchema(payrollEntries).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPaycheckStubSchema = createInsertSchema(paycheckStubs).omit({
  id: true,
  createdAt: true,
});

export const insertBudgetScenarioSchema = createInsertSchema(budgetScenarios).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertScenarioMetricSchema = createInsertSchema(scenarioMetrics).omit({
  id: true,
  createdAt: true,
});

// ============================================
// PHASE 13 TYPES
// ============================================

export type PerDiemPolicy = typeof perDiemPolicies.$inferSelect;
export type InsertPerDiemPolicy = z.infer<typeof insertPerDiemPolicySchema>;

export type MileageRate = typeof mileageRates.$inferSelect;
export type InsertMileageRate = z.infer<typeof insertMileageRateSchema>;

export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;

export type InvoiceTemplate = typeof invoiceTemplates.$inferSelect;
export type InsertInvoiceTemplate = z.infer<typeof insertInvoiceTemplateSchema>;

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;

export type InvoiceLineItem = typeof invoiceLineItems.$inferSelect;
export type InsertInvoiceLineItem = z.infer<typeof insertInvoiceLineItemSchema>;

export type PayRate = typeof payRates.$inferSelect;
export type InsertPayRate = z.infer<typeof insertPayRateSchema>;

export type PayrollBatch = typeof payrollBatches.$inferSelect;
export type InsertPayrollBatch = z.infer<typeof insertPayrollBatchSchema>;

export type PayrollEntry = typeof payrollEntries.$inferSelect;
export type InsertPayrollEntry = z.infer<typeof insertPayrollEntrySchema>;

export type PaycheckStub = typeof paycheckStubs.$inferSelect;
export type InsertPaycheckStub = z.infer<typeof insertPaycheckStubSchema>;

export type BudgetScenario = typeof budgetScenarios.$inferSelect;
export type InsertBudgetScenario = z.infer<typeof insertBudgetScenarioSchema>;

export type ScenarioMetric = typeof scenarioMetrics.$inferSelect;
export type InsertScenarioMetric = z.infer<typeof insertScenarioMetricSchema>;

// ============================================
// PHASE 13 EXTENDED TYPES
// ============================================

export interface ExpenseWithDetails extends Expense {
  consultant: {
    id: string;
    user: {
      firstName: string | null;
      lastName: string | null;
    };
  };
  project: {
    id: string;
    name: string;
  } | null;
  reviewer: {
    id: string;
    firstName: string | null;
    lastName: string | null;
  } | null;
}

export interface InvoiceWithDetails extends Invoice {
  project: {
    id: string;
    name: string;
  } | null;
  hospital: {
    id: string;
    name: string;
  } | null;
  template: InvoiceTemplate | null;
  lineItems: InvoiceLineItem[];
  creator: {
    id: string;
    firstName: string | null;
    lastName: string | null;
  } | null;
}

export interface PayrollBatchWithDetails extends PayrollBatch {
  entries: PayrollEntryWithDetails[];
  approver: {
    id: string;
    firstName: string | null;
    lastName: string | null;
  } | null;
  creator: {
    id: string;
    firstName: string | null;
    lastName: string | null;
  } | null;
}

export interface PayrollEntryWithDetails extends PayrollEntry {
  consultant: {
    id: string;
    user: {
      firstName: string | null;
      lastName: string | null;
    };
  };
  timesheet: {
    id: string;
    weekStartDate: string;
  } | null;
}

export interface PaycheckStubWithDetails extends PaycheckStub {
  consultant: {
    id: string;
    user: {
      firstName: string | null;
      lastName: string | null;
    };
  };
}

export interface BudgetScenarioWithMetrics extends BudgetScenario {
  project: {
    id: string;
    name: string;
  } | null;
  metrics: ScenarioMetric[];
  creator: {
    id: string;
    firstName: string | null;
    lastName: string | null;
  } | null;
}

// Analytics types
export interface ExpenseAnalytics {
  totalExpenses: number;
  pendingApproval: number;
  totalAmount: string;
  byCategory: Array<{
    category: string;
    count: number;
    amount: string;
  }>;
  byStatus: Array<{
    status: string;
    count: number;
    amount: string;
  }>;
}

export interface PayrollAnalytics {
  totalBatches: number;
  pendingBatches: number;
  totalPaidAmount: string;
  averagePayPerConsultant: string;
  recentBatches: PayrollBatchWithDetails[];
}

// ============================================
// PHASE 14: TRAVEL MANAGEMENT
// ============================================

// Travel-related enums
export const seatPreferenceEnum = pgEnum("seat_preference", ["window", "middle", "aisle"]);
export const rentalCarPreferenceEnum = pgEnum("rental_car_preference", ["economy", "compact", "midsize", "fullsize", "suv", "luxury"]);
export const bookingTypeEnum = pgEnum("booking_type", ["flight", "hotel", "rental_car"]);
export const bookingStatusEnum = pgEnum("booking_status", ["pending", "confirmed", "cancelled", "completed"]);
export const itineraryStatusEnum = pgEnum("itinerary_status", ["draft", "confirmed", "in_progress", "completed", "cancelled"]);
export const carpoolStatusEnum = pgEnum("carpool_status", ["open", "full", "cancelled", "completed"]);
export const carpoolRoleEnum = pgEnum("carpool_role", ["driver", "rider"]);
export const carpoolMemberStatusEnum = pgEnum("carpool_member_status", ["pending", "confirmed", "cancelled"]);
export const transportationRoleEnum = pgEnum("transportation_role", ["driver", "shuttle_driver", "coordinator", "other"]);

// ============================================
// TRAVEL PREFERENCES TABLE
// ============================================

export const travelPreferences = pgTable("travel_preferences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  consultantId: varchar("consultant_id").references(() => consultants.id).notNull().unique(),
  preferredAirlines: text("preferred_airlines").array(),
  seatPreference: seatPreferenceEnum("seat_preference"),
  rentalCarPreference: rentalCarPreferenceEnum("rental_car_preference"),
  rentalCarCompany: varchar("rental_car_company"),
  rentalCarRewardsNumber: varchar("rental_car_rewards_number"),
  mealPreference: varchar("meal_preference"),
  specialRequests: text("special_requests"),
  emergencyContactName: varchar("emergency_contact_name"),
  emergencyContactPhone: varchar("emergency_contact_phone"),
  emergencyContactRelation: varchar("emergency_contact_relation"),
  travelNotes: text("travel_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const travelPreferencesRelations = relations(travelPreferences, ({ one }) => ({
  consultant: one(consultants, {
    fields: [travelPreferences.consultantId],
    references: [consultants.id],
  }),
}));

// ============================================
// TRAVEL BOOKINGS TABLE
// ============================================

export const travelBookings = pgTable("travel_bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  consultantId: varchar("consultant_id").references(() => consultants.id).notNull(),
  projectId: varchar("project_id").references(() => projects.id),
  bookingType: bookingTypeEnum("booking_type").notNull(),
  status: bookingStatusEnum("status").default("pending").notNull(),
  departureDate: date("departure_date"),
  returnDate: date("return_date"),
  // Flight fields
  airline: varchar("airline"),
  flightNumber: varchar("flight_number"),
  departureAirport: varchar("departure_airport"),
  arrivalAirport: varchar("arrival_airport"),
  departureTime: time("departure_time"),
  arrivalTime: time("arrival_time"),
  // Hotel fields
  hotelName: varchar("hotel_name"),
  hotelAddress: varchar("hotel_address"),
  hotelConfirmationNumber: varchar("hotel_confirmation_number"),
  checkInDate: date("check_in_date"),
  checkOutDate: date("check_out_date"),
  // Rental car fields
  rentalCompany: varchar("rental_company"),
  pickupLocation: varchar("pickup_location"),
  dropoffLocation: varchar("dropoff_location"),
  vehicleType: varchar("vehicle_type"),
  rentalConfirmationNumber: varchar("rental_confirmation_number"),
  // Cost fields
  estimatedCost: decimal("estimated_cost", { precision: 10, scale: 2 }),
  actualCost: decimal("actual_cost", { precision: 10, scale: 2 }),
  confirmationNumber: varchar("confirmation_number"),
  bookingReference: varchar("booking_reference"),
  notes: text("notes"),
  bookedById: varchar("booked_by_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const travelBookingsRelations = relations(travelBookings, ({ one, many }) => ({
  consultant: one(consultants, {
    fields: [travelBookings.consultantId],
    references: [consultants.id],
  }),
  project: one(projects, {
    fields: [travelBookings.projectId],
    references: [projects.id],
  }),
  bookedBy: one(users, {
    fields: [travelBookings.bookedById],
    references: [users.id],
  }),
  itineraryBookings: many(itineraryBookings),
}));

// ============================================
// TRAVEL ITINERARIES TABLE
// ============================================

export const travelItineraries = pgTable("travel_itineraries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  consultantId: varchar("consultant_id").references(() => consultants.id).notNull(),
  projectId: varchar("project_id").references(() => projects.id),
  tripName: varchar("trip_name").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  status: itineraryStatusEnum("status").default("draft").notNull(),
  totalEstimatedCost: decimal("total_estimated_cost", { precision: 12, scale: 2 }),
  notes: text("notes"),
  createdById: varchar("created_by_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const travelItinerariesRelations = relations(travelItineraries, ({ one, many }) => ({
  consultant: one(consultants, {
    fields: [travelItineraries.consultantId],
    references: [consultants.id],
  }),
  project: one(projects, {
    fields: [travelItineraries.projectId],
    references: [projects.id],
  }),
  createdBy: one(users, {
    fields: [travelItineraries.createdById],
    references: [users.id],
  }),
  itineraryBookings: many(itineraryBookings),
}));

// ============================================
// ITINERARY BOOKINGS TABLE (Many-to-Many)
// ============================================

export const itineraryBookings = pgTable("itinerary_bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  itineraryId: varchar("itinerary_id").references(() => travelItineraries.id).notNull(),
  bookingId: varchar("booking_id").references(() => travelBookings.id).notNull(),
  sequenceOrder: integer("sequence_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const itineraryBookingsRelations = relations(itineraryBookings, ({ one }) => ({
  itinerary: one(travelItineraries, {
    fields: [itineraryBookings.itineraryId],
    references: [travelItineraries.id],
  }),
  booking: one(travelBookings, {
    fields: [itineraryBookings.bookingId],
    references: [travelBookings.id],
  }),
}));

// ============================================
// CARPOOL GROUPS TABLE
// ============================================

export const carpoolGroups = pgTable("carpool_groups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").references(() => projects.id).notNull(),
  groupName: varchar("group_name").notNull(),
  driverId: varchar("driver_id").references(() => consultants.id),
  departureLocation: varchar("departure_location").notNull(),
  destinationLocation: varchar("destination_location").notNull(),
  departureTime: time("departure_time").notNull(),
  departureDate: date("departure_date").notNull(),
  seatsAvailable: integer("seats_available").default(0),
  vehicleDescription: varchar("vehicle_description"),
  status: carpoolStatusEnum("status").default("open").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const carpoolGroupsRelations = relations(carpoolGroups, ({ one, many }) => ({
  project: one(projects, {
    fields: [carpoolGroups.projectId],
    references: [projects.id],
  }),
  driver: one(consultants, {
    fields: [carpoolGroups.driverId],
    references: [consultants.id],
  }),
  members: many(carpoolMembers),
}));

// ============================================
// CARPOOL MEMBERS TABLE
// ============================================

export const carpoolMembers = pgTable("carpool_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  carpoolId: varchar("carpool_id").references(() => carpoolGroups.id).notNull(),
  consultantId: varchar("consultant_id").references(() => consultants.id).notNull(),
  role: carpoolRoleEnum("role").default("rider").notNull(),
  pickupLocation: varchar("pickup_location"),
  pickupTime: time("pickup_time"),
  status: carpoolMemberStatusEnum("status").default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const carpoolMembersRelations = relations(carpoolMembers, ({ one }) => ({
  carpool: one(carpoolGroups, {
    fields: [carpoolMembers.carpoolId],
    references: [carpoolGroups.id],
  }),
  consultant: one(consultants, {
    fields: [carpoolMembers.consultantId],
    references: [consultants.id],
  }),
}));

// ============================================
// SHUTTLE SCHEDULES TABLE
// ============================================

export const shuttleSchedules = pgTable("shuttle_schedules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").references(() => projects.id),
  shuttleName: varchar("shuttle_name").notNull(),
  route: varchar("route"),
  departureLocation: varchar("departure_location").notNull(),
  arrivalLocation: varchar("arrival_location").notNull(),
  departureTime: time("departure_time").notNull(),
  arrivalTime: time("arrival_time").notNull(),
  daysOfWeek: text("days_of_week").array(),
  startDate: date("start_date"),
  endDate: date("end_date"),
  capacity: integer("capacity"),
  driverName: varchar("driver_name"),
  driverPhone: varchar("driver_phone"),
  vehicleInfo: varchar("vehicle_info"),
  isActive: boolean("is_active").default(true).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const shuttleSchedulesRelations = relations(shuttleSchedules, ({ one }) => ({
  project: one(projects, {
    fields: [shuttleSchedules.projectId],
    references: [projects.id],
  }),
}));

// ============================================
// TRANSPORTATION CONTACTS TABLE
// ============================================

export const transportationContacts = pgTable("transportation_contacts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").references(() => projects.id),
  name: varchar("name").notNull(),
  role: transportationRoleEnum("role").default("driver").notNull(),
  phone: varchar("phone"),
  email: varchar("email"),
  photoUrl: varchar("photo_url"),
  company: varchar("company"),
  vehicleInfo: varchar("vehicle_info"),
  availability: text("availability"),
  notes: text("notes"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const transportationContactsRelations = relations(transportationContacts, ({ one }) => ({
  project: one(projects, {
    fields: [transportationContacts.projectId],
    references: [projects.id],
  }),
}));

// ============================================
// PHASE 14 INSERT SCHEMAS
// ============================================

export const insertTravelPreferenceSchema = createInsertSchema(travelPreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTravelBookingSchema = createInsertSchema(travelBookings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTravelItinerarySchema = createInsertSchema(travelItineraries).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertItineraryBookingSchema = createInsertSchema(itineraryBookings).omit({
  id: true,
  createdAt: true,
});

export const insertCarpoolGroupSchema = createInsertSchema(carpoolGroups).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCarpoolMemberSchema = createInsertSchema(carpoolMembers).omit({
  id: true,
  createdAt: true,
});

export const insertShuttleScheduleSchema = createInsertSchema(shuttleSchedules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTransportationContactSchema = createInsertSchema(transportationContacts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// ============================================
// PHASE 14 TYPES
// ============================================

export type TravelPreference = typeof travelPreferences.$inferSelect;
export type InsertTravelPreference = z.infer<typeof insertTravelPreferenceSchema>;

export type TravelBooking = typeof travelBookings.$inferSelect;
export type InsertTravelBooking = z.infer<typeof insertTravelBookingSchema>;

export type TravelItinerary = typeof travelItineraries.$inferSelect;
export type InsertTravelItinerary = z.infer<typeof insertTravelItinerarySchema>;

export type ItineraryBooking = typeof itineraryBookings.$inferSelect;
export type InsertItineraryBooking = z.infer<typeof insertItineraryBookingSchema>;

export type CarpoolGroup = typeof carpoolGroups.$inferSelect;
export type InsertCarpoolGroup = z.infer<typeof insertCarpoolGroupSchema>;

export type CarpoolMember = typeof carpoolMembers.$inferSelect;
export type InsertCarpoolMember = z.infer<typeof insertCarpoolMemberSchema>;

export type ShuttleSchedule = typeof shuttleSchedules.$inferSelect;
export type InsertShuttleSchedule = z.infer<typeof insertShuttleScheduleSchema>;

export type TransportationContact = typeof transportationContacts.$inferSelect;
export type InsertTransportationContact = z.infer<typeof insertTransportationContactSchema>;

// ============================================
// PHASE 15: ADVANCED FEATURES
// ============================================

// ============================================
// QUALITY ASSURANCE - ENUMS
// ============================================

export const scorecardStatusEnum = pgEnum("scorecard_status", ["draft", "active", "archived"]);
export const surveyTypeEnum = pgEnum("survey_type", ["pulse", "nps", "feedback", "exit"]);
export const incidentSeverityEnum = pgEnum("incident_severity", ["low", "medium", "high", "critical"]);
export const incidentStatusEnum = pgEnum("incident_status", ["reported", "investigating", "resolved", "closed"]);
export const correctiveActionStatusEnum = pgEnum("corrective_action_status", ["pending", "in_progress", "completed", "verified"]);
export const badgeCategoryEnum = pgEnum("badge_category", ["performance", "training", "engagement", "milestone", "special"]);
export const pointTransactionTypeEnum = pgEnum("point_transaction_type", ["earned", "redeemed", "bonus", "adjustment"]);
export const referralStatusEnum = pgEnum("referral_status", ["pending", "contacted", "interviewing", "hired", "declined"]);
export const complianceCheckTypeEnum = pgEnum("compliance_check_type", ["hipaa", "oig", "sam", "insurance", "credential", "background"]);
export const complianceCheckStatusEnum = pgEnum("compliance_check_status", ["pending", "passed", "failed", "expired", "waived"]);

// ============================================
// CONSULTANT SCORECARDS TABLE
// ============================================

export const consultantScorecards = pgTable("consultant_scorecards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  consultantId: varchar("consultant_id").references(() => consultants.id).notNull(),
  projectId: varchar("project_id").references(() => projects.id),
  periodStart: date("period_start").notNull(),
  periodEnd: date("period_end").notNull(),
  overallScore: decimal("overall_score", { precision: 5, scale: 2 }),
  qualityScore: decimal("quality_score", { precision: 5, scale: 2 }),
  punctualityScore: decimal("punctuality_score", { precision: 5, scale: 2 }),
  communicationScore: decimal("communication_score", { precision: 5, scale: 2 }),
  technicalScore: decimal("technical_score", { precision: 5, scale: 2 }),
  teamworkScore: decimal("teamwork_score", { precision: 5, scale: 2 }),
  ticketsResolved: integer("tickets_resolved").default(0),
  avgResponseTime: integer("avg_response_time"), // in minutes
  trainingsCompleted: integer("trainings_completed").default(0),
  attendanceRate: decimal("attendance_rate", { precision: 5, scale: 2 }),
  status: scorecardStatusEnum("status").default("draft").notNull(),
  notes: text("notes"),
  reviewedById: varchar("reviewed_by_id").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const consultantScorecardsRelations = relations(consultantScorecards, ({ one }) => ({
  consultant: one(consultants, {
    fields: [consultantScorecards.consultantId],
    references: [consultants.id],
  }),
  project: one(projects, {
    fields: [consultantScorecards.projectId],
    references: [projects.id],
  }),
  reviewedBy: one(users, {
    fields: [consultantScorecards.reviewedById],
    references: [users.id],
  }),
}));

export const insertConsultantScorecardSchema = createInsertSchema(consultantScorecards).omit({ id: true, createdAt: true, updatedAt: true });
export type ConsultantScorecard = typeof consultantScorecards.$inferSelect;
export type InsertConsultantScorecard = z.infer<typeof insertConsultantScorecardSchema>;

// ============================================
// PULSE SURVEYS TABLE
// ============================================

export const pulseSurveys = pgTable("pulse_surveys", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description"),
  surveyType: surveyTypeEnum("survey_type").default("pulse").notNull(),
  questions: jsonb("questions").notNull(), // Array of { id, question, type, options? }
  projectId: varchar("project_id").references(() => projects.id),
  isActive: boolean("is_active").default(true).notNull(),
  startDate: date("start_date"),
  endDate: date("end_date"),
  frequency: varchar("frequency"), // daily, weekly, monthly
  createdById: varchar("created_by_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const pulseSurveysRelations = relations(pulseSurveys, ({ one, many }) => ({
  project: one(projects, {
    fields: [pulseSurveys.projectId],
    references: [projects.id],
  }),
  createdBy: one(users, {
    fields: [pulseSurveys.createdById],
    references: [users.id],
  }),
  responses: many(pulseResponses),
}));

export const insertPulseSurveySchema = createInsertSchema(pulseSurveys).omit({ id: true, createdAt: true, updatedAt: true });
export type PulseSurvey = typeof pulseSurveys.$inferSelect;
export type InsertPulseSurvey = z.infer<typeof insertPulseSurveySchema>;

// ============================================
// PULSE RESPONSES TABLE
// ============================================

export const pulseResponses = pgTable("pulse_responses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  surveyId: varchar("survey_id").references(() => pulseSurveys.id).notNull(),
  consultantId: varchar("consultant_id").references(() => consultants.id).notNull(),
  responses: jsonb("responses").notNull(), // { questionId: answer }
  mood: integer("mood"), // 1-5 scale
  sentiment: varchar("sentiment"), // positive, neutral, negative
  submittedAt: timestamp("submitted_at").defaultNow(),
});

export const pulseResponsesRelations = relations(pulseResponses, ({ one }) => ({
  survey: one(pulseSurveys, {
    fields: [pulseResponses.surveyId],
    references: [pulseSurveys.id],
  }),
  consultant: one(consultants, {
    fields: [pulseResponses.consultantId],
    references: [consultants.id],
  }),
}));

export const insertPulseResponseSchema = createInsertSchema(pulseResponses).omit({ id: true, submittedAt: true });
export type PulseResponse = typeof pulseResponses.$inferSelect;
export type InsertPulseResponse = z.infer<typeof insertPulseResponseSchema>;

// ============================================
// NPS RESPONSES TABLE
// ============================================

export const npsResponses = pgTable("nps_responses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  consultantId: varchar("consultant_id").references(() => consultants.id),
  hospitalId: varchar("hospital_id").references(() => hospitals.id),
  projectId: varchar("project_id").references(() => projects.id),
  score: integer("score").notNull(), // 0-10
  feedback: text("feedback"),
  category: varchar("category"), // consultant, hospital, project, platform
  respondentType: varchar("respondent_type"), // consultant, hospital_staff, admin
  respondentId: varchar("respondent_id"),
  submittedAt: timestamp("submitted_at").defaultNow(),
});

export const npsResponsesRelations = relations(npsResponses, ({ one }) => ({
  consultant: one(consultants, {
    fields: [npsResponses.consultantId],
    references: [consultants.id],
  }),
  hospital: one(hospitals, {
    fields: [npsResponses.hospitalId],
    references: [hospitals.id],
  }),
  project: one(projects, {
    fields: [npsResponses.projectId],
    references: [projects.id],
  }),
}));

export const insertNpsResponseSchema = createInsertSchema(npsResponses).omit({ id: true, submittedAt: true });
export type NpsResponse = typeof npsResponses.$inferSelect;
export type InsertNpsResponse = z.infer<typeof insertNpsResponseSchema>;

// ============================================
// INCIDENTS TABLE
// ============================================

export const incidents = pgTable("incidents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  severity: incidentSeverityEnum("severity").default("medium").notNull(),
  status: incidentStatusEnum("status").default("reported").notNull(),
  projectId: varchar("project_id").references(() => projects.id),
  hospitalId: varchar("hospital_id").references(() => hospitals.id),
  consultantId: varchar("consultant_id").references(() => consultants.id),
  reportedById: varchar("reported_by_id").references(() => users.id).notNull(),
  assignedToId: varchar("assigned_to_id").references(() => users.id),
  incidentDate: timestamp("incident_date").notNull(),
  location: varchar("location"),
  category: varchar("category"), // safety, quality, compliance, technical, interpersonal
  rootCause: text("root_cause"),
  resolution: text("resolution"),
  resolvedAt: timestamp("resolved_at"),
  closedAt: timestamp("closed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const incidentsRelations = relations(incidents, ({ one, many }) => ({
  project: one(projects, {
    fields: [incidents.projectId],
    references: [projects.id],
  }),
  hospital: one(hospitals, {
    fields: [incidents.hospitalId],
    references: [hospitals.id],
  }),
  consultant: one(consultants, {
    fields: [incidents.consultantId],
    references: [consultants.id],
  }),
  reportedBy: one(users, {
    fields: [incidents.reportedById],
    references: [users.id],
  }),
  assignedTo: one(users, {
    fields: [incidents.assignedToId],
    references: [users.id],
  }),
  correctiveActions: many(correctiveActions),
}));

export const insertIncidentSchema = createInsertSchema(incidents).omit({ id: true, createdAt: true, updatedAt: true });
export type Incident = typeof incidents.$inferSelect;
export type InsertIncident = z.infer<typeof insertIncidentSchema>;

// ============================================
// CORRECTIVE ACTIONS TABLE
// ============================================

export const correctiveActions = pgTable("corrective_actions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  incidentId: varchar("incident_id").references(() => incidents.id).notNull(),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  status: correctiveActionStatusEnum("status").default("pending").notNull(),
  priority: varchar("priority").default("medium"), // low, medium, high, critical
  assignedToId: varchar("assigned_to_id").references(() => users.id),
  dueDate: date("due_date"),
  completedAt: timestamp("completed_at"),
  verifiedById: varchar("verified_by_id").references(() => users.id),
  verifiedAt: timestamp("verified_at"),
  evidence: text("evidence"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const correctiveActionsRelations = relations(correctiveActions, ({ one }) => ({
  incident: one(incidents, {
    fields: [correctiveActions.incidentId],
    references: [incidents.id],
  }),
  assignedTo: one(users, {
    fields: [correctiveActions.assignedToId],
    references: [users.id],
  }),
  verifiedBy: one(users, {
    fields: [correctiveActions.verifiedById],
    references: [users.id],
  }),
}));

export const insertCorrectiveActionSchema = createInsertSchema(correctiveActions).omit({ id: true, createdAt: true, updatedAt: true });
export type CorrectiveAction = typeof correctiveActions.$inferSelect;
export type InsertCorrectiveAction = z.infer<typeof insertCorrectiveActionSchema>;

// ============================================
// ACHIEVEMENT BADGES TABLE
// ============================================

export const achievementBadges = pgTable("achievement_badges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull().unique(),
  description: text("description").notNull(),
  category: badgeCategoryEnum("category").notNull(),
  iconUrl: varchar("icon_url"),
  color: varchar("color"), // hex color for badge
  pointValue: integer("point_value").default(0),
  criteria: jsonb("criteria"), // { type: 'count', metric: 'projects_completed', threshold: 5 }
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAchievementBadgeSchema = createInsertSchema(achievementBadges).omit({ id: true, createdAt: true });
export type AchievementBadge = typeof achievementBadges.$inferSelect;
export type InsertAchievementBadge = z.infer<typeof insertAchievementBadgeSchema>;

// ============================================
// CONSULTANT BADGES TABLE (Many-to-Many)
// ============================================

export const consultantBadges = pgTable("consultant_badges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  consultantId: varchar("consultant_id").references(() => consultants.id).notNull(),
  badgeId: varchar("badge_id").references(() => achievementBadges.id).notNull(),
  earnedAt: timestamp("earned_at").defaultNow(),
  awardedById: varchar("awarded_by_id").references(() => users.id),
  notes: text("notes"),
});

export const consultantBadgesRelations = relations(consultantBadges, ({ one }) => ({
  consultant: one(consultants, {
    fields: [consultantBadges.consultantId],
    references: [consultants.id],
  }),
  badge: one(achievementBadges, {
    fields: [consultantBadges.badgeId],
    references: [achievementBadges.id],
  }),
  awardedBy: one(users, {
    fields: [consultantBadges.awardedById],
    references: [users.id],
  }),
}));

export const insertConsultantBadgeSchema = createInsertSchema(consultantBadges).omit({ id: true, earnedAt: true });
export type ConsultantBadge = typeof consultantBadges.$inferSelect;
export type InsertConsultantBadge = z.infer<typeof insertConsultantBadgeSchema>;

// ============================================
// POINT TRANSACTIONS TABLE
// ============================================

export const pointTransactions = pgTable("point_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  consultantId: varchar("consultant_id").references(() => consultants.id).notNull(),
  type: pointTransactionTypeEnum("type").notNull(),
  points: integer("points").notNull(),
  balance: integer("balance").notNull(), // running balance after transaction
  description: varchar("description").notNull(),
  referenceType: varchar("reference_type"), // badge, referral, project, training, etc.
  referenceId: varchar("reference_id"),
  createdById: varchar("created_by_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const pointTransactionsRelations = relations(pointTransactions, ({ one }) => ({
  consultant: one(consultants, {
    fields: [pointTransactions.consultantId],
    references: [consultants.id],
  }),
  createdBy: one(users, {
    fields: [pointTransactions.createdById],
    references: [users.id],
  }),
}));

export const insertPointTransactionSchema = createInsertSchema(pointTransactions).omit({ id: true, createdAt: true });
export type PointTransaction = typeof pointTransactions.$inferSelect;
export type InsertPointTransaction = z.infer<typeof insertPointTransactionSchema>;

// ============================================
// REFERRALS TABLE
// ============================================

export const referrals = pgTable("referrals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  referrerId: varchar("referrer_id").references(() => consultants.id).notNull(),
  referredName: varchar("referred_name").notNull(),
  referredEmail: varchar("referred_email").notNull(),
  referredPhone: varchar("referred_phone"),
  status: referralStatusEnum("status").default("pending").notNull(),
  notes: text("notes"),
  hiredAsConsultantId: varchar("hired_as_consultant_id").references(() => consultants.id),
  bonusPoints: integer("bonus_points").default(0),
  bonusPaid: boolean("bonus_paid").default(false),
  bonusPaidAt: timestamp("bonus_paid_at"),
  contactedAt: timestamp("contacted_at"),
  hiredAt: timestamp("hired_at"),
  declinedReason: text("declined_reason"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const referralsRelations = relations(referrals, ({ one }) => ({
  referrer: one(consultants, {
    fields: [referrals.referrerId],
    references: [consultants.id],
  }),
  hiredAsConsultant: one(consultants, {
    fields: [referrals.hiredAsConsultantId],
    references: [consultants.id],
  }),
}));

export const insertReferralSchema = createInsertSchema(referrals).omit({ id: true, createdAt: true, updatedAt: true });
export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = z.infer<typeof insertReferralSchema>;

// ============================================
// COMPLIANCE CHECKS TABLE
// ============================================

export const complianceChecks = pgTable("compliance_checks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  consultantId: varchar("consultant_id").references(() => consultants.id).notNull(),
  checkType: complianceCheckTypeEnum("check_type").notNull(),
  status: complianceCheckStatusEnum("status").default("pending").notNull(),
  checkDate: date("check_date").notNull(),
  expirationDate: date("expiration_date"),
  verificationSource: varchar("verification_source"),
  verificationId: varchar("verification_id"),
  notes: text("notes"),
  documentUrl: varchar("document_url"),
  checkedById: varchar("checked_by_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const complianceChecksRelations = relations(complianceChecks, ({ one }) => ({
  consultant: one(consultants, {
    fields: [complianceChecks.consultantId],
    references: [consultants.id],
  }),
  checkedBy: one(users, {
    fields: [complianceChecks.checkedById],
    references: [users.id],
  }),
}));

export const insertComplianceCheckSchema = createInsertSchema(complianceChecks).omit({ id: true, createdAt: true, updatedAt: true });
export type ComplianceCheck = typeof complianceChecks.$inferSelect;
export type InsertComplianceCheck = z.infer<typeof insertComplianceCheckSchema>;

// ============================================
// COMPLIANCE AUDITS TABLE
// ============================================

export const complianceAudits = pgTable("compliance_audits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description"),
  auditType: varchar("audit_type").notNull(), // hipaa, internal, external
  projectId: varchar("project_id").references(() => projects.id),
  hospitalId: varchar("hospital_id").references(() => hospitals.id),
  auditDate: date("audit_date").notNull(),
  findings: jsonb("findings"), // Array of { category, finding, severity, status }
  overallScore: decimal("overall_score", { precision: 5, scale: 2 }),
  passedChecks: integer("passed_checks").default(0),
  failedChecks: integer("failed_checks").default(0),
  totalChecks: integer("total_checks").default(0),
  auditorId: varchar("auditor_id").references(() => users.id),
  status: varchar("status").default("draft"), // draft, in_progress, completed, reviewed
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const complianceAuditsRelations = relations(complianceAudits, ({ one }) => ({
  project: one(projects, {
    fields: [complianceAudits.projectId],
    references: [projects.id],
  }),
  hospital: one(hospitals, {
    fields: [complianceAudits.hospitalId],
    references: [hospitals.id],
  }),
  auditor: one(users, {
    fields: [complianceAudits.auditorId],
    references: [users.id],
  }),
}));

export const insertComplianceAuditSchema = createInsertSchema(complianceAudits).omit({ id: true, createdAt: true, updatedAt: true });
export type ComplianceAudit = typeof complianceAudits.$inferSelect;
export type InsertComplianceAudit = z.infer<typeof insertComplianceAuditSchema>;

// ============================================
// DIGITAL SIGNATURES & CONTRACTS
// ============================================

// Contract status enum
export const contractStatusEnum = pgEnum("contract_status", ["draft", "pending_signature", "partially_signed", "completed", "expired", "cancelled"]);

// Signer role enum
export const signerRoleEnum = pgEnum("signer_role", ["consultant", "admin", "hospital_staff", "witness"]);

// Contract Templates
export const contractTemplates = pgTable("contract_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  templateType: varchar("template_type").notNull(), // ica, nda, task_order, baa, general
  content: text("content").notNull(), // HTML/Markdown template with placeholders
  placeholders: jsonb("placeholders"), // Array of { key, label, type, required }
  requiredSigners: jsonb("required_signers"), // Array of { role, order }
  isActive: boolean("is_active").default(true).notNull(),
  version: integer("version").default(1).notNull(),
  createdById: varchar("created_by_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Contracts (generated from templates)
export const contracts = pgTable("contracts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  contractNumber: varchar("contract_number").unique(),
  templateId: varchar("template_id").references(() => contractTemplates.id),
  title: varchar("title").notNull(),
  content: text("content").notNull(), // Rendered content with data filled in
  consultantId: varchar("consultant_id").references(() => consultants.id),
  projectId: varchar("project_id").references(() => projects.id),
  hospitalId: varchar("hospital_id").references(() => hospitals.id),
  status: contractStatusEnum("status").default("draft").notNull(),
  effectiveDate: date("effective_date"),
  expirationDate: date("expiration_date"),
  metadata: jsonb("metadata"), // Additional data used to fill template
  createdById: varchar("created_by_id").references(() => users.id),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Contract Signers (who needs to sign)
export const contractSigners = pgTable("contract_signers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  contractId: varchar("contract_id").references(() => contracts.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  role: signerRoleEnum("role").notNull(),
  signingOrder: integer("signing_order").default(1).notNull(),
  status: varchar("status").default("pending").notNull(), // pending, signed, declined
  signedAt: timestamp("signed_at"),
  declinedAt: timestamp("declined_at"),
  declineReason: text("decline_reason"),
  reminderSentAt: timestamp("reminder_sent_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Contract Signatures (actual signature data)
export const contractSignatures = pgTable("contract_signatures", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  contractId: varchar("contract_id").references(() => contracts.id).notNull(),
  signerId: varchar("signer_id").references(() => contractSigners.id).notNull(),
  signatureImageUrl: varchar("signature_image_url"), // Stored in object storage
  signatureData: text("signature_data"), // Base64 or SVG data as backup
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  signedAt: timestamp("signed_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Contract Audit Events
export const contractAuditEvents = pgTable("contract_audit_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  contractId: varchar("contract_id").references(() => contracts.id).notNull(),
  eventType: varchar("event_type").notNull(), // created, viewed, sent, signed, declined, completed, expired
  userId: varchar("user_id").references(() => users.id),
  details: jsonb("details"),
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations for contract tables
export const contractTemplatesRelations = relations(contractTemplates, ({ one, many }) => ({
  createdBy: one(users, { fields: [contractTemplates.createdById], references: [users.id] }),
  contracts: many(contracts),
}));

export const contractsRelations = relations(contracts, ({ one, many }) => ({
  template: one(contractTemplates, { fields: [contracts.templateId], references: [contractTemplates.id] }),
  consultant: one(consultants, { fields: [contracts.consultantId], references: [consultants.id] }),
  project: one(projects, { fields: [contracts.projectId], references: [projects.id] }),
  hospital: one(hospitals, { fields: [contracts.hospitalId], references: [hospitals.id] }),
  createdBy: one(users, { fields: [contracts.createdById], references: [users.id] }),
  signers: many(contractSigners),
  signatures: many(contractSignatures),
  auditEvents: many(contractAuditEvents),
}));

export const contractSignersRelations = relations(contractSigners, ({ one, many }) => ({
  contract: one(contracts, { fields: [contractSigners.contractId], references: [contracts.id] }),
  user: one(users, { fields: [contractSigners.userId], references: [users.id] }),
  signatures: many(contractSignatures),
}));

export const contractSignaturesRelations = relations(contractSignatures, ({ one }) => ({
  contract: one(contracts, { fields: [contractSignatures.contractId], references: [contracts.id] }),
  signer: one(contractSigners, { fields: [contractSignatures.signerId], references: [contractSigners.id] }),
}));

export const contractAuditEventsRelations = relations(contractAuditEvents, ({ one }) => ({
  contract: one(contracts, { fields: [contractAuditEvents.contractId], references: [contracts.id] }),
  user: one(users, { fields: [contractAuditEvents.userId], references: [users.id] }),
}));

// Insert schemas
export const insertContractTemplateSchema = createInsertSchema(contractTemplates).omit({ id: true, createdAt: true, updatedAt: true });
export const insertContractSchema = createInsertSchema(contracts).omit({ id: true, createdAt: true, updatedAt: true });
export const insertContractSignerSchema = createInsertSchema(contractSigners).omit({ id: true, createdAt: true });
export const insertContractSignatureSchema = createInsertSchema(contractSignatures).omit({ id: true, createdAt: true });
export const insertContractAuditEventSchema = createInsertSchema(contractAuditEvents).omit({ id: true, createdAt: true });

// Types
export type ContractTemplate = typeof contractTemplates.$inferSelect;
export type InsertContractTemplate = z.infer<typeof insertContractTemplateSchema>;
export type Contract = typeof contracts.$inferSelect;
export type InsertContract = z.infer<typeof insertContractSchema>;
export type ContractSigner = typeof contractSigners.$inferSelect;
export type InsertContractSigner = z.infer<typeof insertContractSignerSchema>;
export type ContractSignature = typeof contractSignatures.$inferSelect;
export type InsertContractSignature = z.infer<typeof insertContractSignatureSchema>;
export type ContractAuditEvent = typeof contractAuditEvents.$inferSelect;
export type InsertContractAuditEvent = z.infer<typeof insertContractAuditEventSchema>;

// ============================================
// REAL-TIME CHAT
// ============================================

// Chat Channels
export const chatChannels = pgTable("chat_channels", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  channelType: varchar("channel_type").notNull(), // project, unit, module, direct, announcement
  projectId: varchar("project_id").references(() => projects.id),
  unitId: varchar("unit_id").references(() => hospitalUnits.id),
  isPrivate: boolean("is_private").default(false).notNull(),
  quietHoursEnabled: boolean("quiet_hours_enabled").default(true).notNull(),
  quietHoursStart: time("quiet_hours_start").default("19:00:00"),
  quietHoursEnd: time("quiet_hours_end").default("07:00:00"),
  isArchived: boolean("is_archived").default(false).notNull(),
  createdById: varchar("created_by_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Channel Members
export const channelMembers = pgTable("channel_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  channelId: varchar("channel_id").references(() => chatChannels.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  role: varchar("role").default("member").notNull(), // admin, moderator, member
  isMuted: boolean("is_muted").default(false).notNull(),
  lastReadAt: timestamp("last_read_at"),
  joinedAt: timestamp("joined_at").defaultNow(),
});

// Chat Messages
export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  channelId: varchar("channel_id").references(() => chatChannels.id).notNull(),
  senderId: varchar("sender_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  messageType: varchar("message_type").default("text").notNull(), // text, system, file, summary
  replyToId: varchar("reply_to_id"),
  attachmentUrl: varchar("attachment_url"),
  attachmentType: varchar("attachment_type"),
  isEdited: boolean("is_edited").default(false).notNull(),
  isPinned: boolean("is_pinned").default(false).notNull(),
  isDeleted: boolean("is_deleted").default(false).notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Chat Message Reads (for tracking who read what)
export const chatMessageReads = pgTable("chat_message_reads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  messageId: varchar("message_id").references(() => chatMessages.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  readAt: timestamp("read_at").defaultNow().notNull(),
});

// Shift Chat Summaries
export const shiftChatSummaries = pgTable("shift_chat_summaries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  channelId: varchar("channel_id").references(() => chatChannels.id).notNull(),
  shiftDate: date("shift_date").notNull(),
  shiftType: shiftTypeEnum("shift_type").notNull(),
  summary: text("summary").notNull(),
  keyPoints: jsonb("key_points"), // Array of important bullet points
  issuesMentioned: jsonb("issues_mentioned"),
  createdById: varchar("created_by_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const chatChannelsRelations = relations(chatChannels, ({ one, many }) => ({
  project: one(projects, { fields: [chatChannels.projectId], references: [projects.id] }),
  unit: one(hospitalUnits, { fields: [chatChannels.unitId], references: [hospitalUnits.id] }),
  createdBy: one(users, { fields: [chatChannels.createdById], references: [users.id] }),
  members: many(channelMembers),
  messages: many(chatMessages),
  summaries: many(shiftChatSummaries),
}));

export const channelMembersRelations = relations(channelMembers, ({ one }) => ({
  channel: one(chatChannels, { fields: [channelMembers.channelId], references: [chatChannels.id] }),
  user: one(users, { fields: [channelMembers.userId], references: [users.id] }),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one, many }) => ({
  channel: one(chatChannels, { fields: [chatMessages.channelId], references: [chatChannels.id] }),
  sender: one(users, { fields: [chatMessages.senderId], references: [users.id] }),
  reads: many(chatMessageReads),
}));

export const chatMessageReadsRelations = relations(chatMessageReads, ({ one }) => ({
  message: one(chatMessages, { fields: [chatMessageReads.messageId], references: [chatMessages.id] }),
  user: one(users, { fields: [chatMessageReads.userId], references: [users.id] }),
}));

export const shiftChatSummariesRelations = relations(shiftChatSummaries, ({ one }) => ({
  channel: one(chatChannels, { fields: [shiftChatSummaries.channelId], references: [chatChannels.id] }),
  createdBy: one(users, { fields: [shiftChatSummaries.createdById], references: [users.id] }),
}));

// Insert schemas
export const insertChatChannelSchema = createInsertSchema(chatChannels).omit({ id: true, createdAt: true, updatedAt: true });
export const insertChannelMemberSchema = createInsertSchema(channelMembers).omit({ id: true, joinedAt: true });
export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({ id: true, createdAt: true, updatedAt: true });
export const insertChatMessageReadSchema = createInsertSchema(chatMessageReads).omit({ id: true, readAt: true });
export const insertShiftChatSummarySchema = createInsertSchema(shiftChatSummaries).omit({ id: true, createdAt: true });

// Types
export type ChatChannel = typeof chatChannels.$inferSelect;
export type InsertChatChannel = z.infer<typeof insertChatChannelSchema>;
export type ChannelMember = typeof channelMembers.$inferSelect;
export type InsertChannelMember = z.infer<typeof insertChannelMemberSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessageRead = typeof chatMessageReads.$inferSelect;
export type InsertChatMessageRead = z.infer<typeof insertChatMessageReadSchema>;
export type ShiftChatSummary = typeof shiftChatSummaries.$inferSelect;
export type InsertShiftChatSummary = z.infer<typeof insertShiftChatSummarySchema>;

// ============================================
// IDENTITY VERIFICATION
// ============================================

// Verification status enum
export const verificationStatusEnum = pgEnum("verification_status", ["pending", "in_review", "verified", "rejected", "expired"]);

// Document type for ID verification
export const idDocumentTypeEnum = pgEnum("id_document_type", ["drivers_license", "passport", "state_id", "military_id", "other"]);

// Identity Verifications
export const identityVerifications = pgTable("identity_verifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  consultantId: varchar("consultant_id").references(() => consultants.id),
  status: verificationStatusEnum("status").default("pending").notNull(),
  verificationType: varchar("verification_type").default("manual").notNull(), // manual, automated, id_me
  legalFirstName: varchar("legal_first_name"),
  legalLastName: varchar("legal_last_name"),
  dateOfBirth: date("date_of_birth"),
  ssn4: varchar("ssn_last_4"), // Last 4 digits only, encrypted
  addressVerified: boolean("address_verified").default(false),
  identityScore: integer("identity_score"), // 0-100 confidence score
  reviewedById: varchar("reviewed_by_id").references(() => users.id),
  reviewNotes: text("review_notes"),
  verifiedAt: timestamp("verified_at"),
  expiresAt: timestamp("expires_at"),
  rejectedAt: timestamp("rejected_at"),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Identity Documents
export const identityDocuments = pgTable("identity_documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  verificationId: varchar("verification_id").references(() => identityVerifications.id).notNull(),
  documentType: idDocumentTypeEnum("document_type").notNull(),
  documentNumber: varchar("document_number"), // Encrypted
  issuingState: varchar("issuing_state"),
  issuingCountry: varchar("issuing_country"),
  issueDate: date("issue_date"),
  expirationDate: date("expiration_date"),
  frontImageUrl: varchar("front_image_url"),
  backImageUrl: varchar("back_image_url"),
  selfieImageUrl: varchar("selfie_image_url"),
  isValid: boolean("is_valid"),
  validationNotes: text("validation_notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Verification Events (audit trail)
export const verificationEvents = pgTable("verification_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  verificationId: varchar("verification_id").references(() => identityVerifications.id).notNull(),
  eventType: varchar("event_type").notNull(), // submitted, document_uploaded, reviewed, verified, rejected, expired, resubmitted
  performedById: varchar("performed_by_id").references(() => users.id),
  details: jsonb("details"),
  ipAddress: varchar("ip_address"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Fraud Flags
export const fraudFlags = pgTable("fraud_flags", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  verificationId: varchar("verification_id").references(() => identityVerifications.id),
  flagType: varchar("flag_type").notNull(), // duplicate_account, suspicious_document, address_mismatch, velocity_check, device_fingerprint
  severity: varchar("severity").default("medium").notNull(), // low, medium, high, critical
  description: text("description"),
  evidence: jsonb("evidence"),
  isResolved: boolean("is_resolved").default(false).notNull(),
  resolvedById: varchar("resolved_by_id").references(() => users.id),
  resolvedAt: timestamp("resolved_at"),
  resolutionNotes: text("resolution_notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const identityVerificationsRelations = relations(identityVerifications, ({ one, many }) => ({
  user: one(users, { fields: [identityVerifications.userId], references: [users.id] }),
  consultant: one(consultants, { fields: [identityVerifications.consultantId], references: [consultants.id] }),
  reviewedBy: one(users, { fields: [identityVerifications.reviewedById], references: [users.id] }),
  documents: many(identityDocuments),
  events: many(verificationEvents),
  fraudFlags: many(fraudFlags),
}));

export const identityDocumentsRelations = relations(identityDocuments, ({ one }) => ({
  verification: one(identityVerifications, { fields: [identityDocuments.verificationId], references: [identityVerifications.id] }),
}));

export const verificationEventsRelations = relations(verificationEvents, ({ one }) => ({
  verification: one(identityVerifications, { fields: [verificationEvents.verificationId], references: [identityVerifications.id] }),
  performedBy: one(users, { fields: [verificationEvents.performedById], references: [users.id] }),
}));

export const fraudFlagsRelations = relations(fraudFlags, ({ one }) => ({
  user: one(users, { fields: [fraudFlags.userId], references: [users.id] }),
  verification: one(identityVerifications, { fields: [fraudFlags.verificationId], references: [identityVerifications.id] }),
  resolvedBy: one(users, { fields: [fraudFlags.resolvedById], references: [users.id] }),
}));

// Insert schemas
export const insertIdentityVerificationSchema = createInsertSchema(identityVerifications).omit({ id: true, createdAt: true, updatedAt: true });
export const insertIdentityDocumentSchema = createInsertSchema(identityDocuments).omit({ id: true, createdAt: true });
export const insertVerificationEventSchema = createInsertSchema(verificationEvents).omit({ id: true, createdAt: true });
export const insertFraudFlagSchema = createInsertSchema(fraudFlags).omit({ id: true, createdAt: true });

// Types
export type IdentityVerification = typeof identityVerifications.$inferSelect;
export type InsertIdentityVerification = z.infer<typeof insertIdentityVerificationSchema>;
export type IdentityDocument = typeof identityDocuments.$inferSelect;
export type InsertIdentityDocument = z.infer<typeof insertIdentityDocumentSchema>;
export type VerificationEvent = typeof verificationEvents.$inferSelect;
export type InsertVerificationEvent = z.infer<typeof insertVerificationEventSchema>;
export type FraudFlag = typeof fraudFlags.$inferSelect;
export type InsertFraudFlag = z.infer<typeof insertFraudFlagSchema>;

// ============================================
// PHASE 17: REPORTING & BUSINESS INTELLIGENCE
// ============================================

// Report Templates - Pre-built report definitions
export const reportTemplates = pgTable("report_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  category: varchar("category").notNull(), // consultants, projects, financial, compliance, training, operations
  dataSource: varchar("data_source").notNull(), // The primary table/entity for the report
  availableColumns: jsonb("available_columns").notNull(), // Array of column definitions with name, label, type, format
  defaultColumns: text("default_columns").array(), // Default selected columns
  availableFilters: jsonb("available_filters"), // Filter definitions
  defaultFilters: jsonb("default_filters"), // Default filter values
  supportedFormats: text("supported_formats").array().default(["csv", "pdf", "excel"]).notNull(),
  sortOptions: jsonb("sort_options"), // Available sort fields
  groupByOptions: text("group_by_options").array(), // Available grouping fields
  isActive: boolean("is_active").default(true).notNull(),
  createdById: varchar("created_by_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Saved Reports - User-customized reports
export const savedReports = pgTable("saved_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  templateId: varchar("template_id").references(() => reportTemplates.id),
  userId: varchar("user_id").references(() => users.id).notNull(),
  selectedColumns: text("selected_columns").array().notNull(),
  filters: jsonb("filters"), // Applied filters
  sortBy: varchar("sort_by"),
  sortOrder: varchar("sort_order").default("asc"),
  groupBy: varchar("group_by"),
  chartType: varchar("chart_type"), // bar, line, pie, table, none
  chartConfig: jsonb("chart_config"), // Chart-specific options
  isPublic: boolean("is_public").default(false).notNull(),
  isFavorite: boolean("is_favorite").default(false).notNull(),
  lastRunAt: timestamp("last_run_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Scheduled Reports - Automatic report generation
export const scheduledReports = pgTable("scheduled_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  savedReportId: varchar("saved_report_id").references(() => savedReports.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  name: varchar("name").notNull(),
  schedule: varchar("schedule").notNull(), // cron expression or preset: daily, weekly, monthly
  timezone: varchar("timezone").default("America/New_York").notNull(),
  exportFormat: varchar("export_format").default("pdf").notNull(), // pdf, excel, csv
  recipients: text("recipients").array(), // Email addresses
  includeCharts: boolean("include_charts").default(true).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  lastRunAt: timestamp("last_run_at"),
  nextRunAt: timestamp("next_run_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Report Runs - Execution history
export const reportRuns = pgTable("report_runs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  savedReportId: varchar("saved_report_id").references(() => savedReports.id),
  scheduledReportId: varchar("scheduled_report_id").references(() => scheduledReports.id),
  userId: varchar("user_id").references(() => users.id).notNull(),
  status: varchar("status").default("pending").notNull(), // pending, running, completed, failed
  exportFormat: varchar("export_format"),
  rowCount: integer("row_count"),
  fileUrl: varchar("file_url"),
  fileSizeBytes: integer("file_size_bytes"),
  executionTimeMs: integer("execution_time_ms"),
  errorMessage: text("error_message"),
  parameters: jsonb("parameters"), // Filters and options used
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Export Logs - Track all data exports
export const exportLogs = pgTable("export_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  exportType: varchar("export_type").notNull(), // report, data_table, dashboard
  sourceType: varchar("source_type").notNull(), // consultants, projects, invoices, etc.
  format: varchar("format").notNull(), // csv, pdf, excel
  rowCount: integer("row_count"),
  fileSizeBytes: integer("file_size_bytes"),
  fileUrl: varchar("file_url"),
  filters: jsonb("filters"), // What filters were applied
  ipAddress: varchar("ip_address"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Executive Dashboards - Custom dashboard configurations
export const executiveDashboards = pgTable("executive_dashboards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  userId: varchar("user_id").references(() => users.id).notNull(),
  layout: jsonb("layout"), // Grid layout configuration
  refreshInterval: integer("refresh_interval").default(300), // Seconds, default 5 min
  isDefault: boolean("is_default").default(false).notNull(),
  isPublic: boolean("is_public").default(false).notNull(),
  theme: varchar("theme").default("light"), // light, dark, auto
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Dashboard Widgets - Individual dashboard components
export const dashboardWidgets = pgTable("dashboard_widgets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  dashboardId: varchar("dashboard_id").references(() => executiveDashboards.id).notNull(),
  title: varchar("title").notNull(),
  widgetType: varchar("widget_type").notNull(), // kpi, chart, table, metric, gauge, heatmap, trend
  dataSource: varchar("data_source").notNull(), // API endpoint or query
  config: jsonb("config").notNull(), // Widget-specific configuration
  position: jsonb("position").notNull(), // x, y, width, height in grid
  refreshInterval: integer("refresh_interval"), // Override dashboard default
  drillDownConfig: jsonb("drill_down_config"), // Click to view details
  thresholds: jsonb("thresholds"), // Color coding based on values
  isVisible: boolean("is_visible").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// KPI Definitions - Reusable KPI metrics
export const kpiDefinitions = pgTable("kpi_definitions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  category: varchar("category").notNull(), // financial, operational, quality, compliance
  calculation: text("calculation").notNull(), // Formula or query
  unit: varchar("unit"), // %, $, count, hours
  format: varchar("format").default("number"), // number, currency, percentage, duration
  targetValue: decimal("target_value", { precision: 15, scale: 2 }),
  warningThreshold: decimal("warning_threshold", { precision: 15, scale: 2 }),
  criticalThreshold: decimal("critical_threshold", { precision: 15, scale: 2 }),
  trendDirection: varchar("trend_direction").default("higher_is_better"), // higher_is_better, lower_is_better
  dataSource: varchar("data_source").notNull(),
  refreshFrequency: varchar("refresh_frequency").default("hourly"), // realtime, hourly, daily, weekly
  isActive: boolean("is_active").default(true).notNull(),
  createdById: varchar("created_by_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// KPI Snapshots - Historical KPI values
export const kpiSnapshots = pgTable("kpi_snapshots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  kpiId: varchar("kpi_id").references(() => kpiDefinitions.id).notNull(),
  value: decimal("value", { precision: 15, scale: 4 }).notNull(),
  previousValue: decimal("previous_value", { precision: 15, scale: 4 }),
  percentChange: decimal("percent_change", { precision: 10, scale: 2 }),
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  metadata: jsonb("metadata"), // Additional context
  createdAt: timestamp("created_at").defaultNow(),
});

// Report Relations
export const reportTemplatesRelations = relations(reportTemplates, ({ one, many }) => ({
  createdBy: one(users, { fields: [reportTemplates.createdById], references: [users.id] }),
  savedReports: many(savedReports),
}));

export const savedReportsRelations = relations(savedReports, ({ one, many }) => ({
  template: one(reportTemplates, { fields: [savedReports.templateId], references: [reportTemplates.id] }),
  user: one(users, { fields: [savedReports.userId], references: [users.id] }),
  scheduledReports: many(scheduledReports),
  runs: many(reportRuns),
}));

export const scheduledReportsRelations = relations(scheduledReports, ({ one, many }) => ({
  savedReport: one(savedReports, { fields: [scheduledReports.savedReportId], references: [savedReports.id] }),
  user: one(users, { fields: [scheduledReports.userId], references: [users.id] }),
  runs: many(reportRuns),
}));

export const reportRunsRelations = relations(reportRuns, ({ one }) => ({
  savedReport: one(savedReports, { fields: [reportRuns.savedReportId], references: [savedReports.id] }),
  scheduledReport: one(scheduledReports, { fields: [reportRuns.scheduledReportId], references: [scheduledReports.id] }),
  user: one(users, { fields: [reportRuns.userId], references: [users.id] }),
}));

export const exportLogsRelations = relations(exportLogs, ({ one }) => ({
  user: one(users, { fields: [exportLogs.userId], references: [users.id] }),
}));

export const executiveDashboardsRelations = relations(executiveDashboards, ({ one, many }) => ({
  user: one(users, { fields: [executiveDashboards.userId], references: [users.id] }),
  widgets: many(dashboardWidgets),
}));

export const dashboardWidgetsRelations = relations(dashboardWidgets, ({ one }) => ({
  dashboard: one(executiveDashboards, { fields: [dashboardWidgets.dashboardId], references: [executiveDashboards.id] }),
}));

export const kpiDefinitionsRelations = relations(kpiDefinitions, ({ one, many }) => ({
  createdBy: one(users, { fields: [kpiDefinitions.createdById], references: [users.id] }),
  snapshots: many(kpiSnapshots),
}));

export const kpiSnapshotsRelations = relations(kpiSnapshots, ({ one }) => ({
  kpi: one(kpiDefinitions, { fields: [kpiSnapshots.kpiId], references: [kpiDefinitions.id] }),
}));

// Insert schemas
export const insertReportTemplateSchema = createInsertSchema(reportTemplates).omit({ id: true, createdAt: true, updatedAt: true });
export const insertSavedReportSchema = createInsertSchema(savedReports).omit({ id: true, createdAt: true, updatedAt: true });
export const insertScheduledReportSchema = createInsertSchema(scheduledReports).omit({ id: true, createdAt: true, updatedAt: true });
export const insertReportRunSchema = createInsertSchema(reportRuns).omit({ id: true, createdAt: true });
export const insertExportLogSchema = createInsertSchema(exportLogs).omit({ id: true, createdAt: true });
export const insertExecutiveDashboardSchema = createInsertSchema(executiveDashboards).omit({ id: true, createdAt: true, updatedAt: true });
export const insertDashboardWidgetSchema = createInsertSchema(dashboardWidgets).omit({ id: true, createdAt: true, updatedAt: true });
export const insertKpiDefinitionSchema = createInsertSchema(kpiDefinitions).omit({ id: true, createdAt: true, updatedAt: true });
export const insertKpiSnapshotSchema = createInsertSchema(kpiSnapshots).omit({ id: true, createdAt: true });

// Types
export type ReportTemplate = typeof reportTemplates.$inferSelect;
export type InsertReportTemplate = z.infer<typeof insertReportTemplateSchema>;
export type SavedReport = typeof savedReports.$inferSelect;
export type InsertSavedReport = z.infer<typeof insertSavedReportSchema>;
export type ScheduledReport = typeof scheduledReports.$inferSelect;
export type InsertScheduledReport = z.infer<typeof insertScheduledReportSchema>;
export type ReportRun = typeof reportRuns.$inferSelect;
export type InsertReportRun = z.infer<typeof insertReportRunSchema>;
export type ExportLog = typeof exportLogs.$inferSelect;
export type InsertExportLog = z.infer<typeof insertExportLogSchema>;
export type ExecutiveDashboard = typeof executiveDashboards.$inferSelect;
export type InsertExecutiveDashboard = z.infer<typeof insertExecutiveDashboardSchema>;
export type DashboardWidget = typeof dashboardWidgets.$inferSelect;
export type InsertDashboardWidget = z.infer<typeof insertDashboardWidgetSchema>;
export type KpiDefinition = typeof kpiDefinitions.$inferSelect;
export type InsertKpiDefinition = z.infer<typeof insertKpiDefinitionSchema>;
export type KpiSnapshot = typeof kpiSnapshots.$inferSelect;
export type InsertKpiSnapshot = z.infer<typeof insertKpiSnapshotSchema>;

// ============================================
// PHASE 14 EXTENDED TYPES
// ============================================

export interface TravelPreferenceWithConsultant extends TravelPreference {
  consultant: {
    id: string;
    user: {
      firstName: string | null;
      lastName: string | null;
    };
  };
}

export interface TravelBookingWithDetails extends TravelBooking {
  consultant: {
    id: string;
    user: {
      firstName: string | null;
      lastName: string | null;
    };
  };
  project: {
    id: string;
    name: string;
  } | null;
  bookedBy: {
    id: string;
    firstName: string | null;
    lastName: string | null;
  } | null;
}

export interface TravelItineraryWithDetails extends TravelItinerary {
  consultant: {
    id: string;
    user: {
      firstName: string | null;
      lastName: string | null;
    };
  };
  project: {
    id: string;
    name: string;
  } | null;
  createdBy: {
    id: string;
    firstName: string | null;
    lastName: string | null;
  } | null;
  bookings: TravelBookingWithDetails[];
}

export interface CarpoolGroupWithDetails extends CarpoolGroup {
  project: {
    id: string;
    name: string;
  };
  driver: {
    id: string;
    user: {
      firstName: string | null;
      lastName: string | null;
    };
  } | null;
  members: CarpoolMemberWithDetails[];
}

export interface CarpoolMemberWithDetails extends CarpoolMember {
  consultant: {
    id: string;
    user: {
      firstName: string | null;
      lastName: string | null;
    };
  };
}

export interface ShuttleScheduleWithDetails extends ShuttleSchedule {
  project: {
    id: string;
    name: string;
  } | null;
}

export interface TransportationContactWithProject extends TransportationContact {
  project: {
    id: string;
    name: string;
  } | null;
}

export interface TravelAnalytics {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  totalEstimatedCost: string;
  totalActualCost: string;
  bookingsByType: Array<{
    type: string;
    count: number;
    cost: string;
  }>;
  bookingsByStatus: Array<{
    status: string;
    count: number;
  }>;
  upcomingTrips: TravelItineraryWithDetails[];
}

export interface CarpoolAnalytics {
  totalGroups: number;
  openGroups: number;
  totalMembers: number;
  groupsByStatus: Array<{
    status: string;
    count: number;
  }>;
  recentGroups: CarpoolGroupWithDetails[];
}

// ============================================
// PHASE 15 EXTENDED TYPES
// ============================================

export interface ConsultantScorecardWithDetails extends ConsultantScorecard {
  consultant: {
    id: string;
    user: {
      firstName: string | null;
      lastName: string | null;
      profileImageUrl: string | null;
    };
  };
  project: {
    id: string;
    name: string;
  } | null;
  reviewedBy: {
    id: string;
    firstName: string | null;
    lastName: string | null;
  } | null;
}

export interface PulseSurveyWithDetails extends PulseSurvey {
  project: {
    id: string;
    name: string;
  } | null;
  createdBy: {
    id: string;
    firstName: string | null;
    lastName: string | null;
  } | null;
  responseCount: number;
}

export interface PulseResponseWithDetails extends PulseResponse {
  survey: {
    id: string;
    title: string;
  };
  consultant: {
    id: string;
    user: {
      firstName: string | null;
      lastName: string | null;
    };
  };
}

export interface IncidentWithDetails extends Incident {
  project: {
    id: string;
    name: string;
  } | null;
  hospital: {
    id: string;
    name: string;
  } | null;
  consultant: {
    id: string;
    user: {
      firstName: string | null;
      lastName: string | null;
    };
  } | null;
  reportedBy: {
    id: string;
    firstName: string | null;
    lastName: string | null;
  };
  assignedTo: {
    id: string;
    firstName: string | null;
    lastName: string | null;
  } | null;
  correctiveActions: CorrectiveAction[];
}

export interface CorrectiveActionWithDetails extends CorrectiveAction {
  incident: {
    id: string;
    title: string;
  };
  assignedTo: {
    id: string;
    firstName: string | null;
    lastName: string | null;
  } | null;
  verifiedBy: {
    id: string;
    firstName: string | null;
    lastName: string | null;
  } | null;
}

export interface ConsultantBadgeWithDetails extends ConsultantBadge {
  badge: AchievementBadge;
  consultant: {
    id: string;
    user: {
      firstName: string | null;
      lastName: string | null;
    };
  };
  awardedBy: {
    id: string;
    firstName: string | null;
    lastName: string | null;
  } | null;
}

export interface PointTransactionWithDetails extends PointTransaction {
  consultant: {
    id: string;
    user: {
      firstName: string | null;
      lastName: string | null;
    };
  };
  createdBy: {
    id: string;
    firstName: string | null;
    lastName: string | null;
  } | null;
}

export interface ReferralWithDetails extends Referral {
  referrer: {
    id: string;
    user: {
      firstName: string | null;
      lastName: string | null;
    };
  };
  hiredAsConsultant: {
    id: string;
    user: {
      firstName: string | null;
      lastName: string | null;
    };
  } | null;
}

export interface ComplianceCheckWithDetails extends ComplianceCheck {
  consultant: {
    id: string;
    user: {
      firstName: string | null;
      lastName: string | null;
    };
  };
  checkedBy: {
    id: string;
    firstName: string | null;
    lastName: string | null;
  } | null;
}

export interface ComplianceAuditWithDetails extends ComplianceAudit {
  project: {
    id: string;
    name: string;
  } | null;
  hospital: {
    id: string;
    name: string;
  } | null;
  auditor: {
    id: string;
    firstName: string | null;
    lastName: string | null;
  } | null;
}

export interface QualityAnalytics {
  avgOverallScore: number;
  avgQualityScore: number;
  avgPunctualityScore: number;
  avgCommunicationScore: number;
  avgTechnicalScore: number;
  totalScorecards: number;
  activeScorecards: number;
  npsScore: number;
  totalNpsResponses: number;
  promoters: number;
  passives: number;
  detractors: number;
}

export interface GamificationAnalytics {
  totalBadges: number;
  totalBadgesAwarded: number;
  totalPointsEarned: number;
  totalPointsRedeemed: number;
  totalReferrals: number;
  hiredReferrals: number;
  topEarners: Array<{
    consultantId: string;
    consultantName: string;
    totalPoints: number;
  }>;
}

export interface ComplianceAnalytics {
  totalChecks: number;
  passedChecks: number;
  failedChecks: number;
  expiredChecks: number;
  pendingChecks: number;
  complianceRate: number;
  checksByType: Array<{
    type: string;
    total: number;
    passed: number;
    failed: number;
  }>;
  upcomingExpirations: ComplianceCheckWithDetails[];
}

// ============================================
// AI INSIGHTS TYPES
// ============================================

export interface AIInsight {
  id: string;
  type: 'recommendation' | 'warning' | 'prediction' | 'trend';
  category: 'performance' | 'compliance' | 'staffing' | 'risk' | 'opportunity';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  actionItems?: string[];
  metric?: {
    name: string;
    currentValue: number;
    predictedValue?: number;
    trend: 'up' | 'down' | 'stable';
  };
  confidence: number; // 0-100
  generatedAt: string;
}

export interface AIAnalytics {
  overallHealthScore: number;
  insights: AIInsight[];
  consultantRecommendations: Array<{
    consultantId: string;
    consultantName: string;
    matchScore: number;
    reason: string;
  }>;
  attritionRisks: Array<{
    consultantId: string;
    consultantName: string;
    riskLevel: 'low' | 'medium' | 'high';
    factors: string[];
  }>;
  demandForecast: Array<{
    period: string;
    projectedDemand: number;
    currentCapacity: number;
    gap: number;
  }>;
  performanceTrends: Array<{
    metric: string;
    values: Array<{ period: string; value: number }>;
    trend: 'improving' | 'declining' | 'stable';
  }>;
}

// ============================================
// PHASE 16 EXTENDED TYPES
// ============================================

export interface ContractWithDetails extends Contract {
  template: ContractTemplate | null;
  consultant: {
    id: string;
    user: {
      firstName: string | null;
      lastName: string | null;
    };
  } | null;
  project: {
    id: string;
    name: string;
  } | null;
  hospital: {
    id: string;
    name: string;
  } | null;
  createdBy: {
    id: string;
    firstName: string | null;
    lastName: string | null;
  } | null;
  signers: ContractSignerWithDetails[];
}

export interface ContractSignerWithDetails extends ContractSigner {
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
  };
  signatures: ContractSignature[];
}

export interface ChatChannelWithDetails extends ChatChannel {
  project: {
    id: string;
    name: string;
  } | null;
  unit: {
    id: string;
    name: string;
  } | null;
  createdBy: {
    id: string;
    firstName: string | null;
    lastName: string | null;
  } | null;
  memberCount: number;
  unreadCount: number;
  lastMessage: ChatMessageWithSender | null;
}

export interface ChatMessageWithSender extends ChatMessage {
  sender: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    profileImageUrl: string | null;
  };
}

export interface IdentityVerificationWithDetails extends IdentityVerification {
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
  };
  consultant: {
    id: string;
  } | null;
  reviewedBy: {
    id: string;
    firstName: string | null;
    lastName: string | null;
  } | null;
  documents: IdentityDocument[];
  events: VerificationEvent[];
  fraudFlags: FraudFlag[];
}

export interface FraudFlagWithDetails extends FraudFlag {
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
  };
  resolvedBy: {
    id: string;
    firstName: string | null;
    lastName: string | null;
  } | null;
}

// ============================================
// PHASE 17 EXTENDED TYPES
// ============================================

export interface ReportTemplateWithDetails extends ReportTemplate {
  createdBy: {
    id: string;
    firstName: string | null;
    lastName: string | null;
  } | null;
  savedReportCount: number;
}

export interface SavedReportWithDetails extends SavedReport {
  template: ReportTemplate | null;
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
  };
  scheduledReports: ScheduledReport[];
  lastRun: ReportRun | null;
}

export interface ScheduledReportWithDetails extends ScheduledReport {
  savedReport: SavedReportWithDetails;
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
  };
  lastRun: ReportRun | null;
}

export interface ReportRunWithDetails extends ReportRun {
  savedReport: {
    id: string;
    name: string;
  } | null;
  scheduledReport: {
    id: string;
    name: string;
  } | null;
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
  };
}

export interface ExecutiveDashboardWithDetails extends ExecutiveDashboard {
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
  };
  widgets: DashboardWidget[];
  widgetCount: number;
}

export interface KpiDefinitionWithDetails extends KpiDefinition {
  createdBy: {
    id: string;
    firstName: string | null;
    lastName: string | null;
  } | null;
  latestSnapshot: KpiSnapshot | null;
  trend: 'up' | 'down' | 'stable';
}

export interface ReportAnalytics {
  totalReports: number;
  totalScheduledReports: number;
  totalExports: number;
  reportsThisWeek: number;
  exportsThisWeek: number;
  reportsByCategory: Array<{
    category: string;
    count: number;
  }>;
  exportsByFormat: Array<{
    format: string;
    count: number;
  }>;
  topReports: Array<{
    id: string;
    name: string;
    runCount: number;
  }>;
}

export interface DashboardAnalytics {
  totalDashboards: number;
  totalWidgets: number;
  totalKpis: number;
  kpisByCategory: Array<{
    category: string;
    count: number;
  }>;
  kpiHealthStatus: {
    healthy: number;
    warning: number;
    critical: number;
  };
}

// ============================================
// PHASE 18: INTEGRATION & AUTOMATION TABLES
// ============================================

// Integration Provider Enum
export const integrationProviderEnum = pgEnum("integration_provider", [
  "google_calendar", "outlook_calendar", "ical",
  "adp", "workday", "paychex", "gusto",
  "epic", "cerner", "meditech", "allscripts"
]);

export const integrationStatusEnum = pgEnum("integration_status", [
  "connected", "disconnected", "error", "pending", "expired"
]);

export const syncStatusEnum = pgEnum("sync_status", [
  "pending", "in_progress", "completed", "failed", "partial"
]);

export const syncDirectionEnum = pgEnum("sync_direction", [
  "import", "export", "bidirectional"
]);

// Integration Connections - Stores connected external services
export const integrationConnections = pgTable("integration_connections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  provider: integrationProviderEnum("provider").notNull(),
  category: varchar("category").notNull(), // calendar, payroll, ehr
  status: integrationStatusEnum("status").default("pending").notNull(),
  configuration: jsonb("configuration"), // Provider-specific settings
  credentials: jsonb("credentials"), // Encrypted OAuth tokens or API keys (for demo, stored as mock)
  lastSyncAt: timestamp("last_sync_at"),
  lastSyncStatus: syncStatusEnum("last_sync_status"),
  syncFrequency: varchar("sync_frequency").default("manual"), // manual, hourly, daily, weekly
  isActive: boolean("is_active").default(true).notNull(),
  connectedByUserId: varchar("connected_by_user_id").notNull(),
  connectedAt: timestamp("connected_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_integration_connections_provider").on(table.provider),
  index("idx_integration_connections_category").on(table.category),
  index("idx_integration_connections_status").on(table.status),
]);

export const insertIntegrationConnectionSchema = createInsertSchema(integrationConnections).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertIntegrationConnection = z.infer<typeof insertIntegrationConnectionSchema>;
export type IntegrationConnection = typeof integrationConnections.$inferSelect;

// Sync Jobs - Individual sync operations
export const syncJobs = pgTable("sync_jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  connectionId: varchar("connection_id").notNull().references(() => integrationConnections.id),
  direction: syncDirectionEnum("direction").notNull(),
  status: syncStatusEnum("status").default("pending").notNull(),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  recordsProcessed: integer("records_processed").default(0),
  recordsSucceeded: integer("records_succeeded").default(0),
  recordsFailed: integer("records_failed").default(0),
  errorLog: jsonb("error_log"),
  metadata: jsonb("metadata"), // Job-specific data
  triggeredByUserId: varchar("triggered_by_user_id"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_sync_jobs_connection").on(table.connectionId),
  index("idx_sync_jobs_status").on(table.status),
]);

export const insertSyncJobSchema = createInsertSchema(syncJobs).omit({
  id: true,
  createdAt: true,
});
export type InsertSyncJob = z.infer<typeof insertSyncJobSchema>;
export type SyncJob = typeof syncJobs.$inferSelect;

// Sync Events - Detailed log of synced items
export const syncEvents = pgTable("sync_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  syncJobId: varchar("sync_job_id").notNull().references(() => syncJobs.id),
  eventType: varchar("event_type").notNull(), // created, updated, deleted, skipped, error
  resourceType: varchar("resource_type").notNull(), // schedule, availability, timesheet, payroll_entry
  resourceId: varchar("resource_id"),
  externalId: varchar("external_id"), // ID in external system
  details: jsonb("details"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_sync_events_job").on(table.syncJobId),
  index("idx_sync_events_type").on(table.eventType),
]);

export const insertSyncEventSchema = createInsertSchema(syncEvents).omit({
  id: true,
  createdAt: true,
});
export type InsertSyncEvent = z.infer<typeof insertSyncEventSchema>;
export type SyncEvent = typeof syncEvents.$inferSelect;

// Calendar Sync Settings - Per-user calendar sync preferences
export const calendarSyncSettings = pgTable("calendar_sync_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  connectionId: varchar("connection_id").notNull().references(() => integrationConnections.id),
  syncSchedules: boolean("sync_schedules").default(true),
  syncAvailability: boolean("sync_availability").default(true),
  syncTimeOff: boolean("sync_time_off").default(true),
  syncTraining: boolean("sync_training").default(false),
  calendarId: varchar("calendar_id"), // External calendar ID
  colorCoding: jsonb("color_coding"), // Event type to color mapping
  reminderMinutes: integer("reminder_minutes").default(30),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_calendar_sync_user").on(table.userId),
  index("idx_calendar_sync_connection").on(table.connectionId),
]);

export const insertCalendarSyncSettingsSchema = createInsertSchema(calendarSyncSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertCalendarSyncSettings = z.infer<typeof insertCalendarSyncSettingsSchema>;
export type CalendarSyncSettings = typeof calendarSyncSettings.$inferSelect;

// ============================================
// EHR SYSTEM MONITORING TABLES
// ============================================

export const ehrSystemStatusEnum = pgEnum("ehr_system_status", [
  "operational", "degraded", "partial_outage", "major_outage", "maintenance"
]);

export const ehrIncidentSeverityEnum = pgEnum("ehr_incident_severity", [
  "critical", "major", "minor", "informational"
]);

// EHR Systems - Connected EHR systems to monitor
export const ehrSystems = pgTable("ehr_systems", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  vendor: varchar("vendor").notNull(), // Epic, Cerner, Meditech, etc.
  version: varchar("version"),
  hospitalId: varchar("hospital_id").references(() => hospitals.id),
  environment: varchar("environment").default("production"), // production, staging, training
  status: ehrSystemStatusEnum("status").default("operational").notNull(),
  baseUrl: varchar("base_url"),
  healthCheckEndpoint: varchar("health_check_endpoint"),
  lastHealthCheck: timestamp("last_health_check"),
  uptimePercent: decimal("uptime_percent", { precision: 5, scale: 2 }),
  avgResponseTime: integer("avg_response_time"), // in milliseconds
  isMonitored: boolean("is_monitored").default(true).notNull(),
  alertThresholds: jsonb("alert_thresholds"), // Response time, error rate thresholds
  notificationChannels: text("notification_channels").array(), // Email, Slack, etc.
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_ehr_systems_hospital").on(table.hospitalId),
  index("idx_ehr_systems_vendor").on(table.vendor),
  index("idx_ehr_systems_status").on(table.status),
]);

export const insertEhrSystemSchema = createInsertSchema(ehrSystems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertEhrSystem = z.infer<typeof insertEhrSystemSchema>;
export type EhrSystem = typeof ehrSystems.$inferSelect;

// EHR Status Metrics - Time-series health metrics
export const ehrStatusMetrics = pgTable("ehr_status_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ehrSystemId: varchar("ehr_system_id").notNull().references(() => ehrSystems.id),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  status: ehrSystemStatusEnum("status").notNull(),
  responseTime: integer("response_time"), // milliseconds
  errorRate: decimal("error_rate", { precision: 5, scale: 2 }),
  activeUsers: integer("active_users"),
  transactionsPerMinute: integer("transactions_per_minute"),
  cpuUsage: decimal("cpu_usage", { precision: 5, scale: 2 }),
  memoryUsage: decimal("memory_usage", { precision: 5, scale: 2 }),
  diskUsage: decimal("disk_usage", { precision: 5, scale: 2 }),
  details: jsonb("details"),
}, (table) => [
  index("idx_ehr_metrics_system").on(table.ehrSystemId),
  index("idx_ehr_metrics_timestamp").on(table.timestamp),
]);

export const insertEhrStatusMetricSchema = createInsertSchema(ehrStatusMetrics).omit({
  id: true,
});
export type InsertEhrStatusMetric = z.infer<typeof insertEhrStatusMetricSchema>;
export type EhrStatusMetric = typeof ehrStatusMetrics.$inferSelect;

// EHR Incidents - Outages and issues
export const ehrIncidents = pgTable("ehr_incidents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ehrSystemId: varchar("ehr_system_id").notNull().references(() => ehrSystems.id),
  title: varchar("title").notNull(),
  description: text("description"),
  severity: ehrIncidentSeverityEnum("severity").notNull(),
  status: varchar("status").default("investigating").notNull(), // investigating, identified, monitoring, resolved
  impactedModules: text("impacted_modules").array(),
  affectedUsers: integer("affected_users"),
  startedAt: timestamp("started_at").notNull(),
  identifiedAt: timestamp("identified_at"),
  resolvedAt: timestamp("resolved_at"),
  resolution: text("resolution"),
  rootCause: text("root_cause"),
  preventiveMeasures: text("preventive_measures"),
  reportedByUserId: varchar("reported_by_user_id"),
  assignedToUserId: varchar("assigned_to_user_id"),
  notificationsSent: boolean("notifications_sent").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_ehr_incidents_system").on(table.ehrSystemId),
  index("idx_ehr_incidents_severity").on(table.severity),
  index("idx_ehr_incidents_status").on(table.status),
]);

export const insertEhrIncidentSchema = createInsertSchema(ehrIncidents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertEhrIncident = z.infer<typeof insertEhrIncidentSchema>;
export type EhrIncident = typeof ehrIncidents.$inferSelect;

// EHR Incident Updates - Timeline of updates
export const ehrIncidentUpdates = pgTable("ehr_incident_updates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  incidentId: varchar("incident_id").notNull().references(() => ehrIncidents.id),
  status: varchar("status").notNull(),
  message: text("message").notNull(),
  postedByUserId: varchar("posted_by_user_id"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_ehr_incident_updates_incident").on(table.incidentId),
]);

export const insertEhrIncidentUpdateSchema = createInsertSchema(ehrIncidentUpdates).omit({
  id: true,
  createdAt: true,
});
export type InsertEhrIncidentUpdate = z.infer<typeof insertEhrIncidentUpdateSchema>;
export type EhrIncidentUpdate = typeof ehrIncidentUpdates.$inferSelect;

// ============================================
// PAYROLL SYNC TABLES
// ============================================

export const payrollSyncStatusEnum = pgEnum("payroll_sync_status", [
  "pending", "processing", "completed", "failed", "partial"
]);

// Payroll Sync Profiles - Configuration for payroll exports
export const payrollSyncProfiles = pgTable("payroll_sync_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  connectionId: varchar("connection_id").references(() => integrationConnections.id),
  exportFormat: varchar("export_format").default("csv").notNull(), // csv, xml, api
  fieldMappings: jsonb("field_mappings"), // Map NICEHR fields to external system fields
  includeOvertime: boolean("include_overtime").default(true),
  includeBonuses: boolean("include_bonuses").default(true),
  includeDeductions: boolean("include_deductions").default(true),
  autoExportSchedule: varchar("auto_export_schedule"), // cron expression
  lastExportAt: timestamp("last_export_at"),
  isActive: boolean("is_active").default(true).notNull(),
  createdByUserId: varchar("created_by_user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_payroll_sync_profiles_connection").on(table.connectionId),
]);

export const insertPayrollSyncProfileSchema = createInsertSchema(payrollSyncProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertPayrollSyncProfile = z.infer<typeof insertPayrollSyncProfileSchema>;
export type PayrollSyncProfile = typeof payrollSyncProfiles.$inferSelect;

// Payroll Export Jobs - Individual export operations
export const payrollExportJobs = pgTable("payroll_export_jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  profileId: varchar("profile_id").notNull().references(() => payrollSyncProfiles.id),
  batchId: varchar("batch_id").references(() => payrollBatches.id),
  status: payrollSyncStatusEnum("status").default("pending").notNull(),
  exportFormat: varchar("export_format").notNull(),
  periodStart: date("period_start").notNull(),
  periodEnd: date("period_end").notNull(),
  recordCount: integer("record_count").default(0),
  totalAmount: decimal("total_amount", { precision: 12, scale: 2 }),
  filePath: varchar("file_path"),
  fileName: varchar("file_name"),
  fileSize: integer("file_size"),
  errorMessage: text("error_message"),
  exportedByUserId: varchar("exported_by_user_id").notNull(),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  downloadedAt: timestamp("downloaded_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_payroll_export_jobs_profile").on(table.profileId),
  index("idx_payroll_export_jobs_batch").on(table.batchId),
  index("idx_payroll_export_jobs_status").on(table.status),
]);

export const insertPayrollExportJobSchema = createInsertSchema(payrollExportJobs).omit({
  id: true,
  createdAt: true,
});
export type InsertPayrollExportJob = z.infer<typeof insertPayrollExportJobSchema>;
export type PayrollExportJob = typeof payrollExportJobs.$inferSelect;

// ============================================
// AUTOMATED ESCALATION TABLES
// ============================================

// Note: escalationTriggerTypeEnum already defined earlier in schema

export const escalationActionTypeEnum = pgEnum("escalation_action_type", [
  "notify_email", "notify_slack", "notify_sms", "assign_user", "change_priority", "create_incident"
]);

// Escalation Triggers - Enhanced automation rules
export const escalationTriggers = pgTable("escalation_triggers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ruleId: varchar("rule_id").notNull().references(() => escalationRules.id),
  name: varchar("name").notNull(),
  triggerType: varchar("trigger_type").notNull(), // time_based, priority_change, sla_breach, inactivity, volume_spike, manual
  conditions: jsonb("conditions").notNull(), // Trigger conditions
  actions: jsonb("actions").notNull(), // Actions to take
  cooldownMinutes: integer("cooldown_minutes").default(60), // Prevent repeated triggers
  maxTriggersPerHour: integer("max_triggers_per_hour").default(5),
  isActive: boolean("is_active").default(true).notNull(),
  lastTriggeredAt: timestamp("last_triggered_at"),
  triggerCount: integer("trigger_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_escalation_triggers_rule").on(table.ruleId),
  index("idx_escalation_triggers_type").on(table.triggerType),
]);

export const insertEscalationTriggerSchema = createInsertSchema(escalationTriggers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertEscalationTrigger = z.infer<typeof insertEscalationTriggerSchema>;
export type EscalationTrigger = typeof escalationTriggers.$inferSelect;

// Escalation Events - Log of triggered escalations
export const escalationEvents = pgTable("escalation_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  triggerId: varchar("trigger_id").notNull().references(() => escalationTriggers.id),
  ticketId: varchar("ticket_id").references(() => supportTickets.id),
  incidentId: varchar("incident_id").references(() => incidents.id),
  triggerReason: text("trigger_reason").notNull(),
  actionsTaken: jsonb("actions_taken"),
  notificationsSent: jsonb("notifications_sent"),
  previousPriority: varchar("previous_priority"),
  newPriority: varchar("new_priority"),
  previousAssignee: varchar("previous_assignee"),
  newAssignee: varchar("new_assignee"),
  wasSuccessful: boolean("was_successful").default(true),
  errorMessage: text("error_message"),
  acknowledgedByUserId: varchar("acknowledged_by_user_id"),
  acknowledgedAt: timestamp("acknowledged_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_escalation_events_trigger").on(table.triggerId),
  index("idx_escalation_events_ticket").on(table.ticketId),
  index("idx_escalation_events_incident").on(table.incidentId),
]);

export const insertEscalationEventSchema = createInsertSchema(escalationEvents).omit({
  id: true,
  createdAt: true,
});
export type InsertEscalationEvent = z.infer<typeof insertEscalationEventSchema>;
export type EscalationEvent = typeof escalationEvents.$inferSelect;

// Notification Queue - Pending notifications from automations
export const notificationQueue = pgTable("notification_queue", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: varchar("type").notNull(), // email, slack, sms, in_app
  recipientUserId: varchar("recipient_user_id"),
  recipientEmail: varchar("recipient_email"),
  recipientPhone: varchar("recipient_phone"),
  subject: varchar("subject"),
  message: text("message").notNull(),
  priority: varchar("priority").default("normal"), // urgent, high, normal, low
  sourceType: varchar("source_type"), // escalation, system_alert, scheduled
  sourceId: varchar("source_id"),
  status: varchar("status").default("pending"), // pending, sent, failed, cancelled
  scheduledFor: timestamp("scheduled_for"),
  sentAt: timestamp("sent_at"),
  failedAt: timestamp("failed_at"),
  retryCount: integer("retry_count").default(0),
  errorMessage: text("error_message"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_notification_queue_status").on(table.status),
  index("idx_notification_queue_recipient").on(table.recipientUserId),
  index("idx_notification_queue_scheduled").on(table.scheduledFor),
]);

export const insertNotificationQueueSchema = createInsertSchema(notificationQueue).omit({
  id: true,
  createdAt: true,
});
export type InsertNotificationQueue = z.infer<typeof insertNotificationQueueSchema>;
export type NotificationQueueItem = typeof notificationQueue.$inferSelect;

// Automation Workflow Templates - Reusable workflow definitions
export const automationWorkflows = pgTable("automation_workflows", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  category: varchar("category").notNull(), // escalation, notification, data_sync, compliance
  triggerEvent: varchar("trigger_event").notNull(), // ticket_created, sla_warning, compliance_due, etc.
  conditions: jsonb("conditions"),
  actions: jsonb("actions").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  executionCount: integer("execution_count").default(0),
  lastExecutedAt: timestamp("last_executed_at"),
  createdByUserId: varchar("created_by_user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_automation_workflows_category").on(table.category),
  index("idx_automation_workflows_trigger").on(table.triggerEvent),
]);

export const insertAutomationWorkflowSchema = createInsertSchema(automationWorkflows).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertAutomationWorkflow = z.infer<typeof insertAutomationWorkflowSchema>;
export type AutomationWorkflow = typeof automationWorkflows.$inferSelect;

// Workflow Executions - Log of workflow runs
export const workflowExecutions = pgTable("workflow_executions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  workflowId: varchar("workflow_id").notNull().references(() => automationWorkflows.id),
  triggerData: jsonb("trigger_data"),
  status: varchar("status").default("pending"), // pending, running, completed, failed
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  actionsExecuted: jsonb("actions_executed"),
  results: jsonb("results"),
  errorMessage: text("error_message"),
  triggeredByUserId: varchar("triggered_by_user_id"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_workflow_executions_workflow").on(table.workflowId),
  index("idx_workflow_executions_status").on(table.status),
]);

export const insertWorkflowExecutionSchema = createInsertSchema(workflowExecutions).omit({
  id: true,
  createdAt: true,
});
export type InsertWorkflowExecution = z.infer<typeof insertWorkflowExecutionSchema>;
export type WorkflowExecution = typeof workflowExecutions.$inferSelect;

// ============================================
// PHASE 18 EXTENDED TYPES
// ============================================

export interface IntegrationConnectionWithDetails extends IntegrationConnection {
  connectedBy: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
  };
  syncJobCount: number;
  lastSyncJob: SyncJob | null;
}

export interface SyncJobWithDetails extends SyncJob {
  connection: IntegrationConnection;
  triggeredBy: {
    id: string;
    firstName: string | null;
    lastName: string | null;
  } | null;
  eventCount: number;
}

export interface EhrSystemWithDetails extends EhrSystem {
  hospital: Hospital | null;
  recentMetrics: EhrStatusMetric[];
  activeIncidents: EhrIncident[];
  incidentCount: number;
}

export interface EhrIncidentWithDetails extends EhrIncident {
  ehrSystem: EhrSystem;
  reportedBy: {
    id: string;
    firstName: string | null;
    lastName: string | null;
  } | null;
  assignedTo: {
    id: string;
    firstName: string | null;
    lastName: string | null;
  } | null;
  updates: EhrIncidentUpdate[];
}

export interface PayrollSyncProfileWithDetails extends PayrollSyncProfile {
  connection: IntegrationConnection | null;
  createdBy: {
    id: string;
    firstName: string | null;
    lastName: string | null;
  };
  recentExports: PayrollExportJob[];
}

export interface PayrollExportJobWithDetails extends PayrollExportJob {
  profile: PayrollSyncProfile;
  batch: {
    id: string;
    name: string;
    periodStart: string;
    periodEnd: string;
  } | null;
  exportedBy: {
    id: string;
    firstName: string | null;
    lastName: string | null;
  };
}

export interface EscalationTriggerWithDetails extends EscalationTrigger {
  rule: {
    id: string;
    name: string;
    priority: string;
  };
  recentEvents: EscalationEvent[];
}

export interface EscalationEventWithDetails extends EscalationEvent {
  trigger: {
    id: string;
    name: string;
    triggerType: string;
  };
  ticket: SupportTicket | null;
  incident: Incident | null;
  acknowledgedBy: {
    id: string;
    firstName: string | null;
    lastName: string | null;
  } | null;
}

export interface AutomationWorkflowWithDetails extends AutomationWorkflow {
  createdBy: {
    id: string;
    firstName: string | null;
    lastName: string | null;
  };
  recentExecutions: WorkflowExecution[];
}

export interface IntegrationAnalytics {
  totalConnections: number;
  activeConnections: number;
  connectionsByProvider: Array<{
    provider: string;
    count: number;
    status: string;
  }>;
  syncJobsToday: number;
  syncJobsSuccessRate: number;
  recentSyncJobs: SyncJobWithDetails[];
}

export interface EhrMonitoringAnalytics {
  totalSystems: number;
  operationalSystems: number;
  degradedSystems: number;
  systemsWithIncidents: number;
  averageUptime: number;
  averageResponseTime: number;
  activeIncidents: EhrIncidentWithDetails[];
  systemsByVendor: Array<{
    vendor: string;
    count: number;
    avgUptime: number;
  }>;
}

export interface EscalationAnalytics {
  totalTriggers: number;
  activeTriggers: number;
  eventsToday: number;
  eventsThisWeek: number;
  eventsByType: Array<{
    type: string;
    count: number;
  }>;
  averageResponseTime: number;
  acknowledgementRate: number;
  recentEvents: EscalationEventWithDetails[];
}
