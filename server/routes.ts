import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, requireRole, optionalAuth } from "./replitAuth";
import {
  ObjectStorageService,
  ObjectNotFoundError,
} from "./objectStorage";
import { ObjectPermission } from "./objectAcl";
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
} from "@shared/schema";

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

  app.post('/api/hospitals', isAuthenticated, requireRole('admin'), async (req, res) => {
    try {
      const validated = insertHospitalSchema.parse(req.body);
      const hospital = await storage.createHospital(validated);
      res.status(201).json(hospital);
    } catch (error) {
      console.error("Error creating hospital:", error);
      res.status(400).json({ message: "Failed to create hospital" });
    }
  });

  app.patch('/api/hospitals/:id', isAuthenticated, requireRole('admin'), async (req, res) => {
    try {
      const hospital = await storage.updateHospital(req.params.id, req.body);
      if (!hospital) {
        return res.status(404).json({ message: "Hospital not found" });
      }
      res.json(hospital);
    } catch (error) {
      console.error("Error updating hospital:", error);
      res.status(500).json({ message: "Failed to update hospital" });
    }
  });

  app.delete('/api/hospitals/:id', isAuthenticated, requireRole('admin'), async (req, res) => {
    try {
      await storage.deleteHospital(req.params.id);
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
      const validated = insertConsultantSchema.parse({
        ...req.body,
        userId: req.body.userId || req.user.claims.sub,
      });
      const consultant = await storage.createConsultant(validated);
      res.status(201).json(consultant);
    } catch (error) {
      console.error("Error creating consultant:", error);
      res.status(400).json({ message: "Failed to create consultant" });
    }
  });

  app.patch('/api/consultants/:id', isAuthenticated, async (req, res) => {
    try {
      const consultant = await storage.updateConsultant(req.params.id, req.body);
      if (!consultant) {
        return res.status(404).json({ message: "Consultant not found" });
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

  app.post('/api/consultants/:consultantId/documents', isAuthenticated, async (req, res) => {
    try {
      const validated = insertConsultantDocumentSchema.parse({
        ...req.body,
        consultantId: req.params.consultantId,
      });
      const document = await storage.createConsultantDocument(validated);
      res.status(201).json(document);
    } catch (error) {
      console.error("Error creating document:", error);
      res.status(400).json({ message: "Failed to create document" });
    }
  });

  app.patch('/api/documents/:id/status', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      const { status, notes } = req.body;
      const document = await storage.updateDocumentStatus(
        req.params.id,
        status,
        req.user.claims.sub,
        notes
      );
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
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
      const validated = insertProjectSchema.parse({
        ...req.body,
        createdBy: req.user.claims.sub,
      });
      const project = await storage.createProject(validated);
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

  return httpServer;
}
