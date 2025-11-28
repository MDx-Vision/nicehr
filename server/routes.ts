import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, requireRole, optionalAuth } from "./replitAuth";
import {
  ObjectStorageService,
  ObjectNotFoundError,
} from "./objectStorage";
import { ObjectPermission } from "./objectAcl";
import { logActivity } from "./activityLogger";
import {
  insertHospitalSchema,
  insertHospitalUnitSchema,
  insertHospitalModuleSchema,
  insertProjectSchema,
  insertProjectRequirementSchema,
  insertConsultantSchema,
  insertConsultantDocumentSchema,
  insertDocumentTypeSchema,
  insertConsultantAvailabilitySchema,
  insertConsultantRatingSchema,
  insertBudgetCalculationSchema,
  insertRoiQuestionSchema,
  insertRoiSurveySchema,
  insertRoiResponseSchema,
  insertProjectScheduleSchema,
  insertScheduleAssignmentSchema,
  accountSettingsSchema,
  insertProjectPhaseSchema,
  insertProjectTaskSchema,
  insertProjectMilestoneSchema,
  insertPhaseDeliverableSchema,
  insertProjectRiskSchema,
  insertTeamRoleTemplateSchema,
  insertProjectTeamAssignmentSchema,
  insertOnboardingTaskSchema,
  insertGoLiveSignInSchema,
  insertSupportTicketSchema,
  insertShiftHandoffSchema,
  insertTimesheetSchema,
  insertTimesheetEntrySchema,
  insertAvailabilityBlockSchema,
  insertShiftSwapRequestSchema,
  insertCourseSchema,
  insertCourseModuleSchema,
  insertCourseEnrollmentSchema,
  insertAssessmentSchema,
  insertAssessmentQuestionSchema,
  insertAssessmentAttemptSchema,
  insertLoginLabSchema,
  insertLoginLabParticipantSchema,
  insertKnowledgeArticleSchema,
  insertEodReportSchema,
  insertEscalationRuleSchema,
  insertTicketHistorySchema,
  insertDataRetentionPolicySchema,
  insertTicketCommentSchema,
} from "@shared/schema";
import {
  sendWelcomeEmail,
  sendDocumentApprovedEmail,
  sendDocumentRejectedEmail,
  sendScheduleAssignedEmail,
  sendAccountDeletionRequestedEmail,
} from "./emailService";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Replit Auth
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Update user profile
  app.put('/api/users/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (req.params.id !== userId) {
        return res.status(403).json({ message: "Forbidden: Can only update your own profile" });
      }
      
      const { firstName, lastName, linkedinUrl, websiteUrl } = req.body;
      const user = await storage.updateUser(req.params.id, {
        firstName,
        lastName,
        linkedinUrl,
        websiteUrl,
      });
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Update user role (admin only)
  app.patch('/api/users/:id/role', isAuthenticated, requireRole('admin'), async (req, res) => {
    try {
      const { role } = req.body;
      if (!['admin', 'hospital_staff', 'consultant'].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }
      const user = await storage.updateUserRole(req.params.id, role);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  // Dashboard stats
  app.get('/api/dashboard/stats', isAuthenticated, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Hospital routes
  app.get('/api/hospitals', isAuthenticated, async (req, res) => {
    try {
      const hospitals = await storage.getAllHospitals();
      res.json(hospitals);
    } catch (error) {
      console.error("Error fetching hospitals:", error);
      res.status(500).json({ message: "Failed to fetch hospitals" });
    }
  });

  app.get('/api/hospitals/:id', isAuthenticated, async (req, res) => {
    try {
      const hospital = await storage.getHospital(req.params.id);
      if (!hospital) {
        return res.status(404).json({ message: "Hospital not found" });
      }
      res.json(hospital);
    } catch (error) {
      console.error("Error fetching hospital:", error);
      res.status(500).json({ message: "Failed to fetch hospital" });
    }
  });

  app.post('/api/hospitals', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const validated = insertHospitalSchema.parse(req.body);
      const hospital = await storage.createHospital(validated);
      
      if (userId) {
        await logActivity(userId, {
          activityType: "create",
          resourceType: "hospital",
          resourceId: hospital.id,
          resourceName: validated.name,
          description: "Created new hospital",
        }, req);
      }
      
      res.status(201).json(hospital);
    } catch (error) {
      console.error("Error creating hospital:", error);
      res.status(400).json({ message: "Failed to create hospital" });
    }
  });

  app.patch('/api/hospitals/:id', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const hospital = await storage.updateHospital(req.params.id, req.body);
      if (!hospital) {
        return res.status(404).json({ message: "Hospital not found" });
      }
      
      if (userId) {
        await logActivity(userId, {
          activityType: "update",
          resourceType: "hospital",
          resourceId: hospital.id,
          resourceName: hospital.name,
          description: "Updated hospital details",
        }, req);
      }
      
      res.json(hospital);
    } catch (error) {
      console.error("Error updating hospital:", error);
      res.status(500).json({ message: "Failed to update hospital" });
    }
  });

  app.delete('/api/hospitals/:id', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const hospitalId = req.params.id;
      
      const hospital = await storage.getHospital(hospitalId);
      const hospitalName = hospital?.name || hospitalId;
      
      await storage.deleteHospital(hospitalId);
      
      if (userId) {
        await logActivity(userId, {
          activityType: "delete",
          resourceType: "hospital",
          resourceId: hospitalId,
          resourceName: hospitalName,
          description: "Deleted hospital",
        }, req);
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting hospital:", error);
      res.status(500).json({ message: "Failed to delete hospital" });
    }
  });

  // Hospital Units routes
  app.get('/api/hospitals/:hospitalId/units', isAuthenticated, async (req, res) => {
    try {
      const units = await storage.getHospitalUnits(req.params.hospitalId);
      res.json(units);
    } catch (error) {
      console.error("Error fetching hospital units:", error);
      res.status(500).json({ message: "Failed to fetch hospital units" });
    }
  });

  app.post('/api/hospitals/:hospitalId/units', isAuthenticated, requireRole('admin'), async (req, res) => {
    try {
      const validated = insertHospitalUnitSchema.parse({
        ...req.body,
        hospitalId: req.params.hospitalId,
      });
      const unit = await storage.createHospitalUnit(validated);
      res.status(201).json(unit);
    } catch (error) {
      console.error("Error creating hospital unit:", error);
      res.status(400).json({ message: "Failed to create hospital unit" });
    }
  });

  app.patch('/api/units/:id', isAuthenticated, requireRole('admin'), async (req, res) => {
    try {
      const unit = await storage.updateHospitalUnit(req.params.id, req.body);
      if (!unit) {
        return res.status(404).json({ message: "Unit not found" });
      }
      res.json(unit);
    } catch (error) {
      console.error("Error updating unit:", error);
      res.status(500).json({ message: "Failed to update unit" });
    }
  });

  app.delete('/api/units/:id', isAuthenticated, requireRole('admin'), async (req, res) => {
    try {
      await storage.deleteHospitalUnit(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting unit:", error);
      res.status(500).json({ message: "Failed to delete unit" });
    }
  });

  // Hospital Modules routes
  app.get('/api/units/:unitId/modules', isAuthenticated, async (req, res) => {
    try {
      const modules = await storage.getHospitalModules(req.params.unitId);
      res.json(modules);
    } catch (error) {
      console.error("Error fetching modules:", error);
      res.status(500).json({ message: "Failed to fetch modules" });
    }
  });

  app.post('/api/units/:unitId/modules', isAuthenticated, requireRole('admin'), async (req, res) => {
    try {
      const validated = insertHospitalModuleSchema.parse({
        ...req.body,
        unitId: req.params.unitId,
      });
      const module = await storage.createHospitalModule(validated);
      res.status(201).json(module);
    } catch (error) {
      console.error("Error creating module:", error);
      res.status(400).json({ message: "Failed to create module" });
    }
  });

  app.patch('/api/modules/:id', isAuthenticated, requireRole('admin'), async (req, res) => {
    try {
      const module = await storage.updateHospitalModule(req.params.id, req.body);
      if (!module) {
        return res.status(404).json({ message: "Module not found" });
      }
      res.json(module);
    } catch (error) {
      console.error("Error updating module:", error);
      res.status(500).json({ message: "Failed to update module" });
    }
  });

  app.delete('/api/modules/:id', isAuthenticated, requireRole('admin'), async (req, res) => {
    try {
      await storage.deleteHospitalModule(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting module:", error);
      res.status(500).json({ message: "Failed to delete module" });
    }
  });

  // Consultant routes
  app.get('/api/consultants', isAuthenticated, async (req, res) => {
    try {
      const consultants = await storage.getAllConsultants();
      res.json(consultants);
    } catch (error) {
      console.error("Error fetching consultants:", error);
      res.status(500).json({ message: "Failed to fetch consultants" });
    }
  });

  app.get('/api/consultants/search', isAuthenticated, async (req, res) => {
    try {
      const filters = {
        location: req.query.location as string,
        shiftPreference: req.query.shiftPreference as any,
        isAvailable: req.query.isAvailable === 'true',
        isOnboarded: req.query.isOnboarded === 'true',
      };
      const consultants = await storage.searchConsultants(filters);
      res.json(consultants);
    } catch (error) {
      console.error("Error searching consultants:", error);
      res.status(500).json({ message: "Failed to search consultants" });
    }
  });

  app.get('/api/consultants/:id', isAuthenticated, async (req, res) => {
    try {
      const consultant = await storage.getConsultant(req.params.id);
      if (!consultant) {
        return res.status(404).json({ message: "Consultant not found" });
      }
      res.json(consultant);
    } catch (error) {
      console.error("Error fetching consultant:", error);
      res.status(500).json({ message: "Failed to fetch consultant" });
    }
  });

  app.get('/api/consultants/user/:userId', isAuthenticated, async (req, res) => {
    try {
      const consultant = await storage.getOrCreateConsultantByUserId(req.params.userId);
      res.json(consultant);
    } catch (error) {
      console.error("Error fetching consultant:", error);
      res.status(500).json({ message: "Failed to fetch consultant" });
    }
  });

  app.post('/api/consultants', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const validated = insertConsultantSchema.parse({
        ...req.body,
        userId: req.body.userId || userId,
      });
      const consultant = await storage.createConsultant(validated);
      
      if (userId) {
        await logActivity(userId, {
          activityType: "create",
          resourceType: "consultant",
          resourceId: consultant.id,
          resourceName: consultant.tngId || "New Consultant",
          description: "Created new consultant profile",
        }, req);
      }
      
      res.status(201).json(consultant);
    } catch (error) {
      console.error("Error creating consultant:", error);
      res.status(400).json({ message: "Failed to create consultant" });
    }
  });

  app.patch('/api/consultants/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const consultant = await storage.updateConsultant(req.params.id, req.body);
      if (!consultant) {
        return res.status(404).json({ message: "Consultant not found" });
      }
      
      if (userId) {
        await logActivity(userId, {
          activityType: "update",
          resourceType: "consultant",
          resourceId: consultant.id,
          resourceName: consultant.tngId || consultant.id,
          description: "Updated consultant profile",
        }, req);
      }
      
      res.json(consultant);
    } catch (error) {
      console.error("Error updating consultant:", error);
      res.status(500).json({ message: "Failed to update consultant" });
    }
  });

  // Consultant directory endpoint with filtering, sorting, and pagination
  app.get('/api/directory/consultants', isAuthenticated, async (req, res) => {
    try {
      const params = {
        search: req.query.search as string | undefined,
        emrSystems: req.query['emrSystems[]'] 
          ? (Array.isArray(req.query['emrSystems[]']) 
              ? req.query['emrSystems[]'] as string[] 
              : [req.query['emrSystems[]'] as string])
          : undefined,
        availability: req.query.availability as 'available' | 'unavailable' | 'all' | undefined,
        experienceMin: req.query.experienceMin ? parseInt(req.query.experienceMin as string, 10) : undefined,
        experienceMax: req.query.experienceMax ? parseInt(req.query.experienceMax as string, 10) : undefined,
        modules: req.query['modules[]']
          ? (Array.isArray(req.query['modules[]'])
              ? req.query['modules[]'] as string[]
              : [req.query['modules[]'] as string])
          : undefined,
        shiftPreference: req.query.shiftPreference as string | undefined,
        sortBy: req.query.sortBy as 'name' | 'experience' | 'location' | 'rating' | undefined,
        order: req.query.order as 'asc' | 'desc' | undefined,
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        pageSize: req.query.pageSize ? parseInt(req.query.pageSize as string, 10) : 12,
      };

      const result = await storage.searchConsultantsDirectory(params);

      const totalPages = Math.ceil(result.totalCount / params.pageSize);

      res.json({
        consultants: result.consultants,
        pagination: {
          page: params.page,
          pageSize: params.pageSize,
          totalCount: result.totalCount,
          totalPages,
        },
        filters: {
          availableEmrSystems: result.availableEmrSystems,
          availableModules: result.availableModules,
        },
      });
    } catch (error) {
      console.error("Error searching consultants directory:", error);
      res.status(500).json({ message: "Failed to search consultants directory" });
    }
  });

  // Consultant full profile endpoint with privacy settings enforcement
  app.get('/api/consultants/:id/profile', isAuthenticated, async (req: any, res) => {
    try {
      const profile = await storage.getConsultantProfile(req.params.id);
      if (!profile) {
        return res.status(404).json({ message: "Consultant not found" });
      }

      // Check profile visibility
      const currentUserId = req.user?.claims?.sub;
      const isOwnProfile = profile.user.id === currentUserId;
      
      // Get user settings for this profile
      const userSettings = await storage.getAccountSettings(profile.user.id);
      
      if (userSettings) {
        // If profile is private and not the owner, deny access
        if (userSettings.profileVisibility === 'private' && !isOwnProfile) {
          return res.status(403).json({ message: "This profile is private" });
        }

        // Hide contact information if not the owner and settings restrict visibility
        if (!isOwnProfile) {
          // Hide email if showEmail is false
          if (!userSettings.showEmail) {
            profile.user.email = null;
          }

          // Hide phone and address if showPhone is false (phone-related contact info)
          if (!userSettings.showPhone) {
            profile.consultant.phone = null;
            profile.consultant.address = null;
          }
        }
      }

      res.json(profile);
    } catch (error) {
      console.error("Error fetching consultant profile:", error);
      res.status(500).json({ message: "Failed to fetch consultant profile" });
    }
  });

  // Account Settings routes
  app.get('/api/account/settings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const settings = await storage.getAccountSettings(userId);
      if (!settings) {
        return res.status(404).json({ message: "Account not found" });
      }
      res.json(settings);
    } catch (error) {
      console.error("Error fetching account settings:", error);
      res.status(500).json({ message: "Failed to fetch account settings" });
    }
  });

  app.patch('/api/account/settings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validated = accountSettingsSchema.parse(req.body);
      const user = await storage.updateAccountSettings(userId, validated);
      if (!user) {
        return res.status(404).json({ message: "Account not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error updating account settings:", error);
      res.status(400).json({ message: "Failed to update account settings" });
    }
  });

  app.post('/api/account/delete-request', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.requestAccountDeletion(userId);
      if (!user) {
        return res.status(404).json({ message: "Account not found" });
      }
      
      // Send email notification for account deletion request
      if (user.email) {
        try {
          await sendAccountDeletionRequestedEmail(
            user,
            user.deletionRequestedAt?.toLocaleDateString() || new Date().toLocaleDateString()
          );
        } catch (emailError) {
          console.error("Error sending account deletion email:", emailError);
        }
      }
      
      res.json({ message: "Deletion request submitted", deletionRequestedAt: user.deletionRequestedAt });
    } catch (error) {
      console.error("Error requesting account deletion:", error);
      res.status(500).json({ message: "Failed to request account deletion" });
    }
  });

  app.delete('/api/account/delete-request', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.cancelAccountDeletion(userId);
      if (!user) {
        return res.status(404).json({ message: "Account not found" });
      }
      res.json({ message: "Deletion request cancelled" });
    } catch (error) {
      console.error("Error cancelling account deletion:", error);
      res.status(500).json({ message: "Failed to cancel account deletion" });
    }
  });

  // Consultant documents routes
  app.get('/api/consultants/:consultantId/documents', isAuthenticated, async (req, res) => {
    try {
      const documents = await storage.getConsultantDocuments(req.params.consultantId);
      res.json(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  app.post('/api/consultants/:consultantId/documents', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const validated = insertConsultantDocumentSchema.parse({
        ...req.body,
        consultantId: req.params.consultantId,
      });
      const document = await storage.createConsultantDocument(validated);
      
      if (userId) {
        await logActivity(userId, {
          activityType: "upload",
          resourceType: "document",
          resourceId: document.id,
          resourceName: validated.fileName,
          description: "Uploaded consultant document",
        }, req);
      }
      
      res.status(201).json(document);
    } catch (error) {
      console.error("Error creating document:", error);
      res.status(400).json({ message: "Failed to create document" });
    }
  });

  app.patch('/api/documents/:id/status', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { status, notes } = req.body;
      const document = await storage.updateDocumentStatus(
        req.params.id,
        status,
        userId,
        notes
      );
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      // Log activity for document status update
      if (userId) {
        const activityType = status === 'approved' ? 'approve' : status === 'rejected' ? 'reject' : 'update';
        await logActivity(userId, {
          activityType,
          resourceType: "document",
          resourceId: document.id,
          resourceName: document.fileName,
          description: `Document ${status}`,
        }, req);
      }
      
      // Send email notification for document status change
      try {
        const consultant = await storage.getConsultant(document.consultantId);
        if (consultant) {
          const user = await storage.getUser(consultant.userId);
          if (user) {
            const docType = await storage.getDocumentType(document.documentTypeId);
            const documentTypeName = docType?.name || 'Document';
            
            if (status === 'approved') {
              await sendDocumentApprovedEmail(user, documentTypeName);
            } else if (status === 'rejected') {
              await sendDocumentRejectedEmail(user, documentTypeName, notes);
            }
          }
        }
      } catch (emailError) {
        console.error("Error sending document status email:", emailError);
      }
      
      res.json(document);
    } catch (error) {
      console.error("Error updating document status:", error);
      res.status(500).json({ message: "Failed to update document status" });
    }
  });

  // Document types routes
  app.get('/api/document-types', isAuthenticated, async (req, res) => {
    try {
      const types = await storage.getAllDocumentTypes();
      res.json(types);
    } catch (error) {
      console.error("Error fetching document types:", error);
      res.status(500).json({ message: "Failed to fetch document types" });
    }
  });

  app.post('/api/document-types', isAuthenticated, requireRole('admin'), async (req, res) => {
    try {
      const validated = insertDocumentTypeSchema.parse(req.body);
      const docType = await storage.createDocumentType(validated);
      res.status(201).json(docType);
    } catch (error) {
      console.error("Error creating document type:", error);
      res.status(400).json({ message: "Failed to create document type" });
    }
  });

  // Consultant availability routes
  app.get('/api/consultants/:consultantId/availability', isAuthenticated, async (req, res) => {
    try {
      const availability = await storage.getConsultantAvailability(req.params.consultantId);
      res.json(availability);
    } catch (error) {
      console.error("Error fetching availability:", error);
      res.status(500).json({ message: "Failed to fetch availability" });
    }
  });

  app.post('/api/consultants/:consultantId/availability', isAuthenticated, async (req, res) => {
    try {
      const validated = insertConsultantAvailabilitySchema.parse({
        ...req.body,
        consultantId: req.params.consultantId,
      });
      const availability = await storage.createConsultantAvailability(validated);
      res.status(201).json(availability);
    } catch (error) {
      console.error("Error creating availability:", error);
      res.status(400).json({ message: "Failed to create availability" });
    }
  });

  app.delete('/api/availability/:id', isAuthenticated, async (req, res) => {
    try {
      await storage.deleteConsultantAvailability(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting availability:", error);
      res.status(500).json({ message: "Failed to delete availability" });
    }
  });

  // Consultant ratings routes
  app.get('/api/consultants/:consultantId/ratings', isAuthenticated, async (req, res) => {
    try {
      const ratings = await storage.getConsultantRatings(req.params.consultantId);
      res.json(ratings);
    } catch (error) {
      console.error("Error fetching ratings:", error);
      res.status(500).json({ message: "Failed to fetch ratings" });
    }
  });

  app.post('/api/consultants/:consultantId/ratings', isAuthenticated, async (req: any, res) => {
    try {
      const validated = insertConsultantRatingSchema.parse({
        ...req.body,
        consultantId: req.params.consultantId,
        ratedBy: req.user.claims.sub,
      });
      const rating = await storage.createConsultantRating(validated);
      res.status(201).json(rating);
    } catch (error) {
      console.error("Error creating rating:", error);
      res.status(400).json({ message: "Failed to create rating" });
    }
  });

  // Project routes
  app.get('/api/projects', isAuthenticated, async (req, res) => {
    try {
      const projects = await storage.getAllProjects();
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.get('/api/projects/:id', isAuthenticated, async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  app.get('/api/hospitals/:hospitalId/projects', isAuthenticated, async (req, res) => {
    try {
      const projects = await storage.getProjectsByHospital(req.params.hospitalId);
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.post('/api/projects', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const validated = insertProjectSchema.parse({
        ...req.body,
        createdBy: userId,
      });
      const project = await storage.createProject(validated);
      
      if (userId) {
        await logActivity(userId, {
          activityType: "create",
          resourceType: "project",
          resourceId: project.id,
          resourceName: validated.name,
          description: "Created new project",
        }, req);
      }
      
      res.status(201).json(project);
    } catch (error) {
      console.error("Error creating project:", error);
      res.status(400).json({ message: "Failed to create project" });
    }
  });

  app.patch('/api/projects/:id', isAuthenticated, requireRole('admin'), async (req, res) => {
    try {
      const project = await storage.updateProject(req.params.id, req.body);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      console.error("Error updating project:", error);
      res.status(500).json({ message: "Failed to update project" });
    }
  });

  app.delete('/api/projects/:id', isAuthenticated, requireRole('admin'), async (req, res) => {
    try {
      await storage.deleteProject(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting project:", error);
      res.status(500).json({ message: "Failed to delete project" });
    }
  });

  // Project requirements routes
  app.get('/api/projects/:projectId/requirements', isAuthenticated, async (req, res) => {
    try {
      const requirements = await storage.getProjectRequirements(req.params.projectId);
      res.json(requirements);
    } catch (error) {
      console.error("Error fetching requirements:", error);
      res.status(500).json({ message: "Failed to fetch requirements" });
    }
  });

  app.post('/api/projects/:projectId/requirements', isAuthenticated, requireRole('admin'), async (req, res) => {
    try {
      const validated = insertProjectRequirementSchema.parse({
        ...req.body,
        projectId: req.params.projectId,
      });
      const requirement = await storage.createProjectRequirement(validated);
      res.status(201).json(requirement);
    } catch (error) {
      console.error("Error creating requirement:", error);
      res.status(400).json({ message: "Failed to create requirement" });
    }
  });

  app.delete('/api/requirements/:id', isAuthenticated, requireRole('admin'), async (req, res) => {
    try {
      await storage.deleteProjectRequirement(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting requirement:", error);
      res.status(500).json({ message: "Failed to delete requirement" });
    }
  });

  // Schedule routes
  app.get('/api/projects/:projectId/schedules', isAuthenticated, async (req, res) => {
    try {
      const schedules = await storage.getProjectSchedules(req.params.projectId);
      res.json(schedules);
    } catch (error) {
      console.error("Error fetching schedules:", error);
      res.status(500).json({ message: "Failed to fetch schedules" });
    }
  });

  app.post('/api/projects/:projectId/schedules', isAuthenticated, requireRole('admin'), async (req, res) => {
    try {
      const validated = insertProjectScheduleSchema.parse({
        ...req.body,
        projectId: req.params.projectId,
      });
      const schedule = await storage.createProjectSchedule(validated);
      res.status(201).json(schedule);
    } catch (error) {
      console.error("Error creating schedule:", error);
      res.status(400).json({ message: "Failed to create schedule" });
    }
  });

  app.patch('/api/schedules/:id/status', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      const { status } = req.body;
      const schedule = await storage.updateScheduleStatus(
        req.params.id,
        status,
        req.user.claims.sub
      );
      if (!schedule) {
        return res.status(404).json({ message: "Schedule not found" });
      }
      res.json(schedule);
    } catch (error) {
      console.error("Error updating schedule status:", error);
      res.status(500).json({ message: "Failed to update schedule status" });
    }
  });

  // Schedule assignments routes
  app.get('/api/schedules/:scheduleId/assignments', isAuthenticated, async (req, res) => {
    try {
      const assignments = await storage.getScheduleAssignments(req.params.scheduleId);
      res.json(assignments);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      res.status(500).json({ message: "Failed to fetch assignments" });
    }
  });

  app.get('/api/consultants/:consultantId/schedules', isAuthenticated, async (req, res) => {
    try {
      const schedules = await storage.getConsultantSchedules(req.params.consultantId);
      res.json(schedules);
    } catch (error) {
      console.error("Error fetching consultant schedules:", error);
      res.status(500).json({ message: "Failed to fetch consultant schedules" });
    }
  });

  app.post('/api/schedules/:scheduleId/assignments', isAuthenticated, requireRole('admin'), async (req, res) => {
    try {
      const validated = insertScheduleAssignmentSchema.parse({
        ...req.body,
        scheduleId: req.params.scheduleId,
      });
      const assignment = await storage.createScheduleAssignment(validated);
      
      // Send email notification to assigned consultant
      try {
        const consultant = await storage.getConsultant(validated.consultantId);
        if (consultant) {
          const user = await storage.getUser(consultant.userId);
          const schedule = await storage.getSchedule(req.params.scheduleId);
          if (user && schedule) {
            const project = await storage.getProject(schedule.projectId);
            if (project) {
              const hospital = project.hospitalId ? await storage.getHospital(project.hospitalId) : null;
              await sendScheduleAssignedEmail(user, {
                projectName: project.name,
                hospitalName: hospital?.name || 'TBD',
                shiftDate: schedule.scheduleDate || 'TBD',
                shiftTime: schedule.shiftType === 'day' ? '7:00 AM - 7:00 PM' : schedule.shiftType === 'night' ? '7:00 PM - 7:00 AM' : '3:00 PM - 11:00 PM',
                shiftType: schedule.shiftType || 'day',
              });
            }
          }
        }
      } catch (emailError) {
        console.error("Error sending schedule assignment email:", emailError);
      }
      
      res.status(201).json(assignment);
    } catch (error) {
      console.error("Error creating assignment:", error);
      res.status(400).json({ message: "Failed to create assignment" });
    }
  });

  app.delete('/api/assignments/:id', isAuthenticated, requireRole('admin'), async (req, res) => {
    try {
      await storage.deleteScheduleAssignment(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting assignment:", error);
      res.status(500).json({ message: "Failed to delete assignment" });
    }
  });

  // Budget calculation routes
  app.get('/api/projects/:projectId/budget', isAuthenticated, async (req, res) => {
    try {
      const budget = await storage.getBudgetCalculation(req.params.projectId);
      res.json(budget || null);
    } catch (error) {
      console.error("Error fetching budget:", error);
      res.status(500).json({ message: "Failed to fetch budget" });
    }
  });

  app.post('/api/projects/:projectId/budget', isAuthenticated, requireRole('admin'), async (req, res) => {
    try {
      const validated = insertBudgetCalculationSchema.parse({
        ...req.body,
        projectId: req.params.projectId,
      });
      const budget = await storage.createBudgetCalculation(validated);
      res.status(201).json(budget);
    } catch (error) {
      console.error("Error creating budget:", error);
      res.status(400).json({ message: "Failed to create budget" });
    }
  });

  app.patch('/api/budget/:id', isAuthenticated, requireRole('admin'), async (req, res) => {
    try {
      const budget = await storage.updateBudgetCalculation(req.params.id, req.body);
      if (!budget) {
        return res.status(404).json({ message: "Budget not found" });
      }
      res.json(budget);
    } catch (error) {
      console.error("Error updating budget:", error);
      res.status(500).json({ message: "Failed to update budget" });
    }
  });

  // ROI routes
  app.get('/api/roi/questions', isAuthenticated, async (req, res) => {
    try {
      const questions = await storage.getAllRoiQuestions();
      res.json(questions);
    } catch (error) {
      console.error("Error fetching ROI questions:", error);
      res.status(500).json({ message: "Failed to fetch ROI questions" });
    }
  });

  app.post('/api/roi/questions', isAuthenticated, requireRole('admin'), async (req, res) => {
    try {
      const validated = insertRoiQuestionSchema.parse(req.body);
      const question = await storage.createRoiQuestion(validated);
      res.status(201).json(question);
    } catch (error) {
      console.error("Error creating ROI question:", error);
      res.status(400).json({ message: "Failed to create ROI question" });
    }
  });

  app.get('/api/projects/:projectId/surveys', isAuthenticated, async (req, res) => {
    try {
      const surveys = await storage.getRoiSurveys(req.params.projectId);
      res.json(surveys);
    } catch (error) {
      console.error("Error fetching surveys:", error);
      res.status(500).json({ message: "Failed to fetch surveys" });
    }
  });

  app.post('/api/projects/:projectId/surveys', isAuthenticated, async (req: any, res) => {
    try {
      const validated = insertRoiSurveySchema.parse({
        projectId: req.params.projectId,
        respondentId: req.user.claims.sub,
      });
      const survey = await storage.createRoiSurvey(validated);
      res.status(201).json(survey);
    } catch (error) {
      console.error("Error creating survey:", error);
      res.status(400).json({ message: "Failed to create survey" });
    }
  });

  app.get('/api/surveys/:surveyId/responses', isAuthenticated, async (req, res) => {
    try {
      const responses = await storage.getRoiResponses(req.params.surveyId);
      res.json(responses);
    } catch (error) {
      console.error("Error fetching responses:", error);
      res.status(500).json({ message: "Failed to fetch responses" });
    }
  });

  app.post('/api/surveys/:surveyId/responses', isAuthenticated, async (req, res) => {
    try {
      const validated = insertRoiResponseSchema.parse({
        ...req.body,
        surveyId: req.params.surveyId,
      });
      const response = await storage.createRoiResponse(validated);
      res.status(201).json(response);
    } catch (error) {
      console.error("Error creating response:", error);
      res.status(400).json({ message: "Failed to create response" });
    }
  });

  app.post('/api/surveys/:surveyId/complete', isAuthenticated, async (req, res) => {
    try {
      const survey = await storage.completeSurvey(req.params.surveyId);
      if (!survey) {
        return res.status(404).json({ message: "Survey not found" });
      }
      res.json(survey);
    } catch (error) {
      console.error("Error completing survey:", error);
      res.status(500).json({ message: "Failed to complete survey" });
    }
  });

  // Object Storage routes
  
  // Serve public objects (no auth required for public visibility)
  app.get("/public-objects/:filePath(*)", async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const file = await objectStorageService.searchPublicObject(req.params.filePath);
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }
      objectStorageService.downloadObject(file, res);
    } catch (error) {
      console.error("Error serving public object:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  // Serve objects with ACL check (public objects accessible without auth, private require auth)
  app.get("/objects/:objectPath(*)", optionalAuth, async (req: any, res) => {
    const userId = req.user?.claims?.sub; // May be undefined for public objects
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      const canAccess = await objectStorageService.canAccessObjectEntity({
        objectFile,
        userId: userId,
        requestedPermission: ObjectPermission.READ,
      });
      if (!canAccess) {
        return res.sendStatus(401);
      }
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error checking object access:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  // Get presigned upload URL
  app.post("/api/objects/upload", isAuthenticated, async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ message: "Failed to get upload URL" });
    }
  });

  // Helper function to validate uploaded object URL
  const validateObjectUrl = (url: string): boolean => {
    // Must be a Google Cloud Storage URL from our bucket
    if (!url.startsWith("https://storage.googleapis.com/")) {
      return false;
    }
    // URL should contain uploads path for security
    if (!url.includes("/uploads/")) {
      return false;
    }
    return true;
  };

  // Update profile photo
  app.put("/api/users/:id/profile-photo", isAuthenticated, async (req: any, res) => {
    const userId = req.user?.claims?.sub;
    const { photoUrl } = req.body;
    
    if (!photoUrl) {
      return res.status(400).json({ error: "photoUrl is required" });
    }
    
    // Validate ownership - user can only update their own profile
    if (userId !== req.params.id) {
      return res.status(403).json({ error: "Forbidden: Can only update your own profile photo" });
    }
    
    // Validate URL is from expected storage domain
    if (!validateObjectUrl(photoUrl)) {
      return res.status(400).json({ error: "Invalid photo URL" });
    }
    
    try {
      const objectStorageService = new ObjectStorageService();
      // Normalize path and set ACL policy to public
      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
        photoUrl,
        {
          owner: userId,
          visibility: "public",
        }
      );
      
      // Update database with normalized path
      const user = await storage.updateUserProfilePhoto(userId, objectPath);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json({ success: true, objectPath });
    } catch (error) {
      console.error("Error updating profile photo:", error);
      res.status(500).json({ error: "Failed to update profile photo" });
    }
  });

  // Update cover photo
  app.put("/api/users/:id/cover-photo", isAuthenticated, async (req: any, res) => {
    const userId = req.user?.claims?.sub;
    const { coverPhotoUrl } = req.body;
    
    if (!coverPhotoUrl) {
      return res.status(400).json({ error: "coverPhotoUrl is required" });
    }
    
    // Validate ownership - user can only update their own profile
    if (userId !== req.params.id) {
      return res.status(403).json({ error: "Forbidden: Can only update your own cover photo" });
    }
    
    // Validate URL is from expected storage domain
    if (!validateObjectUrl(coverPhotoUrl)) {
      return res.status(400).json({ error: "Invalid cover photo URL" });
    }
    
    try {
      const objectStorageService = new ObjectStorageService();
      // Normalize path and set ACL policy to public
      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
        coverPhotoUrl,
        {
          owner: userId,
          visibility: "public",
        }
      );
      
      // Update database with normalized path
      const user = await storage.updateUserCoverPhoto(userId, objectPath);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      res.json({ success: true, objectPath });
    } catch (error) {
      console.error("Error updating cover photo:", error);
      res.status(500).json({ error: "Failed to update cover photo" });
    }
  });

  // Upload consultant document
  app.put("/api/consultants/:id/documents", isAuthenticated, async (req: any, res) => {
    try {
      if (!req.body.fileUrl || !req.body.documentTypeId || !req.body.fileName) {
        return res.status(400).json({ message: "fileUrl, documentTypeId, and fileName are required" });
      }

      const userId = req.user?.claims?.sub;
      const objectStorageService = new ObjectStorageService();
      
      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
        req.body.fileUrl,
        {
          owner: userId,
          visibility: "private",
        }
      );

      const document = await storage.createConsultantDocument({
        consultantId: req.params.id,
        documentTypeId: req.body.documentTypeId,
        fileName: req.body.fileName,
        fileUrl: objectPath,
        expirationDate: req.body.expirationDate,
      });

      res.status(201).json({ objectPath, document });
    } catch (error) {
      console.error("Error uploading consultant document:", error);
      res.status(500).json({ message: "Failed to upload consultant document" });
    }
  });

  // Admin Email Log routes
  app.get('/api/admin/email-logs', isAuthenticated, requireRole('admin'), async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const userId = req.query.userId as string | undefined;
      const logs = await storage.getEmailNotifications(limit, userId);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching email logs:", error);
      res.status(500).json({ message: "Failed to fetch email logs" });
    }
  });

  app.get('/api/admin/email-stats', isAuthenticated, requireRole('admin'), async (req, res) => {
    try {
      const stats = await storage.getEmailNotificationStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching email stats:", error);
      res.status(500).json({ message: "Failed to fetch email stats" });
    }
  });

  // Admin Access Control routes
  app.get('/api/admin/access-rules', isAuthenticated, requireRole('admin'), async (req, res) => {
    try {
      const rules = await storage.getAllAccessRules();
      res.json(rules);
    } catch (error) {
      console.error("Error fetching access rules:", error);
      res.status(500).json({ message: "Failed to fetch access rules" });
    }
  });

  app.get('/api/admin/access-rules/:id', isAuthenticated, requireRole('admin'), async (req, res) => {
    try {
      const rule = await storage.getAccessRule(req.params.id);
      if (!rule) {
        return res.status(404).json({ message: "Access rule not found" });
      }
      res.json(rule);
    } catch (error) {
      console.error("Error fetching access rule:", error);
      res.status(500).json({ message: "Failed to fetch access rule" });
    }
  });

  app.post('/api/admin/access-rules', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { name, resourceType, resourceKey, allowedRoles, deniedRoles, restrictionMessage, isActive } = req.body;
      
      if (!name || !resourceType || !resourceKey) {
        return res.status(400).json({ message: "name, resourceType, and resourceKey are required" });
      }

      if (!['page', 'api', 'feature'].includes(resourceType)) {
        return res.status(400).json({ message: "Invalid resourceType. Must be 'page', 'api', or 'feature'" });
      }

      const rule = await storage.createAccessRule({
        name,
        resourceType,
        resourceKey,
        allowedRoles: allowedRoles || [],
        deniedRoles: deniedRoles || [],
        restrictionMessage: restrictionMessage || null,
        isActive: isActive !== undefined ? isActive : true,
        createdBy: userId,
      });
      
      res.status(201).json(rule);
    } catch (error) {
      console.error("Error creating access rule:", error);
      res.status(500).json({ message: "Failed to create access rule" });
    }
  });

  app.put('/api/admin/access-rules/:id', isAuthenticated, requireRole('admin'), async (req, res) => {
    try {
      const { name, resourceType, resourceKey, allowedRoles, deniedRoles, restrictionMessage, isActive } = req.body;
      
      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (resourceType !== undefined) {
        if (!['page', 'api', 'feature'].includes(resourceType)) {
          return res.status(400).json({ message: "Invalid resourceType. Must be 'page', 'api', or 'feature'" });
        }
        updateData.resourceType = resourceType;
      }
      if (resourceKey !== undefined) updateData.resourceKey = resourceKey;
      if (allowedRoles !== undefined) updateData.allowedRoles = allowedRoles;
      if (deniedRoles !== undefined) updateData.deniedRoles = deniedRoles;
      if (restrictionMessage !== undefined) updateData.restrictionMessage = restrictionMessage;
      if (isActive !== undefined) updateData.isActive = isActive;

      const rule = await storage.updateAccessRule(req.params.id, updateData);
      if (!rule) {
        return res.status(404).json({ message: "Access rule not found" });
      }
      res.json(rule);
    } catch (error) {
      console.error("Error updating access rule:", error);
      res.status(500).json({ message: "Failed to update access rule" });
    }
  });

  app.delete('/api/admin/access-rules/:id', isAuthenticated, requireRole('admin'), async (req, res) => {
    try {
      await storage.deleteAccessRule(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting access rule:", error);
      res.status(500).json({ message: "Failed to delete access rule" });
    }
  });

  app.get('/api/admin/access-audit', isAuthenticated, requireRole('admin'), async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const ruleId = req.query.ruleId as string | undefined;
      const logs = await storage.getAccessAuditLogs(limit, ruleId);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching access audit logs:", error);
      res.status(500).json({ message: "Failed to fetch access audit logs" });
    }
  });

  // User permissions API (for frontend to check access)
  app.get('/api/permissions', optionalAuth, async (req: any, res) => {
    try {
      const user = req.user ? await storage.getUser(req.user.claims.sub) : null;
      const userRole = user?.role || null;
      
      const allRules = await storage.getAllAccessRules();
      const activeRules = allRules.filter(r => r.isActive);
      
      const restrictedPages: string[] = [];
      const restrictedFeatures: string[] = [];
      
      for (const rule of activeRules) {
        const allowedRoles = rule.allowedRoles as string[];
        const deniedRoles = rule.deniedRoles as string[];
        
        let isRestricted = false;
        
        if (!userRole) {
          if (allowedRoles.length > 0 && !allowedRoles.includes('guest')) {
            isRestricted = true;
          }
        } else {
          if (deniedRoles.includes(userRole)) {
            isRestricted = true;
          } else if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
            isRestricted = true;
          }
        }
        
        if (isRestricted) {
          if (rule.resourceType === 'page') {
            restrictedPages.push(rule.resourceKey);
          } else if (rule.resourceType === 'feature') {
            restrictedFeatures.push(rule.resourceKey);
          }
        }
      }
      
      res.json({
        role: userRole,
        restrictedPages,
        restrictedFeatures,
      });
    } catch (error) {
      console.error("Error fetching permissions:", error);
      res.status(500).json({ message: "Failed to fetch permissions" });
    }
  });

  // User Activity routes
  app.get('/api/activities', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const limit = parseInt(req.query.limit as string) || 50;
      const activities = await storage.getUserActivities(userId, limit);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching user activities:", error);
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  app.get('/api/activities/recent', isAuthenticated, async (req: any, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const activities = await storage.getRecentActivities(limit);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching recent activities:", error);
      res.status(500).json({ message: "Failed to fetch recent activities" });
    }
  });

  app.get('/api/activities/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.query.userId as string | undefined;
      const stats = await storage.getActivityStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching activity stats:", error);
      res.status(500).json({ message: "Failed to fetch activity stats" });
    }
  });

  // Admin: View all user activities
  app.get('/api/admin/activities', isAuthenticated, requireRole('admin'), async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const activities = await storage.getRecentActivities(limit);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching all activities:", error);
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  // Notification routes
  app.get('/api/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const limit = parseInt(req.query.limit as string) || 50;
      const unreadOnly = req.query.unreadOnly === 'true';
      const notifications = await storage.getUserNotifications(userId, limit, unreadOnly);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.get('/api/notifications/unread-count', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const count = await storage.getUnreadNotificationCount(userId);
      res.json({ count });
    } catch (error) {
      console.error("Error fetching unread count:", error);
      res.status(500).json({ message: "Failed to fetch unread count" });
    }
  });

  app.patch('/api/notifications/:id/read', isAuthenticated, async (req: any, res) => {
    try {
      const notification = await storage.markNotificationRead(req.params.id);
      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      res.json(notification);
    } catch (error) {
      console.error("Error marking notification read:", error);
      res.status(500).json({ message: "Failed to mark notification read" });
    }
  });

  app.post('/api/notifications/mark-all-read', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const count = await storage.markAllNotificationsRead(userId);
      res.json({ success: true, count });
    } catch (error) {
      console.error("Error marking all notifications read:", error);
      res.status(500).json({ message: "Failed to mark all notifications read" });
    }
  });

  app.delete('/api/notifications/:id', isAuthenticated, async (req: any, res) => {
    try {
      await storage.deleteNotification(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting notification:", error);
      res.status(500).json({ message: "Failed to delete notification" });
    }
  });

  // Admin: Create notification for a user
  app.post('/api/admin/notifications', isAuthenticated, requireRole('admin'), async (req, res) => {
    try {
      const { userId, type, title, message, link, metadata } = req.body;
      
      if (!userId || !title || !message) {
        return res.status(400).json({ message: "userId, title, and message are required" });
      }

      const notification = await storage.createNotification({
        userId,
        type: type || 'info',
        title,
        message,
        link: link || null,
        isRead: false,
        readAt: null,
        metadata: metadata || null,
      });
      
      res.status(201).json(notification);
    } catch (error) {
      console.error("Error creating notification:", error);
      res.status(500).json({ message: "Failed to create notification" });
    }
  });

  // Analytics routes
  app.get('/api/analytics/platform', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      const analytics = await storage.getPlatformAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching platform analytics:", error);
      res.status(500).json({ message: "Failed to fetch platform analytics" });
    }
  });

  app.get('/api/analytics/hospital/:hospitalId', isAuthenticated, async (req: any, res) => {
    try {
      const { hospitalId } = req.params;
      const user = req.user;
      const userId = user.claims.sub;
      
      // Get user's role from database
      const dbUser = await storage.getUser(userId);
      if (!dbUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check access: admins can access any hospital, staff can only access their own
      if (dbUser.role !== 'admin') {
        const staff = await storage.getHospitalStaffByUserId(userId);
        if (!staff || staff.hospitalId !== hospitalId) {
          return res.status(403).json({ message: "Access denied" });
        }
      }
      
      const analytics = await storage.getHospitalAnalytics(hospitalId);
      if (!analytics) {
        return res.status(404).json({ message: "Hospital not found" });
      }
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching hospital analytics:", error);
      res.status(500).json({ message: "Failed to fetch hospital analytics" });
    }
  });

  app.get('/api/analytics/consultant/:consultantId', isAuthenticated, async (req: any, res) => {
    try {
      const { consultantId } = req.params;
      const user = req.user;
      const userId = user.claims.sub;
      
      // Get user's role from database
      const dbUser = await storage.getUser(userId);
      if (!dbUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check access: admins can access any consultant, consultants can only access their own
      if (dbUser.role !== 'admin') {
        const consultant = await storage.getConsultantByUserId(userId);
        if (!consultant || consultant.id !== consultantId) {
          return res.status(403).json({ message: "Access denied" });
        }
      }
      
      const analytics = await storage.getConsultantAnalytics(consultantId);
      if (!analytics) {
        return res.status(404).json({ message: "Consultant not found" });
      }
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching consultant analytics:", error);
      res.status(500).json({ message: "Failed to fetch consultant analytics" });
    }
  });

  // Get current user's analytics based on role
  app.get('/api/analytics/me', isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      const userId = user.claims.sub;
      
      // Get user's role from database (not from OIDC claims)
      const dbUser = await storage.getUser(userId);
      if (!dbUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const role = dbUser.role;
      
      if (role === 'admin') {
        const analytics = await storage.getPlatformAnalytics();
        res.json({ type: 'platform', data: analytics });
      } else if (role === 'hospital_staff') {
        const staff = await storage.getHospitalStaffByUserId(userId);
        if (!staff) {
          return res.status(404).json({ message: "Hospital staff profile not found" });
        }
        const analytics = await storage.getHospitalAnalytics(staff.hospitalId);
        res.json({ type: 'hospital', data: analytics });
      } else if (role === 'consultant') {
        const consultant = await storage.getConsultantByUserId(userId);
        if (!consultant) {
          return res.status(404).json({ message: "Consultant profile not found" });
        }
        const analytics = await storage.getConsultantAnalytics(consultant.id);
        res.json({ type: 'consultant', data: analytics });
      } else {
        res.status(400).json({ message: "Unknown user role" });
      }
    } catch (error) {
      console.error("Error fetching user analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // ============================================
  // PHASE 8: PROJECT LIFECYCLE & ONBOARDING
  // ============================================

  // Project Phases routes
  app.get('/api/projects/:projectId/phases', isAuthenticated, async (req, res) => {
    try {
      const phases = await storage.getProjectPhases(req.params.projectId);
      res.json(phases);
    } catch (error) {
      console.error("Error fetching project phases:", error);
      res.status(500).json({ message: "Failed to fetch project phases" });
    }
  });

  app.post('/api/projects/:projectId/phases/initialize', isAuthenticated, async (req: any, res) => {
    try {
      const phases = await storage.initializeProjectPhases(req.params.projectId);
      await logActivity(req.user.claims.sub, {
        activityType: 'create',
        resourceType: 'project_phase',
        resourceId: req.params.projectId,
        description: `Initialized ${phases.length} project phases`,
      }, req);
      res.status(201).json(phases);
    } catch (error) {
      console.error("Error initializing project phases:", error);
      res.status(500).json({ message: "Failed to initialize project phases" });
    }
  });

  app.get('/api/phases/:id', isAuthenticated, async (req, res) => {
    try {
      const phase = await storage.getProjectPhase(req.params.id);
      if (!phase) {
        return res.status(404).json({ message: "Phase not found" });
      }
      res.json(phase);
    } catch (error) {
      console.error("Error fetching phase:", error);
      res.status(500).json({ message: "Failed to fetch phase" });
    }
  });

  app.patch('/api/phases/:id', isAuthenticated, async (req: any, res) => {
    try {
      const updateData = insertProjectPhaseSchema.partial().parse(req.body);
      const phase = await storage.updateProjectPhase(req.params.id, updateData);
      if (!phase) {
        return res.status(404).json({ message: "Phase not found" });
      }
      await logActivity(req.user.claims.sub, {
        activityType: 'update',
        resourceType: 'project_phase',
        resourceId: req.params.id,
        resourceName: phase.phaseName,
        description: `Updated project phase ${phase.phaseName}`,
      }, req);
      res.json(phase);
    } catch (error) {
      console.error("Error updating phase:", error);
      res.status(500).json({ message: "Failed to update phase" });
    }
  });

  // Project Tasks routes
  app.get('/api/projects/:projectId/tasks', isAuthenticated, async (req, res) => {
    try {
      const { phaseId } = req.query;
      const tasks = await storage.getProjectTasks(req.params.projectId, phaseId as string);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching project tasks:", error);
      res.status(500).json({ message: "Failed to fetch project tasks" });
    }
  });

  app.post('/api/projects/:projectId/tasks', isAuthenticated, async (req: any, res) => {
    try {
      const taskData = insertProjectTaskSchema.parse({
        ...req.body,
        projectId: req.params.projectId,
      });
      const task = await storage.createProjectTask(taskData);
      await logActivity(req.user.claims.sub, {
        activityType: 'create',
        resourceType: 'project_task',
        resourceId: task.id,
        resourceName: task.title,
        description: `Created task: ${task.title}`,
      }, req);
      res.status(201).json(task);
    } catch (error) {
      console.error("Error creating task:", error);
      res.status(500).json({ message: "Failed to create task" });
    }
  });

  app.get('/api/tasks/:id', isAuthenticated, async (req, res) => {
    try {
      const task = await storage.getProjectTask(req.params.id);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      res.json(task);
    } catch (error) {
      console.error("Error fetching task:", error);
      res.status(500).json({ message: "Failed to fetch task" });
    }
  });

  app.patch('/api/tasks/:id', isAuthenticated, async (req: any, res) => {
    try {
      const updateData = insertProjectTaskSchema.partial().parse(req.body);
      const task = await storage.updateProjectTask(req.params.id, updateData);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      await logActivity(req.user.claims.sub, {
        activityType: 'update',
        resourceType: 'project_task',
        resourceId: req.params.id,
        resourceName: task.title,
        description: `Updated task: ${task.title}`,
      }, req);
      res.json(task);
    } catch (error) {
      console.error("Error updating task:", error);
      res.status(500).json({ message: "Failed to update task" });
    }
  });

  app.delete('/api/tasks/:id', isAuthenticated, async (req: any, res) => {
    try {
      const deleted = await storage.deleteProjectTask(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Task not found" });
      }
      await logActivity(req.user.claims.sub, {
        activityType: 'delete',
        resourceType: 'project_task',
        resourceId: req.params.id,
        description: `Deleted project task`,
      }, req);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting task:", error);
      res.status(500).json({ message: "Failed to delete task" });
    }
  });

  // Project Milestones routes
  app.get('/api/projects/:projectId/milestones', isAuthenticated, async (req, res) => {
    try {
      const milestones = await storage.getProjectMilestones(req.params.projectId);
      res.json(milestones);
    } catch (error) {
      console.error("Error fetching milestones:", error);
      res.status(500).json({ message: "Failed to fetch milestones" });
    }
  });

  app.post('/api/projects/:projectId/milestones', isAuthenticated, async (req: any, res) => {
    try {
      const milestoneData = insertProjectMilestoneSchema.parse({
        ...req.body,
        projectId: req.params.projectId,
      });
      const milestone = await storage.createProjectMilestone(milestoneData);
      await logActivity(req.user.claims.sub, {
        activityType: 'create',
        resourceType: 'project_milestone',
        resourceId: milestone.id,
        resourceName: milestone.title,
        description: `Created milestone: ${milestone.title}`,
      }, req);
      res.status(201).json(milestone);
    } catch (error) {
      console.error("Error creating milestone:", error);
      res.status(500).json({ message: "Failed to create milestone" });
    }
  });

  app.patch('/api/milestones/:id', isAuthenticated, async (req: any, res) => {
    try {
      const updateData = insertProjectMilestoneSchema.partial().parse(req.body);
      const milestone = await storage.updateProjectMilestone(req.params.id, updateData);
      if (!milestone) {
        return res.status(404).json({ message: "Milestone not found" });
      }
      await logActivity(req.user.claims.sub, {
        activityType: 'update',
        resourceType: 'project_milestone',
        resourceId: req.params.id,
        resourceName: milestone.title,
        description: `Updated milestone: ${milestone.title}`,
      }, req);
      res.json(milestone);
    } catch (error) {
      console.error("Error updating milestone:", error);
      res.status(500).json({ message: "Failed to update milestone" });
    }
  });

  app.delete('/api/milestones/:id', isAuthenticated, async (req: any, res) => {
    try {
      const deleted = await storage.deleteProjectMilestone(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Milestone not found" });
      }
      await logActivity(req.user.claims.sub, {
        activityType: 'delete',
        resourceType: 'project_milestone',
        resourceId: req.params.id,
        description: `Deleted project milestone`,
      }, req);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting milestone:", error);
      res.status(500).json({ message: "Failed to delete milestone" });
    }
  });

  // Phase Deliverables routes
  app.get('/api/phases/:phaseId/deliverables', isAuthenticated, async (req, res) => {
    try {
      const deliverables = await storage.getPhaseDeliverables(req.params.phaseId);
      res.json(deliverables);
    } catch (error) {
      console.error("Error fetching deliverables:", error);
      res.status(500).json({ message: "Failed to fetch deliverables" });
    }
  });

  app.post('/api/phases/:phaseId/deliverables', isAuthenticated, async (req: any, res) => {
    try {
      const deliverableData = insertPhaseDeliverableSchema.parse({
        ...req.body,
        phaseId: req.params.phaseId,
      });
      const deliverable = await storage.createPhaseDeliverable(deliverableData);
      await logActivity(req.user.claims.sub, {
        activityType: 'create',
        resourceType: 'phase_deliverable',
        resourceId: deliverable.id,
        resourceName: deliverable.title,
        description: `Created deliverable: ${deliverable.title}`,
      }, req);
      res.status(201).json(deliverable);
    } catch (error) {
      console.error("Error creating deliverable:", error);
      res.status(500).json({ message: "Failed to create deliverable" });
    }
  });

  app.patch('/api/deliverables/:id', isAuthenticated, async (req: any, res) => {
    try {
      const updateData = insertPhaseDeliverableSchema.partial().parse(req.body);
      const deliverable = await storage.updatePhaseDeliverable(req.params.id, updateData);
      if (!deliverable) {
        return res.status(404).json({ message: "Deliverable not found" });
      }
      await logActivity(req.user.claims.sub, {
        activityType: 'update',
        resourceType: 'phase_deliverable',
        resourceId: req.params.id,
        resourceName: deliverable.title,
        description: `Updated deliverable: ${deliverable.title}`,
      }, req);
      res.json(deliverable);
    } catch (error) {
      console.error("Error updating deliverable:", error);
      res.status(500).json({ message: "Failed to update deliverable" });
    }
  });

  // Project Risks routes
  app.get('/api/projects/:projectId/risks', isAuthenticated, async (req, res) => {
    try {
      const risks = await storage.getProjectRisks(req.params.projectId);
      res.json(risks);
    } catch (error) {
      console.error("Error fetching project risks:", error);
      res.status(500).json({ message: "Failed to fetch project risks" });
    }
  });

  app.post('/api/projects/:projectId/risks', isAuthenticated, async (req: any, res) => {
    try {
      const riskData = insertProjectRiskSchema.parse({
        ...req.body,
        projectId: req.params.projectId,
        createdBy: req.user.claims.sub,
      });
      const risk = await storage.createProjectRisk(riskData);
      await logActivity(req.user.claims.sub, {
        activityType: 'create',
        resourceType: 'project_risk',
        resourceId: risk.id,
        resourceName: risk.title,
        description: `Created risk: ${risk.title}`,
      }, req);
      res.status(201).json(risk);
    } catch (error) {
      console.error("Error creating risk:", error);
      res.status(500).json({ message: "Failed to create risk" });
    }
  });

  app.get('/api/risks/:id', isAuthenticated, async (req, res) => {
    try {
      const risk = await storage.getProjectRisk(req.params.id);
      if (!risk) {
        return res.status(404).json({ message: "Risk not found" });
      }
      res.json(risk);
    } catch (error) {
      console.error("Error fetching risk:", error);
      res.status(500).json({ message: "Failed to fetch risk" });
    }
  });

  app.patch('/api/risks/:id', isAuthenticated, async (req: any, res) => {
    try {
      const updateData = insertProjectRiskSchema.partial().parse(req.body);
      const risk = await storage.updateProjectRisk(req.params.id, updateData);
      if (!risk) {
        return res.status(404).json({ message: "Risk not found" });
      }
      await logActivity(req.user.claims.sub, {
        activityType: 'update',
        resourceType: 'project_risk',
        resourceId: req.params.id,
        resourceName: risk.title,
        description: `Updated risk: ${risk.title}`,
      }, req);
      res.json(risk);
    } catch (error) {
      console.error("Error updating risk:", error);
      res.status(500).json({ message: "Failed to update risk" });
    }
  });

  app.delete('/api/risks/:id', isAuthenticated, async (req: any, res) => {
    try {
      const deleted = await storage.deleteProjectRisk(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Risk not found" });
      }
      await logActivity(req.user.claims.sub, {
        activityType: 'delete',
        resourceType: 'project_risk',
        resourceId: req.params.id,
        description: `Deleted project risk`,
      }, req);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting risk:", error);
      res.status(500).json({ message: "Failed to delete risk" });
    }
  });

  // Team Role Templates routes
  app.get('/api/team-roles', isAuthenticated, async (req, res) => {
    try {
      const { category } = req.query;
      if (category && (category === 'nicehr' || category === 'hospital')) {
        const templates = await storage.getTeamRoleTemplatesByCategory(category);
        res.json(templates);
      } else {
        const templates = await storage.getAllTeamRoleTemplates();
        res.json(templates);
      }
    } catch (error) {
      console.error("Error fetching team roles:", error);
      res.status(500).json({ message: "Failed to fetch team roles" });
    }
  });

  app.post('/api/team-roles/initialize', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      const templates = await storage.initializeTeamRoleTemplates();
      await logActivity(req.user.claims.sub, {
        activityType: 'create',
        resourceType: 'team_role_template',
        description: `Initialized ${templates.length} team role templates`,
      }, req);
      res.status(201).json(templates);
    } catch (error) {
      console.error("Error initializing team roles:", error);
      res.status(500).json({ message: "Failed to initialize team roles" });
    }
  });

  app.post('/api/team-roles', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      const templateData = insertTeamRoleTemplateSchema.parse(req.body);
      const template = await storage.createTeamRoleTemplate(templateData);
      await logActivity(req.user.claims.sub, {
        activityType: 'create',
        resourceType: 'team_role_template',
        resourceId: template.id,
        resourceName: template.name,
        description: `Created team role: ${template.name}`,
      }, req);
      res.status(201).json(template);
    } catch (error) {
      console.error("Error creating team role:", error);
      res.status(500).json({ message: "Failed to create team role" });
    }
  });

  // Project Team Assignment routes
  app.get('/api/projects/:projectId/team', isAuthenticated, async (req, res) => {
    try {
      const assignments = await storage.getProjectTeamAssignments(req.params.projectId);
      res.json(assignments);
    } catch (error) {
      console.error("Error fetching project team:", error);
      res.status(500).json({ message: "Failed to fetch project team" });
    }
  });

  app.post('/api/projects/:projectId/team', isAuthenticated, async (req: any, res) => {
    try {
      const assignmentData = insertProjectTeamAssignmentSchema.parse({
        ...req.body,
        projectId: req.params.projectId,
        assignedBy: req.user.claims.sub,
      });
      const assignment = await storage.createProjectTeamAssignment(assignmentData);
      await logActivity(req.user.claims.sub, {
        activityType: 'assign',
        resourceType: 'project_team_assignment',
        resourceId: assignment.id,
        description: `Assigned team member to project`,
      }, req);
      res.status(201).json(assignment);
    } catch (error) {
      console.error("Error creating team assignment:", error);
      res.status(500).json({ message: "Failed to create team assignment" });
    }
  });

  app.patch('/api/team-assignments/:id', isAuthenticated, async (req: any, res) => {
    try {
      const updateData = insertProjectTeamAssignmentSchema.partial().parse(req.body);
      const assignment = await storage.updateProjectTeamAssignment(req.params.id, updateData);
      if (!assignment) {
        return res.status(404).json({ message: "Assignment not found" });
      }
      await logActivity(req.user.claims.sub, {
        activityType: 'update',
        resourceType: 'project_team_assignment',
        resourceId: req.params.id,
        description: `Updated team assignment`,
      }, req);
      res.json(assignment);
    } catch (error) {
      console.error("Error updating team assignment:", error);
      res.status(500).json({ message: "Failed to update team assignment" });
    }
  });

  app.delete('/api/team-assignments/:id', isAuthenticated, async (req: any, res) => {
    try {
      const deleted = await storage.deleteProjectTeamAssignment(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Assignment not found" });
      }
      await logActivity(req.user.claims.sub, {
        activityType: 'delete',
        resourceType: 'project_team_assignment',
        resourceId: req.params.id,
        description: `Removed team member from project`,
      }, req);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting team assignment:", error);
      res.status(500).json({ message: "Failed to delete team assignment" });
    }
  });

  // Onboarding Tasks routes
  app.get('/api/consultants/:consultantId/onboarding', isAuthenticated, async (req: any, res) => {
    try {
      const { consultantId } = req.params;
      const userId = req.user.claims.sub;
      const dbUser = await storage.getUser(userId);
      
      if (dbUser?.role !== 'admin') {
        const consultant = await storage.getConsultantByUserId(userId);
        if (!consultant || consultant.id !== consultantId) {
          return res.status(403).json({ message: "Access denied" });
        }
      }
      
      const tasks = await storage.getOnboardingTasks(consultantId);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching onboarding tasks:", error);
      res.status(500).json({ message: "Failed to fetch onboarding tasks" });
    }
  });

  app.post('/api/consultants/:consultantId/onboarding/initialize', isAuthenticated, async (req: any, res) => {
    try {
      const { consultantId } = req.params;
      const tasks = await storage.initializeOnboardingTasks(consultantId);
      await logActivity(req.user.claims.sub, {
        activityType: 'create',
        resourceType: 'onboarding_task',
        resourceId: consultantId,
        description: `Initialized ${tasks.length} onboarding tasks`,
      }, req);
      res.status(201).json(tasks);
    } catch (error) {
      console.error("Error initializing onboarding tasks:", error);
      res.status(500).json({ message: "Failed to initialize onboarding tasks" });
    }
  });

  app.get('/api/consultants/:consultantId/onboarding/progress', isAuthenticated, async (req: any, res) => {
    try {
      const { consultantId } = req.params;
      const userId = req.user.claims.sub;
      const dbUser = await storage.getUser(userId);
      
      if (dbUser?.role !== 'admin') {
        const consultant = await storage.getConsultantByUserId(userId);
        if (!consultant || consultant.id !== consultantId) {
          return res.status(403).json({ message: "Access denied" });
        }
      }
      
      const progress = await storage.getOnboardingProgress(consultantId);
      if (!progress) {
        return res.status(404).json({ message: "Consultant not found" });
      }
      res.json(progress);
    } catch (error) {
      console.error("Error fetching onboarding progress:", error);
      res.status(500).json({ message: "Failed to fetch onboarding progress" });
    }
  });

  app.patch('/api/onboarding-tasks/:id', isAuthenticated, async (req: any, res) => {
    try {
      const updateData = insertOnboardingTaskSchema.partial().parse(req.body);
      if (updateData.status === 'submitted') {
        (updateData as any).submittedAt = new Date();
      }
      if (updateData.status === 'approved' || updateData.status === 'rejected') {
        (updateData as any).reviewedBy = req.user.claims.sub;
        (updateData as any).reviewedAt = new Date();
      }
      
      const task = await storage.updateOnboardingTask(req.params.id, updateData);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      await logActivity(req.user.claims.sub, {
        activityType: 'update',
        resourceType: 'onboarding_task',
        resourceId: req.params.id,
        resourceName: task.title,
        description: `Updated onboarding task: ${task.title}`,
      }, req);
      res.json(task);
    } catch (error) {
      console.error("Error updating onboarding task:", error);
      res.status(500).json({ message: "Failed to update onboarding task" });
    }
  });

  app.get('/api/admin/onboarding/pending', isAuthenticated, requireRole('admin'), async (req, res) => {
    try {
      const pendingTasks = await storage.getPendingOnboardingReviews();
      res.json(pendingTasks);
    } catch (error) {
      console.error("Error fetching pending onboarding reviews:", error);
      res.status(500).json({ message: "Failed to fetch pending onboarding reviews" });
    }
  });

  // Project Lifecycle (combined view)
  app.get('/api/projects/:projectId/lifecycle', isAuthenticated, async (req, res) => {
    try {
      const lifecycle = await storage.getProjectLifecycle(req.params.projectId);
      if (!lifecycle) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(lifecycle);
    } catch (error) {
      console.error("Error fetching project lifecycle:", error);
      res.status(500).json({ message: "Failed to fetch project lifecycle" });
    }
  });

  // ============================================
  // PHASE 9: GO-LIVE COMMAND CENTER ROUTES
  // ============================================

  // Command Center Stats
  app.get('/api/projects/:projectId/command-center/stats', isAuthenticated, async (req, res) => {
    try {
      const stats = await storage.getCommandCenterStats(req.params.projectId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching command center stats:", error);
      res.status(500).json({ message: "Failed to fetch command center stats" });
    }
  });

  // Go-Live Sign-In Routes
  app.get('/api/projects/:projectId/go-live/signins', isAuthenticated, async (req, res) => {
    try {
      const signIns = await storage.getGoLiveSignIns(req.params.projectId);
      res.json(signIns);
    } catch (error) {
      console.error("Error fetching sign-ins:", error);
      res.status(500).json({ message: "Failed to fetch sign-ins" });
    }
  });

  app.get('/api/projects/:projectId/go-live/signins/active', isAuthenticated, async (req, res) => {
    try {
      const activeSignIns = await storage.getActiveSignIns(req.params.projectId);
      res.json(activeSignIns);
    } catch (error) {
      console.error("Error fetching active sign-ins:", error);
      res.status(500).json({ message: "Failed to fetch active sign-ins" });
    }
  });

  app.get('/api/projects/:projectId/go-live/signins/today', isAuthenticated, async (req, res) => {
    try {
      const todaySignIns = await storage.getTodaySignIns(req.params.projectId);
      res.json(todaySignIns);
    } catch (error) {
      console.error("Error fetching today's sign-ins:", error);
      res.status(500).json({ message: "Failed to fetch today's sign-ins" });
    }
  });

  app.get('/api/go-live/signins/:id', isAuthenticated, async (req, res) => {
    try {
      const signIn = await storage.getGoLiveSignIn(req.params.id);
      if (!signIn) {
        return res.status(404).json({ message: "Sign-in not found" });
      }
      res.json(signIn);
    } catch (error) {
      console.error("Error fetching sign-in:", error);
      res.status(500).json({ message: "Failed to fetch sign-in" });
    }
  });

  app.post('/api/projects/:projectId/go-live/signins', isAuthenticated, async (req: any, res) => {
    try {
      const validated = insertGoLiveSignInSchema.parse({
        ...req.body,
        projectId: req.params.projectId,
      });
      const signIn = await storage.createGoLiveSignIn(validated);
      
      await logActivity(req.user.claims.sub, {
        activityType: 'create',
        resourceType: 'go_live_signin',
        resourceId: signIn.id,
        resourceName: `Sign-in for project`,
        description: `Checked in for go-live support`,
      }, req);
      
      res.status(201).json(signIn);
    } catch (error) {
      console.error("Error creating sign-in:", error);
      res.status(400).json({ message: "Failed to create sign-in" });
    }
  });

  app.patch('/api/go-live/signins/:id', isAuthenticated, async (req: any, res) => {
    try {
      const updateData = insertGoLiveSignInSchema.partial().parse(req.body);
      const signIn = await storage.updateGoLiveSignIn(req.params.id, updateData);
      if (!signIn) {
        return res.status(404).json({ message: "Sign-in not found" });
      }
      res.json(signIn);
    } catch (error) {
      console.error("Error updating sign-in:", error);
      res.status(500).json({ message: "Failed to update sign-in" });
    }
  });

  app.post('/api/go-live/signins/:id/signout', isAuthenticated, async (req: any, res) => {
    try {
      const signIn = await storage.signOutConsultant(req.params.id);
      if (!signIn) {
        return res.status(404).json({ message: "Sign-in not found" });
      }
      
      await logActivity(req.user.claims.sub, {
        activityType: 'update',
        resourceType: 'go_live_signin',
        resourceId: signIn.id,
        resourceName: `Sign-out`,
        description: `Checked out from go-live support`,
      }, req);
      
      res.json(signIn);
    } catch (error) {
      console.error("Error signing out:", error);
      res.status(500).json({ message: "Failed to sign out" });
    }
  });

  // Support Ticket Routes
  app.get('/api/projects/:projectId/support/tickets', isAuthenticated, async (req, res) => {
    try {
      const tickets = await storage.getSupportTickets(req.params.projectId);
      res.json(tickets);
    } catch (error) {
      console.error("Error fetching support tickets:", error);
      res.status(500).json({ message: "Failed to fetch support tickets" });
    }
  });

  app.get('/api/projects/:projectId/support/tickets/open', isAuthenticated, async (req, res) => {
    try {
      const openTickets = await storage.getOpenTickets(req.params.projectId);
      res.json(openTickets);
    } catch (error) {
      console.error("Error fetching open tickets:", error);
      res.status(500).json({ message: "Failed to fetch open tickets" });
    }
  });

  app.get('/api/support/tickets/:id', isAuthenticated, async (req, res) => {
    try {
      const ticket = await storage.getSupportTicket(req.params.id);
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }
      res.json(ticket);
    } catch (error) {
      console.error("Error fetching ticket:", error);
      res.status(500).json({ message: "Failed to fetch ticket" });
    }
  });

  app.post('/api/projects/:projectId/support/tickets', isAuthenticated, async (req: any, res) => {
    try {
      const validated = insertSupportTicketSchema.parse({
        ...req.body,
        projectId: req.params.projectId,
        reportedBy: req.user.claims.sub,
      });
      const ticket = await storage.createSupportTicket(validated);
      
      await logActivity(req.user.claims.sub, {
        activityType: 'create',
        resourceType: 'support_ticket',
        resourceId: ticket.id,
        resourceName: ticket.ticketNumber || `Ticket ${ticket.id}`,
        description: `Created support ticket: ${ticket.title}`,
      }, req);
      
      res.status(201).json(ticket);
    } catch (error) {
      console.error("Error creating support ticket:", error);
      res.status(400).json({ message: "Failed to create support ticket" });
    }
  });

  app.patch('/api/support/tickets/:id', isAuthenticated, async (req: any, res) => {
    try {
      const updateData = insertSupportTicketSchema.partial().parse(req.body);
      const ticket = await storage.updateSupportTicket(req.params.id, updateData);
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }
      res.json(ticket);
    } catch (error) {
      console.error("Error updating ticket:", error);
      res.status(500).json({ message: "Failed to update ticket" });
    }
  });

  app.post('/api/support/tickets/:id/assign', isAuthenticated, async (req: any, res) => {
    try {
      const { consultantId } = req.body;
      if (!consultantId) {
        return res.status(400).json({ message: "Consultant ID required" });
      }
      const ticket = await storage.assignTicket(req.params.id, consultantId);
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }
      
      await logActivity(req.user.claims.sub, {
        activityType: 'update',
        resourceType: 'support_ticket',
        resourceId: ticket.id,
        resourceName: ticket.ticketNumber || `Ticket ${ticket.id}`,
        description: `Assigned ticket to consultant`,
      }, req);
      
      res.json(ticket);
    } catch (error) {
      console.error("Error assigning ticket:", error);
      res.status(500).json({ message: "Failed to assign ticket" });
    }
  });

  app.post('/api/support/tickets/:id/resolve', isAuthenticated, async (req: any, res) => {
    try {
      const { resolution } = req.body;
      if (!resolution) {
        return res.status(400).json({ message: "Resolution required" });
      }
      const ticket = await storage.resolveTicket(req.params.id, resolution);
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }
      
      await logActivity(req.user.claims.sub, {
        activityType: 'update',
        resourceType: 'support_ticket',
        resourceId: ticket.id,
        resourceName: ticket.ticketNumber || `Ticket ${ticket.id}`,
        description: `Resolved ticket: ${ticket.title}`,
      }, req);
      
      res.json(ticket);
    } catch (error) {
      console.error("Error resolving ticket:", error);
      res.status(500).json({ message: "Failed to resolve ticket" });
    }
  });

  app.post('/api/support/tickets/:id/escalate', isAuthenticated, async (req: any, res) => {
    try {
      const ticket = await storage.escalateTicket(req.params.id);
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }
      
      await logActivity(req.user.claims.sub, {
        activityType: 'update',
        resourceType: 'support_ticket',
        resourceId: ticket.id,
        resourceName: ticket.ticketNumber || `Ticket ${ticket.id}`,
        description: `Escalated ticket: ${ticket.title}`,
      }, req);
      
      // Create notification for admins about escalation
      const admins = await storage.getAllConsultants();
      for (const admin of admins) {
        await storage.createNotification({
          userId: admin.userId,
          type: 'warning',
          title: 'Ticket Escalated',
          message: `Support ticket ${ticket.ticketNumber} has been escalated: ${ticket.title}`,
          link: `/command-center?ticket=${ticket.id}`,
        });
      }
      
      res.json(ticket);
    } catch (error) {
      console.error("Error escalating ticket:", error);
      res.status(500).json({ message: "Failed to escalate ticket" });
    }
  });

  // Shift Handoff Routes
  app.get('/api/projects/:projectId/shift/handoffs', isAuthenticated, async (req, res) => {
    try {
      const handoffs = await storage.getShiftHandoffs(req.params.projectId);
      res.json(handoffs);
    } catch (error) {
      console.error("Error fetching shift handoffs:", error);
      res.status(500).json({ message: "Failed to fetch shift handoffs" });
    }
  });

  app.get('/api/projects/:projectId/shift/handoffs/pending', isAuthenticated, async (req, res) => {
    try {
      const pendingHandoffs = await storage.getPendingHandoffs(req.params.projectId);
      res.json(pendingHandoffs);
    } catch (error) {
      console.error("Error fetching pending handoffs:", error);
      res.status(500).json({ message: "Failed to fetch pending handoffs" });
    }
  });

  app.get('/api/shift/handoffs/:id', isAuthenticated, async (req, res) => {
    try {
      const handoff = await storage.getShiftHandoff(req.params.id);
      if (!handoff) {
        return res.status(404).json({ message: "Handoff not found" });
      }
      res.json(handoff);
    } catch (error) {
      console.error("Error fetching handoff:", error);
      res.status(500).json({ message: "Failed to fetch handoff" });
    }
  });

  app.post('/api/projects/:projectId/shift/handoffs', isAuthenticated, async (req: any, res) => {
    try {
      const validated = insertShiftHandoffSchema.parse({
        ...req.body,
        projectId: req.params.projectId,
        outgoingConsultantId: req.body.outgoingConsultantId || req.user.claims.sub,
      });
      const handoff = await storage.createShiftHandoff(validated);
      
      await logActivity(req.user.claims.sub, {
        activityType: 'create',
        resourceType: 'shift_handoff',
        resourceId: handoff.id,
        resourceName: `Shift handoff`,
        description: `Created shift handoff notes`,
      }, req);
      
      // Notify incoming consultant if specified
      if (validated.incomingConsultantId) {
        await storage.createNotification({
          userId: validated.incomingConsultantId,
          type: 'schedule',
          title: 'Shift Handoff Pending',
          message: 'You have a new shift handoff awaiting acknowledgment',
          link: `/command-center?handoff=${handoff.id}`,
        });
      }
      
      res.status(201).json(handoff);
    } catch (error) {
      console.error("Error creating handoff:", error);
      res.status(400).json({ message: "Failed to create handoff" });
    }
  });

  app.patch('/api/shift/handoffs/:id', isAuthenticated, async (req: any, res) => {
    try {
      const updateData = insertShiftHandoffSchema.partial().parse(req.body);
      const handoff = await storage.updateShiftHandoff(req.params.id, updateData);
      if (!handoff) {
        return res.status(404).json({ message: "Handoff not found" });
      }
      res.json(handoff);
    } catch (error) {
      console.error("Error updating handoff:", error);
      res.status(500).json({ message: "Failed to update handoff" });
    }
  });

  app.post('/api/shift/handoffs/:id/acknowledge', isAuthenticated, async (req: any, res) => {
    try {
      const consultantId = req.user.claims.sub;
      const handoff = await storage.acknowledgeHandoff(req.params.id, consultantId);
      if (!handoff) {
        return res.status(404).json({ message: "Handoff not found" });
      }
      
      await logActivity(consultantId, {
        activityType: 'update',
        resourceType: 'shift_handoff',
        resourceId: handoff.id,
        resourceName: `Shift handoff`,
        description: `Acknowledged shift handoff`,
      }, req);
      
      res.json(handoff);
    } catch (error) {
      console.error("Error acknowledging handoff:", error);
      res.status(500).json({ message: "Failed to acknowledge handoff" });
    }
  });

  // ============================================
  // PHASE 10: TIMESHEET, AVAILABILITY & SHIFT SWAP ROUTES
  // ============================================

  // Timesheet Routes
  app.get('/api/timesheets', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const consultant = await storage.getConsultantByUserId(userId);
      if (!consultant) {
        return res.status(404).json({ message: "Consultant profile not found" });
      }
      const timesheets = await storage.getTimesheetsByConsultant(consultant.id);
      res.json(timesheets);
    } catch (error) {
      console.error("Error fetching timesheets:", error);
      res.status(500).json({ message: "Failed to fetch timesheets" });
    }
  });

  app.get('/api/timesheets/:id', isAuthenticated, async (req, res) => {
    try {
      const timesheet = await storage.getTimesheetById(req.params.id);
      if (!timesheet) {
        return res.status(404).json({ message: "Timesheet not found" });
      }
      res.json(timesheet);
    } catch (error) {
      console.error("Error fetching timesheet:", error);
      res.status(500).json({ message: "Failed to fetch timesheet" });
    }
  });

  app.post('/api/timesheets', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const consultant = await storage.getConsultantByUserId(userId);
      if (!consultant) {
        return res.status(404).json({ message: "Consultant profile not found" });
      }
      
      const validated = insertTimesheetSchema.parse({
        ...req.body,
        consultantId: consultant.id,
      });
      const timesheet = await storage.createTimesheet(validated);
      
      await logActivity(userId, {
        activityType: 'create',
        resourceType: 'timesheet',
        resourceId: timesheet.id,
        resourceName: `Timesheet for week of ${timesheet.weekStartDate}`,
        description: 'Created new timesheet',
      }, req);
      
      res.status(201).json(timesheet);
    } catch (error) {
      console.error("Error creating timesheet:", error);
      res.status(400).json({ message: "Failed to create timesheet" });
    }
  });

  app.patch('/api/timesheets/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const updateData = insertTimesheetSchema.partial().parse(req.body);
      const timesheet = await storage.updateTimesheet(req.params.id, updateData);
      if (!timesheet) {
        return res.status(404).json({ message: "Timesheet not found" });
      }
      
      await logActivity(userId, {
        activityType: 'update',
        resourceType: 'timesheet',
        resourceId: timesheet.id,
        resourceName: `Timesheet for week of ${timesheet.weekStartDate}`,
        description: 'Updated timesheet',
      }, req);
      
      res.json(timesheet);
    } catch (error) {
      console.error("Error updating timesheet:", error);
      res.status(500).json({ message: "Failed to update timesheet" });
    }
  });

  app.post('/api/timesheets/:id/submit', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const timesheet = await storage.submitTimesheet(req.params.id);
      if (!timesheet) {
        return res.status(404).json({ message: "Timesheet not found" });
      }
      
      await logActivity(userId, {
        activityType: 'update',
        resourceType: 'timesheet',
        resourceId: timesheet.id,
        resourceName: `Timesheet for week of ${timesheet.weekStartDate}`,
        description: 'Submitted timesheet for approval',
      }, req);
      
      res.json(timesheet);
    } catch (error) {
      console.error("Error submitting timesheet:", error);
      res.status(500).json({ message: "Failed to submit timesheet" });
    }
  });

  app.post('/api/timesheets/:id/approve', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      const approverId = req.user.claims.sub;
      const timesheet = await storage.approveTimesheet(req.params.id, approverId);
      if (!timesheet) {
        return res.status(404).json({ message: "Timesheet not found" });
      }
      
      await logActivity(approverId, {
        activityType: 'update',
        resourceType: 'timesheet',
        resourceId: timesheet.id,
        resourceName: `Timesheet for week of ${timesheet.weekStartDate}`,
        description: 'Approved timesheet',
      }, req);
      
      const timesheetDetails = await storage.getTimesheetById(timesheet.id);
      if (timesheetDetails?.consultant?.userId) {
        await storage.createNotification({
          userId: timesheetDetails.consultant.userId,
          type: 'success',
          title: 'Timesheet Approved',
          message: `Your timesheet for week of ${timesheet.weekStartDate} has been approved`,
          link: `/timesheets/${timesheet.id}`,
        });
      }
      
      res.json(timesheet);
    } catch (error) {
      console.error("Error approving timesheet:", error);
      res.status(500).json({ message: "Failed to approve timesheet" });
    }
  });

  app.post('/api/timesheets/:id/reject', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { reason } = req.body;
      if (!reason) {
        return res.status(400).json({ message: "Rejection reason is required" });
      }
      
      const timesheet = await storage.rejectTimesheet(req.params.id, reason);
      if (!timesheet) {
        return res.status(404).json({ message: "Timesheet not found" });
      }
      
      await logActivity(userId, {
        activityType: 'update',
        resourceType: 'timesheet',
        resourceId: timesheet.id,
        resourceName: `Timesheet for week of ${timesheet.weekStartDate}`,
        description: `Rejected timesheet: ${reason}`,
      }, req);
      
      const timesheetDetails = await storage.getTimesheetById(timesheet.id);
      if (timesheetDetails?.consultant?.userId) {
        await storage.createNotification({
          userId: timesheetDetails.consultant.userId,
          type: 'warning',
          title: 'Timesheet Rejected',
          message: `Your timesheet for week of ${timesheet.weekStartDate} was rejected: ${reason}`,
          link: `/timesheets/${timesheet.id}`,
        });
      }
      
      res.json(timesheet);
    } catch (error) {
      console.error("Error rejecting timesheet:", error);
      res.status(500).json({ message: "Failed to reject timesheet" });
    }
  });

  app.get('/api/projects/:projectId/timesheets', isAuthenticated, async (req, res) => {
    try {
      const timesheets = await storage.getTimesheetsByProject(req.params.projectId);
      res.json(timesheets);
    } catch (error) {
      console.error("Error fetching project timesheets:", error);
      res.status(500).json({ message: "Failed to fetch project timesheets" });
    }
  });

  app.get('/api/admin/timesheets/pending', isAuthenticated, requireRole('admin'), async (req, res) => {
    try {
      const timesheets = await storage.getPendingTimesheets();
      res.json(timesheets);
    } catch (error) {
      console.error("Error fetching pending timesheets:", error);
      res.status(500).json({ message: "Failed to fetch pending timesheets" });
    }
  });

  // Timesheet Entry Routes
  app.get('/api/timesheets/:timesheetId/entries', isAuthenticated, async (req, res) => {
    try {
      const entries = await storage.getTimesheetEntries(req.params.timesheetId);
      res.json(entries);
    } catch (error) {
      console.error("Error fetching timesheet entries:", error);
      res.status(500).json({ message: "Failed to fetch timesheet entries" });
    }
  });

  app.post('/api/timesheets/:timesheetId/entries', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validated = insertTimesheetEntrySchema.parse({
        ...req.body,
        timesheetId: req.params.timesheetId,
      });
      const entry = await storage.createTimesheetEntry(validated);
      
      await logActivity(userId, {
        activityType: 'create',
        resourceType: 'timesheet_entry',
        resourceId: entry.id,
        resourceName: `Timesheet entry`,
        description: 'Added timesheet entry',
      }, req);
      
      res.status(201).json(entry);
    } catch (error) {
      console.error("Error creating timesheet entry:", error);
      res.status(400).json({ message: "Failed to create timesheet entry" });
    }
  });

  app.patch('/api/timesheet-entries/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const updateData = insertTimesheetEntrySchema.partial().parse(req.body);
      const entry = await storage.updateTimesheetEntry(req.params.id, updateData);
      if (!entry) {
        return res.status(404).json({ message: "Timesheet entry not found" });
      }
      
      await logActivity(userId, {
        activityType: 'update',
        resourceType: 'timesheet_entry',
        resourceId: entry.id,
        resourceName: `Timesheet entry`,
        description: 'Updated timesheet entry',
      }, req);
      
      res.json(entry);
    } catch (error) {
      console.error("Error updating timesheet entry:", error);
      res.status(500).json({ message: "Failed to update timesheet entry" });
    }
  });

  app.delete('/api/timesheet-entries/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.deleteTimesheetEntry(req.params.id);
      
      await logActivity(userId, {
        activityType: 'delete',
        resourceType: 'timesheet_entry',
        resourceId: req.params.id,
        resourceName: `Timesheet entry`,
        description: 'Deleted timesheet entry',
      }, req);
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting timesheet entry:", error);
      res.status(500).json({ message: "Failed to delete timesheet entry" });
    }
  });

  app.post('/api/timesheets/:timesheetId/clock-in', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { location } = req.body;
      const entry = await storage.clockIn(req.params.timesheetId, location);
      
      await logActivity(userId, {
        activityType: 'create',
        resourceType: 'timesheet_entry',
        resourceId: entry.id,
        resourceName: `Clock in`,
        description: `Clocked in${location ? ` at ${location}` : ''}`,
      }, req);
      
      res.status(201).json(entry);
    } catch (error) {
      console.error("Error clocking in:", error);
      res.status(500).json({ message: "Failed to clock in" });
    }
  });

  app.post('/api/timesheet-entries/:id/clock-out', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const entry = await storage.clockOut(req.params.id);
      if (!entry) {
        return res.status(404).json({ message: "Timesheet entry not found" });
      }
      
      await logActivity(userId, {
        activityType: 'update',
        resourceType: 'timesheet_entry',
        resourceId: entry.id,
        resourceName: `Clock out`,
        description: 'Clocked out',
      }, req);
      
      res.json(entry);
    } catch (error) {
      console.error("Error clocking out:", error);
      res.status(500).json({ message: "Failed to clock out" });
    }
  });

  // Availability Routes
  app.get('/api/availability', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const consultant = await storage.getConsultantByUserId(userId);
      if (!consultant) {
        return res.status(404).json({ message: "Consultant profile not found" });
      }
      
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      
      const availability = await storage.getAvailabilityByConsultant(consultant.id, startDate, endDate);
      res.json(availability);
    } catch (error) {
      console.error("Error fetching availability:", error);
      res.status(500).json({ message: "Failed to fetch availability" });
    }
  });

  app.get('/api/consultants/:consultantId/availability', isAuthenticated, async (req, res) => {
    try {
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      
      const availability = await storage.getAvailabilityByConsultant(req.params.consultantId, startDate, endDate);
      res.json(availability);
    } catch (error) {
      console.error("Error fetching consultant availability:", error);
      res.status(500).json({ message: "Failed to fetch consultant availability" });
    }
  });

  app.post('/api/availability', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const consultant = await storage.getConsultantByUserId(userId);
      if (!consultant) {
        return res.status(404).json({ message: "Consultant profile not found" });
      }
      
      const validated = insertAvailabilityBlockSchema.parse({
        ...req.body,
        consultantId: consultant.id,
      });
      const block = await storage.createAvailabilityBlock(validated);
      
      await logActivity(userId, {
        activityType: 'create',
        resourceType: 'availability',
        resourceId: block.id,
        resourceName: `Availability block`,
        description: `Set availability: ${block.type}`,
      }, req);
      
      res.status(201).json(block);
    } catch (error) {
      console.error("Error creating availability block:", error);
      res.status(400).json({ message: "Failed to create availability block" });
    }
  });

  app.patch('/api/availability/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const updateData = insertAvailabilityBlockSchema.partial().parse(req.body);
      const block = await storage.updateAvailabilityBlock(req.params.id, updateData);
      if (!block) {
        return res.status(404).json({ message: "Availability block not found" });
      }
      
      await logActivity(userId, {
        activityType: 'update',
        resourceType: 'availability',
        resourceId: block.id,
        resourceName: `Availability block`,
        description: 'Updated availability',
      }, req);
      
      res.json(block);
    } catch (error) {
      console.error("Error updating availability block:", error);
      res.status(500).json({ message: "Failed to update availability block" });
    }
  });

  app.delete('/api/availability/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.deleteAvailabilityBlock(req.params.id);
      
      await logActivity(userId, {
        activityType: 'delete',
        resourceType: 'availability',
        resourceId: req.params.id,
        resourceName: `Availability block`,
        description: 'Deleted availability block',
      }, req);
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting availability block:", error);
      res.status(500).json({ message: "Failed to delete availability block" });
    }
  });

  // Shift Swap Routes
  app.get('/api/shift-swaps', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const consultant = await storage.getConsultantByUserId(userId);
      if (!consultant) {
        return res.status(404).json({ message: "Consultant profile not found" });
      }
      const swapRequests = await storage.getSwapRequestsByConsultant(consultant.id);
      res.json(swapRequests);
    } catch (error) {
      console.error("Error fetching shift swap requests:", error);
      res.status(500).json({ message: "Failed to fetch shift swap requests" });
    }
  });

  app.get('/api/shift-swaps/:id', isAuthenticated, async (req, res) => {
    try {
      const swapRequest = await storage.getSwapRequestById(req.params.id);
      if (!swapRequest) {
        return res.status(404).json({ message: "Shift swap request not found" });
      }
      res.json(swapRequest);
    } catch (error) {
      console.error("Error fetching shift swap request:", error);
      res.status(500).json({ message: "Failed to fetch shift swap request" });
    }
  });

  app.post('/api/shift-swaps', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const consultant = await storage.getConsultantByUserId(userId);
      if (!consultant) {
        return res.status(404).json({ message: "Consultant profile not found" });
      }
      
      const validated = insertShiftSwapRequestSchema.parse({
        ...req.body,
        requesterId: consultant.id,
      });
      const swapRequest = await storage.createShiftSwapRequest(validated);
      
      await logActivity(userId, {
        activityType: 'create',
        resourceType: 'shift_swap',
        resourceId: swapRequest.id,
        resourceName: `Shift swap request`,
        description: 'Created shift swap request',
      }, req);
      
      if (validated.targetConsultantId) {
        const targetConsultant = await storage.getConsultant(validated.targetConsultantId);
        if (targetConsultant?.userId) {
          await storage.createNotification({
            userId: targetConsultant.userId,
            type: 'schedule',
            title: 'Shift Swap Request',
            message: 'You have received a shift swap request',
            link: `/shift-swaps/${swapRequest.id}`,
          });
        }
      }
      
      res.status(201).json(swapRequest);
    } catch (error) {
      console.error("Error creating shift swap request:", error);
      res.status(400).json({ message: "Failed to create shift swap request" });
    }
  });

  app.post('/api/shift-swaps/:id/approve', isAuthenticated, async (req: any, res) => {
    try {
      const responderId = req.user.claims.sub;
      const { notes } = req.body;
      const swapRequest = await storage.approveSwapRequest(req.params.id, responderId, notes);
      if (!swapRequest) {
        return res.status(404).json({ message: "Shift swap request not found" });
      }
      
      await logActivity(responderId, {
        activityType: 'update',
        resourceType: 'shift_swap',
        resourceId: swapRequest.id,
        resourceName: `Shift swap request`,
        description: 'Approved shift swap request',
      }, req);
      
      const requester = await storage.getConsultant(swapRequest.requesterId);
      if (requester?.userId) {
        await storage.createNotification({
          userId: requester.userId,
          type: 'success',
          title: 'Shift Swap Approved',
          message: 'Your shift swap request has been approved',
          link: `/shift-swaps/${swapRequest.id}`,
        });
      }
      
      res.json(swapRequest);
    } catch (error) {
      console.error("Error approving shift swap request:", error);
      res.status(500).json({ message: "Failed to approve shift swap request" });
    }
  });

  app.post('/api/shift-swaps/:id/reject', isAuthenticated, async (req: any, res) => {
    try {
      const responderId = req.user.claims.sub;
      const { notes } = req.body;
      const swapRequest = await storage.rejectSwapRequest(req.params.id, responderId, notes);
      if (!swapRequest) {
        return res.status(404).json({ message: "Shift swap request not found" });
      }
      
      await logActivity(responderId, {
        activityType: 'update',
        resourceType: 'shift_swap',
        resourceId: swapRequest.id,
        resourceName: `Shift swap request`,
        description: 'Rejected shift swap request',
      }, req);
      
      const requester = await storage.getConsultant(swapRequest.requesterId);
      if (requester?.userId) {
        await storage.createNotification({
          userId: requester.userId,
          type: 'warning',
          title: 'Shift Swap Rejected',
          message: 'Your shift swap request has been rejected',
          link: `/shift-swaps/${swapRequest.id}`,
        });
      }
      
      res.json(swapRequest);
    } catch (error) {
      console.error("Error rejecting shift swap request:", error);
      res.status(500).json({ message: "Failed to reject shift swap request" });
    }
  });

  app.post('/api/shift-swaps/:id/cancel', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const swapRequest = await storage.cancelSwapRequest(req.params.id);
      if (!swapRequest) {
        return res.status(404).json({ message: "Shift swap request not found" });
      }
      
      await logActivity(userId, {
        activityType: 'update',
        resourceType: 'shift_swap',
        resourceId: swapRequest.id,
        resourceName: `Shift swap request`,
        description: 'Cancelled shift swap request',
      }, req);
      
      res.json(swapRequest);
    } catch (error) {
      console.error("Error cancelling shift swap request:", error);
      res.status(500).json({ message: "Failed to cancel shift swap request" });
    }
  });

  app.get('/api/admin/shift-swaps/pending', isAuthenticated, requireRole('admin'), async (req, res) => {
    try {
      const pendingRequests = await storage.getPendingSwapRequests();
      res.json(pendingRequests);
    } catch (error) {
      console.error("Error fetching pending shift swap requests:", error);
      res.status(500).json({ message: "Failed to fetch pending shift swap requests" });
    }
  });

  // ============================================
  // PHASE 11: TRAINING & COMPETENCY ROUTES
  // ============================================

  // Course Routes
  app.post('/api/courses', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const validated = insertCourseSchema.parse({
        ...req.body,
        createdBy: userId,
      });
      const course = await storage.createCourse(validated);
      
      if (userId) {
        await logActivity(userId, {
          activityType: 'create',
          resourceType: 'course',
          resourceId: course.id,
          resourceName: validated.title,
          description: 'Created new training course',
        }, req);
      }
      
      res.status(201).json(course);
    } catch (error) {
      console.error("Error creating course:", error);
      res.status(400).json({ message: "Failed to create course" });
    }
  });

  app.get('/api/courses', isAuthenticated, async (req, res) => {
    try {
      const filters = {
        status: req.query.status as string,
        level: req.query.level as string,
        courseType: req.query.courseType as string,
        moduleId: req.query.moduleId as string,
      };
      const courses = await storage.getCourses(filters);
      res.json(courses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  });

  app.get('/api/courses/:id', isAuthenticated, async (req, res) => {
    try {
      const course = await storage.getCourseById(req.params.id);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      res.json(course);
    } catch (error) {
      console.error("Error fetching course:", error);
      res.status(500).json({ message: "Failed to fetch course" });
    }
  });

  app.patch('/api/courses/:id', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const course = await storage.updateCourse(req.params.id, req.body);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      if (userId) {
        await logActivity(userId, {
          activityType: 'update',
          resourceType: 'course',
          resourceId: course.id,
          resourceName: course.title,
          description: 'Updated training course',
        }, req);
      }
      
      res.json(course);
    } catch (error) {
      console.error("Error updating course:", error);
      res.status(500).json({ message: "Failed to update course" });
    }
  });

  app.delete('/api/courses/:id', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const courseId = req.params.id;
      
      const course = await storage.getCourseById(courseId);
      const courseName = course?.title || courseId;
      
      await storage.deleteCourse(courseId);
      
      if (userId) {
        await logActivity(userId, {
          activityType: 'delete',
          resourceType: 'course',
          resourceId: courseId,
          resourceName: courseName,
          description: 'Deleted training course',
        }, req);
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting course:", error);
      res.status(500).json({ message: "Failed to delete course" });
    }
  });

  // Course Module Routes
  app.post('/api/courses/:courseId/modules', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const validated = insertCourseModuleSchema.parse({
        ...req.body,
        courseId: req.params.courseId,
      });
      const courseModule = await storage.createCourseModule(validated);
      
      if (userId) {
        await logActivity(userId, {
          activityType: 'create',
          resourceType: 'course_module',
          resourceId: courseModule.id,
          resourceName: validated.title,
          description: 'Added module to course',
        }, req);
      }
      
      res.status(201).json(courseModule);
    } catch (error) {
      console.error("Error creating course module:", error);
      res.status(400).json({ message: "Failed to create course module" });
    }
  });

  app.get('/api/courses/:courseId/modules', isAuthenticated, async (req, res) => {
    try {
      const modules = await storage.getCourseModules(req.params.courseId);
      res.json(modules);
    } catch (error) {
      console.error("Error fetching course modules:", error);
      res.status(500).json({ message: "Failed to fetch course modules" });
    }
  });

  app.patch('/api/course-modules/:id', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const courseModule = await storage.updateCourseModule(req.params.id, req.body);
      if (!courseModule) {
        return res.status(404).json({ message: "Course module not found" });
      }
      
      if (userId) {
        await logActivity(userId, {
          activityType: 'update',
          resourceType: 'course_module',
          resourceId: courseModule.id,
          resourceName: courseModule.title,
          description: 'Updated course module',
        }, req);
      }
      
      res.json(courseModule);
    } catch (error) {
      console.error("Error updating course module:", error);
      res.status(500).json({ message: "Failed to update course module" });
    }
  });

  app.delete('/api/course-modules/:id', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      await storage.deleteCourseModule(req.params.id);
      
      if (userId) {
        await logActivity(userId, {
          activityType: 'delete',
          resourceType: 'course_module',
          resourceId: req.params.id,
          resourceName: 'Course module',
          description: 'Deleted course module',
        }, req);
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting course module:", error);
      res.status(500).json({ message: "Failed to delete course module" });
    }
  });

  // Enrollment Routes
  app.post('/api/courses/:courseId/enroll', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validated = insertCourseEnrollmentSchema.parse({
        courseId: req.params.courseId,
        userId: userId,
        status: 'enrolled',
      });
      const enrollment = await storage.enrollInCourse(validated);
      
      const course = await storage.getCourseById(req.params.courseId);
      
      await logActivity(userId, {
        activityType: 'create',
        resourceType: 'enrollment',
        resourceId: enrollment.id,
        resourceName: course?.title || req.params.courseId,
        description: 'Enrolled in course',
      }, req);
      
      await storage.createNotification({
        userId: userId,
        type: 'info',
        title: 'Course Enrollment',
        message: `You have been enrolled in ${course?.title || 'a course'}`,
        link: `/courses/${req.params.courseId}`,
      });
      
      res.status(201).json(enrollment);
    } catch (error) {
      console.error("Error enrolling in course:", error);
      res.status(400).json({ message: "Failed to enroll in course" });
    }
  });

  app.get('/api/my-enrollments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const enrollments = await storage.getEnrollmentsByUser(userId);
      res.json(enrollments);
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      res.status(500).json({ message: "Failed to fetch enrollments" });
    }
  });

  app.get('/api/courses/:courseId/enrollments', isAuthenticated, requireRole('admin'), async (req, res) => {
    try {
      const enrollments = await storage.getEnrollmentsByCourse(req.params.courseId);
      res.json(enrollments);
    } catch (error) {
      console.error("Error fetching course enrollments:", error);
      res.status(500).json({ message: "Failed to fetch course enrollments" });
    }
  });

  app.patch('/api/enrollments/:id/progress', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { progressPercent, status, ceCreditsEarned, certificateUrl } = req.body;
      
      const updateData: any = {};
      if (progressPercent !== undefined) updateData.progressPercent = progressPercent;
      if (status !== undefined) updateData.status = status;
      if (ceCreditsEarned !== undefined) updateData.ceCreditsEarned = ceCreditsEarned;
      if (certificateUrl !== undefined) updateData.certificateUrl = certificateUrl;
      if (status === 'completed') updateData.completedAt = new Date();
      if (status === 'in_progress' && !updateData.startedAt) updateData.startedAt = new Date();
      
      const enrollment = await storage.updateEnrollmentProgress(req.params.id, updateData);
      if (!enrollment) {
        return res.status(404).json({ message: "Enrollment not found" });
      }
      
      await logActivity(userId, {
        activityType: 'update',
        resourceType: 'enrollment',
        resourceId: enrollment.id,
        resourceName: 'Course progress',
        description: `Updated course progress to ${progressPercent || 0}%`,
      }, req);
      
      if (status === 'completed') {
        await storage.createNotification({
          userId: userId,
          type: 'success',
          title: 'Course Completed',
          message: 'Congratulations! You have completed the course',
          link: `/my-enrollments`,
        });
      }
      
      res.json(enrollment);
    } catch (error) {
      console.error("Error updating enrollment progress:", error);
      res.status(500).json({ message: "Failed to update enrollment progress" });
    }
  });

  app.post('/api/enrollments/:id/drop', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const enrollment = await storage.dropFromCourse(req.params.id);
      if (!enrollment) {
        return res.status(404).json({ message: "Enrollment not found" });
      }
      
      await logActivity(userId, {
        activityType: 'update',
        resourceType: 'enrollment',
        resourceId: enrollment.id,
        resourceName: 'Course enrollment',
        description: 'Dropped from course',
      }, req);
      
      res.json(enrollment);
    } catch (error) {
      console.error("Error dropping from course:", error);
      res.status(500).json({ message: "Failed to drop from course" });
    }
  });

  // Assessment Routes
  app.post('/api/assessments', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const validated = insertAssessmentSchema.parse(req.body);
      const assessment = await storage.createAssessment(validated);
      
      if (userId) {
        await logActivity(userId, {
          activityType: 'create',
          resourceType: 'assessment',
          resourceId: assessment.id,
          resourceName: validated.title,
          description: 'Created new assessment',
        }, req);
      }
      
      res.status(201).json(assessment);
    } catch (error) {
      console.error("Error creating assessment:", error);
      res.status(400).json({ message: "Failed to create assessment" });
    }
  });

  app.get('/api/assessments/:id', isAuthenticated, async (req, res) => {
    try {
      const assessment = await storage.getAssessmentById(req.params.id);
      if (!assessment) {
        return res.status(404).json({ message: "Assessment not found" });
      }
      res.json(assessment);
    } catch (error) {
      console.error("Error fetching assessment:", error);
      res.status(500).json({ message: "Failed to fetch assessment" });
    }
  });

  app.get('/api/courses/:courseId/assessments', isAuthenticated, async (req, res) => {
    try {
      const assessments = await storage.getAssessmentsByCourse(req.params.courseId);
      res.json(assessments);
    } catch (error) {
      console.error("Error fetching course assessments:", error);
      res.status(500).json({ message: "Failed to fetch course assessments" });
    }
  });

  app.patch('/api/assessments/:id', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const assessment = await storage.updateAssessment(req.params.id, req.body);
      if (!assessment) {
        return res.status(404).json({ message: "Assessment not found" });
      }
      
      if (userId) {
        await logActivity(userId, {
          activityType: 'update',
          resourceType: 'assessment',
          resourceId: assessment.id,
          resourceName: assessment.title,
          description: 'Updated assessment',
        }, req);
      }
      
      res.json(assessment);
    } catch (error) {
      console.error("Error updating assessment:", error);
      res.status(500).json({ message: "Failed to update assessment" });
    }
  });

  app.delete('/api/assessments/:id', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const assessmentId = req.params.id;
      
      const assessment = await storage.getAssessmentById(assessmentId);
      const assessmentName = assessment?.title || assessmentId;
      
      await storage.deleteAssessment(assessmentId);
      
      if (userId) {
        await logActivity(userId, {
          activityType: 'delete',
          resourceType: 'assessment',
          resourceId: assessmentId,
          resourceName: assessmentName,
          description: 'Deleted assessment',
        }, req);
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting assessment:", error);
      res.status(500).json({ message: "Failed to delete assessment" });
    }
  });

  // Assessment Question Routes
  app.post('/api/assessments/:assessmentId/questions', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const validated = insertAssessmentQuestionSchema.parse({
        ...req.body,
        assessmentId: req.params.assessmentId,
      });
      const question = await storage.createAssessmentQuestion(validated);
      
      if (userId) {
        await logActivity(userId, {
          activityType: 'create',
          resourceType: 'assessment_question',
          resourceId: question.id,
          resourceName: 'Assessment question',
          description: 'Added question to assessment',
        }, req);
      }
      
      res.status(201).json(question);
    } catch (error) {
      console.error("Error creating assessment question:", error);
      res.status(400).json({ message: "Failed to create assessment question" });
    }
  });

  app.get('/api/assessments/:assessmentId/questions', isAuthenticated, async (req, res) => {
    try {
      const questions = await storage.getAssessmentQuestions(req.params.assessmentId);
      res.json(questions);
    } catch (error) {
      console.error("Error fetching assessment questions:", error);
      res.status(500).json({ message: "Failed to fetch assessment questions" });
    }
  });

  app.patch('/api/assessment-questions/:id', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const question = await storage.updateAssessmentQuestion(req.params.id, req.body);
      if (!question) {
        return res.status(404).json({ message: "Assessment question not found" });
      }
      
      if (userId) {
        await logActivity(userId, {
          activityType: 'update',
          resourceType: 'assessment_question',
          resourceId: question.id,
          resourceName: 'Assessment question',
          description: 'Updated assessment question',
        }, req);
      }
      
      res.json(question);
    } catch (error) {
      console.error("Error updating assessment question:", error);
      res.status(500).json({ message: "Failed to update assessment question" });
    }
  });

  app.delete('/api/assessment-questions/:id', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      await storage.deleteAssessmentQuestion(req.params.id);
      
      if (userId) {
        await logActivity(userId, {
          activityType: 'delete',
          resourceType: 'assessment_question',
          resourceId: req.params.id,
          resourceName: 'Assessment question',
          description: 'Deleted assessment question',
        }, req);
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting assessment question:", error);
      res.status(500).json({ message: "Failed to delete assessment question" });
    }
  });

  // Assessment Attempt Routes
  app.post('/api/assessments/:assessmentId/attempts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const assessmentId = req.params.assessmentId;
      
      const assessment = await storage.getAssessmentById(assessmentId);
      if (!assessment) {
        return res.status(404).json({ message: "Assessment not found" });
      }
      
      const attemptCount = await storage.getAttemptCount(userId, assessmentId);
      if (assessment.maxAttempts && attemptCount >= assessment.maxAttempts) {
        return res.status(400).json({ message: "Maximum attempts reached" });
      }
      
      const validated = insertAssessmentAttemptSchema.parse({
        assessmentId: assessmentId,
        userId: userId,
        attemptNumber: attemptCount + 1,
      });
      const attempt = await storage.startAssessmentAttempt(validated);
      
      await logActivity(userId, {
        activityType: 'create',
        resourceType: 'assessment_attempt',
        resourceId: attempt.id,
        resourceName: assessment.title,
        description: `Started assessment attempt ${attemptCount + 1}`,
      }, req);
      
      res.status(201).json(attempt);
    } catch (error) {
      console.error("Error starting assessment attempt:", error);
      res.status(400).json({ message: "Failed to start assessment attempt" });
    }
  });

  app.post('/api/assessment-attempts/:id/submit', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { answers, score, passed } = req.body;
      
      const attempt = await storage.submitAssessmentAttempt(req.params.id, answers, score, passed);
      if (!attempt) {
        return res.status(404).json({ message: "Assessment attempt not found" });
      }
      
      await logActivity(userId, {
        activityType: 'update',
        resourceType: 'assessment_attempt',
        resourceId: attempt.id,
        resourceName: 'Assessment attempt',
        description: `Submitted assessment - Score: ${score}%, Passed: ${passed}`,
      }, req);
      
      if (passed) {
        await storage.createNotification({
          userId: userId,
          type: 'success',
          title: 'Assessment Passed',
          message: `Congratulations! You passed with a score of ${score}%`,
          link: `/my-attempts`,
        });
      } else {
        await storage.createNotification({
          userId: userId,
          type: 'warning',
          title: 'Assessment Not Passed',
          message: `Your score was ${score}%. Please review and try again.`,
          link: `/my-attempts`,
        });
      }
      
      res.json(attempt);
    } catch (error) {
      console.error("Error submitting assessment attempt:", error);
      res.status(500).json({ message: "Failed to submit assessment attempt" });
    }
  });

  app.get('/api/my-attempts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const attempts = await storage.getAttemptsByUser(userId);
      res.json(attempts);
    } catch (error) {
      console.error("Error fetching attempts:", error);
      res.status(500).json({ message: "Failed to fetch attempts" });
    }
  });

  app.get('/api/assessments/:assessmentId/attempts', isAuthenticated, requireRole('admin'), async (req, res) => {
    try {
      const attempts = await storage.getAttemptsByAssessment(req.params.assessmentId);
      res.json(attempts);
    } catch (error) {
      console.error("Error fetching assessment attempts:", error);
      res.status(500).json({ message: "Failed to fetch assessment attempts" });
    }
  });

  // Login Lab Routes
  app.post('/api/login-labs', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin' && user?.role !== 'hospital_staff') {
        return res.status(403).json({ message: "Forbidden: Only admins and hospital staff can create login labs" });
      }
      
      const validated = insertLoginLabSchema.parse({
        ...req.body,
        facilitatorId: req.body.facilitatorId || userId,
      });
      const loginLab = await storage.createLoginLab(validated);
      
      await logActivity(userId, {
        activityType: 'create',
        resourceType: 'login_lab',
        resourceId: loginLab.id,
        resourceName: validated.title,
        description: 'Created login lab session',
      }, req);
      
      res.status(201).json(loginLab);
    } catch (error) {
      console.error("Error creating login lab:", error);
      res.status(400).json({ message: "Failed to create login lab" });
    }
  });

  app.get('/api/login-labs', isAuthenticated, async (req, res) => {
    try {
      const filters = {
        projectId: req.query.projectId as string,
        hospitalId: req.query.hospitalId as string,
        status: req.query.status as string,
      };
      const loginLabs = await storage.getLoginLabs(filters);
      res.json(loginLabs);
    } catch (error) {
      console.error("Error fetching login labs:", error);
      res.status(500).json({ message: "Failed to fetch login labs" });
    }
  });

  app.get('/api/login-labs/:id', isAuthenticated, async (req, res) => {
    try {
      const loginLab = await storage.getLoginLabById(req.params.id);
      if (!loginLab) {
        return res.status(404).json({ message: "Login lab not found" });
      }
      res.json(loginLab);
    } catch (error) {
      console.error("Error fetching login lab:", error);
      res.status(500).json({ message: "Failed to fetch login lab" });
    }
  });

  app.patch('/api/login-labs/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin' && user?.role !== 'hospital_staff') {
        return res.status(403).json({ message: "Forbidden: Only admins and hospital staff can update login labs" });
      }
      
      const loginLab = await storage.updateLoginLab(req.params.id, req.body);
      if (!loginLab) {
        return res.status(404).json({ message: "Login lab not found" });
      }
      
      await logActivity(userId, {
        activityType: 'update',
        resourceType: 'login_lab',
        resourceId: loginLab.id,
        resourceName: loginLab.title,
        description: 'Updated login lab session',
      }, req);
      
      res.json(loginLab);
    } catch (error) {
      console.error("Error updating login lab:", error);
      res.status(500).json({ message: "Failed to update login lab" });
    }
  });

  app.delete('/api/login-labs/:id', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const labId = req.params.id;
      
      const loginLab = await storage.getLoginLabById(labId);
      const labName = loginLab?.title || labId;
      
      await storage.deleteLoginLab(labId);
      
      if (userId) {
        await logActivity(userId, {
          activityType: 'delete',
          resourceType: 'login_lab',
          resourceId: labId,
          resourceName: labName,
          description: 'Deleted login lab session',
        }, req);
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting login lab:", error);
      res.status(500).json({ message: "Failed to delete login lab" });
    }
  });

  // Login Lab Participant Routes
  app.post('/api/login-labs/:labId/participants', isAuthenticated, async (req: any, res) => {
    try {
      const currentUserId = req.user?.claims?.sub;
      const validated = insertLoginLabParticipantSchema.parse({
        ...req.body,
        loginLabId: req.params.labId,
      });
      const participant = await storage.addParticipantToLab(validated);
      
      const loginLab = await storage.getLoginLabById(req.params.labId);
      
      await logActivity(currentUserId, {
        activityType: 'create',
        resourceType: 'login_lab_participant',
        resourceId: participant.id,
        resourceName: loginLab?.title || 'Login lab',
        description: 'Added participant to login lab',
      }, req);
      
      await storage.createNotification({
        userId: validated.userId,
        type: 'info',
        title: 'Login Lab Registration',
        message: `You have been registered for ${loginLab?.title || 'a login lab session'}`,
        link: `/login-labs/${req.params.labId}`,
      });
      
      res.status(201).json(participant);
    } catch (error) {
      console.error("Error adding participant to login lab:", error);
      res.status(400).json({ message: "Failed to add participant to login lab" });
    }
  });

  app.get('/api/login-labs/:labId/participants', isAuthenticated, async (req, res) => {
    try {
      const participants = await storage.getLabParticipants(req.params.labId);
      res.json(participants);
    } catch (error) {
      console.error("Error fetching login lab participants:", error);
      res.status(500).json({ message: "Failed to fetch login lab participants" });
    }
  });

  app.post('/api/login-lab-participants/:id/validate', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const participant = await storage.validateParticipantAccess(req.params.id);
      if (!participant) {
        return res.status(404).json({ message: "Participant not found" });
      }
      
      await logActivity(userId, {
        activityType: 'update',
        resourceType: 'login_lab_participant',
        resourceId: participant.id,
        resourceName: 'Lab participant',
        description: 'Validated participant access',
      }, req);
      
      await storage.createNotification({
        userId: participant.userId,
        type: 'success',
        title: 'Access Validated',
        message: 'Your login lab access has been validated',
        link: `/login-labs/${participant.loginLabId}`,
      });
      
      res.json(participant);
    } catch (error) {
      console.error("Error validating participant access:", error);
      res.status(500).json({ message: "Failed to validate participant access" });
    }
  });

  app.post('/api/login-lab-participants/:id/complete', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { customizationNotes } = req.body;
      const participant = await storage.completeParticipantLab(req.params.id, customizationNotes);
      if (!participant) {
        return res.status(404).json({ message: "Participant not found" });
      }
      
      await logActivity(userId, {
        activityType: 'update',
        resourceType: 'login_lab_participant',
        resourceId: participant.id,
        resourceName: 'Lab participant',
        description: 'Marked participant as completed',
      }, req);
      
      await storage.createNotification({
        userId: participant.userId,
        type: 'success',
        title: 'Login Lab Completed',
        message: 'You have completed the login lab session',
        link: `/login-labs/${participant.loginLabId}`,
      });
      
      res.json(participant);
    } catch (error) {
      console.error("Error completing participant lab:", error);
      res.status(500).json({ message: "Failed to complete participant lab" });
    }
  });

  // Knowledge Base Routes
  app.post('/api/knowledge-articles', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const validated = insertKnowledgeArticleSchema.parse({
        ...req.body,
        authorId: userId,
      });
      const article = await storage.createKnowledgeArticle(validated);
      
      if (userId) {
        await logActivity(userId, {
          activityType: 'create',
          resourceType: 'knowledge_article',
          resourceId: article.id,
          resourceName: validated.title,
          description: 'Created knowledge base article',
        }, req);
      }
      
      res.status(201).json(article);
    } catch (error) {
      console.error("Error creating knowledge article:", error);
      res.status(400).json({ message: "Failed to create knowledge article" });
    }
  });

  app.get('/api/knowledge-articles', isAuthenticated, async (req, res) => {
    try {
      const query = req.query.query as string || '';
      const filters = {
        category: req.query.category as string,
        moduleId: req.query.moduleId as string,
        status: req.query.status as string,
      };
      const articles = await storage.searchArticles(query, filters);
      res.json(articles);
    } catch (error) {
      console.error("Error fetching knowledge articles:", error);
      res.status(500).json({ message: "Failed to fetch knowledge articles" });
    }
  });

  app.get('/api/knowledge-articles/:id', isAuthenticated, async (req, res) => {
    try {
      const article = await storage.getArticleById(req.params.id);
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }
      
      await storage.incrementArticleViews(req.params.id);
      
      res.json(article);
    } catch (error) {
      console.error("Error fetching knowledge article:", error);
      res.status(500).json({ message: "Failed to fetch knowledge article" });
    }
  });

  app.patch('/api/knowledge-articles/:id', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const article = await storage.updateArticle(req.params.id, req.body);
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }
      
      if (userId) {
        await logActivity(userId, {
          activityType: 'update',
          resourceType: 'knowledge_article',
          resourceId: article.id,
          resourceName: article.title,
          description: 'Updated knowledge base article',
        }, req);
      }
      
      res.json(article);
    } catch (error) {
      console.error("Error updating knowledge article:", error);
      res.status(500).json({ message: "Failed to update knowledge article" });
    }
  });

  app.delete('/api/knowledge-articles/:id', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const articleId = req.params.id;
      
      const article = await storage.getArticleById(articleId);
      const articleName = article?.title || articleId;
      
      await storage.deleteArticle(articleId);
      
      if (userId) {
        await logActivity(userId, {
          activityType: 'delete',
          resourceType: 'knowledge_article',
          resourceId: articleId,
          resourceName: articleName,
          description: 'Deleted knowledge base article',
        }, req);
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting knowledge article:", error);
      res.status(500).json({ message: "Failed to delete knowledge article" });
    }
  });

  // Training Analytics Route
  app.get('/api/training/analytics', isAuthenticated, requireRole('admin'), async (req, res) => {
    try {
      const analytics = await storage.getTrainingAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching training analytics:", error);
      res.status(500).json({ message: "Failed to fetch training analytics" });
    }
  });

  // ============================================
  // PHASE 12: TICKETING & SUPPORT ROUTES
  // ============================================

  // EOD Report Routes
  app.post('/api/eod-reports', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validated = insertEodReportSchema.parse({
        ...req.body,
        submittedById: userId,
      });
      const report = await storage.createEodReport(validated);
      
      await logActivity(userId, {
        activityType: 'create',
        resourceType: 'eod_report',
        resourceId: report.id,
        resourceName: `EOD Report - ${validated.reportDate}`,
        description: 'Created end of day report',
      }, req);
      
      res.status(201).json(report);
    } catch (error) {
      console.error("Error creating EOD report:", error);
      res.status(400).json({ message: "Failed to create EOD report" });
    }
  });

  app.get('/api/eod-reports', isAuthenticated, async (req, res) => {
    try {
      const projectId = req.query.projectId as string;
      const reports = await storage.getEodReportsWithDetails(projectId);
      res.json(reports);
    } catch (error) {
      console.error("Error fetching EOD reports:", error);
      res.status(500).json({ message: "Failed to fetch EOD reports" });
    }
  });

  app.get('/api/eod-reports/:id', isAuthenticated, async (req, res) => {
    try {
      const report = await storage.getEodReportWithDetails(req.params.id);
      if (!report) {
        return res.status(404).json({ message: "EOD report not found" });
      }
      res.json(report);
    } catch (error) {
      console.error("Error fetching EOD report:", error);
      res.status(500).json({ message: "Failed to fetch EOD report" });
    }
  });

  app.patch('/api/eod-reports/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const report = await storage.updateEodReport(req.params.id, req.body);
      if (!report) {
        return res.status(404).json({ message: "EOD report not found" });
      }
      
      if (userId) {
        await logActivity(userId, {
          activityType: 'update',
          resourceType: 'eod_report',
          resourceId: report.id,
          resourceName: `EOD Report - ${report.reportDate}`,
          description: 'Updated end of day report',
        }, req);
      }
      
      res.json(report);
    } catch (error) {
      console.error("Error updating EOD report:", error);
      res.status(500).json({ message: "Failed to update EOD report" });
    }
  });

  app.post('/api/eod-reports/:id/submit', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const report = await storage.submitEodReport(req.params.id);
      if (!report) {
        return res.status(404).json({ message: "EOD report not found" });
      }
      
      if (userId) {
        await logActivity(userId, {
          activityType: 'update',
          resourceType: 'eod_report',
          resourceId: report.id,
          resourceName: `EOD Report - ${report.reportDate}`,
          description: 'Submitted end of day report',
        }, req);
        
        const admins = await storage.getAllAdminUsers?.() || [];
        for (const admin of admins) {
          await storage.createNotification({
            userId: admin.id,
            type: 'info',
            title: 'EOD Report Submitted',
            message: `A new EOD report for ${report.reportDate} is pending approval`,
            link: `/eod-reports/${report.id}`,
          });
        }
      }
      
      res.json(report);
    } catch (error) {
      console.error("Error submitting EOD report:", error);
      res.status(500).json({ message: "Failed to submit EOD report" });
    }
  });

  app.post('/api/eod-reports/:id/approve', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const report = await storage.approveEodReport(req.params.id, userId);
      if (!report) {
        return res.status(404).json({ message: "EOD report not found" });
      }
      
      await logActivity(userId, {
        activityType: 'update',
        resourceType: 'eod_report',
        resourceId: report.id,
        resourceName: `EOD Report - ${report.reportDate}`,
        description: 'Approved end of day report',
      }, req);
      
      await storage.createNotification({
        userId: report.submittedById,
        type: 'success',
        title: 'EOD Report Approved',
        message: `Your EOD report for ${report.reportDate} has been approved`,
        link: `/eod-reports/${report.id}`,
      });
      
      res.json(report);
    } catch (error) {
      console.error("Error approving EOD report:", error);
      res.status(500).json({ message: "Failed to approve EOD report" });
    }
  });

  app.post('/api/eod-reports/:id/reject', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const report = await storage.rejectEodReport(req.params.id);
      if (!report) {
        return res.status(404).json({ message: "EOD report not found" });
      }
      
      await logActivity(userId, {
        activityType: 'update',
        resourceType: 'eod_report',
        resourceId: report.id,
        resourceName: `EOD Report - ${report.reportDate}`,
        description: 'Rejected end of day report',
      }, req);
      
      await storage.createNotification({
        userId: report.submittedById,
        type: 'warning',
        title: 'EOD Report Rejected',
        message: `Your EOD report for ${report.reportDate} was rejected. Please review and resubmit.`,
        link: `/eod-reports/${report.id}`,
      });
      
      res.json(report);
    } catch (error) {
      console.error("Error rejecting EOD report:", error);
      res.status(500).json({ message: "Failed to reject EOD report" });
    }
  });

  app.delete('/api/eod-reports/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      await storage.deleteEodReport(req.params.id);
      
      if (userId) {
        await logActivity(userId, {
          activityType: 'delete',
          resourceType: 'eod_report',
          resourceId: req.params.id,
          resourceName: 'EOD Report',
          description: 'Deleted end of day report',
        }, req);
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting EOD report:", error);
      res.status(500).json({ message: "Failed to delete EOD report" });
    }
  });

  app.get('/api/eod-reports/analytics', isAuthenticated, requireRole('admin'), async (req, res) => {
    try {
      const analytics = await storage.getEodReportAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching EOD report analytics:", error);
      res.status(500).json({ message: "Failed to fetch EOD report analytics" });
    }
  });

  app.get('/api/projects/:projectId/eod-reports/auto-populate', isAuthenticated, async (req, res) => {
    try {
      const date = req.query.date as string || new Date().toISOString().split('T')[0];
      const autoPopulated = await storage.autoPopulateEodReport(req.params.projectId, date);
      res.json(autoPopulated);
    } catch (error) {
      console.error("Error auto-populating EOD report:", error);
      res.status(500).json({ message: "Failed to auto-populate EOD report" });
    }
  });

  // Escalation Rules Routes
  app.post('/api/escalation-rules', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validated = insertEscalationRuleSchema.parse({
        ...req.body,
        createdBy: userId,
      });
      const rule = await storage.createEscalationRule(validated);
      
      await logActivity(userId, {
        activityType: 'create',
        resourceType: 'escalation_rule',
        resourceId: rule.id,
        resourceName: validated.name,
        description: 'Created escalation rule',
      }, req);
      
      res.status(201).json(rule);
    } catch (error) {
      console.error("Error creating escalation rule:", error);
      res.status(400).json({ message: "Failed to create escalation rule" });
    }
  });

  app.get('/api/escalation-rules', isAuthenticated, async (req, res) => {
    try {
      const projectId = req.query.projectId as string;
      const rules = await storage.getEscalationRules(projectId);
      res.json(rules);
    } catch (error) {
      console.error("Error fetching escalation rules:", error);
      res.status(500).json({ message: "Failed to fetch escalation rules" });
    }
  });

  app.get('/api/escalation-rules/:id', isAuthenticated, async (req, res) => {
    try {
      const rule = await storage.getEscalationRule(req.params.id);
      if (!rule) {
        return res.status(404).json({ message: "Escalation rule not found" });
      }
      res.json(rule);
    } catch (error) {
      console.error("Error fetching escalation rule:", error);
      res.status(500).json({ message: "Failed to fetch escalation rule" });
    }
  });

  app.patch('/api/escalation-rules/:id', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const rule = await storage.updateEscalationRule(req.params.id, req.body);
      if (!rule) {
        return res.status(404).json({ message: "Escalation rule not found" });
      }
      
      if (userId) {
        await logActivity(userId, {
          activityType: 'update',
          resourceType: 'escalation_rule',
          resourceId: rule.id,
          resourceName: rule.name,
          description: 'Updated escalation rule',
        }, req);
      }
      
      res.json(rule);
    } catch (error) {
      console.error("Error updating escalation rule:", error);
      res.status(500).json({ message: "Failed to update escalation rule" });
    }
  });

  app.delete('/api/escalation-rules/:id', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      await storage.deleteEscalationRule(req.params.id);
      
      if (userId) {
        await logActivity(userId, {
          activityType: 'delete',
          resourceType: 'escalation_rule',
          resourceId: req.params.id,
          resourceName: 'Escalation rule',
          description: 'Deleted escalation rule',
        }, req);
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting escalation rule:", error);
      res.status(500).json({ message: "Failed to delete escalation rule" });
    }
  });

  // Ticket History Routes
  app.get('/api/support-tickets/:ticketId/history', isAuthenticated, async (req, res) => {
    try {
      const history = await storage.getTicketHistory(req.params.ticketId);
      res.json(history);
    } catch (error) {
      console.error("Error fetching ticket history:", error);
      res.status(500).json({ message: "Failed to fetch ticket history" });
    }
  });

  app.get('/api/support-tickets/:id/full', isAuthenticated, async (req, res) => {
    try {
      const ticket = await storage.getSupportTicketWithHistory(req.params.id);
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }
      res.json(ticket);
    } catch (error) {
      console.error("Error fetching ticket with history:", error);
      res.status(500).json({ message: "Failed to fetch ticket with history" });
    }
  });

  // Ticket Comments Routes
  app.post('/api/support-tickets/:ticketId/comments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validated = insertTicketCommentSchema.parse({
        ...req.body,
        ticketId: req.params.ticketId,
        authorId: userId,
      });
      const comment = await storage.createTicketComment(validated);
      
      await storage.createTicketHistory({
        ticketId: req.params.ticketId,
        action: 'commented',
        performedById: userId,
        comment: req.body.content?.substring(0, 100),
      });
      
      await logActivity(userId, {
        activityType: 'create',
        resourceType: 'ticket_comment',
        resourceId: comment.id,
        resourceName: `Comment on ticket`,
        description: 'Added comment to support ticket',
      }, req);
      
      res.status(201).json(comment);
    } catch (error) {
      console.error("Error creating ticket comment:", error);
      res.status(400).json({ message: "Failed to create ticket comment" });
    }
  });

  app.get('/api/support-tickets/:ticketId/comments', isAuthenticated, async (req, res) => {
    try {
      const comments = await storage.getTicketComments(req.params.ticketId);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching ticket comments:", error);
      res.status(500).json({ message: "Failed to fetch ticket comments" });
    }
  });

  app.patch('/api/ticket-comments/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const comment = await storage.updateTicketComment(req.params.id, req.body);
      if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
      }
      
      if (userId) {
        await logActivity(userId, {
          activityType: 'update',
          resourceType: 'ticket_comment',
          resourceId: comment.id,
          resourceName: 'Ticket comment',
          description: 'Updated ticket comment',
        }, req);
      }
      
      res.json(comment);
    } catch (error) {
      console.error("Error updating ticket comment:", error);
      res.status(500).json({ message: "Failed to update ticket comment" });
    }
  });

  app.delete('/api/ticket-comments/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      await storage.deleteTicketComment(req.params.id);
      
      if (userId) {
        await logActivity(userId, {
          activityType: 'delete',
          resourceType: 'ticket_comment',
          resourceId: req.params.id,
          resourceName: 'Ticket comment',
          description: 'Deleted ticket comment',
        }, req);
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting ticket comment:", error);
      res.status(500).json({ message: "Failed to delete ticket comment" });
    }
  });

  // Data Retention Policy Routes
  app.post('/api/data-retention-policies', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validated = insertDataRetentionPolicySchema.parse({
        ...req.body,
        createdBy: userId,
      });
      const policy = await storage.createDataRetentionPolicy(validated);
      
      await logActivity(userId, {
        activityType: 'create',
        resourceType: 'data_retention_policy',
        resourceId: policy.id,
        resourceName: `Retention policy - ${validated.entityType}`,
        description: 'Created data retention policy',
      }, req);
      
      res.status(201).json(policy);
    } catch (error) {
      console.error("Error creating data retention policy:", error);
      res.status(400).json({ message: "Failed to create data retention policy" });
    }
  });

  app.get('/api/data-retention-policies', isAuthenticated, requireRole('admin'), async (req, res) => {
    try {
      const policies = await storage.getDataRetentionPolicies();
      res.json(policies);
    } catch (error) {
      console.error("Error fetching data retention policies:", error);
      res.status(500).json({ message: "Failed to fetch data retention policies" });
    }
  });

  app.get('/api/data-retention-policies/:id', isAuthenticated, requireRole('admin'), async (req, res) => {
    try {
      const policy = await storage.getDataRetentionPolicy(req.params.id);
      if (!policy) {
        return res.status(404).json({ message: "Data retention policy not found" });
      }
      res.json(policy);
    } catch (error) {
      console.error("Error fetching data retention policy:", error);
      res.status(500).json({ message: "Failed to fetch data retention policy" });
    }
  });

  app.patch('/api/data-retention-policies/:id', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const policy = await storage.updateDataRetentionPolicy(req.params.id, req.body);
      if (!policy) {
        return res.status(404).json({ message: "Data retention policy not found" });
      }
      
      if (userId) {
        await logActivity(userId, {
          activityType: 'update',
          resourceType: 'data_retention_policy',
          resourceId: policy.id,
          resourceName: `Retention policy - ${policy.entityType}`,
          description: 'Updated data retention policy',
        }, req);
      }
      
      res.json(policy);
    } catch (error) {
      console.error("Error updating data retention policy:", error);
      res.status(500).json({ message: "Failed to update data retention policy" });
    }
  });

  app.delete('/api/data-retention-policies/:id', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      await storage.deleteDataRetentionPolicy(req.params.id);
      
      if (userId) {
        await logActivity(userId, {
          activityType: 'delete',
          resourceType: 'data_retention_policy',
          resourceId: req.params.id,
          resourceName: 'Data retention policy',
          description: 'Deleted data retention policy',
        }, req);
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting data retention policy:", error);
      res.status(500).json({ message: "Failed to delete data retention policy" });
    }
  });

  return httpServer;
}
