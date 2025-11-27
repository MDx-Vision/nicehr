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
}

export const storage = new DatabaseStorage();
