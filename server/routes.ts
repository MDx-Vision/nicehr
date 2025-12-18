import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, requireRole, requirePermission, requireAnyPermission, optionalAuth } from "./replitAuth";
import {
  ObjectStorageService,
  ObjectNotFoundError,
} from "./objectStorage";
import { ObjectPermission } from "./objectAcl";
import { logActivity } from "./activityLogger";
import { sendInvitationEmail } from "./emailService";
import { broadcastNotificationUpdate } from "./websocket";
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
  insertPhaseStepSchema,
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
  insertPerDiemPolicySchema,
  insertMileageRateSchema,
  insertExpenseSchema,
  insertInvoiceTemplateSchema,
  insertInvoiceSchema,
  insertInvoiceLineItemSchema,
  insertPayRateSchema,
  insertPayrollBatchSchema,
  insertPayrollEntrySchema,
  insertPaycheckStubSchema,
  insertBudgetScenarioSchema,
  insertScenarioMetricSchema,
  insertTravelPreferenceSchema,
  insertTravelBookingSchema,
  insertTravelItinerarySchema,
  insertItineraryBookingSchema,
  insertCarpoolGroupSchema,
  insertCarpoolMemberSchema,
  insertShuttleScheduleSchema,
  insertTransportationContactSchema,
  insertConsultantScorecardSchema,
  insertPulseSurveySchema,
  insertPulseResponseSchema,
  insertNpsResponseSchema,
  insertIncidentSchema,
  insertCorrectiveActionSchema,
  insertAchievementBadgeSchema,
  insertConsultantBadgeSchema,
  insertPointTransactionSchema,
  insertReferralSchema,
  insertComplianceCheckSchema,
  insertComplianceAuditSchema,
  insertContractTemplateSchema,
  insertContractSchema,
  insertContractSignerSchema,
  insertContractSignatureSchema,
  insertContractAuditEventSchema,
  insertChatChannelSchema,
  insertChannelMemberSchema,
  insertChatMessageSchema,
  insertShiftChatSummarySchema,
  insertIdentityVerificationSchema,
  insertIdentityDocumentSchema,
  insertVerificationEventSchema,
  insertFraudFlagSchema,
  insertReportTemplateSchema,
  insertSavedReportSchema,
  insertScheduledReportSchema,
  insertReportRunSchema,
  insertExportLogSchema,
  insertExecutiveDashboardSchema,
  insertDashboardWidgetSchema,
  insertKpiDefinitionSchema,
  insertKpiSnapshotSchema,
  insertRaciAssignmentSchema,
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

  // Seed RBAC roles and permissions at startup
  try {
    await storage.seedBaseRolesAndPermissions();
    console.log("RBAC roles and permissions seeded successfully");
  } catch (error) {
    console.error("Error seeding RBAC:", error);
  }
  // Seed test data in CI mode
  if (process.env.CI === "true") {
    try {
      // 1. Seed test user
      await storage.upsertUser({
        id: "ci-test-user",
        email: "test@example.com",
        firstName: "Test",
        lastName: "User",
        role: "admin",
      });
      console.log("[CI MODE] Test user seeded successfully");

      // 2. Seed test hospital
      const existingHospital = await storage.getHospital("ci-test-hospital");
      if (!existingHospital) {
        await storage.createHospital({
          id: "ci-test-hospital",
          name: "CI Test Hospital",
          location: "Test City, TC",
          contactEmail: "hospital@example.com",
          contactPhone: "555-0100",
          status: "active",
        });
        console.log("[CI MODE] Test hospital seeded successfully");
      }

      // 3. Seed test consultant
      const existingConsultant = await storage.getConsultant("ci-test-consultant");
      if (!existingConsultant) {
        await storage.createConsultant({
          id: "ci-test-consultant",
          userId: "ci-test-user",
          firstName: "Test",
          lastName: "Consultant",
          email: "consultant@example.com",
          phone: "555-0101",
          specialty: "General",
          status: "active",
          availabilityStatus: "available",
          hourlyRate: "150.00",
        });
        console.log("[CI MODE] Test consultant seeded successfully");
      }

      // 4. Seed test project
      const existingProject = await storage.getProject("ci-test-project");
      if (!existingProject) {
        await storage.createProject({
          id: "ci-test-project",
          hospitalId: "ci-test-hospital",
          name: "CI Test Project",
          description: "Test project for CI environment",
          status: "active",
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        });
        console.log("[CI MODE] Test project seeded successfully");
      }
      // 5. Seed test expense
      const expenses = await storage.getExpenses();
      if (expenses.length === 0) {
        await storage.createExpense({
          consultantId: "ci-test-consultant",
          projectId: "ci-test-project",
          category: "travel",
          amount: "245.00",
          description: "Test expense for CI",
          expenseDate: new Date().toISOString().split("T")[0],
          status: "pending",
        });
        console.log("[CI MODE] Test expense seeded successfully");
      }

      // 6. Seed test support ticket
      const tickets = await storage.getSupportTickets();
      if (tickets.length === 0) {
        await storage.createSupportTicket({
          projectId: "ci-test-project",
          reportedBy: "ci-test-user",
          title: "CI Test Ticket",
          description: "Test support ticket for CI",
          priority: "medium",
          status: "open",
          category: "technical",
        });
        console.log("[CI MODE] Test support ticket seeded successfully");
      }

      // 7. Seed test chat channel
      const channels = await storage.getChatChannels();
      if (channels.length === 0) {
        await storage.createChatChannel({
          name: "CI Test Channel",
          type: "project",
          projectId: "ci-test-project",
          createdBy: "ci-test-user",
        });
        console.log("[CI MODE] Test chat channel seeded successfully");
      }

      // 8. Seed test travel booking
      const bookings = await storage.getTravelBookings();
      if (bookings.length === 0) {
        await storage.createTravelBooking({
          consultantId: "ci-test-consultant",
          projectId: "ci-test-project",
          bookingType: "flight",
          status: "confirmed",
          departureDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          returnDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          estimatedCost: "500.00",
        });
        console.log("[CI MODE] Test travel booking seeded successfully");
      }

      // 9. Seed test timesheet
      const timesheets = await storage.getTimesheets();
      if (timesheets.length === 0) {
        await storage.createTimesheet({
          consultantId: "ci-test-consultant",
          projectId: "ci-test-project",
          weekStartDate: new Date().toISOString().split("T")[0],
          status: "draft",
          totalHours: "40.00",
        });
        console.log("[CI MODE] Test timesheet seeded successfully");
      }
    } catch (error) {
      console.error("[CI MODE] Error seeding test data:", error);
    }
  }

  // Seed skills questionnaire data at startup
  try {
    await storage.seedSkillsData();
    console.log("Skills questionnaire data seeded successfully");
  } catch (error) {
    console.error("Error seeding skills data:", error);
  }

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

  // Traditional email/password login for testing
  app.post('/api/auth/login', async (req: any, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      
      // For testing purposes, accept password123 for any existing user
      if (password !== "password123") {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      // Create user object similar to OIDC format with a far-future expiration
      const sessionUser = {
        claims: {
          sub: user.id,
          email: user.email,
          first_name: user.firstName,
          last_name: user.lastName,
        },
        expires_at: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 1 week from now
      };
      
      // Use Passport's req.login to properly authenticate the session
      req.login(sessionUser, (err: any) => {
        if (err) {
          console.error("Login error:", err);
          return res.status(500).json({ message: "Login failed" });
        }
        res.json({ success: true, user });
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
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

  app.post('/api/hospitals', isAuthenticated, requireAnyPermission('hospitals:create', 'admin:manage'), async (req: any, res) => {
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

  app.patch('/api/hospitals/:id', isAuthenticated, requireAnyPermission('hospitals:edit', 'admin:manage'), async (req: any, res) => {
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

  app.delete('/api/hospitals/:id', isAuthenticated, requirePermission('hospitals:delete'), async (req: any, res) => {
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

  app.delete('/api/units/:id', isAuthenticated, requirePermission('admin:manage'), async (req, res) => {
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

  app.delete('/api/modules/:id', isAuthenticated, requirePermission('admin:manage'), async (req, res) => {
    try {
      await storage.deleteHospitalModule(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting module:", error);
      res.status(500).json({ message: "Failed to delete module" });
    }
  });

  // Consultant routes
  app.get('/api/consultants', isAuthenticated, requireAnyPermission('consultants:view', 'admin:view'), async (req, res) => {
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

  app.get('/api/consultants/:id', isAuthenticated, requireAnyPermission('consultants:view', 'admin:view'), async (req, res) => {
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

  // ============================================
  // Staff Invitations API (Invitation-only access)
  // ============================================
  
  function generateSecureToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 48; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  }

  app.get('/api/admin/invitations', isAuthenticated, requireRole('admin'), async (req, res) => {
    try {
      const status = req.query.status as 'pending' | 'accepted' | 'revoked' | 'expired' | undefined;
      let invitationsList;
      if (status) {
        invitationsList = await storage.getInvitationsByStatus(status);
      } else {
        invitationsList = await storage.getAllInvitations();
      }
      res.json(invitationsList);
    } catch (error) {
      console.error("Error fetching invitations:", error);
      res.status(500).json({ message: "Failed to fetch invitations" });
    }
  });

  app.get('/api/admin/invitations/:id', isAuthenticated, requireRole('admin'), async (req, res) => {
    try {
      const invitation = await storage.getInvitation(req.params.id);
      if (!invitation) {
        return res.status(404).json({ message: "Invitation not found" });
      }
      res.json(invitation);
    } catch (error) {
      console.error("Error fetching invitation:", error);
      res.status(500).json({ message: "Failed to fetch invitation" });
    }
  });

  app.post('/api/admin/invitations', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      const { email, role, message, expiresInDays } = req.body;
      const adminUserId = req.user?.claims?.sub;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      
      const normalizedEmail = email.toLowerCase().trim();
      
      // Validate email format using regex
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(normalizedEmail)) {
        return res.status(400).json({ message: "Invalid email format" });
      }
      
      // Validate role is one of the allowed values
      const allowedRoles = ['consultant', 'hospital_staff', 'admin'];
      const validatedRole = role || 'consultant';
      if (!allowedRoles.includes(validatedRole)) {
        return res.status(400).json({ 
          message: `Invalid role. Must be one of: ${allowedRoles.join(', ')}` 
        });
      }
      
      // Auto-expire any existing expired invitations for this email
      const existingInvitation = await storage.getInvitationByEmail(normalizedEmail);
      if (existingInvitation && existingInvitation.status === 'expired') {
        // Already expired, no action needed - we can create a new one
      } else if (existingInvitation && existingInvitation.status === 'pending') {
        // Check if it's actually past expiration date but not yet marked as expired
        if (new Date(existingInvitation.expiresAt) < new Date()) {
          // Mark as expired before proceeding
          await storage.expireOldInvitations();
        } else {
          return res.status(400).json({ 
            message: "An active invitation already exists for this email. Revoke it first to send a new one." 
          });
        }
      }
      
      const existingPending = await storage.getPendingInvitationByEmail(normalizedEmail);
      if (existingPending) {
        return res.status(400).json({ 
          message: "An active invitation already exists for this email. Revoke it first to send a new one." 
        });
      }
      
      const existingUser = await storage.getUserByEmail(normalizedEmail);
      if (existingUser && existingUser.accessStatus === 'active') {
        return res.status(400).json({ 
          message: "This user already has active access to the platform." 
        });
      }
      
      const token = generateSecureToken();
      const daysToExpire = expiresInDays || 7;
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + daysToExpire);
      
      const invitation = await storage.createInvitation({
        email: normalizedEmail,
        token,
        role: validatedRole as 'consultant' | 'hospital_staff' | 'admin',
        invitedByUserId: adminUserId,
        message: message || null,
        expiresAt,
      });
      
      await sendInvitationEmail({
        email: normalizedEmail,
        inviterName: req.user?.claims?.first_name || 'Administrator',
        role: validatedRole,
        message,
        expiresAt,
      });

      // Broadcast notification update for invitations
      broadcastNotificationUpdate(['invitations']);

      res.status(201).json(invitation);
    } catch (error) {
      console.error("Error creating invitation:", error);
      res.status(500).json({ message: "Failed to create invitation" });
    }
  });

  app.post('/api/admin/invitations/:id/revoke', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      const adminUserId = req.user?.claims?.sub;
      const { reason } = req.body;

      const invitation = await storage.revokeInvitation(
        req.params.id,
        adminUserId,
        reason || 'Revoked by administrator'
      );

      if (!invitation) {
        return res.status(404).json({ message: "Invitation not found" });
      }

      if (invitation.acceptedByUserId) {
        await storage.updateUserAccessStatus(invitation.acceptedByUserId, 'revoked');
      }

      // Broadcast notification update for invitations
      broadcastNotificationUpdate(['invitations']);

      res.json(invitation);
    } catch (error) {
      console.error("Error revoking invitation:", error);
      res.status(500).json({ message: "Failed to revoke invitation" });
    }
  });

  app.post('/api/admin/invitations/:id/resend', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      const invitation = await storage.getInvitation(req.params.id);
      
      if (!invitation) {
        return res.status(404).json({ message: "Invitation not found" });
      }
      
      // Check if invitation has been revoked
      if (invitation.status === 'revoked') {
        return res.status(400).json({ 
          message: "Cannot resend a revoked invitation. Please create a new one." 
        });
      }
      
      // Check if invitation has been accepted
      if (invitation.status === 'accepted') {
        return res.status(400).json({ 
          message: "Cannot resend an already accepted invitation." 
        });
      }
      
      // Check if invitation is expired and extend expiration if needed
      const now = new Date();
      let expiresAt = invitation.expiresAt;
      let wasExpired = false;
      
      if (invitation.status === 'expired' || new Date(invitation.expiresAt) < now) {
        // Extend expiration by 7 days from now
        expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        wasExpired = true;
        
        // Update the invitation expiration in storage
        await storage.updateInvitationExpiration(req.params.id, expiresAt);
      }
      
      await sendInvitationEmail({
        email: invitation.email,
        inviterName: req.user?.claims?.first_name || 'Administrator',
        role: invitation.role,
        message: invitation.message || undefined,
        expiresAt,
      });
      
      res.json({ 
        success: true, 
        message: wasExpired 
          ? "Invitation resent and expiration extended successfully" 
          : "Invitation resent successfully",
        expiresAt: expiresAt.toISOString()
      });
    } catch (error) {
      console.error("Error resending invitation:", error);
      res.status(500).json({ message: "Failed to resend invitation" });
    }
  });

  app.post('/api/admin/expire-invitations', isAuthenticated, requireRole('admin'), async (req, res) => {
    try {
      const count = await storage.expireOldInvitations();
      res.json({ success: true, expiredCount: count });
    } catch (error) {
      console.error("Error expiring invitations:", error);
      res.status(500).json({ message: "Failed to expire invitations" });
    }
  });

  app.post('/api/admin/seed-demo-data', isAuthenticated, requireRole('admin'), async (req, res) => {
    try {
      const { seedDemoData } = await import('./seedDemoData');
      await seedDemoData();
      res.json({ success: true, message: "Demo data seeded successfully" });
    } catch (error) {
      console.error("Error seeding demo data:", error);
      res.status(500).json({ message: "Failed to seed demo data" });
    }
  });

  // ============================================
  // RBAC (Role-Based Access Control) API
  // ============================================

  // Seed base roles on first request if needed
  let rbacSeeded = false;
  const ensureRbacSeeded = async () => {
    if (!rbacSeeded) {
      try {
        await storage.seedBaseRolesAndPermissions();
        rbacSeeded = true;
      } catch (error) {
        console.error("Error seeding RBAC:", error);
      }
    }
  };

  // List all roles (RBAC manage permission required)
  app.get('/api/admin/rbac/roles', isAuthenticated, requirePermission('rbac:manage'), async (req, res) => {
    try {
      await ensureRbacSeeded();
      const roleType = req.query.roleType as 'base' | 'custom' | undefined;
      const hospitalId = req.query.hospitalId as string | undefined;
      const isActive = req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined;
      const roles = await storage.listRoles({ roleType, hospitalId, isActive });
      res.json(roles);
    } catch (error) {
      console.error("Error fetching roles:", error);
      res.status(500).json({ message: "Failed to fetch roles" });
    }
  });

  // Get single role with permissions
  app.get('/api/admin/rbac/roles/:id', isAuthenticated, requirePermission('rbac:manage'), async (req, res) => {
    try {
      await ensureRbacSeeded();
      const role = await storage.getRoleWithPermissions(req.params.id);
      if (!role) {
        return res.status(404).json({ message: "Role not found" });
      }
      res.json(role);
    } catch (error) {
      console.error("Error fetching role:", error);
      res.status(500).json({ message: "Failed to fetch role" });
    }
  });

  // Create custom role
  app.post('/api/admin/rbac/roles', isAuthenticated, requirePermission('rbac:manage'), async (req: any, res) => {
    try {
      await ensureRbacSeeded();
      const userId = req.user?.claims?.sub;
      const roleData = {
        ...req.body,
        roleType: 'custom' as const,
        createdBy: userId,
      };
      const role = await storage.createRole(roleData);
      res.status(201).json(role);
    } catch (error) {
      console.error("Error creating role:", error);
      res.status(500).json({ message: "Failed to create role" });
    }
  });

  // Update role
  app.patch('/api/admin/rbac/roles/:id', isAuthenticated, requirePermission('rbac:manage'), async (req, res) => {
    try {
      const role = await storage.updateRole(req.params.id, req.body);
      if (!role) {
        return res.status(404).json({ message: "Role not found" });
      }
      res.json(role);
    } catch (error) {
      console.error("Error updating role:", error);
      res.status(500).json({ message: "Failed to update role" });
    }
  });

  // Delete role (custom roles only)
  app.delete('/api/admin/rbac/roles/:id', isAuthenticated, requirePermission('rbac:manage'), async (req, res) => {
    try {
      const role = await storage.getRole(req.params.id);
      if (!role) {
        return res.status(404).json({ message: "Role not found" });
      }
      if (role.roleType === 'base') {
        return res.status(400).json({ message: "Cannot delete base roles" });
      }
      await storage.deleteRole(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting role:", error);
      res.status(500).json({ message: "Failed to delete role" });
    }
  });

  // List all permissions
  app.get('/api/admin/rbac/permissions', isAuthenticated, requirePermission('rbac:manage'), async (req, res) => {
    try {
      await ensureRbacSeeded();
      const domain = req.query.domain as string | undefined;
      const isActive = req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined;
      const permissions = await storage.listPermissions({ domain, isActive });
      res.json(permissions);
    } catch (error) {
      console.error("Error fetching permissions:", error);
      res.status(500).json({ message: "Failed to fetch permissions" });
    }
  });

  // Set permissions for a role
  app.put('/api/admin/rbac/roles/:id/permissions', isAuthenticated, requirePermission('rbac:manage'), async (req, res) => {
    try {
      const { permissionIds } = req.body;
      if (!Array.isArray(permissionIds)) {
        return res.status(400).json({ message: "permissionIds must be an array" });
      }
      const rolePermissions = await storage.setRolePermissions(req.params.id, permissionIds);
      res.json(rolePermissions);
    } catch (error) {
      console.error("Error setting role permissions:", error);
      res.status(500).json({ message: "Failed to set role permissions" });
    }
  });

  // List user role assignments
  app.get('/api/admin/rbac/assignments', isAuthenticated, requirePermission('rbac:manage'), async (req, res) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(400).json({ message: "userId is required" });
      }
      const assignments = await storage.getUserRoleAssignmentsWithDetails(userId);
      res.json(assignments);
    } catch (error) {
      console.error("Error fetching role assignments:", error);
      res.status(500).json({ message: "Failed to fetch role assignments" });
    }
  });

  // Assign role to user
  app.post('/api/admin/rbac/assignments', isAuthenticated, requirePermission('rbac:manage'), async (req: any, res) => {
    try {
      const assignedBy = req.user?.claims?.sub;
      const assignment = await storage.assignRoleToUser({
        ...req.body,
        assignedBy,
      });
      res.status(201).json(assignment);
    } catch (error) {
      console.error("Error assigning role:", error);
      res.status(500).json({ message: "Failed to assign role" });
    }
  });

  // Remove role from user
  app.delete('/api/admin/rbac/assignments', isAuthenticated, requirePermission('rbac:manage'), async (req, res) => {
    try {
      const { userId, roleId, projectId } = req.body;
      if (!userId || !roleId) {
        return res.status(400).json({ message: "userId and roleId are required" });
      }
      await storage.removeRoleFromUser(userId, roleId, projectId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing role assignment:", error);
      res.status(500).json({ message: "Failed to remove role assignment" });
    }
  });

  // Get effective permissions for current user or specific user
  app.get('/api/rbac/effective-permissions', isAuthenticated, async (req: any, res) => {
    try {
      await ensureRbacSeeded();
      const userId = req.query.userId || req.user?.claims?.sub;
      const projectId = req.query.projectId as string | undefined;
      const permissions = await storage.getEffectivePermissions(userId, projectId);
      res.json(permissions);
    } catch (error) {
      console.error("Error fetching effective permissions:", error);
      res.status(500).json({ message: "Failed to fetch effective permissions" });
    }
  });

  // Check if current user has a specific permission
  app.get('/api/rbac/has-permission/:permissionName', isAuthenticated, async (req: any, res) => {
    try {
      await ensureRbacSeeded();
      const userId = req.user?.claims?.sub;
      const projectId = req.query.projectId as string | undefined;
      const hasPermission = await storage.hasPermission(userId, req.params.permissionName, projectId);
      res.json({ hasPermission });
    } catch (error) {
      console.error("Error checking permission:", error);
      res.status(500).json({ message: "Failed to check permission" });
    }
  });

  // User permissions API (for frontend to check access)
  app.get('/api/permissions', optionalAuth, async (req: any, res) => {
    try {
      const user = req.user ? await storage.getUser(req.user.claims.sub) : null;
      const userRole = user?.role || null;
      
      // Get leadership status and hospital context
      let isLeadership = false;
      let hospitalId: string | null = null;
      let assignedProjectIds: string[] = [];
      let effectiveRole = userRole;
      let roleLevel: 'admin' | 'hospital_leadership' | 'hospital_staff' | 'consultant' = 'consultant';
      
      // Determine role level
      if (userRole === 'admin') {
        roleLevel = 'admin';
      }
      
      // Check if user is hospital staff (may override consultant default role)
      if (user) {
        const staffInfo = await storage.getHospitalStaffByUserId(user.id);
        if (staffInfo) {
          effectiveRole = 'hospital_staff';
          isLeadership = staffInfo.isLeadership;
          hospitalId = staffInfo.hospitalId;
          roleLevel = isLeadership ? 'hospital_leadership' : 'hospital_staff';
          // Get projects for this hospital
          const hospitalProjects = await storage.getProjectsByHospital(staffInfo.hospitalId);
          assignedProjectIds = hospitalProjects.map((p: any) => p.id);
        }
      }
      
      // Get assigned projects for consultants (if not hospital staff)
      if (user && effectiveRole === 'consultant' && roleLevel === 'consultant') {
        const consultant = await storage.getConsultantByUserId(user.id);
        if (consultant) {
          // Get consultant's assigned project IDs using efficient JOIN query
          assignedProjectIds = await storage.getProjectsForConsultant(consultant.id);
        }
      }
      
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
        role: effectiveRole,
        roleLevel,
        isLeadership,
        hospitalId,
        assignedProjectIds,
        restrictedPages,
        restrictedFeatures,
      });
    } catch (error) {
      console.error("Error fetching permissions:", error);
      res.status(500).json({ message: "Failed to fetch permissions" });
    }
  });

  // Development-only: Get all available roles for dev mode switcher
  app.get('/api/dev/roles', isAuthenticated, async (req: any, res) => {
    try {
      // Only allow in development
      if (process.env.NODE_ENV === 'production') {
        return res.status(403).json({ message: "Not available in production" });
      }
      
      await ensureRbacSeeded();
      
      // Get all roles from the database
      const allRoles = await storage.listRoles();
      
      res.json(allRoles.map(r => ({
        id: r.id,
        name: r.name,
        displayName: r.displayName,
        description: r.description,
        roleType: r.roleType,
      })));
    } catch (error) {
      console.error("Error fetching dev roles:", error);
      res.status(500).json({ message: "Failed to fetch dev roles" });
    }
  });

  // Development-only: Get permissions for a simulated role (for testing different views)
  app.get('/api/dev/permissions/:role', isAuthenticated, async (req: any, res) => {
    try {
      // Only allow in development
      if (process.env.NODE_ENV === 'production') {
        return res.status(403).json({ message: "Not available in production" });
      }
      
      const simulatedRole = req.params.role as string;
      
      await ensureRbacSeeded();
      
      // Verify role exists in the database
      const roleData = await storage.getRoleByName(simulatedRole);
      if (!roleData) {
        return res.status(400).json({ message: "Invalid role" });
      }
      
      // Determine role level based on role type and name
      let roleLevel: 'admin' | 'hospital_leadership' | 'hospital_staff' | 'consultant' = 'consultant';
      let isLeadership = false;
      
      if (simulatedRole === 'admin') {
        roleLevel = 'admin';
      } else if (simulatedRole === 'hospital_leadership') {
        roleLevel = 'hospital_leadership';
        isLeadership = true;
      } else if (simulatedRole === 'hospital_staff' || simulatedRole === 'super_user') {
        roleLevel = 'hospital_staff';
      } else if (['implementation_project_manager', 'go_live_coordinator', 'training_lead', 
                  'command_center_manager', 'quality_assurance_lead', 'support_desk_lead',
                  'stabilization_lead', 'transition_coordinator', 'optimization_analyst'].includes(simulatedRole)) {
        // Implementation leadership roles get elevated permissions
        roleLevel = 'consultant';
        isLeadership = true;
      } else {
        roleLevel = 'consultant';
      }
      
      // Get access rules for simulated role
      const allRules = await storage.getAllAccessRules();
      const activeRules = allRules.filter(r => r.isActive);
      
      const restrictedPages: string[] = [];
      const restrictedFeatures: string[] = [];
      
      for (const rule of activeRules) {
        const allowedRoles = rule.allowedRoles as string[];
        const deniedRoles = rule.deniedRoles as string[];
        
        let isRestricted = false;
        
        if (deniedRoles.includes(simulatedRole)) {
          isRestricted = true;
        } else if (allowedRoles.length > 0 && !allowedRoles.includes(simulatedRole)) {
          isRestricted = true;
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
        role: simulatedRole,
        roleLevel,
        isLeadership,
        hospitalId: null,
        assignedProjectIds: [],
        restrictedPages,
        restrictedFeatures,
      });
    } catch (error) {
      console.error("Error fetching dev permissions:", error);
      res.status(500).json({ message: "Failed to fetch dev permissions" });
    }
  });

  // Development-only: Get effective permissions for a simulated role
  app.get('/api/dev/effective-permissions/:role', isAuthenticated, async (req: any, res) => {
    try {
      // Only allow in development
      if (process.env.NODE_ENV === 'production') {
        return res.status(403).json({ message: "Not available in production" });
      }
      
      const simulatedRole = req.params.role as string;
      
      await ensureRbacSeeded();
      
      // Get permissions for the simulated role from RBAC
      const roleData = await storage.getRoleByName(simulatedRole);
      
      if (!roleData) {
        // Return empty permissions if role not found
        return res.json([]);
      }
      
      // Get role with full permission details
      const roleWithPermissions = await storage.getRoleWithPermissions(roleData.id);
      
      if (!roleWithPermissions) {
        return res.json([]);
      }
      
      res.json(roleWithPermissions.permissions.map((rp: any) => ({
        permissionId: rp.permissionId,
        permissionName: rp.permission?.name || '',
        domain: rp.permission?.domain || '',
        action: rp.permission?.action || '',
      })));
    } catch (error) {
      console.error("Error fetching dev effective permissions:", error);
      res.status(500).json({ message: "Failed to fetch dev effective permissions" });
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

  // Phase Steps routes
  app.get('/api/phases/:phaseId/steps', isAuthenticated, async (req, res) => {
    try {
      const steps = await storage.getPhaseSteps(req.params.phaseId);
      res.json(steps);
    } catch (error) {
      console.error("Error fetching phase steps:", error);
      res.status(500).json({ message: "Failed to fetch phase steps" });
    }
  });

  app.post('/api/phases/:phaseId/steps', isAuthenticated, async (req: any, res) => {
    try {
      const stepData = insertPhaseStepSchema.parse({
        ...req.body,
        phaseId: req.params.phaseId,
      });
      const step = await storage.createPhaseStep(stepData);
      await logActivity(req.user.claims.sub, {
        activityType: 'create',
        resourceType: 'phase_step',
        resourceId: step.id,
        resourceName: step.title,
        description: `Created phase step: ${step.title}`,
      }, req);
      res.status(201).json(step);
    } catch (error) {
      console.error("Error creating phase step:", error);
      res.status(500).json({ message: "Failed to create phase step" });
    }
  });

  app.post('/api/phases/:phaseId/steps/bulk', isAuthenticated, async (req: any, res) => {
    try {
      const stepsData = (req.body.steps as any[]).map((step) =>
        insertPhaseStepSchema.parse({
          ...step,
          phaseId: req.params.phaseId,
        })
      );
      const steps = await storage.bulkCreatePhaseSteps(stepsData);
      await logActivity(req.user.claims.sub, {
        activityType: 'create',
        resourceType: 'phase_step',
        description: `Created ${steps.length} phase steps`,
      }, req);
      res.status(201).json(steps);
    } catch (error) {
      console.error("Error bulk creating phase steps:", error);
      res.status(500).json({ message: "Failed to create phase steps" });
    }
  });

  app.get('/api/steps/:id', isAuthenticated, async (req, res) => {
    try {
      const step = await storage.getPhaseStep(req.params.id);
      if (!step) {
        return res.status(404).json({ message: "Step not found" });
      }
      res.json(step);
    } catch (error) {
      console.error("Error fetching step:", error);
      res.status(500).json({ message: "Failed to fetch step" });
    }
  });

  app.patch('/api/steps/:id', isAuthenticated, async (req: any, res) => {
    try {
      const updateData = insertPhaseStepSchema.partial().parse(req.body);
      const step = await storage.updatePhaseStep(req.params.id, updateData);
      if (!step) {
        return res.status(404).json({ message: "Step not found" });
      }
      await logActivity(req.user.claims.sub, {
        activityType: 'update',
        resourceType: 'phase_step',
        resourceId: req.params.id,
        resourceName: step.title,
        description: `Updated phase step: ${step.title}`,
      }, req);
      res.json(step);
    } catch (error) {
      console.error("Error updating step:", error);
      res.status(500).json({ message: "Failed to update step" });
    }
  });

  app.delete('/api/steps/:id', isAuthenticated, async (req: any, res) => {
    try {
      const deleted = await storage.deletePhaseStep(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Step not found" });
      }
      await logActivity(req.user.claims.sub, {
        activityType: 'delete',
        resourceType: 'phase_step',
        resourceId: req.params.id,
        description: `Deleted phase step`,
      }, req);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting step:", error);
      res.status(500).json({ message: "Failed to delete step" });
    }
  });

  // Phase progress calculation endpoint
  app.get('/api/phases/:phaseId/progress', isAuthenticated, async (req, res) => {
    try {
      const progress = await storage.calculatePhaseProgress(req.params.phaseId);
      res.json({ phaseId: req.params.phaseId, calculatedProgress: progress });
    } catch (error) {
      console.error("Error calculating phase progress:", error);
      res.status(500).json({ message: "Failed to calculate phase progress" });
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
      const allRoleTemplates = await storage.getAllTeamRoleTemplates();
      const assignmentsWithUsers = await Promise.all(
        assignments.map(async (assignment) => {
          const user = await storage.getUser(assignment.userId);
          const roleTemplate = assignment.roleTemplateId 
            ? allRoleTemplates.find(t => t.id === assignment.roleTemplateId) || null
            : null;
          return {
            ...assignment,
            user: user ? {
              id: user.id,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              profileImageUrl: user.profileImageUrl,
            } : {
              id: assignment.userId,
              firstName: null,
              lastName: null,
              email: null,
              profileImageUrl: null,
            },
            roleTemplate,
          };
        })
      );
      res.json(assignmentsWithUsers);
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
  app.get('/api/projects/:projectId/support/tickets', isAuthenticated, requireAnyPermission('support_tickets:view_all', 'support_tickets:view_own'), async (req, res) => {
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

  app.post('/api/projects/:projectId/support/tickets', isAuthenticated, requirePermission('support_tickets:create'), async (req: any, res) => {
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

      // Broadcast notification update for tickets
      broadcastNotificationUpdate(['tickets']);

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

      // Broadcast notification update if status changed
      if (updateData.status) {
        broadcastNotificationUpdate(['tickets']);
      }

      res.json(ticket);
    } catch (error) {
      console.error("Error updating ticket:", error);
      res.status(500).json({ message: "Failed to update ticket" });
    }
  });

  app.post('/api/support/tickets/:id/assign', isAuthenticated, requirePermission('support_tickets:manage'), async (req: any, res) => {
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
  app.get('/api/timesheets', isAuthenticated, requireAnyPermission('timesheets:view_all', 'timesheets:view_own'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      const hasViewAllPermission = await storage.hasPermission(userId, 'timesheets:view_all');
      
      if (hasViewAllPermission) {
        const timesheets = await storage.getAllTimesheets();
        return res.json(timesheets);
      }
      
      const consultant = await storage.getConsultantByUserId(userId);
      if (!consultant) {
        return res.json([]);
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

  app.post('/api/timesheets', isAuthenticated, requirePermission('timesheets:edit_own'), async (req: any, res) => {
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

      // Broadcast notification update for timesheets
      broadcastNotificationUpdate(['timesheets']);

      res.json(timesheet);
    } catch (error) {
      console.error("Error submitting timesheet:", error);
      res.status(500).json({ message: "Failed to submit timesheet" });
    }
  });

  app.post('/api/timesheets/:id/approve', isAuthenticated, requirePermission('timesheets:approve'), async (req: any, res) => {
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

      // Broadcast notification update for timesheets
      broadcastNotificationUpdate(['timesheets']);

      res.json(timesheet);
    } catch (error) {
      console.error("Error approving timesheet:", error);
      res.status(500).json({ message: "Failed to approve timesheet" });
    }
  });

  app.post('/api/timesheets/:id/reject', isAuthenticated, requirePermission('timesheets:approve'), async (req: any, res) => {
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

      // Broadcast notification update for timesheets
      broadcastNotificationUpdate(['timesheets']);

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

      // Broadcast notification update for shift swaps
      broadcastNotificationUpdate(['shift-swaps']);

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

      // Broadcast notification update for shift swaps
      broadcastNotificationUpdate(['shift-swaps']);

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

      // Broadcast notification update for shift swaps
      broadcastNotificationUpdate(['shift-swaps']);

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
  app.get('/api/training/analytics', isAuthenticated, requirePermission('training:manage'), async (req, res) => {
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
  app.post('/api/eod-reports', isAuthenticated, requirePermission('eod_reports:create'), async (req: any, res) => {
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

  app.get('/api/eod-reports', isAuthenticated, requireAnyPermission('eod_reports:view_all', 'eod_reports:view_own'), async (req, res) => {
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
      }
      
      res.json(report);
    } catch (error) {
      console.error("Error submitting EOD report:", error);
      res.status(500).json({ message: "Failed to submit EOD report" });
    }
  });

  app.post('/api/eod-reports/:id/approve', isAuthenticated, requirePermission('eod_reports:view_all'), async (req: any, res) => {
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

  app.post('/api/eod-reports/:id/reject', isAuthenticated, requirePermission('eod_reports:view_all'), async (req: any, res) => {
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

  app.get('/api/eod-reports/analytics', isAuthenticated, requirePermission('eod_reports:view_all'), async (req, res) => {
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

  // ============================================
  // PHASE 13: FINANCIAL MANAGEMENT API ROUTES
  // ============================================

  // Per Diem Policies Routes
  app.get('/api/per-diem-policies', isAuthenticated, async (req, res) => {
    try {
      const policies = await storage.listPerDiemPolicies();
      res.json(policies);
    } catch (error) {
      console.error("Error fetching per diem policies:", error);
      res.status(500).json({ message: "Failed to fetch per diem policies" });
    }
  });

  app.get('/api/per-diem-policies/:id', isAuthenticated, async (req, res) => {
    try {
      const policy = await storage.getPerDiemPolicy(req.params.id);
      if (!policy) {
        return res.status(404).json({ message: "Per diem policy not found" });
      }
      res.json(policy);
    } catch (error) {
      console.error("Error fetching per diem policy:", error);
      res.status(500).json({ message: "Failed to fetch per diem policy" });
    }
  });

  app.post('/api/per-diem-policies', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validated = insertPerDiemPolicySchema.parse(req.body);
      const policy = await storage.createPerDiemPolicy(validated);
      
      await logActivity(userId, {
        activityType: 'create',
        resourceType: 'per_diem_policy',
        resourceId: policy.id,
        resourceName: validated.name,
        description: 'Created per diem policy',
      }, req);
      
      res.status(201).json(policy);
    } catch (error) {
      console.error("Error creating per diem policy:", error);
      res.status(400).json({ message: "Failed to create per diem policy" });
    }
  });

  app.patch('/api/per-diem-policies/:id', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const policy = await storage.updatePerDiemPolicy(req.params.id, req.body);
      if (!policy) {
        return res.status(404).json({ message: "Per diem policy not found" });
      }
      
      if (userId) {
        await logActivity(userId, {
          activityType: 'update',
          resourceType: 'per_diem_policy',
          resourceId: policy.id,
          resourceName: policy.name,
          description: 'Updated per diem policy',
        }, req);
      }
      
      res.json(policy);
    } catch (error) {
      console.error("Error updating per diem policy:", error);
      res.status(500).json({ message: "Failed to update per diem policy" });
    }
  });

  app.delete('/api/per-diem-policies/:id', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      await storage.deletePerDiemPolicy(req.params.id);
      
      if (userId) {
        await logActivity(userId, {
          activityType: 'delete',
          resourceType: 'per_diem_policy',
          resourceId: req.params.id,
          resourceName: 'Per diem policy',
          description: 'Deleted per diem policy',
        }, req);
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting per diem policy:", error);
      res.status(500).json({ message: "Failed to delete per diem policy" });
    }
  });

  // Mileage Rates Routes
  app.get('/api/mileage-rates', isAuthenticated, async (req, res) => {
    try {
      const rates = await storage.listMileageRates();
      res.json(rates);
    } catch (error) {
      console.error("Error fetching mileage rates:", error);
      res.status(500).json({ message: "Failed to fetch mileage rates" });
    }
  });

  app.get('/api/mileage-rates/:id', isAuthenticated, async (req, res) => {
    try {
      const rate = await storage.getMileageRate(req.params.id);
      if (!rate) {
        return res.status(404).json({ message: "Mileage rate not found" });
      }
      res.json(rate);
    } catch (error) {
      console.error("Error fetching mileage rate:", error);
      res.status(500).json({ message: "Failed to fetch mileage rate" });
    }
  });

  app.post('/api/mileage-rates', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validated = insertMileageRateSchema.parse(req.body);
      const rate = await storage.createMileageRate(validated);
      
      await logActivity(userId, {
        activityType: 'create',
        resourceType: 'mileage_rate',
        resourceId: rate.id,
        resourceName: validated.name,
        description: 'Created mileage rate',
      }, req);
      
      res.status(201).json(rate);
    } catch (error) {
      console.error("Error creating mileage rate:", error);
      res.status(400).json({ message: "Failed to create mileage rate" });
    }
  });

  app.patch('/api/mileage-rates/:id', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const rate = await storage.updateMileageRate(req.params.id, req.body);
      if (!rate) {
        return res.status(404).json({ message: "Mileage rate not found" });
      }
      
      if (userId) {
        await logActivity(userId, {
          activityType: 'update',
          resourceType: 'mileage_rate',
          resourceId: rate.id,
          resourceName: rate.name,
          description: 'Updated mileage rate',
        }, req);
      }
      
      res.json(rate);
    } catch (error) {
      console.error("Error updating mileage rate:", error);
      res.status(500).json({ message: "Failed to update mileage rate" });
    }
  });

  app.delete('/api/mileage-rates/:id', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      await storage.deleteMileageRate(req.params.id);
      
      if (userId) {
        await logActivity(userId, {
          activityType: 'delete',
          resourceType: 'mileage_rate',
          resourceId: req.params.id,
          resourceName: 'Mileage rate',
          description: 'Deleted mileage rate',
        }, req);
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting mileage rate:", error);
      res.status(500).json({ message: "Failed to delete mileage rate" });
    }
  });

  // Expenses Routes
  app.get('/api/expenses', isAuthenticated, async (req, res) => {
    try {
      const filters = {
        consultantId: req.query.consultantId as string | undefined,
        projectId: req.query.projectId as string | undefined,
        status: req.query.status as string | undefined,
        category: req.query.category as string | undefined,
      };
      const expenses = await storage.listExpenses(filters);
      res.json(expenses);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      res.status(500).json({ message: "Failed to fetch expenses" });
    }
  });

  app.get('/api/expenses/analytics', isAuthenticated, requireRole('admin'), async (req, res) => {
    try {
      const analytics = await storage.getExpenseAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching expense analytics:", error);
      res.status(500).json({ message: "Failed to fetch expense analytics" });
    }
  });

  app.get('/api/expenses/:id', isAuthenticated, async (req, res) => {
    try {
      const expense = await storage.getExpense(req.params.id);
      if (!expense) {
        return res.status(404).json({ message: "Expense not found" });
      }
      res.json(expense);
    } catch (error) {
      console.error("Error fetching expense:", error);
      res.status(500).json({ message: "Failed to fetch expense" });
    }
  });

  app.post('/api/expenses', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validated = insertExpenseSchema.parse(req.body);
      const expense = await storage.createExpense(validated);
      
      await logActivity(userId, {
        activityType: 'create',
        resourceType: 'expense',
        resourceId: expense.id,
        resourceName: validated.description,
        description: 'Created expense',
      }, req);
      
      res.status(201).json(expense);
    } catch (error) {
      console.error("Error creating expense:", error);
      res.status(400).json({ message: "Failed to create expense" });
    }
  });

  app.patch('/api/expenses/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const expense = await storage.updateExpense(req.params.id, req.body);
      if (!expense) {
        return res.status(404).json({ message: "Expense not found" });
      }
      
      if (userId) {
        await logActivity(userId, {
          activityType: 'update',
          resourceType: 'expense',
          resourceId: expense.id,
          resourceName: expense.description,
          description: 'Updated expense',
        }, req);
      }
      
      res.json(expense);
    } catch (error) {
      console.error("Error updating expense:", error);
      res.status(500).json({ message: "Failed to update expense" });
    }
  });

  app.post('/api/expenses/:id/submit', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const expense = await storage.submitExpense(req.params.id);
      if (!expense) {
        return res.status(404).json({ message: "Expense not found" });
      }
      
      await logActivity(userId, {
        activityType: 'update',
        resourceType: 'expense',
        resourceId: expense.id,
        resourceName: expense.description,
        description: 'Submitted expense for approval',
      }, req);
      
      res.json(expense);
    } catch (error) {
      console.error("Error submitting expense:", error);
      res.status(500).json({ message: "Failed to submit expense" });
    }
  });

  app.post('/api/expenses/:id/approve', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const expense = await storage.approveExpense(req.params.id, userId);
      if (!expense) {
        return res.status(404).json({ message: "Expense not found" });
      }
      
      await logActivity(userId, {
        activityType: 'update',
        resourceType: 'expense',
        resourceId: expense.id,
        resourceName: expense.description,
        description: 'Approved expense',
      }, req);
      
      res.json(expense);
    } catch (error) {
      console.error("Error approving expense:", error);
      res.status(500).json({ message: "Failed to approve expense" });
    }
  });

  app.post('/api/expenses/:id/reject', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { reason } = req.body;
      const expense = await storage.rejectExpense(req.params.id, userId, reason);
      if (!expense) {
        return res.status(404).json({ message: "Expense not found" });
      }
      
      await logActivity(userId, {
        activityType: 'update',
        resourceType: 'expense',
        resourceId: expense.id,
        resourceName: expense.description,
        description: 'Rejected expense',
      }, req);
      
      res.json(expense);
    } catch (error) {
      console.error("Error rejecting expense:", error);
      res.status(500).json({ message: "Failed to reject expense" });
    }
  });

  app.delete('/api/expenses/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      await storage.deleteExpense(req.params.id);
      
      if (userId) {
        await logActivity(userId, {
          activityType: 'delete',
          resourceType: 'expense',
          resourceId: req.params.id,
          resourceName: 'Expense',
          description: 'Deleted expense',
        }, req);
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting expense:", error);
      res.status(500).json({ message: "Failed to delete expense" });
    }
  });

  // Invoice Templates Routes
  app.get('/api/invoice-templates', isAuthenticated, async (req, res) => {
    try {
      const templates = await storage.listInvoiceTemplates();
      res.json(templates);
    } catch (error) {
      console.error("Error fetching invoice templates:", error);
      res.status(500).json({ message: "Failed to fetch invoice templates" });
    }
  });

  app.get('/api/invoice-templates/:id', isAuthenticated, async (req, res) => {
    try {
      const template = await storage.getInvoiceTemplate(req.params.id);
      if (!template) {
        return res.status(404).json({ message: "Invoice template not found" });
      }
      res.json(template);
    } catch (error) {
      console.error("Error fetching invoice template:", error);
      res.status(500).json({ message: "Failed to fetch invoice template" });
    }
  });

  app.post('/api/invoice-templates', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validated = insertInvoiceTemplateSchema.parse(req.body);
      const template = await storage.createInvoiceTemplate(validated);
      
      await logActivity(userId, {
        activityType: 'create',
        resourceType: 'invoice_template',
        resourceId: template.id,
        resourceName: validated.name,
        description: 'Created invoice template',
      }, req);
      
      res.status(201).json(template);
    } catch (error) {
      console.error("Error creating invoice template:", error);
      res.status(400).json({ message: "Failed to create invoice template" });
    }
  });

  app.patch('/api/invoice-templates/:id', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const template = await storage.updateInvoiceTemplate(req.params.id, req.body);
      if (!template) {
        return res.status(404).json({ message: "Invoice template not found" });
      }
      
      if (userId) {
        await logActivity(userId, {
          activityType: 'update',
          resourceType: 'invoice_template',
          resourceId: template.id,
          resourceName: template.name,
          description: 'Updated invoice template',
        }, req);
      }
      
      res.json(template);
    } catch (error) {
      console.error("Error updating invoice template:", error);
      res.status(500).json({ message: "Failed to update invoice template" });
    }
  });

  app.delete('/api/invoice-templates/:id', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      await storage.deleteInvoiceTemplate(req.params.id);
      
      if (userId) {
        await logActivity(userId, {
          activityType: 'delete',
          resourceType: 'invoice_template',
          resourceId: req.params.id,
          resourceName: 'Invoice template',
          description: 'Deleted invoice template',
        }, req);
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting invoice template:", error);
      res.status(500).json({ message: "Failed to delete invoice template" });
    }
  });

  // Invoices Routes
  app.get('/api/invoices', isAuthenticated, async (req, res) => {
    try {
      const filters = {
        projectId: req.query.projectId as string | undefined,
        hospitalId: req.query.hospitalId as string | undefined,
        status: req.query.status as string | undefined,
      };
      const invoices = await storage.listInvoices(filters);
      res.json(invoices);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });

  app.get('/api/invoices/:id', isAuthenticated, async (req, res) => {
    try {
      const invoice = await storage.getInvoice(req.params.id);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      res.json(invoice);
    } catch (error) {
      console.error("Error fetching invoice:", error);
      res.status(500).json({ message: "Failed to fetch invoice" });
    }
  });

  app.post('/api/invoices', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validated = insertInvoiceSchema.parse({
        ...req.body,
        createdBy: userId,
      });
      const invoice = await storage.createInvoice(validated);
      
      await logActivity(userId, {
        activityType: 'create',
        resourceType: 'invoice',
        resourceId: invoice.id,
        resourceName: invoice.invoiceNumber || 'New Invoice',
        description: 'Created invoice',
      }, req);
      
      res.status(201).json(invoice);
    } catch (error) {
      console.error("Error creating invoice:", error);
      res.status(400).json({ message: "Failed to create invoice" });
    }
  });

  app.patch('/api/invoices/:id', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const invoice = await storage.updateInvoice(req.params.id, req.body);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      
      if (userId) {
        await logActivity(userId, {
          activityType: 'update',
          resourceType: 'invoice',
          resourceId: invoice.id,
          resourceName: invoice.invoiceNumber || invoice.id,
          description: 'Updated invoice',
        }, req);
      }
      
      res.json(invoice);
    } catch (error) {
      console.error("Error updating invoice:", error);
      res.status(500).json({ message: "Failed to update invoice" });
    }
  });

  app.delete('/api/invoices/:id', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      await storage.deleteInvoice(req.params.id);
      
      if (userId) {
        await logActivity(userId, {
          activityType: 'delete',
          resourceType: 'invoice',
          resourceId: req.params.id,
          resourceName: 'Invoice',
          description: 'Deleted invoice',
        }, req);
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting invoice:", error);
      res.status(500).json({ message: "Failed to delete invoice" });
    }
  });

  app.post('/api/invoices/generate-from-timesheet', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { timesheetId, templateId } = req.body;
      
      if (!timesheetId) {
        return res.status(400).json({ message: "timesheetId is required" });
      }
      
      const invoice = await storage.generateInvoiceFromTimesheet(timesheetId, templateId);
      if (!invoice) {
        return res.status(404).json({ message: "Failed to generate invoice from timesheet" });
      }
      
      await logActivity(userId, {
        activityType: 'create',
        resourceType: 'invoice',
        resourceId: invoice.id,
        resourceName: invoice.invoiceNumber || 'Generated Invoice',
        description: 'Generated invoice from timesheet',
      }, req);
      
      res.status(201).json(invoice);
    } catch (error) {
      console.error("Error generating invoice from timesheet:", error);
      res.status(500).json({ message: "Failed to generate invoice from timesheet" });
    }
  });

  // Invoice Line Items Routes
  app.get('/api/invoice-line-items', isAuthenticated, async (req, res) => {
    try {
      const invoiceId = req.query.invoiceId as string;
      if (!invoiceId) {
        return res.status(400).json({ message: "invoiceId is required" });
      }
      const lineItems = await storage.listInvoiceLineItems(invoiceId);
      res.json(lineItems);
    } catch (error) {
      console.error("Error fetching invoice line items:", error);
      res.status(500).json({ message: "Failed to fetch invoice line items" });
    }
  });

  app.post('/api/invoice-line-items', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validated = insertInvoiceLineItemSchema.parse(req.body);
      const lineItem = await storage.createInvoiceLineItem(validated);
      
      await logActivity(userId, {
        activityType: 'create',
        resourceType: 'invoice_line_item',
        resourceId: lineItem.id,
        resourceName: validated.description,
        description: 'Created invoice line item',
      }, req);
      
      res.status(201).json(lineItem);
    } catch (error) {
      console.error("Error creating invoice line item:", error);
      res.status(400).json({ message: "Failed to create invoice line item" });
    }
  });

  app.patch('/api/invoice-line-items/:id', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const lineItem = await storage.updateInvoiceLineItem(req.params.id, req.body);
      if (!lineItem) {
        return res.status(404).json({ message: "Invoice line item not found" });
      }
      
      if (userId) {
        await logActivity(userId, {
          activityType: 'update',
          resourceType: 'invoice_line_item',
          resourceId: lineItem.id,
          resourceName: lineItem.description,
          description: 'Updated invoice line item',
        }, req);
      }
      
      res.json(lineItem);
    } catch (error) {
      console.error("Error updating invoice line item:", error);
      res.status(500).json({ message: "Failed to update invoice line item" });
    }
  });

  app.delete('/api/invoice-line-items/:id', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      await storage.deleteInvoiceLineItem(req.params.id);
      
      if (userId) {
        await logActivity(userId, {
          activityType: 'delete',
          resourceType: 'invoice_line_item',
          resourceId: req.params.id,
          resourceName: 'Invoice line item',
          description: 'Deleted invoice line item',
        }, req);
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting invoice line item:", error);
      res.status(500).json({ message: "Failed to delete invoice line item" });
    }
  });

  // Pay Rates Routes
  app.get('/api/pay-rates', isAuthenticated, async (req, res) => {
    try {
      const consultantId = req.query.consultantId as string | undefined;
      const payRates = await storage.listPayRates(consultantId);
      res.json(payRates);
    } catch (error) {
      console.error("Error fetching pay rates:", error);
      res.status(500).json({ message: "Failed to fetch pay rates" });
    }
  });

  app.get('/api/pay-rates/current/:consultantId', isAuthenticated, async (req, res) => {
    try {
      const payRate = await storage.getCurrentPayRate(req.params.consultantId);
      if (!payRate) {
        return res.status(404).json({ message: "No current pay rate found for consultant" });
      }
      res.json(payRate);
    } catch (error) {
      console.error("Error fetching current pay rate:", error);
      res.status(500).json({ message: "Failed to fetch current pay rate" });
    }
  });

  app.get('/api/pay-rates/:id', isAuthenticated, async (req, res) => {
    try {
      const payRate = await storage.getPayRate(req.params.id);
      if (!payRate) {
        return res.status(404).json({ message: "Pay rate not found" });
      }
      res.json(payRate);
    } catch (error) {
      console.error("Error fetching pay rate:", error);
      res.status(500).json({ message: "Failed to fetch pay rate" });
    }
  });

  app.post('/api/pay-rates', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validated = insertPayRateSchema.parse({
        ...req.body,
        approvedBy: userId,
      });
      const payRate = await storage.createPayRate(validated);
      
      await logActivity(userId, {
        activityType: 'create',
        resourceType: 'pay_rate',
        resourceId: payRate.id,
        resourceName: `Pay rate: $${validated.hourlyRate}/hr`,
        description: 'Created pay rate',
      }, req);
      
      res.status(201).json(payRate);
    } catch (error) {
      console.error("Error creating pay rate:", error);
      res.status(400).json({ message: "Failed to create pay rate" });
    }
  });

  app.patch('/api/pay-rates/:id', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const payRate = await storage.updatePayRate(req.params.id, req.body);
      if (!payRate) {
        return res.status(404).json({ message: "Pay rate not found" });
      }
      
      if (userId) {
        await logActivity(userId, {
          activityType: 'update',
          resourceType: 'pay_rate',
          resourceId: payRate.id,
          resourceName: `Pay rate: $${payRate.hourlyRate}/hr`,
          description: 'Updated pay rate',
        }, req);
      }
      
      res.json(payRate);
    } catch (error) {
      console.error("Error updating pay rate:", error);
      res.status(500).json({ message: "Failed to update pay rate" });
    }
  });

  // Payroll Batches Routes
  app.get('/api/payroll-batches', isAuthenticated, async (req, res) => {
    try {
      const filters = {
        status: req.query.status as string | undefined,
        periodStart: req.query.periodStart as string | undefined,
        periodEnd: req.query.periodEnd as string | undefined,
      };
      const batches = await storage.listPayrollBatches(filters);
      res.json(batches);
    } catch (error) {
      console.error("Error fetching payroll batches:", error);
      res.status(500).json({ message: "Failed to fetch payroll batches" });
    }
  });

  app.get('/api/payroll-batches/analytics', isAuthenticated, requireRole('admin'), async (req, res) => {
    try {
      const analytics = await storage.getPayrollAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching payroll analytics:", error);
      res.status(500).json({ message: "Failed to fetch payroll analytics" });
    }
  });

  app.get('/api/payroll-batches/:id', isAuthenticated, async (req, res) => {
    try {
      const batch = await storage.getPayrollBatch(req.params.id);
      if (!batch) {
        return res.status(404).json({ message: "Payroll batch not found" });
      }
      res.json(batch);
    } catch (error) {
      console.error("Error fetching payroll batch:", error);
      res.status(500).json({ message: "Failed to fetch payroll batch" });
    }
  });

  app.post('/api/payroll-batches', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validated = insertPayrollBatchSchema.parse({
        ...req.body,
        createdBy: userId,
      });
      const batch = await storage.createPayrollBatch(validated);
      
      await logActivity(userId, {
        activityType: 'create',
        resourceType: 'payroll_batch',
        resourceId: batch.id,
        resourceName: validated.name,
        description: 'Created payroll batch',
      }, req);
      
      res.status(201).json(batch);
    } catch (error) {
      console.error("Error creating payroll batch:", error);
      res.status(400).json({ message: "Failed to create payroll batch" });
    }
  });

  app.patch('/api/payroll-batches/:id', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const batch = await storage.updatePayrollBatch(req.params.id, req.body);
      if (!batch) {
        return res.status(404).json({ message: "Payroll batch not found" });
      }
      
      if (userId) {
        await logActivity(userId, {
          activityType: 'update',
          resourceType: 'payroll_batch',
          resourceId: batch.id,
          resourceName: batch.name,
          description: 'Updated payroll batch',
        }, req);
      }
      
      res.json(batch);
    } catch (error) {
      console.error("Error updating payroll batch:", error);
      res.status(500).json({ message: "Failed to update payroll batch" });
    }
  });

  app.post('/api/payroll-batches/:id/approve', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const batch = await storage.approvePayrollBatch(req.params.id, userId);
      if (!batch) {
        return res.status(404).json({ message: "Payroll batch not found" });
      }
      
      await logActivity(userId, {
        activityType: 'update',
        resourceType: 'payroll_batch',
        resourceId: batch.id,
        resourceName: batch.name,
        description: 'Approved payroll batch',
      }, req);
      
      res.json(batch);
    } catch (error) {
      console.error("Error approving payroll batch:", error);
      res.status(500).json({ message: "Failed to approve payroll batch" });
    }
  });

  app.post('/api/payroll-batches/:id/process', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const batch = await storage.processPayrollBatch(req.params.id);
      if (!batch) {
        return res.status(404).json({ message: "Payroll batch not found" });
      }
      
      await logActivity(userId, {
        activityType: 'update',
        resourceType: 'payroll_batch',
        resourceId: batch.id,
        resourceName: batch.name,
        description: 'Processed payroll batch',
      }, req);
      
      res.json(batch);
    } catch (error) {
      console.error("Error processing payroll batch:", error);
      res.status(500).json({ message: "Failed to process payroll batch" });
    }
  });

  // Payroll Entries Routes
  app.get('/api/payroll-entries', isAuthenticated, async (req, res) => {
    try {
      const batchId = req.query.batchId as string;
      if (!batchId) {
        return res.status(400).json({ message: "batchId is required" });
      }
      const entries = await storage.listPayrollEntries(batchId);
      res.json(entries);
    } catch (error) {
      console.error("Error fetching payroll entries:", error);
      res.status(500).json({ message: "Failed to fetch payroll entries" });
    }
  });

  app.post('/api/payroll-entries', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validated = insertPayrollEntrySchema.parse(req.body);
      const entry = await storage.createPayrollEntry(validated);
      
      await logActivity(userId, {
        activityType: 'create',
        resourceType: 'payroll_entry',
        resourceId: entry.id,
        resourceName: 'Payroll entry',
        description: 'Created payroll entry',
      }, req);
      
      res.status(201).json(entry);
    } catch (error) {
      console.error("Error creating payroll entry:", error);
      res.status(400).json({ message: "Failed to create payroll entry" });
    }
  });

  app.patch('/api/payroll-entries/:id', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const entry = await storage.updatePayrollEntry(req.params.id, req.body);
      if (!entry) {
        return res.status(404).json({ message: "Payroll entry not found" });
      }
      
      if (userId) {
        await logActivity(userId, {
          activityType: 'update',
          resourceType: 'payroll_entry',
          resourceId: entry.id,
          resourceName: 'Payroll entry',
          description: 'Updated payroll entry',
        }, req);
      }
      
      res.json(entry);
    } catch (error) {
      console.error("Error updating payroll entry:", error);
      res.status(500).json({ message: "Failed to update payroll entry" });
    }
  });

  // Paycheck Stubs Routes
  app.get('/api/paycheck-stubs', isAuthenticated, async (req, res) => {
    try {
      const consultantId = req.query.consultantId as string;
      if (!consultantId) {
        return res.status(400).json({ message: "consultantId is required" });
      }
      const stubs = await storage.listPaycheckStubs(consultantId);
      res.json(stubs);
    } catch (error) {
      console.error("Error fetching paycheck stubs:", error);
      res.status(500).json({ message: "Failed to fetch paycheck stubs" });
    }
  });

  app.get('/api/paycheck-stubs/:id', isAuthenticated, async (req, res) => {
    try {
      const stub = await storage.getPaycheckStub(req.params.id);
      if (!stub) {
        return res.status(404).json({ message: "Paycheck stub not found" });
      }
      res.json(stub);
    } catch (error) {
      console.error("Error fetching paycheck stub:", error);
      res.status(500).json({ message: "Failed to fetch paycheck stub" });
    }
  });

  app.post('/api/paycheck-stubs', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validated = insertPaycheckStubSchema.parse(req.body);
      const stub = await storage.createPaycheckStub(validated);
      
      await logActivity(userId, {
        activityType: 'create',
        resourceType: 'paycheck_stub',
        resourceId: stub.id,
        resourceName: 'Paycheck stub',
        description: 'Created paycheck stub',
      }, req);
      
      res.status(201).json(stub);
    } catch (error) {
      console.error("Error creating paycheck stub:", error);
      res.status(400).json({ message: "Failed to create paycheck stub" });
    }
  });

  // Budget Scenarios Routes
  app.get('/api/budget-scenarios', isAuthenticated, async (req, res) => {
    try {
      const projectId = req.query.projectId as string | undefined;
      const scenarios = await storage.listBudgetScenarios(projectId);
      res.json(scenarios);
    } catch (error) {
      console.error("Error fetching budget scenarios:", error);
      res.status(500).json({ message: "Failed to fetch budget scenarios" });
    }
  });

  app.get('/api/budget-scenarios/:id', isAuthenticated, async (req, res) => {
    try {
      const scenario = await storage.getBudgetScenario(req.params.id);
      if (!scenario) {
        return res.status(404).json({ message: "Budget scenario not found" });
      }
      res.json(scenario);
    } catch (error) {
      console.error("Error fetching budget scenario:", error);
      res.status(500).json({ message: "Failed to fetch budget scenario" });
    }
  });

  app.post('/api/budget-scenarios', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validated = insertBudgetScenarioSchema.parse({
        ...req.body,
        createdBy: userId,
      });
      const scenario = await storage.createBudgetScenario(validated);
      
      await logActivity(userId, {
        activityType: 'create',
        resourceType: 'budget_scenario',
        resourceId: scenario.id,
        resourceName: validated.name,
        description: 'Created budget scenario',
      }, req);
      
      res.status(201).json(scenario);
    } catch (error) {
      console.error("Error creating budget scenario:", error);
      res.status(400).json({ message: "Failed to create budget scenario" });
    }
  });

  app.patch('/api/budget-scenarios/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const scenario = await storage.updateBudgetScenario(req.params.id, req.body);
      if (!scenario) {
        return res.status(404).json({ message: "Budget scenario not found" });
      }
      
      if (userId) {
        await logActivity(userId, {
          activityType: 'update',
          resourceType: 'budget_scenario',
          resourceId: scenario.id,
          resourceName: scenario.name,
          description: 'Updated budget scenario',
        }, req);
      }
      
      res.json(scenario);
    } catch (error) {
      console.error("Error updating budget scenario:", error);
      res.status(500).json({ message: "Failed to update budget scenario" });
    }
  });

  app.delete('/api/budget-scenarios/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      await storage.deleteBudgetScenario(req.params.id);
      
      if (userId) {
        await logActivity(userId, {
          activityType: 'delete',
          resourceType: 'budget_scenario',
          resourceId: req.params.id,
          resourceName: 'Budget scenario',
          description: 'Deleted budget scenario',
        }, req);
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting budget scenario:", error);
      res.status(500).json({ message: "Failed to delete budget scenario" });
    }
  });

  app.post('/api/budget-scenarios/:id/clone', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { name } = req.body;
      
      if (!name) {
        return res.status(400).json({ message: "name is required for cloning" });
      }
      
      const clonedScenario = await storage.cloneScenario(req.params.id, name);
      if (!clonedScenario) {
        return res.status(404).json({ message: "Budget scenario not found" });
      }
      
      await logActivity(userId, {
        activityType: 'create',
        resourceType: 'budget_scenario',
        resourceId: clonedScenario.id,
        resourceName: name,
        description: 'Cloned budget scenario',
      }, req);
      
      res.status(201).json(clonedScenario);
    } catch (error) {
      console.error("Error cloning budget scenario:", error);
      res.status(500).json({ message: "Failed to clone budget scenario" });
    }
  });

  // Scenario Metrics Routes
  app.get('/api/scenario-metrics', isAuthenticated, async (req, res) => {
    try {
      const scenarioId = req.query.scenarioId as string;
      if (!scenarioId) {
        return res.status(400).json({ message: "scenarioId is required" });
      }
      const metrics = await storage.listScenarioMetrics(scenarioId);
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching scenario metrics:", error);
      res.status(500).json({ message: "Failed to fetch scenario metrics" });
    }
  });

  app.post('/api/scenario-metrics', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validated = insertScenarioMetricSchema.parse(req.body);
      const metric = await storage.createScenarioMetric(validated);
      
      await logActivity(userId, {
        activityType: 'create',
        resourceType: 'scenario_metric',
        resourceId: metric.id,
        resourceName: validated.metricName,
        description: 'Created scenario metric',
      }, req);
      
      res.status(201).json(metric);
    } catch (error) {
      console.error("Error creating scenario metric:", error);
      res.status(400).json({ message: "Failed to create scenario metric" });
    }
  });

  app.patch('/api/scenario-metrics/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const metric = await storage.updateScenarioMetric(req.params.id, req.body);
      if (!metric) {
        return res.status(404).json({ message: "Scenario metric not found" });
      }
      
      if (userId) {
        await logActivity(userId, {
          activityType: 'update',
          resourceType: 'scenario_metric',
          resourceId: metric.id,
          resourceName: metric.metricName,
          description: 'Updated scenario metric',
        }, req);
      }
      
      res.json(metric);
    } catch (error) {
      console.error("Error updating scenario metric:", error);
      res.status(500).json({ message: "Failed to update scenario metric" });
    }
  });

  // =============================================
  // Phase 14: Travel Management Routes
  // =============================================

  // Travel Preferences Routes
  app.get('/api/travel-preferences/:consultantId', isAuthenticated, async (req, res) => {
    try {
      const preferences = await storage.getTravelPreferences(req.params.consultantId);
      if (!preferences) {
        return res.status(404).json({ message: "Travel preferences not found" });
      }
      res.json(preferences);
    } catch (error) {
      console.error("Error fetching travel preferences:", error);
      res.status(500).json({ message: "Failed to fetch travel preferences" });
    }
  });

  app.put('/api/travel-preferences', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const validated = insertTravelPreferenceSchema.parse(req.body);
      const preferences = await storage.upsertTravelPreferences(validated);
      
      if (userId) {
        await logActivity(userId, {
          activityType: 'update',
          resourceType: 'travel_preferences',
          resourceId: preferences.id,
          resourceName: 'Travel Preferences',
          description: 'Updated travel preferences',
        }, req);
      }
      
      res.json(preferences);
    } catch (error) {
      console.error("Error upserting travel preferences:", error);
      res.status(400).json({ message: "Failed to upsert travel preferences" });
    }
  });

  app.patch('/api/travel-preferences/:consultantId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const preferences = await storage.updateTravelPreferences(req.params.consultantId, req.body);
      if (!preferences) {
        return res.status(404).json({ message: "Travel preferences not found" });
      }
      
      if (userId) {
        await logActivity(userId, {
          activityType: 'update',
          resourceType: 'travel_preferences',
          resourceId: preferences.id,
          resourceName: 'Travel Preferences',
          description: 'Updated travel preferences',
        }, req);
      }
      
      res.json(preferences);
    } catch (error) {
      console.error("Error updating travel preferences:", error);
      res.status(500).json({ message: "Failed to update travel preferences" });
    }
  });

  // Travel Bookings Routes
  app.get('/api/travel-bookings', isAuthenticated, async (req, res) => {
    try {
      const filters = {
        consultantId: req.query.consultantId as string | undefined,
        projectId: req.query.projectId as string | undefined,
        bookingType: req.query.bookingType as string | undefined,
        status: req.query.status as string | undefined,
      };
      const bookings = await storage.listTravelBookings(filters);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching travel bookings:", error);
      res.status(500).json({ message: "Failed to fetch travel bookings" });
    }
  });

  app.get('/api/travel-bookings/:id', isAuthenticated, async (req, res) => {
    try {
      const booking = await storage.getTravelBooking(req.params.id);
      if (!booking) {
        return res.status(404).json({ message: "Travel booking not found" });
      }
      res.json(booking);
    } catch (error) {
      console.error("Error fetching travel booking:", error);
      res.status(500).json({ message: "Failed to fetch travel booking" });
    }
  });

  app.post('/api/travel-bookings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const validated = insertTravelBookingSchema.parse({
        ...req.body,
        bookedById: req.body.bookedById || userId,
      });
      const booking = await storage.createTravelBooking(validated);
      
      if (userId) {
        await logActivity(userId, {
          activityType: 'create',
          resourceType: 'travel_booking',
          resourceId: booking.id,
          resourceName: `${validated.bookingType} booking`,
          description: 'Created travel booking',
        }, req);
      }
      
      res.status(201).json(booking);
    } catch (error) {
      console.error("Error creating travel booking:", error);
      res.status(400).json({ message: "Failed to create travel booking" });
    }
  });

  app.patch('/api/travel-bookings/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const booking = await storage.updateTravelBooking(req.params.id, req.body);
      if (!booking) {
        return res.status(404).json({ message: "Travel booking not found" });
      }
      
      if (userId) {
        await logActivity(userId, {
          activityType: 'update',
          resourceType: 'travel_booking',
          resourceId: booking.id,
          resourceName: `${booking.bookingType} booking`,
          description: 'Updated travel booking',
        }, req);
      }
      
      res.json(booking);
    } catch (error) {
      console.error("Error updating travel booking:", error);
      res.status(500).json({ message: "Failed to update travel booking" });
    }
  });

  app.delete('/api/travel-bookings/:id', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const bookingId = req.params.id;
      
      const booking = await storage.getTravelBooking(bookingId);
      const bookingName = booking ? `${booking.bookingType} booking` : bookingId;
      
      await storage.deleteTravelBooking(bookingId);
      
      if (userId) {
        await logActivity(userId, {
          activityType: 'delete',
          resourceType: 'travel_booking',
          resourceId: bookingId,
          resourceName: bookingName,
          description: 'Deleted travel booking',
        }, req);
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting travel booking:", error);
      res.status(500).json({ message: "Failed to delete travel booking" });
    }
  });

  // Travel Itineraries Routes
  app.get('/api/travel-itineraries', isAuthenticated, async (req, res) => {
    try {
      const filters = {
        consultantId: req.query.consultantId as string | undefined,
        projectId: req.query.projectId as string | undefined,
        status: req.query.status as string | undefined,
      };
      const itineraries = await storage.listTravelItineraries(filters);
      res.json(itineraries);
    } catch (error) {
      console.error("Error fetching travel itineraries:", error);
      res.status(500).json({ message: "Failed to fetch travel itineraries" });
    }
  });

  app.get('/api/travel-itineraries/:id', isAuthenticated, async (req, res) => {
    try {
      const itinerary = await storage.getTravelItinerary(req.params.id);
      if (!itinerary) {
        return res.status(404).json({ message: "Travel itinerary not found" });
      }
      res.json(itinerary);
    } catch (error) {
      console.error("Error fetching travel itinerary:", error);
      res.status(500).json({ message: "Failed to fetch travel itinerary" });
    }
  });

  app.post('/api/travel-itineraries', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const validated = insertTravelItinerarySchema.parse({
        ...req.body,
        createdById: req.body.createdById || userId,
      });
      const itinerary = await storage.createTravelItinerary(validated);
      
      if (userId) {
        await logActivity(userId, {
          activityType: 'create',
          resourceType: 'travel_itinerary',
          resourceId: itinerary.id,
          resourceName: validated.tripName || 'Travel Itinerary',
          description: 'Created travel itinerary',
        }, req);
      }
      
      res.status(201).json(itinerary);
    } catch (error) {
      console.error("Error creating travel itinerary:", error);
      res.status(400).json({ message: "Failed to create travel itinerary" });
    }
  });

  app.patch('/api/travel-itineraries/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const itinerary = await storage.updateTravelItinerary(req.params.id, req.body);
      if (!itinerary) {
        return res.status(404).json({ message: "Travel itinerary not found" });
      }
      
      if (userId) {
        await logActivity(userId, {
          activityType: 'update',
          resourceType: 'travel_itinerary',
          resourceId: itinerary.id,
          resourceName: itinerary.tripName || 'Travel Itinerary',
          description: 'Updated travel itinerary',
        }, req);
      }
      
      res.json(itinerary);
    } catch (error) {
      console.error("Error updating travel itinerary:", error);
      res.status(500).json({ message: "Failed to update travel itinerary" });
    }
  });

  app.delete('/api/travel-itineraries/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const itineraryId = req.params.id;
      
      const itinerary = await storage.getTravelItinerary(itineraryId);
      const itineraryName = itinerary?.tripName || itineraryId;
      
      await storage.deleteTravelItinerary(itineraryId);
      
      if (userId) {
        await logActivity(userId, {
          activityType: 'delete',
          resourceType: 'travel_itinerary',
          resourceId: itineraryId,
          resourceName: itineraryName,
          description: 'Deleted travel itinerary',
        }, req);
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting travel itinerary:", error);
      res.status(500).json({ message: "Failed to delete travel itinerary" });
    }
  });

  app.post('/api/travel-itineraries/:id/bookings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const validated = insertItineraryBookingSchema.parse({
        itineraryId: req.params.id,
        bookingId: req.body.bookingId,
        sequenceOrder: req.body.sequenceOrder,
      });
      const itineraryBooking = await storage.addBookingToItinerary(validated);
      
      if (userId) {
        await logActivity(userId, {
          activityType: 'create',
          resourceType: 'itinerary_booking',
          resourceId: itineraryBooking.id,
          resourceName: 'Itinerary Booking',
          description: 'Added booking to itinerary',
        }, req);
      }
      
      res.status(201).json(itineraryBooking);
    } catch (error) {
      console.error("Error adding booking to itinerary:", error);
      res.status(400).json({ message: "Failed to add booking to itinerary" });
    }
  });

  app.delete('/api/travel-itineraries/:itineraryId/bookings/:bookingId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { itineraryId, bookingId } = req.params;
      
      await storage.removeBookingFromItinerary(itineraryId, bookingId);
      
      if (userId) {
        await logActivity(userId, {
          activityType: 'delete',
          resourceType: 'itinerary_booking',
          resourceId: `${itineraryId}-${bookingId}`,
          resourceName: 'Itinerary Booking',
          description: 'Removed booking from itinerary',
        }, req);
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error removing booking from itinerary:", error);
      res.status(500).json({ message: "Failed to remove booking from itinerary" });
    }
  });

  // Carpool Groups Routes
  app.get('/api/carpool-groups', isAuthenticated, async (req, res) => {
    try {
      const filters = {
        projectId: req.query.projectId as string | undefined,
        status: req.query.status as string | undefined,
        driverId: req.query.driverId as string | undefined,
      };
      const groups = await storage.listCarpoolGroups(filters);
      res.json(groups);
    } catch (error) {
      console.error("Error fetching carpool groups:", error);
      res.status(500).json({ message: "Failed to fetch carpool groups" });
    }
  });

  app.get('/api/carpool-groups/available/:projectId/:date', isAuthenticated, async (req, res) => {
    try {
      const { projectId, date } = req.params;
      const carpools = await storage.getAvailableCarpools(projectId, date);
      res.json(carpools);
    } catch (error) {
      console.error("Error fetching available carpools:", error);
      res.status(500).json({ message: "Failed to fetch available carpools" });
    }
  });

  app.get('/api/carpool-groups/:id', isAuthenticated, async (req, res) => {
    try {
      const group = await storage.getCarpoolGroup(req.params.id);
      if (!group) {
        return res.status(404).json({ message: "Carpool group not found" });
      }
      res.json(group);
    } catch (error) {
      console.error("Error fetching carpool group:", error);
      res.status(500).json({ message: "Failed to fetch carpool group" });
    }
  });

  app.post('/api/carpool-groups', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const validated = insertCarpoolGroupSchema.parse(req.body);
      const group = await storage.createCarpoolGroup(validated);
      
      if (userId) {
        await logActivity(userId, {
          activityType: 'create',
          resourceType: 'carpool_group',
          resourceId: group.id,
          resourceName: 'Carpool Group',
          description: 'Created carpool group',
        }, req);
      }
      
      res.status(201).json(group);
    } catch (error) {
      console.error("Error creating carpool group:", error);
      res.status(400).json({ message: "Failed to create carpool group" });
    }
  });

  app.patch('/api/carpool-groups/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const group = await storage.updateCarpoolGroup(req.params.id, req.body);
      if (!group) {
        return res.status(404).json({ message: "Carpool group not found" });
      }
      
      if (userId) {
        await logActivity(userId, {
          activityType: 'update',
          resourceType: 'carpool_group',
          resourceId: group.id,
          resourceName: 'Carpool Group',
          description: 'Updated carpool group',
        }, req);
      }
      
      res.json(group);
    } catch (error) {
      console.error("Error updating carpool group:", error);
      res.status(500).json({ message: "Failed to update carpool group" });
    }
  });

  app.delete('/api/carpool-groups/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const groupId = req.params.id;
      
      await storage.deleteCarpoolGroup(groupId);
      
      if (userId) {
        await logActivity(userId, {
          activityType: 'delete',
          resourceType: 'carpool_group',
          resourceId: groupId,
          resourceName: 'Carpool Group',
          description: 'Deleted carpool group',
        }, req);
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting carpool group:", error);
      res.status(500).json({ message: "Failed to delete carpool group" });
    }
  });

  // Carpool Members Routes
  app.get('/api/carpool-members/:carpoolId', isAuthenticated, async (req, res) => {
    try {
      const members = await storage.listCarpoolMembers(req.params.carpoolId);
      res.json(members);
    } catch (error) {
      console.error("Error fetching carpool members:", error);
      res.status(500).json({ message: "Failed to fetch carpool members" });
    }
  });

  app.post('/api/carpool-members', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const validated = insertCarpoolMemberSchema.parse(req.body);
      const member = await storage.addCarpoolMember(validated);
      
      if (userId) {
        await logActivity(userId, {
          activityType: 'create',
          resourceType: 'carpool_member',
          resourceId: member.id,
          resourceName: 'Carpool Member',
          description: 'Added member to carpool',
        }, req);
      }
      
      res.status(201).json(member);
    } catch (error) {
      console.error("Error adding carpool member:", error);
      res.status(400).json({ message: "Failed to add carpool member" });
    }
  });

  app.patch('/api/carpool-members/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const member = await storage.updateCarpoolMember(req.params.id, req.body);
      if (!member) {
        return res.status(404).json({ message: "Carpool member not found" });
      }
      
      if (userId) {
        await logActivity(userId, {
          activityType: 'update',
          resourceType: 'carpool_member',
          resourceId: member.id,
          resourceName: 'Carpool Member',
          description: 'Updated carpool member status',
        }, req);
      }
      
      res.json(member);
    } catch (error) {
      console.error("Error updating carpool member:", error);
      res.status(500).json({ message: "Failed to update carpool member" });
    }
  });

  app.delete('/api/carpool-members/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const memberId = req.params.id;
      
      await storage.removeCarpoolMember(memberId);
      
      if (userId) {
        await logActivity(userId, {
          activityType: 'delete',
          resourceType: 'carpool_member',
          resourceId: memberId,
          resourceName: 'Carpool Member',
          description: 'Removed member from carpool',
        }, req);
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error removing carpool member:", error);
      res.status(500).json({ message: "Failed to remove carpool member" });
    }
  });

  // Shuttle Schedules Routes
  app.get('/api/shuttle-schedules', isAuthenticated, async (req, res) => {
    try {
      const filters = {
        projectId: req.query.projectId as string | undefined,
        isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
      };
      const schedules = await storage.listShuttleSchedules(filters);
      res.json(schedules);
    } catch (error) {
      console.error("Error fetching shuttle schedules:", error);
      res.status(500).json({ message: "Failed to fetch shuttle schedules" });
    }
  });

  app.get('/api/shuttle-schedules/:id', isAuthenticated, async (req, res) => {
    try {
      const schedule = await storage.getShuttleSchedule(req.params.id);
      if (!schedule) {
        return res.status(404).json({ message: "Shuttle schedule not found" });
      }
      res.json(schedule);
    } catch (error) {
      console.error("Error fetching shuttle schedule:", error);
      res.status(500).json({ message: "Failed to fetch shuttle schedule" });
    }
  });

  app.post('/api/shuttle-schedules', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const validated = insertShuttleScheduleSchema.parse(req.body);
      const schedule = await storage.createShuttleSchedule(validated);
      
      if (userId) {
        await logActivity(userId, {
          activityType: 'create',
          resourceType: 'shuttle_schedule',
          resourceId: schedule.id,
          resourceName: validated.shuttleName || 'Shuttle Schedule',
          description: 'Created shuttle schedule',
        }, req);
      }
      
      res.status(201).json(schedule);
    } catch (error) {
      console.error("Error creating shuttle schedule:", error);
      res.status(400).json({ message: "Failed to create shuttle schedule" });
    }
  });

  app.patch('/api/shuttle-schedules/:id', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const schedule = await storage.updateShuttleSchedule(req.params.id, req.body);
      if (!schedule) {
        return res.status(404).json({ message: "Shuttle schedule not found" });
      }
      
      if (userId) {
        await logActivity(userId, {
          activityType: 'update',
          resourceType: 'shuttle_schedule',
          resourceId: schedule.id,
          resourceName: schedule.shuttleName || 'Shuttle Schedule',
          description: 'Updated shuttle schedule',
        }, req);
      }
      
      res.json(schedule);
    } catch (error) {
      console.error("Error updating shuttle schedule:", error);
      res.status(500).json({ message: "Failed to update shuttle schedule" });
    }
  });

  app.delete('/api/shuttle-schedules/:id', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const scheduleId = req.params.id;
      
      const schedule = await storage.getShuttleSchedule(scheduleId);
      const scheduleName = schedule?.shuttleName || scheduleId;
      
      await storage.deleteShuttleSchedule(scheduleId);
      
      if (userId) {
        await logActivity(userId, {
          activityType: 'delete',
          resourceType: 'shuttle_schedule',
          resourceId: scheduleId,
          resourceName: scheduleName,
          description: 'Deleted shuttle schedule',
        }, req);
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting shuttle schedule:", error);
      res.status(500).json({ message: "Failed to delete shuttle schedule" });
    }
  });

  // Transportation Contacts Routes
  app.get('/api/transportation-contacts', isAuthenticated, async (req, res) => {
    try {
      const filters = {
        projectId: req.query.projectId as string | undefined,
        role: req.query.role as string | undefined,
        isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
      };
      const contacts = await storage.listTransportationContacts(filters);
      res.json(contacts);
    } catch (error) {
      console.error("Error fetching transportation contacts:", error);
      res.status(500).json({ message: "Failed to fetch transportation contacts" });
    }
  });

  app.get('/api/transportation-contacts/:id', isAuthenticated, async (req, res) => {
    try {
      const contact = await storage.getTransportationContact(req.params.id);
      if (!contact) {
        return res.status(404).json({ message: "Transportation contact not found" });
      }
      res.json(contact);
    } catch (error) {
      console.error("Error fetching transportation contact:", error);
      res.status(500).json({ message: "Failed to fetch transportation contact" });
    }
  });

  app.post('/api/transportation-contacts', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const validated = insertTransportationContactSchema.parse(req.body);
      const contact = await storage.createTransportationContact(validated);
      
      if (userId) {
        await logActivity(userId, {
          activityType: 'create',
          resourceType: 'transportation_contact',
          resourceId: contact.id,
          resourceName: validated.name,
          description: 'Created transportation contact',
        }, req);
      }
      
      res.status(201).json(contact);
    } catch (error) {
      console.error("Error creating transportation contact:", error);
      res.status(400).json({ message: "Failed to create transportation contact" });
    }
  });

  app.patch('/api/transportation-contacts/:id', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const contact = await storage.updateTransportationContact(req.params.id, req.body);
      if (!contact) {
        return res.status(404).json({ message: "Transportation contact not found" });
      }
      
      if (userId) {
        await logActivity(userId, {
          activityType: 'update',
          resourceType: 'transportation_contact',
          resourceId: contact.id,
          resourceName: contact.name,
          description: 'Updated transportation contact',
        }, req);
      }
      
      res.json(contact);
    } catch (error) {
      console.error("Error updating transportation contact:", error);
      res.status(500).json({ message: "Failed to update transportation contact" });
    }
  });

  app.delete('/api/transportation-contacts/:id', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const contactId = req.params.id;
      
      const contact = await storage.getTransportationContact(contactId);
      const contactName = contact?.name || contactId;
      
      await storage.deleteTransportationContact(contactId);
      
      if (userId) {
        await logActivity(userId, {
          activityType: 'delete',
          resourceType: 'transportation_contact',
          resourceId: contactId,
          resourceName: contactName,
          description: 'Deleted transportation contact',
        }, req);
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting transportation contact:", error);
      res.status(500).json({ message: "Failed to delete transportation contact" });
    }
  });

  // Travel Analytics Routes
  app.get('/api/travel-analytics', isAuthenticated, async (req, res) => {
    try {
      const filters = {
        projectId: req.query.projectId as string | undefined,
      };
      const analytics = await storage.getTravelAnalytics(filters);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching travel analytics:", error);
      res.status(500).json({ message: "Failed to fetch travel analytics" });
    }
  });

  app.get('/api/carpool-analytics', isAuthenticated, async (req, res) => {
    try {
      const filters = {
        projectId: req.query.projectId as string | undefined,
      };
      const analytics = await storage.getCarpoolAnalytics(filters);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching carpool analytics:", error);
      res.status(500).json({ message: "Failed to fetch carpool analytics" });
    }
  });

  // =============================================
  // Phase 15: Quality Assurance, Gamification, Compliance Routes
  // =============================================

  // Consultant Scorecards Routes
  app.get('/api/consultant-scorecards', isAuthenticated, async (req, res) => {
    try {
      const filters = {
        consultantId: req.query.consultantId as string | undefined,
        projectId: req.query.projectId as string | undefined,
        periodStart: req.query.periodStart as string | undefined,
      };
      const scorecards = await storage.listConsultantScorecards(filters);
      res.json(scorecards);
    } catch (error) {
      console.error("Error fetching consultant scorecards:", error);
      res.status(500).json({ message: "Failed to fetch consultant scorecards" });
    }
  });

  app.get('/api/consultant-scorecards/:id', isAuthenticated, async (req, res) => {
    try {
      const scorecard = await storage.getConsultantScorecard(req.params.id);
      if (!scorecard) {
        return res.status(404).json({ message: "Consultant scorecard not found" });
      }
      res.json(scorecard);
    } catch (error) {
      console.error("Error fetching consultant scorecard:", error);
      res.status(500).json({ message: "Failed to fetch consultant scorecard" });
    }
  });

  app.post('/api/consultant-scorecards', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const validated = insertConsultantScorecardSchema.parse(req.body);
      const scorecard = await storage.createConsultantScorecard(validated);
      
      if (userId) {
        await logActivity(userId, {
          activityType: 'create',
          resourceType: 'consultant_scorecard',
          resourceId: scorecard.id,
          resourceName: `Scorecard for ${validated.periodStart}`,
          description: 'Created consultant scorecard',
        }, req);
      }
      
      res.status(201).json(scorecard);
    } catch (error) {
      console.error("Error creating consultant scorecard:", error);
      res.status(400).json({ message: "Failed to create consultant scorecard" });
    }
  });

  app.patch('/api/consultant-scorecards/:id', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const scorecard = await storage.updateConsultantScorecard(req.params.id, req.body);
      if (!scorecard) {
        return res.status(404).json({ message: "Consultant scorecard not found" });
      }
      
      if (userId) {
        await logActivity(userId, {
          activityType: 'update',
          resourceType: 'consultant_scorecard',
          resourceId: scorecard.id,
          resourceName: `Scorecard for ${scorecard.periodStart}`,
          description: 'Updated consultant scorecard',
        }, req);
      }
      
      res.json(scorecard);
    } catch (error) {
      console.error("Error updating consultant scorecard:", error);
      res.status(500).json({ message: "Failed to update consultant scorecard" });
    }
  });

  app.delete('/api/consultant-scorecards/:id', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const scorecardId = req.params.id;
      
      const scorecard = await storage.getConsultantScorecard(scorecardId);
      const scorecardName = scorecard ? `Scorecard for ${scorecard.periodStart}` : scorecardId;
      
      await storage.deleteConsultantScorecard(scorecardId);
      
      if (userId) {
        await logActivity(userId, {
          activityType: 'delete',
          resourceType: 'consultant_scorecard',
          resourceId: scorecardId,
          resourceName: scorecardName,
          description: 'Deleted consultant scorecard',
        }, req);
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting consultant scorecard:", error);
      res.status(500).json({ message: "Failed to delete consultant scorecard" });
    }
  });

  // Pulse Surveys Routes
  app.get('/api/pulse-surveys', isAuthenticated, async (req, res) => {
    try {
      const filters = {
        projectId: req.query.projectId as string | undefined,
        isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
      };
      const surveys = await storage.listPulseSurveys(filters);
      res.json(surveys);
    } catch (error) {
      console.error("Error fetching pulse surveys:", error);
      res.status(500).json({ message: "Failed to fetch pulse surveys" });
    }
  });

  app.get('/api/pulse-surveys/active', isAuthenticated, async (req, res) => {
    try {
      const surveys = await storage.listActivePulseSurveys();
      res.json(surveys);
    } catch (error) {
      console.error("Error fetching active pulse surveys:", error);
      res.status(500).json({ message: "Failed to fetch active pulse surveys" });
    }
  });

  app.get('/api/pulse-surveys/:id', isAuthenticated, async (req, res) => {
    try {
      const survey = await storage.getPulseSurvey(req.params.id);
      if (!survey) {
        return res.status(404).json({ message: "Pulse survey not found" });
      }
      res.json(survey);
    } catch (error) {
      console.error("Error fetching pulse survey:", error);
      res.status(500).json({ message: "Failed to fetch pulse survey" });
    }
  });

  app.post('/api/pulse-surveys', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const validated = insertPulseSurveySchema.parse({
        ...req.body,
        createdById: req.body.createdById || userId,
      });
      const survey = await storage.createPulseSurvey(validated);
      
      if (userId) {
        await logActivity(userId, {
          activityType: 'create',
          resourceType: 'pulse_survey',
          resourceId: survey.id,
          resourceName: validated.title,
          description: 'Created pulse survey',
        }, req);
      }
      
      res.status(201).json(survey);
    } catch (error) {
      console.error("Error creating pulse survey:", error);
      res.status(400).json({ message: "Failed to create pulse survey" });
    }
  });

  app.patch('/api/pulse-surveys/:id', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const survey = await storage.updatePulseSurvey(req.params.id, req.body);
      if (!survey) {
        return res.status(404).json({ message: "Pulse survey not found" });
      }
      
      if (userId) {
        await logActivity(userId, {
          activityType: 'update',
          resourceType: 'pulse_survey',
          resourceId: survey.id,
          resourceName: survey.title,
          description: 'Updated pulse survey',
        }, req);
      }
      
      res.json(survey);
    } catch (error) {
      console.error("Error updating pulse survey:", error);
      res.status(500).json({ message: "Failed to update pulse survey" });
    }
  });

  app.delete('/api/pulse-surveys/:id', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const surveyId = req.params.id;
      
      const survey = await storage.getPulseSurvey(surveyId);
      const surveyName = survey?.title || surveyId;
      
      await storage.deletePulseSurvey(surveyId);
      
      if (userId) {
        await logActivity(userId, {
          activityType: 'delete',
          resourceType: 'pulse_survey',
          resourceId: surveyId,
          resourceName: surveyName,
          description: 'Deleted pulse survey',
        }, req);
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting pulse survey:", error);
      res.status(500).json({ message: "Failed to delete pulse survey" });
    }
  });

  // Pulse Responses Routes
  app.get('/api/pulse-responses', isAuthenticated, async (req, res) => {
    try {
      const filters = {
        surveyId: req.query.surveyId as string | undefined,
        consultantId: req.query.consultantId as string | undefined,
      };
      const responses = await storage.listPulseResponses(filters);
      res.json(responses);
    } catch (error) {
      console.error("Error fetching pulse responses:", error);
      res.status(500).json({ message: "Failed to fetch pulse responses" });
    }
  });

  app.get('/api/pulse-responses/:id', isAuthenticated, async (req, res) => {
    try {
      const response = await storage.getPulseResponse(req.params.id);
      if (!response) {
        return res.status(404).json({ message: "Pulse response not found" });
      }
      res.json(response);
    } catch (error) {
      console.error("Error fetching pulse response:", error);
      res.status(500).json({ message: "Failed to fetch pulse response" });
    }
  });

  app.post('/api/pulse-responses', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const validated = insertPulseResponseSchema.parse(req.body);
      const response = await storage.createPulseResponse(validated);
      
      if (userId) {
        await logActivity(userId, {
          activityType: 'create',
          resourceType: 'pulse_response',
          resourceId: response.id,
          resourceName: 'Pulse Survey Response',
          description: 'Submitted pulse survey response',
        }, req);
      }
      
      res.status(201).json(response);
    } catch (error) {
      console.error("Error creating pulse response:", error);
      res.status(400).json({ message: "Failed to create pulse response" });
    }
  });

  // NPS Responses Routes
  app.get('/api/nps-responses', isAuthenticated, async (req, res) => {
    try {
      const filters = {
        category: req.query.category as string | undefined,
        consultantId: req.query.consultantId as string | undefined,
      };
      const responses = await storage.listNpsResponses(filters);
      res.json(responses);
    } catch (error) {
      console.error("Error fetching NPS responses:", error);
      res.status(500).json({ message: "Failed to fetch NPS responses" });
    }
  });

  app.post('/api/nps-responses', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const validated = insertNpsResponseSchema.parse(req.body);
      const response = await storage.createNpsResponse(validated);
      
      if (userId) {
        await logActivity(userId, {
          activityType: 'create',
          resourceType: 'nps_response',
          resourceId: response.id,
          resourceName: `NPS Response (${validated.category})`,
          description: 'Submitted NPS response',
        }, req);
      }
      
      res.status(201).json(response);
    } catch (error) {
      console.error("Error creating NPS response:", error);
      res.status(400).json({ message: "Failed to create NPS response" });
    }
  });

  app.get('/api/nps-score', isAuthenticated, async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      const score = await storage.getNpsScore(category);
      res.json(score);
    } catch (error) {
      console.error("Error fetching NPS score:", error);
      res.status(500).json({ message: "Failed to fetch NPS score" });
    }
  });

  // Incidents Routes
  app.get('/api/incidents', isAuthenticated, async (req, res) => {
    try {
      const filters = {
        projectId: req.query.projectId as string | undefined,
        hospitalId: req.query.hospitalId as string | undefined,
        status: req.query.status as string | undefined,
        severity: req.query.severity as string | undefined,
      };
      const incidents = await storage.listIncidents(filters);
      res.json(incidents);
    } catch (error) {
      console.error("Error fetching incidents:", error);
      res.status(500).json({ message: "Failed to fetch incidents" });
    }
  });

  app.get('/api/incidents/:id', isAuthenticated, async (req, res) => {
    try {
      const incident = await storage.getIncident(req.params.id);
      if (!incident) {
        return res.status(404).json({ message: "Incident not found" });
      }
      res.json(incident);
    } catch (error) {
      console.error("Error fetching incident:", error);
      res.status(500).json({ message: "Failed to fetch incident" });
    }
  });

  app.post('/api/incidents', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const validated = insertIncidentSchema.parse({
        ...req.body,
        reportedById: req.body.reportedById || userId,
      });
      const incident = await storage.createIncident(validated);
      
      if (userId) {
        await logActivity(userId, {
          activityType: 'create',
          resourceType: 'incident',
          resourceId: incident.id,
          resourceName: validated.title,
          description: 'Reported an incident',
        }, req);
      }
      
      res.status(201).json(incident);
    } catch (error) {
      console.error("Error creating incident:", error);
      res.status(400).json({ message: "Failed to create incident" });
    }
  });

  app.patch('/api/incidents/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      const incident = await storage.getIncident(req.params.id);
      
      if (!incident) {
        return res.status(404).json({ message: "Incident not found" });
      }
      
      if (user?.role !== 'admin' && incident.assignedToId !== userId) {
        return res.status(403).json({ message: "Access denied. You can only update incidents assigned to you." });
      }
      
      const updatedIncident = await storage.updateIncident(req.params.id, req.body);
      
      if (userId) {
        await logActivity(userId, {
          activityType: 'update',
          resourceType: 'incident',
          resourceId: updatedIncident!.id,
          resourceName: updatedIncident!.title,
          description: 'Updated incident',
        }, req);
      }
      
      res.json(updatedIncident);
    } catch (error) {
      console.error("Error updating incident:", error);
      res.status(500).json({ message: "Failed to update incident" });
    }
  });

  app.delete('/api/incidents/:id', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const incidentId = req.params.id;
      
      const incident = await storage.getIncident(incidentId);
      const incidentName = incident?.title || incidentId;
      
      await storage.deleteIncident(incidentId);
      
      if (userId) {
        await logActivity(userId, {
          activityType: 'delete',
          resourceType: 'incident',
          resourceId: incidentId,
          resourceName: incidentName,
          description: 'Deleted incident',
        }, req);
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting incident:", error);
      res.status(500).json({ message: "Failed to delete incident" });
    }
  });

  // Corrective Actions Routes
  app.get('/api/corrective-actions', isAuthenticated, async (req, res) => {
    try {
      const filters = {
        incidentId: req.query.incidentId as string | undefined,
        status: req.query.status as string | undefined,
        assignedToId: req.query.assignedToId as string | undefined,
      };
      const actions = await storage.listCorrectiveActions(filters);
      res.json(actions);
    } catch (error) {
      console.error("Error fetching corrective actions:", error);
      res.status(500).json({ message: "Failed to fetch corrective actions" });
    }
  });

  app.get('/api/corrective-actions/:id', isAuthenticated, async (req, res) => {
    try {
      const action = await storage.getCorrectiveAction(req.params.id);
      if (!action) {
        return res.status(404).json({ message: "Corrective action not found" });
      }
      res.json(action);
    } catch (error) {
      console.error("Error fetching corrective action:", error);
      res.status(500).json({ message: "Failed to fetch corrective action" });
    }
  });

  app.post('/api/corrective-actions', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const validated = insertCorrectiveActionSchema.parse({
        ...req.body,
        createdById: req.body.createdById || userId,
      });
      const action = await storage.createCorrectiveAction(validated);
      
      if (userId) {
        await logActivity(userId, {
          activityType: 'create',
          resourceType: 'corrective_action',
          resourceId: action.id,
          resourceName: validated.title,
          description: 'Created corrective action',
        }, req);
      }
      
      res.status(201).json(action);
    } catch (error) {
      console.error("Error creating corrective action:", error);
      res.status(400).json({ message: "Failed to create corrective action" });
    }
  });

  app.patch('/api/corrective-actions/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      const action = await storage.getCorrectiveAction(req.params.id);
      
      if (!action) {
        return res.status(404).json({ message: "Corrective action not found" });
      }
      
      if (user?.role !== 'admin' && action.assignedToId !== userId) {
        return res.status(403).json({ message: "Access denied. You can only update corrective actions assigned to you." });
      }
      
      const updatedAction = await storage.updateCorrectiveAction(req.params.id, req.body);
      
      if (userId) {
        await logActivity(userId, {
          activityType: 'update',
          resourceType: 'corrective_action',
          resourceId: updatedAction!.id,
          resourceName: updatedAction!.title,
          description: 'Updated corrective action',
        }, req);
      }
      
      res.json(updatedAction);
    } catch (error) {
      console.error("Error updating corrective action:", error);
      res.status(500).json({ message: "Failed to update corrective action" });
    }
  });

  app.delete('/api/corrective-actions/:id', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const actionId = req.params.id;
      
      const action = await storage.getCorrectiveAction(actionId);
      const actionName = action?.title || actionId;
      
      await storage.deleteCorrectiveAction(actionId);
      
      if (userId) {
        await logActivity(userId, {
          activityType: 'delete',
          resourceType: 'corrective_action',
          resourceId: actionId,
          resourceName: actionName,
          description: 'Deleted corrective action',
        }, req);
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting corrective action:", error);
      res.status(500).json({ message: "Failed to delete corrective action" });
    }
  });

  // Achievement Badges Routes
  app.get('/api/achievement-badges', isAuthenticated, async (req, res) => {
    try {
      const filters = {
        category: req.query.category as string | undefined,
        isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
      };
      const badges = await storage.listAchievementBadges(filters);
      res.json(badges);
    } catch (error) {
      console.error("Error fetching achievement badges:", error);
      res.status(500).json({ message: "Failed to fetch achievement badges" });
    }
  });

  app.get('/api/achievement-badges/:id', isAuthenticated, async (req, res) => {
    try {
      const badge = await storage.getAchievementBadge(req.params.id);
      if (!badge) {
        return res.status(404).json({ message: "Achievement badge not found" });
      }
      res.json(badge);
    } catch (error) {
      console.error("Error fetching achievement badge:", error);
      res.status(500).json({ message: "Failed to fetch achievement badge" });
    }
  });

  app.post('/api/achievement-badges', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const validated = insertAchievementBadgeSchema.parse(req.body);
      const badge = await storage.createAchievementBadge(validated);
      
      if (userId) {
        await logActivity(userId, {
          activityType: 'create',
          resourceType: 'achievement_badge',
          resourceId: badge.id,
          resourceName: validated.name,
          description: 'Created achievement badge',
        }, req);
      }
      
      res.status(201).json(badge);
    } catch (error) {
      console.error("Error creating achievement badge:", error);
      res.status(400).json({ message: "Failed to create achievement badge" });
    }
  });

  app.patch('/api/achievement-badges/:id', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const badge = await storage.updateAchievementBadge(req.params.id, req.body);
      if (!badge) {
        return res.status(404).json({ message: "Achievement badge not found" });
      }
      
      if (userId) {
        await logActivity(userId, {
          activityType: 'update',
          resourceType: 'achievement_badge',
          resourceId: badge.id,
          resourceName: badge.name,
          description: 'Updated achievement badge',
        }, req);
      }
      
      res.json(badge);
    } catch (error) {
      console.error("Error updating achievement badge:", error);
      res.status(500).json({ message: "Failed to update achievement badge" });
    }
  });

  app.delete('/api/achievement-badges/:id', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const badgeId = req.params.id;
      
      const badge = await storage.getAchievementBadge(badgeId);
      const badgeName = badge?.name || badgeId;
      
      await storage.deleteAchievementBadge(badgeId);
      
      if (userId) {
        await logActivity(userId, {
          activityType: 'delete',
          resourceType: 'achievement_badge',
          resourceId: badgeId,
          resourceName: badgeName,
          description: 'Deleted achievement badge',
        }, req);
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting achievement badge:", error);
      res.status(500).json({ message: "Failed to delete achievement badge" });
    }
  });

  // Consultant Badges Routes
  app.get('/api/consultant-badges', isAuthenticated, async (req, res) => {
    try {
      const filters = {
        consultantId: req.query.consultantId as string | undefined,
        badgeId: req.query.badgeId as string | undefined,
      };
      const badges = await storage.listConsultantBadges(filters);
      res.json(badges);
    } catch (error) {
      console.error("Error fetching consultant badges:", error);
      res.status(500).json({ message: "Failed to fetch consultant badges" });
    }
  });

  app.post('/api/consultant-badges', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const validated = insertConsultantBadgeSchema.parse({
        ...req.body,
        awardedById: req.body.awardedById || userId,
      });
      const consultantBadge = await storage.awardBadgeToConsultant(validated);
      
      if (userId) {
        await logActivity(userId, {
          activityType: 'create',
          resourceType: 'consultant_badge',
          resourceId: consultantBadge.id,
          resourceName: 'Badge Award',
          description: 'Awarded badge to consultant',
        }, req);
      }
      
      res.status(201).json(consultantBadge);
    } catch (error) {
      console.error("Error awarding badge to consultant:", error);
      res.status(400).json({ message: "Failed to award badge to consultant" });
    }
  });

  app.delete('/api/consultant-badges/:id', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const badgeId = req.params.id;
      
      await storage.deleteConsultantBadge(badgeId);
      
      if (userId) {
        await logActivity(userId, {
          activityType: 'delete',
          resourceType: 'consultant_badge',
          resourceId: badgeId,
          resourceName: 'Badge Award',
          description: 'Removed badge from consultant',
        }, req);
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error removing badge from consultant:", error);
      res.status(500).json({ message: "Failed to remove badge from consultant" });
    }
  });

  // Point Transactions Routes
  app.get('/api/point-transactions', isAuthenticated, async (req, res) => {
    try {
      const filters = {
        consultantId: req.query.consultantId as string | undefined,
        type: req.query.type as string | undefined,
      };
      const transactions = await storage.listPointTransactions(filters);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching point transactions:", error);
      res.status(500).json({ message: "Failed to fetch point transactions" });
    }
  });

  app.post('/api/point-transactions', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const validated = insertPointTransactionSchema.parse({
        ...req.body,
        awardedById: req.body.awardedById || userId,
      });
      const transaction = await storage.createPointTransaction(validated);
      
      if (userId) {
        await logActivity(userId, {
          activityType: 'create',
          resourceType: 'point_transaction',
          resourceId: transaction.id,
          resourceName: `${validated.points} points (${validated.type})`,
          description: 'Created point transaction',
        }, req);
      }
      
      res.status(201).json(transaction);
    } catch (error) {
      console.error("Error creating point transaction:", error);
      res.status(400).json({ message: "Failed to create point transaction" });
    }
  });

  app.get('/api/consultant-points/:consultantId', isAuthenticated, async (req, res) => {
    try {
      const balance = await storage.getConsultantPointBalance(req.params.consultantId);
      res.json({ consultantId: req.params.consultantId, balance });
    } catch (error) {
      console.error("Error fetching consultant point balance:", error);
      res.status(500).json({ message: "Failed to fetch consultant point balance" });
    }
  });

  // Referrals Routes
  app.get('/api/referrals', isAuthenticated, async (req, res) => {
    try {
      const filters = {
        referrerId: req.query.referrerId as string | undefined,
        status: req.query.status as string | undefined,
      };
      const referrals = await storage.listReferrals(filters);
      res.json(referrals);
    } catch (error) {
      console.error("Error fetching referrals:", error);
      res.status(500).json({ message: "Failed to fetch referrals" });
    }
  });

  app.get('/api/referrals/:id', isAuthenticated, async (req, res) => {
    try {
      const referral = await storage.getReferral(req.params.id);
      if (!referral) {
        return res.status(404).json({ message: "Referral not found" });
      }
      res.json(referral);
    } catch (error) {
      console.error("Error fetching referral:", error);
      res.status(500).json({ message: "Failed to fetch referral" });
    }
  });

  app.post('/api/referrals', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const validated = insertReferralSchema.parse(req.body);
      const referral = await storage.createReferral(validated);
      
      if (userId) {
        await logActivity(userId, {
          activityType: 'create',
          resourceType: 'referral',
          resourceId: referral.id,
          resourceName: `Referral: ${validated.referredName}`,
          description: 'Submitted a referral',
        }, req);
      }
      
      res.status(201).json(referral);
    } catch (error) {
      console.error("Error creating referral:", error);
      res.status(400).json({ message: "Failed to create referral" });
    }
  });

  app.patch('/api/referrals/:id', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const referral = await storage.updateReferral(req.params.id, req.body);
      if (!referral) {
        return res.status(404).json({ message: "Referral not found" });
      }
      
      if (userId) {
        await logActivity(userId, {
          activityType: 'update',
          resourceType: 'referral',
          resourceId: referral.id,
          resourceName: `Referral: ${referral.referredName}`,
          description: 'Updated referral status',
        }, req);
      }
      
      res.json(referral);
    } catch (error) {
      console.error("Error updating referral:", error);
      res.status(500).json({ message: "Failed to update referral" });
    }
  });

  app.delete('/api/referrals/:id', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const referralId = req.params.id;
      
      const referral = await storage.getReferral(referralId);
      const referralName = referral ? `Referral: ${referral.referredName}` : referralId;
      
      await storage.deleteReferral(referralId);
      
      if (userId) {
        await logActivity(userId, {
          activityType: 'delete',
          resourceType: 'referral',
          resourceId: referralId,
          resourceName: referralName,
          description: 'Deleted referral',
        }, req);
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting referral:", error);
      res.status(500).json({ message: "Failed to delete referral" });
    }
  });

  // Compliance Checks Routes
  app.get('/api/compliance-checks', isAuthenticated, async (req, res) => {
    try {
      const filters = {
        consultantId: req.query.consultantId as string | undefined,
        checkType: req.query.checkType as string | undefined,
        status: req.query.status as string | undefined,
      };
      const checks = await storage.listComplianceChecks(filters);
      res.json(checks);
    } catch (error) {
      console.error("Error fetching compliance checks:", error);
      res.status(500).json({ message: "Failed to fetch compliance checks" });
    }
  });

  app.get('/api/compliance-checks/expiring', isAuthenticated, async (req, res) => {
    try {
      const withinDays = parseInt(req.query.days as string) || 30;
      const checks = await storage.listExpiringComplianceChecks(withinDays);
      res.json(checks);
    } catch (error) {
      console.error("Error fetching expiring compliance checks:", error);
      res.status(500).json({ message: "Failed to fetch expiring compliance checks" });
    }
  });

  app.get('/api/compliance-checks/:id', isAuthenticated, async (req, res) => {
    try {
      const check = await storage.getComplianceCheck(req.params.id);
      if (!check) {
        return res.status(404).json({ message: "Compliance check not found" });
      }
      res.json(check);
    } catch (error) {
      console.error("Error fetching compliance check:", error);
      res.status(500).json({ message: "Failed to fetch compliance check" });
    }
  });

  app.post('/api/compliance-checks', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const validated = insertComplianceCheckSchema.parse({
        ...req.body,
        checkedById: req.body.checkedById || userId,
      });
      const check = await storage.createComplianceCheck(validated);
      
      if (userId) {
        await logActivity(userId, {
          activityType: 'create',
          resourceType: 'compliance_check',
          resourceId: check.id,
          resourceName: validated.checkType,
          description: 'Created compliance check',
        }, req);
      }
      
      res.status(201).json(check);
    } catch (error) {
      console.error("Error creating compliance check:", error);
      res.status(400).json({ message: "Failed to create compliance check" });
    }
  });

  app.patch('/api/compliance-checks/:id', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const check = await storage.updateComplianceCheck(req.params.id, req.body);
      if (!check) {
        return res.status(404).json({ message: "Compliance check not found" });
      }
      
      if (userId) {
        await logActivity(userId, {
          activityType: 'update',
          resourceType: 'compliance_check',
          resourceId: check.id,
          resourceName: check.checkType,
          description: 'Updated compliance check',
        }, req);
      }
      
      res.json(check);
    } catch (error) {
      console.error("Error updating compliance check:", error);
      res.status(500).json({ message: "Failed to update compliance check" });
    }
  });

  app.delete('/api/compliance-checks/:id', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const checkId = req.params.id;
      
      const check = await storage.getComplianceCheck(checkId);
      const checkName = check?.checkType || checkId;
      
      await storage.deleteComplianceCheck(checkId);
      
      if (userId) {
        await logActivity(userId, {
          activityType: 'delete',
          resourceType: 'compliance_check',
          resourceId: checkId,
          resourceName: checkName,
          description: 'Deleted compliance check',
        }, req);
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting compliance check:", error);
      res.status(500).json({ message: "Failed to delete compliance check" });
    }
  });

  // Compliance Audits Routes
  app.get('/api/compliance-audits', isAuthenticated, async (req, res) => {
    try {
      const filters = {
        projectId: req.query.projectId as string | undefined,
        hospitalId: req.query.hospitalId as string | undefined,
        status: req.query.status as string | undefined,
      };
      const audits = await storage.listComplianceAudits(filters);
      res.json(audits);
    } catch (error) {
      console.error("Error fetching compliance audits:", error);
      res.status(500).json({ message: "Failed to fetch compliance audits" });
    }
  });

  app.get('/api/compliance-audits/:id', isAuthenticated, async (req, res) => {
    try {
      const audit = await storage.getComplianceAudit(req.params.id);
      if (!audit) {
        return res.status(404).json({ message: "Compliance audit not found" });
      }
      res.json(audit);
    } catch (error) {
      console.error("Error fetching compliance audit:", error);
      res.status(500).json({ message: "Failed to fetch compliance audit" });
    }
  });

  app.post('/api/compliance-audits', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const validated = insertComplianceAuditSchema.parse({
        ...req.body,
        auditorId: req.body.auditorId || userId,
      });
      const audit = await storage.createComplianceAudit(validated);
      
      if (userId) {
        await logActivity(userId, {
          activityType: 'create',
          resourceType: 'compliance_audit',
          resourceId: audit.id,
          resourceName: validated.auditType,
          description: 'Created compliance audit',
        }, req);
      }
      
      res.status(201).json(audit);
    } catch (error) {
      console.error("Error creating compliance audit:", error);
      res.status(400).json({ message: "Failed to create compliance audit" });
    }
  });

  app.patch('/api/compliance-audits/:id', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const audit = await storage.updateComplianceAudit(req.params.id, req.body);
      if (!audit) {
        return res.status(404).json({ message: "Compliance audit not found" });
      }
      
      if (userId) {
        await logActivity(userId, {
          activityType: 'update',
          resourceType: 'compliance_audit',
          resourceId: audit.id,
          resourceName: audit.auditType,
          description: 'Updated compliance audit',
        }, req);
      }
      
      res.json(audit);
    } catch (error) {
      console.error("Error updating compliance audit:", error);
      res.status(500).json({ message: "Failed to update compliance audit" });
    }
  });

  app.delete('/api/compliance-audits/:id', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const auditId = req.params.id;
      
      const audit = await storage.getComplianceAudit(auditId);
      const auditName = audit?.auditType || auditId;
      
      await storage.deleteComplianceAudit(auditId);
      
      if (userId) {
        await logActivity(userId, {
          activityType: 'delete',
          resourceType: 'compliance_audit',
          resourceId: auditId,
          resourceName: auditName,
          description: 'Deleted compliance audit',
        }, req);
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting compliance audit:", error);
      res.status(500).json({ message: "Failed to delete compliance audit" });
    }
  });

  // Phase 15 Analytics Routes
  app.get('/api/analytics/quality', isAuthenticated, async (req, res) => {
    try {
      const filters = {
        projectId: req.query.projectId as string | undefined,
      };
      const analytics = await storage.getQualityAnalytics(filters);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching quality analytics:", error);
      res.status(500).json({ message: "Failed to fetch quality analytics" });
    }
  });

  app.get('/api/analytics/gamification', isAuthenticated, async (req, res) => {
    try {
      const analytics = await storage.getGamificationAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching gamification analytics:", error);
      res.status(500).json({ message: "Failed to fetch gamification analytics" });
    }
  });

  app.get('/api/analytics/compliance', isAuthenticated, async (req, res) => {
    try {
      const filters = {
        consultantId: req.query.consultantId as string | undefined,
      };
      const analytics = await storage.getComplianceAnalytics(filters);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching compliance analytics:", error);
      res.status(500).json({ message: "Failed to fetch compliance analytics" });
    }
  });

  // ============================================
  // AI ANALYTICS ROUTES
  // ============================================

  // Get AI-powered insights and recommendations
  app.get('/api/analytics/ai', isAuthenticated, async (req, res) => {
    try {
      const analytics = await storage.getAIAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching AI analytics:", error);
      res.status(500).json({ message: "Failed to fetch AI analytics" });
    }
  });

  // ============================================
  // DIGITAL SIGNATURES & CONTRACTS
  // ============================================

  // Contract Templates
  app.get('/api/contract-templates', isAuthenticated, async (req, res) => {
    try {
      const isActive = req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined;
      const templateType = req.query.templateType as string | undefined;
      const templates = await storage.listContractTemplates({ isActive, templateType });
      res.json(templates);
    } catch (error) {
      console.error("Error fetching contract templates:", error);
      res.status(500).json({ message: "Failed to fetch contract templates" });
    }
  });

  app.get('/api/contract-templates/:id', isAuthenticated, async (req, res) => {
    try {
      const template = await storage.getContractTemplate(req.params.id);
      if (!template) {
        return res.status(404).json({ message: "Contract template not found" });
      }
      res.json(template);
    } catch (error) {
      console.error("Error fetching contract template:", error);
      res.status(500).json({ message: "Failed to fetch contract template" });
    }
  });

  app.post('/api/contract-templates', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const validated = insertContractTemplateSchema.parse({
        ...req.body,
        createdById: userId,
      });
      const template = await storage.createContractTemplate(validated);
      res.status(201).json(template);
    } catch (error) {
      console.error("Error creating contract template:", error);
      res.status(400).json({ message: "Failed to create contract template" });
    }
  });

  app.patch('/api/contract-templates/:id', isAuthenticated, requireRole('admin'), async (req, res) => {
    try {
      const template = await storage.updateContractTemplate(req.params.id, req.body);
      if (!template) {
        return res.status(404).json({ message: "Contract template not found" });
      }
      res.json(template);
    } catch (error) {
      console.error("Error updating contract template:", error);
      res.status(500).json({ message: "Failed to update contract template" });
    }
  });

  app.delete('/api/contract-templates/:id', isAuthenticated, requireRole('admin'), async (req, res) => {
    try {
      await storage.deleteContractTemplate(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting contract template:", error);
      res.status(500).json({ message: "Failed to delete contract template" });
    }
  });

  // Contracts
  app.get('/api/contracts', isAuthenticated, async (req, res) => {
    try {
      const filters = {
        consultantId: req.query.consultantId as string | undefined,
        projectId: req.query.projectId as string | undefined,
        status: req.query.status as string | undefined,
      };
      const contracts = await storage.listContracts(filters);
      res.json(contracts);
    } catch (error) {
      console.error("Error fetching contracts:", error);
      res.status(500).json({ message: "Failed to fetch contracts" });
    }
  });

  app.get('/api/contracts/:id', isAuthenticated, async (req, res) => {
    try {
      const contract = await storage.getContractWithDetails(req.params.id);
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }
      res.json(contract);
    } catch (error) {
      console.error("Error fetching contract:", error);
      res.status(500).json({ message: "Failed to fetch contract" });
    }
  });

  app.post('/api/contracts', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const validated = insertContractSchema.parse({
        ...req.body,
        createdById: userId,
      });
      const contract = await storage.createContract(validated);
      
      // Create audit event
      await storage.createContractAuditEvent({
        contractId: contract.id,
        eventType: 'created',
        userId,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] || null,
        details: { title: contract.title },
      });
      
      res.status(201).json(contract);
    } catch (error) {
      console.error("Error creating contract:", error);
      res.status(400).json({ message: "Failed to create contract" });
    }
  });

  app.patch('/api/contracts/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const contract = await storage.updateContract(req.params.id, req.body);
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }
      
      await storage.createContractAuditEvent({
        contractId: contract.id,
        eventType: 'updated',
        userId,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] || null,
        details: { changes: Object.keys(req.body) },
      });
      
      res.json(contract);
    } catch (error) {
      console.error("Error updating contract:", error);
      res.status(500).json({ message: "Failed to update contract" });
    }
  });

  // Contract Signers
  app.get('/api/contracts/:id/signers', isAuthenticated, async (req, res) => {
    try {
      const signers = await storage.getContractSigners(req.params.id);
      res.json(signers);
    } catch (error) {
      console.error("Error fetching contract signers:", error);
      res.status(500).json({ message: "Failed to fetch contract signers" });
    }
  });

  app.post('/api/contracts/:id/signers', isAuthenticated, requireRole('admin'), async (req, res) => {
    try {
      const validated = insertContractSignerSchema.parse({
        ...req.body,
        contractId: req.params.id,
      });
      const signer = await storage.createContractSigner(validated);
      res.status(201).json(signer);
    } catch (error) {
      console.error("Error adding contract signer:", error);
      res.status(400).json({ message: "Failed to add contract signer" });
    }
  });

  // Sign Contract
  app.post('/api/contracts/:id/sign', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const contractId = req.params.id;
      
      // Find the user's signer record
      const signers = await storage.getContractSigners(contractId);
      const mySigner = signers.find(s => s.userId === userId);
      
      if (!mySigner) {
        return res.status(403).json({ message: "You are not a signer on this contract" });
      }
      
      if (mySigner.status === 'signed') {
        return res.status(400).json({ message: "You have already signed this contract" });
      }
      
      // Create signature
      const signature = await storage.createContractSignature({
        contractId,
        signerId: mySigner.id,
        signatureImageUrl: req.body.signatureImageUrl,
        signatureData: req.body.signatureData,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] || null,
      });
      
      // Update signer status
      await storage.updateContractSigner(mySigner.id, {
        status: 'signed',
        signedAt: new Date(),
      });
      
      // Create audit event
      await storage.createContractAuditEvent({
        contractId,
        eventType: 'signed',
        userId,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] || null,
        details: { signerId: mySigner.id },
      });
      
      // Check if all signers have signed
      const updatedSigners = await storage.getContractSigners(contractId);
      const allSigned = updatedSigners.every(s => s.status === 'signed');
      
      if (allSigned) {
        await storage.updateContract(contractId, {
          status: 'completed',
          completedAt: new Date(),
        });
        
        await storage.createContractAuditEvent({
          contractId,
          eventType: 'completed',
          userId,
          details: { allSignersCompleted: true },
        });
      } else {
        await storage.updateContract(contractId, {
          status: 'partially_signed',
        });
      }
      
      res.json(signature);
    } catch (error) {
      console.error("Error signing contract:", error);
      res.status(500).json({ message: "Failed to sign contract" });
    }
  });

  // Decline Contract
  app.post('/api/contracts/:id/decline', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const contractId = req.params.id;
      
      const signers = await storage.getContractSigners(contractId);
      const mySigner = signers.find(s => s.userId === userId);
      
      if (!mySigner) {
        return res.status(403).json({ message: "You are not a signer on this contract" });
      }
      
      await storage.updateContractSigner(mySigner.id, {
        status: 'declined',
        declinedAt: new Date(),
        declineReason: req.body.reason,
      });
      
      await storage.updateContract(contractId, {
        status: 'cancelled',
      });
      
      await storage.createContractAuditEvent({
        contractId,
        eventType: 'declined',
        userId,
        ipAddress: req.ip,
        details: { reason: req.body.reason },
      });
      
      res.json({ message: "Contract declined" });
    } catch (error) {
      console.error("Error declining contract:", error);
      res.status(500).json({ message: "Failed to decline contract" });
    }
  });

  // Contract Audit Trail
  app.get('/api/contracts/:id/audit', isAuthenticated, async (req, res) => {
    try {
      const events = await storage.getContractAuditEvents(req.params.id);
      res.json(events);
    } catch (error) {
      console.error("Error fetching contract audit events:", error);
      res.status(500).json({ message: "Failed to fetch audit events" });
    }
  });

  // ============================================
  // REAL-TIME CHAT (REST endpoints - WebSocket separate)
  // ============================================

  // Chat Channels
  app.get('/api/chat/channels', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const filters = {
        projectId: req.query.projectId as string | undefined,
        channelType: req.query.channelType as string | undefined,
      };
      const channels = await storage.listChatChannels(userId, filters);
      res.json(channels);
    } catch (error) {
      console.error("Error fetching chat channels:", error);
      res.status(500).json({ message: "Failed to fetch chat channels" });
    }
  });

  app.get('/api/chat/channels/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const channel = await storage.getChatChannelWithDetails(req.params.id, userId);
      if (!channel) {
        return res.status(404).json({ message: "Channel not found" });
      }
      res.json(channel);
    } catch (error) {
      console.error("Error fetching chat channel:", error);
      res.status(500).json({ message: "Failed to fetch chat channel" });
    }
  });

  app.post('/api/chat/channels', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const validated = insertChatChannelSchema.parse({
        ...req.body,
        createdById: userId,
      });
      const channel = await storage.createChatChannel(validated);
      
      // Add creator as admin member
      await storage.addChannelMember({
        channelId: channel.id,
        userId,
        role: 'admin',
      });
      
      res.status(201).json(channel);
    } catch (error) {
      console.error("Error creating chat channel:", error);
      res.status(400).json({ message: "Failed to create chat channel" });
    }
  });

  app.patch('/api/chat/channels/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const isMember = await storage.isChannelMember(req.params.id, userId);
      if (!isMember) {
        return res.status(403).json({ message: "Not a channel member" });
      }
      const channel = await storage.updateChatChannel(req.params.id, req.body);
      if (!channel) {
        return res.status(404).json({ message: "Channel not found" });
      }
      res.json(channel);
    } catch (error) {
      console.error("Error updating chat channel:", error);
      res.status(500).json({ message: "Failed to update chat channel" });
    }
  });

  // Channel Members
  app.get('/api/chat/channels/:id/members', isAuthenticated, async (req, res) => {
    try {
      const members = await storage.getChannelMembers(req.params.id);
      res.json(members);
    } catch (error) {
      console.error("Error fetching channel members:", error);
      res.status(500).json({ message: "Failed to fetch channel members" });
    }
  });

  app.post('/api/chat/channels/:id/members', isAuthenticated, async (req, res) => {
    try {
      const validated = insertChannelMemberSchema.parse({
        ...req.body,
        channelId: req.params.id,
      });
      const member = await storage.addChannelMember(validated);
      res.status(201).json(member);
    } catch (error) {
      console.error("Error adding channel member:", error);
      res.status(400).json({ message: "Failed to add channel member" });
    }
  });

  app.delete('/api/chat/channels/:id/members/:userId', isAuthenticated, async (req, res) => {
    try {
      await storage.removeChannelMember(req.params.id, req.params.userId);
      res.status(204).send();
    } catch (error) {
      console.error("Error removing channel member:", error);
      res.status(500).json({ message: "Failed to remove channel member" });
    }
  });

  // Chat Messages
  app.get('/api/chat/channels/:id/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const isMember = await storage.isChannelMember(req.params.id, userId);
      if (!isMember) {
        return res.status(403).json({ message: "Not a channel member" });
      }
      const messages = await storage.getChatMessages(req.params.id, {
        limit: parseInt(req.query.limit) || 50,
        before: req.query.before as string | undefined,
      });
      res.json(messages);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      res.status(500).json({ message: "Failed to fetch chat messages" });
    }
  });

  app.post('/api/chat/channels/:id/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const isMember = await storage.isChannelMember(req.params.id, userId);
      if (!isMember) {
        return res.status(403).json({ message: "Not a channel member" });
      }
      
      const validated = insertChatMessageSchema.parse({
        ...req.body,
        channelId: req.params.id,
        senderId: userId,
      });
      const message = await storage.createChatMessage(validated);
      res.status(201).json(message);
    } catch (error) {
      console.error("Error creating chat message:", error);
      res.status(400).json({ message: "Failed to send message" });
    }
  });

  app.patch('/api/chat/messages/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const message = await storage.getChatMessage(req.params.id);
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }
      if (message.senderId !== userId) {
        return res.status(403).json({ message: "Cannot edit another user's message" });
      }
      const updated = await storage.updateChatMessage(req.params.id, {
        content: req.body.content,
      });
      res.json(updated);
    } catch (error) {
      console.error("Error updating chat message:", error);
      res.status(500).json({ message: "Failed to update message" });
    }
  });

  app.delete('/api/chat/messages/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const message = await storage.getChatMessage(req.params.id);
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }
      if (message.senderId !== userId) {
        return res.status(403).json({ message: "Cannot delete another user's message" });
      }
      await storage.deleteMessage(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting chat message:", error);
      res.status(500).json({ message: "Failed to delete message" });
    }
  });

  // Shift Summaries
  app.get('/api/chat/channels/:id/summaries', isAuthenticated, async (req, res) => {
    try {
      const summaries = await storage.getShiftSummaries(req.params.id, {
        shiftDate: req.query.shiftDate as string | undefined,
      });
      res.json(summaries);
    } catch (error) {
      console.error("Error fetching shift summaries:", error);
      res.status(500).json({ message: "Failed to fetch shift summaries" });
    }
  });

  app.post('/api/chat/channels/:id/summaries', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const validated = insertShiftChatSummarySchema.parse({
        ...req.body,
        channelId: req.params.id,
        createdById: userId,
      });
      const summary = await storage.createShiftSummary(validated);
      res.status(201).json(summary);
    } catch (error) {
      console.error("Error creating shift summary:", error);
      res.status(400).json({ message: "Failed to create shift summary" });
    }
  });

  // ============================================
  // IDENTITY VERIFICATION
  // ============================================

  // Get current user's verification status
  app.get('/api/identity/me', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const verification = await storage.getUserVerification(userId);
      res.json(verification || null);
    } catch (error) {
      console.error("Error fetching user verification:", error);
      res.status(500).json({ message: "Failed to fetch verification status" });
    }
  });

  // List all verifications (admin only)
  app.get('/api/identity/verifications', isAuthenticated, requireRole('admin'), async (req, res) => {
    try {
      const filters = {
        status: req.query.status as string | undefined,
        consultantId: req.query.consultantId as string | undefined,
      };
      const verifications = await storage.listIdentityVerifications(filters);
      res.json(verifications);
    } catch (error) {
      console.error("Error fetching identity verifications:", error);
      res.status(500).json({ message: "Failed to fetch verifications" });
    }
  });

  // Get verification by ID
  app.get('/api/identity/verifications/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      const verification = await storage.getIdentityVerificationWithDetails(req.params.id);
      
      if (!verification) {
        return res.status(404).json({ message: "Verification not found" });
      }
      
      // Only allow access to own verification or admin access
      if (verification.userId !== userId && user?.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(verification);
    } catch (error) {
      console.error("Error fetching verification:", error);
      res.status(500).json({ message: "Failed to fetch verification" });
    }
  });

  // Submit identity verification request
  app.post('/api/identity/verifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      
      // Check for existing pending verification
      const existing = await storage.getUserVerification(userId);
      if (existing && ['pending', 'in_review'].includes(existing.status)) {
        return res.status(400).json({ message: "You already have a pending verification request" });
      }
      
      // Find consultant ID if exists
      const consultant = await storage.getConsultantByUserId(userId);
      
      const validated = insertIdentityVerificationSchema.parse({
        ...req.body,
        userId,
        consultantId: consultant?.id,
        status: 'pending',
      });
      
      const verification = await storage.createIdentityVerification(validated);
      
      // Create audit event
      await storage.createVerificationEvent({
        verificationId: verification.id,
        eventType: 'submitted',
        performedById: userId,
        ipAddress: req.ip,
        details: { initialSubmission: true },
      });
      
      res.status(201).json(verification);
    } catch (error) {
      console.error("Error creating identity verification:", error);
      res.status(400).json({ message: "Failed to submit verification request" });
    }
  });

  // Upload identity document
  app.post('/api/identity/verifications/:id/documents', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const verification = await storage.getIdentityVerification(req.params.id);
      
      if (!verification) {
        return res.status(404).json({ message: "Verification not found" });
      }
      
      if (verification.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const validated = insertIdentityDocumentSchema.parse({
        ...req.body,
        verificationId: req.params.id,
      });
      
      const document = await storage.createIdentityDocument(validated);
      
      await storage.createVerificationEvent({
        verificationId: req.params.id,
        eventType: 'document_uploaded',
        performedById: userId,
        details: { documentType: document.documentType },
      });
      
      res.status(201).json(document);
    } catch (error) {
      console.error("Error uploading identity document:", error);
      res.status(400).json({ message: "Failed to upload document" });
    }
  });

  // Admin: Review verification
  app.post('/api/identity/verifications/:id/review', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { action, notes } = req.body; // action: 'approve' | 'reject' | 'request_resubmit'
      
      let updateData: any = {
        reviewedById: userId,
        reviewNotes: notes,
      };
      
      if (action === 'approve') {
        updateData.status = 'verified';
        updateData.verifiedAt = new Date();
        updateData.expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year
      } else if (action === 'reject') {
        updateData.status = 'rejected';
        updateData.rejectedAt = new Date();
        updateData.rejectionReason = notes;
      } else if (action === 'request_resubmit') {
        updateData.status = 'pending';
      }
      
      const verification = await storage.updateIdentityVerification(req.params.id, updateData);
      
      if (!verification) {
        return res.status(404).json({ message: "Verification not found" });
      }
      
      await storage.createVerificationEvent({
        verificationId: req.params.id,
        eventType: action === 'approve' ? 'verified' : action === 'reject' ? 'rejected' : 'resubmit_requested',
        performedById: userId,
        details: { action, notes },
      });
      
      res.json(verification);
    } catch (error) {
      console.error("Error reviewing verification:", error);
      res.status(500).json({ message: "Failed to process review" });
    }
  });

  // Fraud Flags
  app.get('/api/identity/fraud-flags', isAuthenticated, requireRole('admin'), async (req, res) => {
    try {
      const filters = {
        userId: req.query.userId as string | undefined,
        isResolved: req.query.isResolved !== undefined ? req.query.isResolved === 'true' : undefined,
      };
      const flags = await storage.getFraudFlags(filters);
      res.json(flags);
    } catch (error) {
      console.error("Error fetching fraud flags:", error);
      res.status(500).json({ message: "Failed to fetch fraud flags" });
    }
  });

  app.post('/api/identity/fraud-flags', isAuthenticated, requireRole('admin'), async (req, res) => {
    try {
      const validated = insertFraudFlagSchema.parse(req.body);
      const flag = await storage.createFraudFlag(validated);
      res.status(201).json(flag);
    } catch (error) {
      console.error("Error creating fraud flag:", error);
      res.status(400).json({ message: "Failed to create fraud flag" });
    }
  });

  app.patch('/api/identity/fraud-flags/:id', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const flag = await storage.updateFraudFlag(req.params.id, {
        ...req.body,
        resolvedById: req.body.isResolved ? userId : undefined,
        resolvedAt: req.body.isResolved ? new Date() : undefined,
      });
      if (!flag) {
        return res.status(404).json({ message: "Fraud flag not found" });
      }
      res.json(flag);
    } catch (error) {
      console.error("Error updating fraud flag:", error);
      res.status(500).json({ message: "Failed to update fraud flag" });
    }
  });

  // ============================================
  // PHASE 17: REPORTING & BUSINESS INTELLIGENCE
  // ============================================

  // Report Templates routes (admin only)
  app.get('/api/report-templates', isAuthenticated, async (req, res) => {
    try {
      const filters = {
        category: req.query.category as string | undefined,
        isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined,
      };
      const templates = await storage.listReportTemplates(filters);
      res.json(templates);
    } catch (error) {
      console.error("Error fetching report templates:", error);
      res.status(500).json({ message: "Failed to fetch report templates" });
    }
  });

  app.post('/api/report-templates', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const validated = insertReportTemplateSchema.parse({
        ...req.body,
        createdById: userId,
      });
      const template = await storage.createReportTemplate(validated);
      res.status(201).json(template);
    } catch (error) {
      console.error("Error creating report template:", error);
      res.status(400).json({ message: "Failed to create report template" });
    }
  });

  app.get('/api/report-templates/:id', isAuthenticated, async (req, res) => {
    try {
      const template = await storage.getReportTemplate(req.params.id);
      if (!template) {
        return res.status(404).json({ message: "Report template not found" });
      }
      res.json(template);
    } catch (error) {
      console.error("Error fetching report template:", error);
      res.status(500).json({ message: "Failed to fetch report template" });
    }
  });

  app.patch('/api/report-templates/:id', isAuthenticated, requireRole('admin'), async (req, res) => {
    try {
      const updateData = insertReportTemplateSchema.partial().parse(req.body);
      const template = await storage.updateReportTemplate(req.params.id, updateData);
      if (!template) {
        return res.status(404).json({ message: "Report template not found" });
      }
      res.json(template);
    } catch (error) {
      console.error("Error updating report template:", error);
      res.status(500).json({ message: "Failed to update report template" });
    }
  });

  app.delete('/api/report-templates/:id', isAuthenticated, requireRole('admin'), async (req, res) => {
    try {
      const deleted = await storage.deleteReportTemplate(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Report template not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting report template:", error);
      res.status(500).json({ message: "Failed to delete report template" });
    }
  });

  // Saved Reports routes
  app.get('/api/saved-reports', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const filters = {
        templateId: req.query.templateId as string | undefined,
        isFavorite: req.query.isFavorite !== undefined ? req.query.isFavorite === 'true' : undefined,
        isPublic: req.query.isPublic !== undefined ? req.query.isPublic === 'true' : undefined,
      };
      const reports = await storage.listSavedReports(userId, filters);
      res.json(reports);
    } catch (error) {
      console.error("Error fetching saved reports:", error);
      res.status(500).json({ message: "Failed to fetch saved reports" });
    }
  });

  app.post('/api/saved-reports', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const validated = insertSavedReportSchema.parse({
        ...req.body,
        userId,
      });
      const report = await storage.createSavedReport(validated);
      res.status(201).json(report);
    } catch (error) {
      console.error("Error creating saved report:", error);
      res.status(400).json({ message: "Failed to create saved report" });
    }
  });

  app.get('/api/saved-reports/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      const report = await storage.getSavedReportWithDetails(req.params.id);
      
      if (!report) {
        return res.status(404).json({ message: "Report not found" });
      }
      
      // Check access: owner or public report or admin
      if (report.userId !== userId && !report.isPublic && user?.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(report);
    } catch (error) {
      console.error("Error fetching saved report:", error);
      res.status(500).json({ message: "Failed to fetch saved report" });
    }
  });

  app.patch('/api/saved-reports/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      const existingReport = await storage.getSavedReport(req.params.id);
      
      if (!existingReport) {
        return res.status(404).json({ message: "Report not found" });
      }
      
      // Only owner or admin can update
      if (existingReport.userId !== userId && user?.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const updateData = insertSavedReportSchema.partial().parse(req.body);
      const report = await storage.updateSavedReport(req.params.id, updateData);
      res.json(report);
    } catch (error) {
      console.error("Error updating saved report:", error);
      res.status(500).json({ message: "Failed to update saved report" });
    }
  });

  app.delete('/api/saved-reports/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      const existingReport = await storage.getSavedReport(req.params.id);
      
      if (!existingReport) {
        return res.status(404).json({ message: "Report not found" });
      }
      
      // Only owner or admin can delete
      if (existingReport.userId !== userId && user?.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }
      
      await storage.deleteSavedReport(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting saved report:", error);
      res.status(500).json({ message: "Failed to delete saved report" });
    }
  });

  // Scheduled Reports routes
  app.get('/api/scheduled-reports', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const filters = {
        isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined,
      };
      const schedules = await storage.listScheduledReports(userId, filters);
      res.json(schedules);
    } catch (error) {
      console.error("Error fetching scheduled reports:", error);
      res.status(500).json({ message: "Failed to fetch scheduled reports" });
    }
  });

  app.post('/api/scheduled-reports', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const validated = insertScheduledReportSchema.parse({
        ...req.body,
        userId,
      });
      const schedule = await storage.createScheduledReport(validated);
      res.status(201).json(schedule);
    } catch (error) {
      console.error("Error creating scheduled report:", error);
      res.status(400).json({ message: "Failed to create scheduled report" });
    }
  });

  app.get('/api/scheduled-reports/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      const schedule = await storage.getScheduledReport(req.params.id);
      
      if (!schedule) {
        return res.status(404).json({ message: "Scheduled report not found" });
      }
      
      // Only owner or admin can view
      if (schedule.userId !== userId && user?.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(schedule);
    } catch (error) {
      console.error("Error fetching scheduled report:", error);
      res.status(500).json({ message: "Failed to fetch scheduled report" });
    }
  });

  app.patch('/api/scheduled-reports/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      const existingSchedule = await storage.getScheduledReport(req.params.id);
      
      if (!existingSchedule) {
        return res.status(404).json({ message: "Scheduled report not found" });
      }
      
      // Only owner or admin can update
      if (existingSchedule.userId !== userId && user?.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const updateData = insertScheduledReportSchema.partial().parse(req.body);
      const schedule = await storage.updateScheduledReport(req.params.id, updateData);
      res.json(schedule);
    } catch (error) {
      console.error("Error updating scheduled report:", error);
      res.status(500).json({ message: "Failed to update scheduled report" });
    }
  });

  app.delete('/api/scheduled-reports/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      const existingSchedule = await storage.getScheduledReport(req.params.id);
      
      if (!existingSchedule) {
        return res.status(404).json({ message: "Scheduled report not found" });
      }
      
      // Only owner or admin can delete
      if (existingSchedule.userId !== userId && user?.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }
      
      await storage.deleteScheduledReport(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting scheduled report:", error);
      res.status(500).json({ message: "Failed to delete scheduled report" });
    }
  });

  // Report Runs routes
  app.get('/api/report-runs', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      
      const filters: { userId?: string; savedReportId?: string; scheduledReportId?: string; status?: string } = {
        savedReportId: req.query.savedReportId as string | undefined,
        scheduledReportId: req.query.scheduledReportId as string | undefined,
        status: req.query.status as string | undefined,
      };
      
      // Non-admins can only see their own runs
      if (user?.role !== 'admin') {
        filters.userId = userId;
      } else if (req.query.userId) {
        filters.userId = req.query.userId as string;
      }
      
      const runs = await storage.listReportRuns(filters);
      res.json(runs);
    } catch (error) {
      console.error("Error fetching report runs:", error);
      res.status(500).json({ message: "Failed to fetch report runs" });
    }
  });

  app.post('/api/report-runs', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const validated = insertReportRunSchema.parse({
        ...req.body,
        userId,
      });
      const run = await storage.createReportRun(validated);
      res.status(201).json(run);
    } catch (error) {
      console.error("Error creating report run:", error);
      res.status(400).json({ message: "Failed to create report run" });
    }
  });

  app.get('/api/report-runs/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      const run = await storage.getReportRun(req.params.id);
      
      if (!run) {
        return res.status(404).json({ message: "Report run not found" });
      }
      
      // Only the person who triggered it or admin can view
      if (run.userId !== userId && user?.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(run);
    } catch (error) {
      console.error("Error fetching report run:", error);
      res.status(500).json({ message: "Failed to fetch report run" });
    }
  });

  app.patch('/api/report-runs/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      const existingRun = await storage.getReportRun(req.params.id);
      
      if (!existingRun) {
        return res.status(404).json({ message: "Report run not found" });
      }
      
      // Only the person who triggered it or admin can update
      if (existingRun.userId !== userId && user?.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const updateData = insertReportRunSchema.partial().parse(req.body);
      const run = await storage.updateReportRun(req.params.id, updateData);
      res.json(run);
    } catch (error) {
      console.error("Error updating report run:", error);
      res.status(500).json({ message: "Failed to update report run" });
    }
  });

  // Export Logs routes
  app.get('/api/export-logs', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const filters = {
        exportType: req.query.exportType as string | undefined,
        format: req.query.format as string | undefined,
      };
      const logs = await storage.listExportLogs(userId, filters);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching export logs:", error);
      res.status(500).json({ message: "Failed to fetch export logs" });
    }
  });

  app.post('/api/export-logs', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const validated = insertExportLogSchema.parse({
        ...req.body,
        userId,
      });
      const log = await storage.createExportLog(validated);
      res.status(201).json(log);
    } catch (error) {
      console.error("Error creating export log:", error);
      res.status(400).json({ message: "Failed to create export log" });
    }
  });

  // Executive Dashboards routes
  app.get('/api/executive-dashboards', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const filters = {
        isPublic: req.query.isPublic !== undefined ? req.query.isPublic === 'true' : undefined,
      };
      const dashboards = await storage.listExecutiveDashboards(userId, filters);
      res.json(dashboards);
    } catch (error) {
      console.error("Error fetching executive dashboards:", error);
      res.status(500).json({ message: "Failed to fetch executive dashboards" });
    }
  });

  app.post('/api/executive-dashboards', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const validated = insertExecutiveDashboardSchema.parse({
        ...req.body,
        userId,
      });
      const dashboard = await storage.createExecutiveDashboard(validated);
      res.status(201).json(dashboard);
    } catch (error) {
      console.error("Error creating executive dashboard:", error);
      res.status(400).json({ message: "Failed to create executive dashboard" });
    }
  });

  app.get('/api/executive-dashboards/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      const dashboard = await storage.getExecutiveDashboardWithDetails(req.params.id);
      
      if (!dashboard) {
        return res.status(404).json({ message: "Dashboard not found" });
      }
      
      // Check access: owner or public dashboard or admin
      if (dashboard.userId !== userId && !dashboard.isPublic && user?.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(dashboard);
    } catch (error) {
      console.error("Error fetching executive dashboard:", error);
      res.status(500).json({ message: "Failed to fetch executive dashboard" });
    }
  });

  app.patch('/api/executive-dashboards/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      const existingDashboard = await storage.getExecutiveDashboard(req.params.id);
      
      if (!existingDashboard) {
        return res.status(404).json({ message: "Dashboard not found" });
      }
      
      // Only owner or admin can update
      if (existingDashboard.userId !== userId && user?.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const updateData = insertExecutiveDashboardSchema.partial().parse(req.body);
      const dashboard = await storage.updateExecutiveDashboard(req.params.id, updateData);
      res.json(dashboard);
    } catch (error) {
      console.error("Error updating executive dashboard:", error);
      res.status(500).json({ message: "Failed to update executive dashboard" });
    }
  });

  app.delete('/api/executive-dashboards/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      const existingDashboard = await storage.getExecutiveDashboard(req.params.id);
      
      if (!existingDashboard) {
        return res.status(404).json({ message: "Dashboard not found" });
      }
      
      // Only owner or admin can delete
      if (existingDashboard.userId !== userId && user?.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }
      
      await storage.deleteExecutiveDashboard(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting executive dashboard:", error);
      res.status(500).json({ message: "Failed to delete executive dashboard" });
    }
  });

  // Dashboard Widgets routes
  app.get('/api/dashboards/:dashboardId/widgets', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      const dashboard = await storage.getExecutiveDashboard(req.params.dashboardId);
      
      if (!dashboard) {
        return res.status(404).json({ message: "Dashboard not found" });
      }
      
      // Check access: owner or public dashboard or admin
      if (dashboard.userId !== userId && !dashboard.isPublic && user?.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const widgets = await storage.listDashboardWidgets(req.params.dashboardId);
      res.json(widgets);
    } catch (error) {
      console.error("Error fetching dashboard widgets:", error);
      res.status(500).json({ message: "Failed to fetch dashboard widgets" });
    }
  });

  app.post('/api/dashboards/:dashboardId/widgets', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      const dashboard = await storage.getExecutiveDashboard(req.params.dashboardId);
      
      if (!dashboard) {
        return res.status(404).json({ message: "Dashboard not found" });
      }
      
      // Only owner or admin can add widgets
      if (dashboard.userId !== userId && user?.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const validated = insertDashboardWidgetSchema.parse({
        ...req.body,
        dashboardId: req.params.dashboardId,
      });
      const widget = await storage.createDashboardWidget(validated);
      res.status(201).json(widget);
    } catch (error) {
      console.error("Error creating dashboard widget:", error);
      res.status(400).json({ message: "Failed to create dashboard widget" });
    }
  });

  app.patch('/api/widgets/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      const widget = await storage.getDashboardWidget(req.params.id);
      
      if (!widget) {
        return res.status(404).json({ message: "Widget not found" });
      }
      
      const dashboard = await storage.getExecutiveDashboard(widget.dashboardId);
      
      // Only owner or admin can update widget
      if (dashboard?.userId !== userId && user?.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const updateData = insertDashboardWidgetSchema.partial().parse(req.body);
      const updatedWidget = await storage.updateDashboardWidget(req.params.id, updateData);
      res.json(updatedWidget);
    } catch (error) {
      console.error("Error updating widget:", error);
      res.status(500).json({ message: "Failed to update widget" });
    }
  });

  app.delete('/api/widgets/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      const widget = await storage.getDashboardWidget(req.params.id);
      
      if (!widget) {
        return res.status(404).json({ message: "Widget not found" });
      }
      
      const dashboard = await storage.getExecutiveDashboard(widget.dashboardId);
      
      // Only owner or admin can delete widget
      if (dashboard?.userId !== userId && user?.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }
      
      await storage.deleteDashboardWidget(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting widget:", error);
      res.status(500).json({ message: "Failed to delete widget" });
    }
  });

  // KPI Definitions routes (admin only)
  app.get('/api/kpi-definitions', isAuthenticated, async (req, res) => {
    try {
      const filters = {
        category: req.query.category as string | undefined,
        isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined,
      };
      const kpis = await storage.listKpiDefinitions(filters);
      res.json(kpis);
    } catch (error) {
      console.error("Error fetching KPI definitions:", error);
      res.status(500).json({ message: "Failed to fetch KPI definitions" });
    }
  });

  app.post('/api/kpi-definitions', isAuthenticated, requireRole('admin'), async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const validated = insertKpiDefinitionSchema.parse({
        ...req.body,
        createdById: userId,
      });
      const kpi = await storage.createKpiDefinition(validated);
      res.status(201).json(kpi);
    } catch (error) {
      console.error("Error creating KPI definition:", error);
      res.status(400).json({ message: "Failed to create KPI definition" });
    }
  });

  app.get('/api/kpi-definitions/:id', isAuthenticated, async (req, res) => {
    try {
      const kpi = await storage.getKpiDefinition(req.params.id);
      if (!kpi) {
        return res.status(404).json({ message: "KPI definition not found" });
      }
      res.json(kpi);
    } catch (error) {
      console.error("Error fetching KPI definition:", error);
      res.status(500).json({ message: "Failed to fetch KPI definition" });
    }
  });

  app.patch('/api/kpi-definitions/:id', isAuthenticated, requireRole('admin'), async (req, res) => {
    try {
      const updateData = insertKpiDefinitionSchema.partial().parse(req.body);
      const kpi = await storage.updateKpiDefinition(req.params.id, updateData);
      if (!kpi) {
        return res.status(404).json({ message: "KPI definition not found" });
      }
      res.json(kpi);
    } catch (error) {
      console.error("Error updating KPI definition:", error);
      res.status(500).json({ message: "Failed to update KPI definition" });
    }
  });

  app.delete('/api/kpi-definitions/:id', isAuthenticated, requireRole('admin'), async (req, res) => {
    try {
      const deleted = await storage.deleteKpiDefinition(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "KPI definition not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting KPI definition:", error);
      res.status(500).json({ message: "Failed to delete KPI definition" });
    }
  });

  // KPI Snapshots routes
  app.get('/api/kpis/:kpiId/snapshots', isAuthenticated, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
      const snapshots = await storage.listKpiSnapshots(req.params.kpiId, { limit });
      res.json(snapshots);
    } catch (error) {
      console.error("Error fetching KPI snapshots:", error);
      res.status(500).json({ message: "Failed to fetch KPI snapshots" });
    }
  });

  app.post('/api/kpis/:kpiId/snapshots', isAuthenticated, async (req: any, res) => {
    try {
      const kpi = await storage.getKpiDefinition(req.params.kpiId);
      if (!kpi) {
        return res.status(404).json({ message: "KPI definition not found" });
      }
      
      const validated = insertKpiSnapshotSchema.parse({
        ...req.body,
        kpiId: req.params.kpiId,
      });
      const snapshot = await storage.createKpiSnapshot(validated);
      res.status(201).json(snapshot);
    } catch (error) {
      console.error("Error creating KPI snapshot:", error);
      res.status(400).json({ message: "Failed to create KPI snapshot" });
    }
  });

  // Reporting Analytics routes
  app.get('/api/analytics/reports', isAuthenticated, async (req, res) => {
    try {
      const analytics = await storage.getReportAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching report analytics:", error);
      res.status(500).json({ message: "Failed to fetch report analytics" });
    }
  });

  app.get('/api/analytics/dashboards', isAuthenticated, async (req, res) => {
    try {
      const analytics = await storage.getDashboardAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching dashboard analytics:", error);
      res.status(500).json({ message: "Failed to fetch dashboard analytics" });
    }
  });

  // Report Preview/Execute endpoint
  app.post('/api/reports/preview', isAuthenticated, async (req: any, res) => {
    try {
      const { dataSource, selectedFields, filters, groupBy, sortBy, limit = 50 } = req.body;
      
      if (!dataSource || !selectedFields || selectedFields.length === 0) {
        return res.status(400).json({ message: "Data source and at least one field are required" });
      }

      let data: any[] = [];
      
      switch (dataSource) {
        case 'consultants': {
          const consultants = await storage.getAllConsultants();
          data = consultants.map((c: any) => ({
            id: c.id,
            firstName: c.firstName,
            lastName: c.lastName,
            email: c.email,
            location: c.location,
            yearsExperience: c.yearsExperience,
            isAvailable: c.isAvailable,
            averageRating: c.averageRating,
            completedProjects: c.completedProjects,
            shiftPreference: c.shiftPreference,
            createdAt: c.createdAt,
          }));
          break;
        }
        case 'hospitals': {
          const hospitals = await storage.getAllHospitals();
          data = hospitals.map((h: any) => ({
            id: h.id,
            name: h.name,
            type: h.type,
            location: h.location,
            contactName: h.contactName,
            contactEmail: h.contactEmail,
            status: h.status,
            isActive: h.isActive,
            createdAt: h.createdAt,
          }));
          break;
        }
        case 'projects': {
          const projects = await storage.getAllProjects();
          data = projects.map((p: any) => ({
            id: p.id,
            name: p.name,
            hospitalName: p.hospitalName,
            ehrSystem: p.ehrSystem,
            status: p.status,
            currentPhase: p.currentPhase,
            startDate: p.startDate,
            endDate: p.endDate,
            budget: p.budget,
            createdAt: p.createdAt,
          }));
          break;
        }
        default:
          return res.status(400).json({ message: "Invalid data source" });
      }

      const filteredData = data.map(row => {
        const filteredRow: Record<string, any> = {};
        selectedFields.forEach((field: string) => {
          if (field in row) {
            filteredRow[field] = row[field];
          }
        });
        return filteredRow;
      });

      const limitedData = filteredData.slice(0, Math.min(limit, 100));

      res.json({
        data: limitedData,
        totalCount: data.length,
        fields: selectedFields,
      });
    } catch (error) {
      console.error("Error generating report preview:", error);
      res.status(500).json({ message: "Failed to generate report preview" });
    }
  });

  // Scheduled Report creation for Report Builder
  app.post('/api/reports/schedule', isAuthenticated, async (req: any, res) => {
    try {
      const { savedReportId, schedule, recipients, exportFormat, name } = req.body;
      
      if (!savedReportId || !schedule) {
        return res.status(400).json({ message: "Saved report ID and schedule are required" });
      }

      const scheduledReport = await storage.createScheduledReport({
        savedReportId,
        userId: req.user.claims.sub,
        name: name || `Scheduled Report ${Date.now()}`,
        schedule,
        recipients: recipients || [],
        exportFormat: exportFormat || 'pdf',
        isActive: true,
      });

      res.status(201).json(scheduledReport);
    } catch (error) {
      console.error("Error scheduling report:", error);
      res.status(500).json({ message: "Failed to schedule report" });
    }
  });

  // ============================================
  // SKILLS QUESTIONNAIRE Routes
  // ============================================

  // Skill Categories
  app.get('/api/skill-categories', isAuthenticated, async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      const isActive = req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined;
      const categories = await storage.listSkillCategories({ category, isActive });
      res.json(categories);
    } catch (error) {
      console.error("Error fetching skill categories:", error);
      res.status(500).json({ message: "Failed to fetch skill categories" });
    }
  });

  app.get('/api/skill-categories/:id', isAuthenticated, async (req, res) => {
    try {
      const category = await storage.getSkillCategory(req.params.id);
      if (!category) {
        return res.status(404).json({ message: "Skill category not found" });
      }
      res.json(category);
    } catch (error) {
      console.error("Error fetching skill category:", error);
      res.status(500).json({ message: "Failed to fetch skill category" });
    }
  });

  // Skill Items
  app.get('/api/skill-items', isAuthenticated, async (req, res) => {
    try {
      const categoryId = req.query.categoryId as string | undefined;
      const isActive = req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined;
      const items = await storage.listSkillItems({ categoryId, isActive });
      res.json(items);
    } catch (error) {
      console.error("Error fetching skill items:", error);
      res.status(500).json({ message: "Failed to fetch skill items" });
    }
  });

  // Combined endpoint for categories with items
  app.get('/api/skills/all', isAuthenticated, async (req, res) => {
    try {
      const categories = await storage.listSkillCategories({ isActive: true });
      const items = await storage.listSkillItems({ isActive: true });
      
      const categoriesWithItems = categories.map(cat => ({
        ...cat,
        items: items.filter(item => item.categoryId === cat.id),
      }));
      
      res.json(categoriesWithItems);
    } catch (error) {
      console.error("Error fetching skills data:", error);
      res.status(500).json({ message: "Failed to fetch skills data" });
    }
  });

  // Consultant Questionnaire
  app.get('/api/questionnaire', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const consultant = await storage.getConsultantByUserId(userId);
      
      if (!consultant) {
        return res.status(404).json({ message: "Consultant profile not found" });
      }
      
      const questionnaire = await storage.getQuestionnaireWithSkills(consultant.id);
      res.json(questionnaire || null);
    } catch (error) {
      console.error("Error fetching questionnaire:", error);
      res.status(500).json({ message: "Failed to fetch questionnaire" });
    }
  });

  app.post('/api/questionnaire', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const consultant = await storage.getOrCreateConsultantByUserId(userId);
      
      // Check if questionnaire already exists
      const existing = await storage.getQuestionnaireByConsultantId(consultant.id);
      if (existing) {
        return res.status(400).json({ message: "Questionnaire already exists. Use PATCH to update." });
      }
      
      const questionnaire = await storage.createConsultantQuestionnaire({
        consultantId: consultant.id,
        status: 'draft',
        ...req.body,
      });
      
      res.status(201).json(questionnaire);
    } catch (error) {
      console.error("Error creating questionnaire:", error);
      res.status(500).json({ message: "Failed to create questionnaire" });
    }
  });

  app.patch('/api/questionnaire', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const consultant = await storage.getConsultantByUserId(userId);
      
      if (!consultant) {
        return res.status(404).json({ message: "Consultant profile not found" });
      }
      
      let questionnaire = await storage.getQuestionnaireByConsultantId(consultant.id);
      
      if (!questionnaire) {
        // Create new questionnaire if it doesn't exist
        questionnaire = await storage.createConsultantQuestionnaire({
          consultantId: consultant.id,
          status: 'draft',
        });
      }
      
      const updated = await storage.updateConsultantQuestionnaire(questionnaire.id, req.body);
      res.json(updated);
    } catch (error) {
      console.error("Error updating questionnaire:", error);
      res.status(500).json({ message: "Failed to update questionnaire" });
    }
  });

  app.post('/api/questionnaire/submit', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const consultant = await storage.getConsultantByUserId(userId);
      
      if (!consultant) {
        return res.status(404).json({ message: "Consultant profile not found" });
      }
      
      const questionnaire = await storage.getQuestionnaireByConsultantId(consultant.id);
      if (!questionnaire) {
        return res.status(404).json({ message: "Questionnaire not found" });
      }
      
      const updated = await storage.updateConsultantQuestionnaire(questionnaire.id, {
        status: 'submitted',
        submittedAt: new Date(),
      });
      
      res.json(updated);
    } catch (error) {
      console.error("Error submitting questionnaire:", error);
      res.status(500).json({ message: "Failed to submit questionnaire" });
    }
  });

  // Consultant Skills (upsert for autosave)
  app.post('/api/questionnaire/skills', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const consultant = await storage.getConsultantByUserId(userId);
      
      if (!consultant) {
        return res.status(404).json({ message: "Consultant profile not found" });
      }
      
      const { skillItemId, proficiency, yearsExperience, isCertified, certificationName, certificationExpiry, notes } = req.body;
      
      const skill = await storage.upsertConsultantSkill({
        consultantId: consultant.id,
        skillItemId,
        proficiency,
        yearsExperience,
        isCertified,
        certificationName,
        certificationExpiry,
        notes,
      });
      
      res.json(skill);
    } catch (error) {
      console.error("Error saving skill:", error);
      res.status(500).json({ message: "Failed to save skill" });
    }
  });

  app.post('/api/questionnaire/skills/bulk', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const consultant = await storage.getConsultantByUserId(userId);
      
      if (!consultant) {
        return res.status(404).json({ message: "Consultant profile not found" });
      }
      
      const { skills } = req.body;
      if (!Array.isArray(skills)) {
        return res.status(400).json({ message: "Skills must be an array" });
      }
      
      const results = [];
      for (const skillData of skills) {
        const skill = await storage.upsertConsultantSkill({
          consultantId: consultant.id,
          skillItemId: skillData.skillItemId,
          proficiency: skillData.proficiency,
          yearsExperience: skillData.yearsExperience,
          isCertified: skillData.isCertified,
          certificationName: skillData.certificationName,
          certificationExpiry: skillData.certificationExpiry,
          notes: skillData.notes,
        });
        results.push(skill);
      }
      
      res.json(results);
    } catch (error) {
      console.error("Error saving skills:", error);
      res.status(500).json({ message: "Failed to save skills" });
    }
  });

  // EHR Experience
  app.get('/api/questionnaire/ehr-experience', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const consultant = await storage.getConsultantByUserId(userId);
      
      if (!consultant) {
        return res.status(404).json({ message: "Consultant profile not found" });
      }
      
      const experience = await storage.listConsultantEhrExperience(consultant.id);
      res.json(experience);
    } catch (error) {
      console.error("Error fetching EHR experience:", error);
      res.status(500).json({ message: "Failed to fetch EHR experience" });
    }
  });

  app.post('/api/questionnaire/ehr-experience', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const consultant = await storage.getConsultantByUserId(userId);
      
      if (!consultant) {
        return res.status(404).json({ message: "Consultant profile not found" });
      }
      
      const { ehrSystem, yearsExperience, proficiency, isCertified, certifications, lastUsed, projectCount } = req.body;
      
      const experience = await storage.upsertConsultantEhrExperience(consultant.id, ehrSystem, {
        yearsExperience,
        proficiency,
        isCertified,
        certifications,
        lastUsed,
        projectCount,
      });
      
      res.json(experience);
    } catch (error) {
      console.error("Error saving EHR experience:", error);
      res.status(500).json({ message: "Failed to save EHR experience" });
    }
  });

  app.delete('/api/questionnaire/ehr-experience/:id', isAuthenticated, async (req: any, res) => {
    try {
      await storage.deleteConsultantEhrExperience(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting EHR experience:", error);
      res.status(500).json({ message: "Failed to delete EHR experience" });
    }
  });

  // Certifications
  app.get('/api/questionnaire/certifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const consultant = await storage.getConsultantByUserId(userId);
      
      if (!consultant) {
        return res.status(404).json({ message: "Consultant profile not found" });
      }
      
      const certifications = await storage.listConsultantCertifications(consultant.id);
      res.json(certifications);
    } catch (error) {
      console.error("Error fetching certifications:", error);
      res.status(500).json({ message: "Failed to fetch certifications" });
    }
  });

  app.post('/api/questionnaire/certifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const consultant = await storage.getConsultantByUserId(userId);
      
      if (!consultant) {
        return res.status(404).json({ message: "Consultant profile not found" });
      }
      
      const certification = await storage.createConsultantCertification({
        consultantId: consultant.id,
        ...req.body,
      });
      
      res.status(201).json(certification);
    } catch (error) {
      console.error("Error creating certification:", error);
      res.status(500).json({ message: "Failed to create certification" });
    }
  });

  app.patch('/api/questionnaire/certifications/:id', isAuthenticated, async (req: any, res) => {
    try {
      const updated = await storage.updateConsultantCertification(req.params.id, req.body);
      res.json(updated);
    } catch (error) {
      console.error("Error updating certification:", error);
      res.status(500).json({ message: "Failed to update certification" });
    }
  });

  app.delete('/api/questionnaire/certifications/:id', isAuthenticated, async (req: any, res) => {
    try {
      await storage.deleteConsultantCertification(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting certification:", error);
      res.status(500).json({ message: "Failed to delete certification" });
    }
  });

  // Admin: List all questionnaires
  app.get('/api/admin/questionnaires', isAuthenticated, async (req: any, res) => {
    try {
      const status = req.query.status as string | undefined;
      const questionnaires = await storage.listQuestionnaires({ status });
      res.json(questionnaires);
    } catch (error) {
      console.error("Error fetching questionnaires:", error);
      res.status(500).json({ message: "Failed to fetch questionnaires" });
    }
  });

  // Admin: Verify skill
  app.post('/api/admin/skills/:skillId/verify', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { status, notes } = req.body;
      
      const skill = await storage.getConsultantSkill(req.params.skillId);
      if (!skill) {
        return res.status(404).json({ message: "Skill not found" });
      }
      
      // Create verification record
      await storage.createSkillVerification({
        consultantSkillId: skill.id,
        verifiedBy: userId,
        previousStatus: skill.verificationStatus,
        newStatus: status,
        notes,
      });
      
      // Update skill verification status
      const updated = await storage.updateConsultantSkill(skill.id, {
        verificationStatus: status,
        verifiedBy: userId,
        verifiedAt: new Date(),
      });
      
      res.json(updated);
    } catch (error) {
      console.error("Error verifying skill:", error);
      res.status(500).json({ message: "Failed to verify skill" });
    }
  });

  // Admin: Verify EHR experience
  app.post('/api/admin/ehr-experience/:id/verify', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { status } = req.body;
      
      const updated = await storage.updateConsultantEhrExperience(req.params.id, {
        verificationStatus: status,
        verifiedBy: userId,
        verifiedAt: new Date(),
      });
      
      res.json(updated);
    } catch (error) {
      console.error("Error verifying EHR experience:", error);
      res.status(500).json({ message: "Failed to verify EHR experience" });
    }
  });

  // Admin: Verify questionnaire (mark entire questionnaire as verified)
  app.post('/api/admin/questionnaires/:id/verify', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      const questionnaire = await storage.getConsultantQuestionnaire(req.params.id);
      if (!questionnaire) {
        return res.status(404).json({ message: "Questionnaire not found" });
      }
      
      const updated = await storage.updateConsultantQuestionnaire(req.params.id, {
        status: 'verified',
        verifiedAt: new Date(),
        verifiedBy: userId,
      });
      
      res.json(updated);
    } catch (error) {
      console.error("Error verifying questionnaire:", error);
      res.status(500).json({ message: "Failed to verify questionnaire" });
    }
  });

  // Admin: Verify or reject questionnaire
  app.post('/api/admin/questionnaires/verify', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const { questionnaireId, action, notes } = req.body;
      
      if (!questionnaireId || !action) {
        return res.status(400).json({ message: "questionnaireId and action are required" });
      }
      
      if (action !== 'verify' && action !== 'reject') {
        return res.status(400).json({ message: "action must be 'verify' or 'reject'" });
      }
      
      const questionnaire = await storage.getConsultantQuestionnaire(questionnaireId);
      if (!questionnaire) {
        return res.status(404).json({ message: "Questionnaire not found" });
      }
      
      if (action === 'verify') {
        const updated = await storage.updateConsultantQuestionnaire(questionnaireId, {
          status: 'verified',
          verifiedAt: new Date(),
          verifiedBy: userId,
        });
        res.json(updated);
        return;
      }
      
      const updated = await storage.updateConsultantQuestionnaire(questionnaireId, {
        status: 'draft',
        additionalNotes: notes || 'Questionnaire rejected - please revise and resubmit',
      });
      
      res.json(updated);
    } catch (error) {
      console.error("Error processing questionnaire verification:", error);
      res.status(500).json({ message: "Failed to process verification" });
    }
  });

  // Seed skills data endpoint (admin only)
  app.post('/api/admin/seed-skills', isAuthenticated, async (req: any, res) => {
    try {
      await storage.seedSkillsData();
      res.json({ success: true, message: "Skills data seeded successfully" });
    } catch (error) {
      console.error("Error seeding skills data:", error);
      res.status(500).json({ message: "Failed to seed skills data" });
    }
  });

  // ==========================================
  // Personal Information API Endpoints
  // ==========================================

  // Get consultant's personal information
  app.get('/api/personal-info', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const consultant = await storage.getConsultantByUserId(userId);
      
      if (!consultant) {
        return res.status(404).json({ message: "Consultant profile not found" });
      }
      
      // Return only personal info fields
      const personalInfo = {
        preferredName: consultant.preferredName,
        birthday: consultant.birthday,
        tshirtSize: consultant.tshirtSize,
        dietaryRestrictions: consultant.dietaryRestrictions,
        allergies: consultant.allergies,
        languages: consultant.languages || [],
        emergencyContactName: consultant.emergencyContactName,
        emergencyContactPhone: consultant.emergencyContactPhone,
        emergencyContactRelation: consultant.emergencyContactRelation,
        personalInfoCompleted: consultant.personalInfoCompleted,
      };
      
      res.json(personalInfo);
    } catch (error) {
      console.error("Error fetching personal info:", error);
      res.status(500).json({ message: "Failed to fetch personal information" });
    }
  });

  // Update consultant's personal information
  app.patch('/api/personal-info', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const consultant = await storage.getConsultantByUserId(userId);
      
      if (!consultant) {
        return res.status(404).json({ message: "Consultant profile not found" });
      }
      
      const {
        preferredName,
        birthday,
        tshirtSize,
        dietaryRestrictions,
        allergies,
        languages,
        emergencyContactName,
        emergencyContactPhone,
        emergencyContactRelation,
      } = req.body;
      
      // Determine if personal info is complete (at least emergency contact filled)
      const personalInfoCompleted = !!(emergencyContactName && emergencyContactPhone);
      
      const updated = await storage.updateConsultant(consultant.id, {
        preferredName,
        birthday,
        tshirtSize,
        dietaryRestrictions,
        allergies,
        languages,
        emergencyContactName,
        emergencyContactPhone,
        emergencyContactRelation,
        personalInfoCompleted,
      });
      
      res.json(updated);
    } catch (error) {
      console.error("Error updating personal info:", error);
      res.status(500).json({ message: "Failed to update personal information" });
    }
  });

  // ============================================
  // PHASE 18: INTEGRATION & AUTOMATION ROUTES
  // ============================================

  // Integration Connections
  app.get('/api/integrations/connections', isAuthenticated, async (req, res) => {
    try {
      const { category, provider, status, isActive } = req.query;
      const connections = await storage.listIntegrationConnections({
        category: category as string,
        provider: provider as string,
        status: status as string,
        isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined
      });
      res.json(connections);
    } catch (error) {
      console.error("Error listing integration connections:", error);
      res.status(500).json({ message: "Failed to list integration connections" });
    }
  });

  app.get('/api/integrations/connections/:id', isAuthenticated, async (req, res) => {
    try {
      const connection = await storage.getIntegrationConnection(req.params.id);
      if (!connection) {
        return res.status(404).json({ message: "Connection not found" });
      }
      res.json(connection);
    } catch (error) {
      console.error("Error getting integration connection:", error);
      res.status(500).json({ message: "Failed to get integration connection" });
    }
  });

  app.post('/api/integrations/connections', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const connection = await storage.createIntegrationConnection({
        ...req.body,
        createdByUserId: userId,
      });
      res.status(201).json(connection);
    } catch (error) {
      console.error("Error creating integration connection:", error);
      res.status(500).json({ message: "Failed to create integration connection" });
    }
  });

  app.patch('/api/integrations/connections/:id', isAuthenticated, async (req, res) => {
    try {
      const updated = await storage.updateIntegrationConnection(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ message: "Connection not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating integration connection:", error);
      res.status(500).json({ message: "Failed to update integration connection" });
    }
  });

  app.delete('/api/integrations/connections/:id', isAuthenticated, async (req, res) => {
    try {
      const deleted = await storage.deleteIntegrationConnection(req.params.id);
      res.json({ success: deleted });
    } catch (error) {
      console.error("Error deleting integration connection:", error);
      res.status(500).json({ message: "Failed to delete integration connection" });
    }
  });

  // Sync Jobs
  app.get('/api/integrations/sync-jobs', isAuthenticated, async (req, res) => {
    try {
      const { connectionId, status } = req.query;
      const jobs = await storage.listSyncJobs({
        connectionId: connectionId as string,
        status: status as string
      });
      res.json(jobs);
    } catch (error) {
      console.error("Error listing sync jobs:", error);
      res.status(500).json({ message: "Failed to list sync jobs" });
    }
  });

  app.post('/api/integrations/sync-jobs', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const job = await storage.createSyncJob({
        ...req.body,
        triggeredByUserId: userId,
        status: 'pending'
      });
      
      // Simulate async job processing (mock for demo)
      setTimeout(async () => {
        await storage.updateSyncJob(job.id, {
          status: 'in_progress',
          startedAt: new Date()
        });
        
        // Create sync event
        await storage.createSyncEvent({
          syncJobId: job.id,
          eventType: 'started',
          resourceType: 'sync_job',
        });
        
        // Simulate processing
        setTimeout(async () => {
          const recordsProcessed = Math.floor(Math.random() * 100) + 10;
          await storage.updateSyncJob(job.id, {
            status: 'completed',
            completedAt: new Date(),
            recordsProcessed,
            recordsSucceeded: recordsProcessed,
            recordsFailed: 0
          });
          
          await storage.createSyncEvent({
            syncJobId: job.id,
            eventType: 'completed',
            resourceType: 'sync_job',
            details: { recordsProcessed }
          });
        }, 3000);
      }, 1000);
      
      res.status(201).json(job);
    } catch (error) {
      console.error("Error creating sync job:", error);
      res.status(500).json({ message: "Failed to create sync job" });
    }
  });

  app.get('/api/integrations/sync-jobs/:id', isAuthenticated, async (req, res) => {
    try {
      const job = await storage.getSyncJob(req.params.id);
      if (!job) {
        return res.status(404).json({ message: "Sync job not found" });
      }
      const events = await storage.listSyncEvents(job.id);
      res.json({ ...job, events });
    } catch (error) {
      console.error("Error getting sync job:", error);
      res.status(500).json({ message: "Failed to get sync job" });
    }
  });

  // Calendar Sync Settings
  app.get('/api/integrations/calendar-settings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const settings = await storage.getCalendarSyncSettings(userId);
      res.json(settings || null);
    } catch (error) {
      console.error("Error getting calendar settings:", error);
      res.status(500).json({ message: "Failed to get calendar settings" });
    }
  });

  app.post('/api/integrations/calendar-settings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const settings = await storage.createCalendarSyncSettings({
        ...req.body,
        userId
      });
      res.status(201).json(settings);
    } catch (error) {
      console.error("Error creating calendar settings:", error);
      res.status(500).json({ message: "Failed to create calendar settings" });
    }
  });

  app.patch('/api/integrations/calendar-settings/:id', isAuthenticated, async (req, res) => {
    try {
      const updated = await storage.updateCalendarSyncSettings(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ message: "Calendar settings not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating calendar settings:", error);
      res.status(500).json({ message: "Failed to update calendar settings" });
    }
  });

  // EHR Systems Monitoring
  app.get('/api/ehr-systems', isAuthenticated, async (req, res) => {
    try {
      const { hospitalId, vendor, status, isMonitored } = req.query;
      const systems = await storage.listEhrSystems({
        hospitalId: hospitalId as string,
        vendor: vendor as string,
        status: status as string,
        isMonitored: isMonitored === 'true' ? true : isMonitored === 'false' ? false : undefined
      });
      res.json(systems);
    } catch (error) {
      console.error("Error listing EHR systems:", error);
      res.status(500).json({ message: "Failed to list EHR systems" });
    }
  });

  app.get('/api/ehr-systems/:id', isAuthenticated, async (req, res) => {
    try {
      const system = await storage.getEhrSystem(req.params.id);
      if (!system) {
        return res.status(404).json({ message: "EHR system not found" });
      }
      const metrics = await storage.listEhrStatusMetrics(system.id, 24);
      res.json({ ...system, recentMetrics: metrics });
    } catch (error) {
      console.error("Error getting EHR system:", error);
      res.status(500).json({ message: "Failed to get EHR system" });
    }
  });

  app.post('/api/ehr-systems', isAuthenticated, async (req, res) => {
    try {
      const system = await storage.createEhrSystem(req.body);
      res.status(201).json(system);
    } catch (error) {
      console.error("Error creating EHR system:", error);
      res.status(500).json({ message: "Failed to create EHR system" });
    }
  });

  app.patch('/api/ehr-systems/:id', isAuthenticated, async (req, res) => {
    try {
      const updated = await storage.updateEhrSystem(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ message: "EHR system not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating EHR system:", error);
      res.status(500).json({ message: "Failed to update EHR system" });
    }
  });

  app.delete('/api/ehr-systems/:id', isAuthenticated, async (req, res) => {
    try {
      const deleted = await storage.deleteEhrSystem(req.params.id);
      res.json({ success: deleted });
    } catch (error) {
      console.error("Error deleting EHR system:", error);
      res.status(500).json({ message: "Failed to delete EHR system" });
    }
  });

  // EHR Status Metrics
  app.get('/api/ehr-systems/:id/metrics', isAuthenticated, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const metrics = await storage.listEhrStatusMetrics(req.params.id, limit);
      res.json(metrics);
    } catch (error) {
      console.error("Error listing EHR metrics:", error);
      res.status(500).json({ message: "Failed to list EHR metrics" });
    }
  });

  app.post('/api/ehr-systems/:id/metrics', isAuthenticated, async (req, res) => {
    try {
      const metric = await storage.createEhrStatusMetric({
        ...req.body,
        ehrSystemId: req.params.id
      });
      res.status(201).json(metric);
    } catch (error) {
      console.error("Error creating EHR metric:", error);
      res.status(500).json({ message: "Failed to create EHR metric" });
    }
  });

  // EHR Incidents
  app.get('/api/ehr-incidents', isAuthenticated, async (req, res) => {
    try {
      const { ehrSystemId, severity, status } = req.query;
      const incidents = await storage.listEhrIncidents({
        ehrSystemId: ehrSystemId as string,
        severity: severity as string,
        status: status as string
      });
      res.json(incidents);
    } catch (error) {
      console.error("Error listing EHR incidents:", error);
      res.status(500).json({ message: "Failed to list EHR incidents" });
    }
  });

  app.get('/api/ehr-incidents/:id', isAuthenticated, async (req, res) => {
    try {
      const incident = await storage.getEhrIncident(req.params.id);
      if (!incident) {
        return res.status(404).json({ message: "EHR incident not found" });
      }
      const updates = await storage.listEhrIncidentUpdates(incident.id);
      res.json({ ...incident, updates });
    } catch (error) {
      console.error("Error getting EHR incident:", error);
      res.status(500).json({ message: "Failed to get EHR incident" });
    }
  });

  app.post('/api/ehr-incidents', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const incident = await storage.createEhrIncident({
        ...req.body,
        reportedByUserId: userId
      });
      res.status(201).json(incident);
    } catch (error) {
      console.error("Error creating EHR incident:", error);
      res.status(500).json({ message: "Failed to create EHR incident" });
    }
  });

  app.patch('/api/ehr-incidents/:id', isAuthenticated, async (req, res) => {
    try {
      const updated = await storage.updateEhrIncident(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ message: "EHR incident not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating EHR incident:", error);
      res.status(500).json({ message: "Failed to update EHR incident" });
    }
  });

  app.post('/api/ehr-incidents/:id/updates', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const update = await storage.createEhrIncidentUpdate({
        ...req.body,
        incidentId: req.params.id,
        createdByUserId: userId
      });
      res.status(201).json(update);
    } catch (error) {
      console.error("Error creating EHR incident update:", error);
      res.status(500).json({ message: "Failed to create EHR incident update" });
    }
  });

  // Payroll Sync Profiles
  app.get('/api/payroll-sync/profiles', isAuthenticated, async (req, res) => {
    try {
      const { connectionId, isActive } = req.query;
      const profiles = await storage.listPayrollSyncProfiles({
        connectionId: connectionId as string,
        isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined
      });
      res.json(profiles);
    } catch (error) {
      console.error("Error listing payroll sync profiles:", error);
      res.status(500).json({ message: "Failed to list payroll sync profiles" });
    }
  });

  app.post('/api/payroll-sync/profiles', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.createPayrollSyncProfile({
        ...req.body,
        createdByUserId: userId
      });
      res.status(201).json(profile);
    } catch (error) {
      console.error("Error creating payroll sync profile:", error);
      res.status(500).json({ message: "Failed to create payroll sync profile" });
    }
  });

  app.patch('/api/payroll-sync/profiles/:id', isAuthenticated, async (req, res) => {
    try {
      const updated = await storage.updatePayrollSyncProfile(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ message: "Profile not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating payroll sync profile:", error);
      res.status(500).json({ message: "Failed to update payroll sync profile" });
    }
  });

  app.delete('/api/payroll-sync/profiles/:id', isAuthenticated, async (req, res) => {
    try {
      const deleted = await storage.deletePayrollSyncProfile(req.params.id);
      res.json({ success: deleted });
    } catch (error) {
      console.error("Error deleting payroll sync profile:", error);
      res.status(500).json({ message: "Failed to delete payroll sync profile" });
    }
  });

  // Payroll Export Jobs
  app.get('/api/payroll-sync/exports', isAuthenticated, async (req, res) => {
    try {
      const { profileId, batchId, status } = req.query;
      const jobs = await storage.listPayrollExportJobs({
        profileId: profileId as string,
        batchId: batchId as string,
        status: status as string
      });
      res.json(jobs);
    } catch (error) {
      console.error("Error listing payroll export jobs:", error);
      res.status(500).json({ message: "Failed to list payroll export jobs" });
    }
  });

  app.post('/api/payroll-sync/exports', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const batchId = `BATCH-${Date.now()}`;
      
      const job = await storage.createPayrollExportJob({
        ...req.body,
        batchId,
        triggeredByUserId: userId,
        status: 'pending'
      });
      
      // Simulate async export processing (mock for demo)
      setTimeout(async () => {
        await storage.updatePayrollExportJob(job.id, {
          status: 'processing',
          startedAt: new Date()
        });
        
        setTimeout(async () => {
          const recordCount = Math.floor(Math.random() * 50) + 5;
          const totalAmount = (Math.random() * 100000 + 10000).toFixed(2);
          await storage.updatePayrollExportJob(job.id, {
            status: 'completed',
            completedAt: new Date(),
            recordCount,
            totalAmount
          });
        }, 3000);
      }, 1000);
      
      res.status(201).json(job);
    } catch (error) {
      console.error("Error creating payroll export job:", error);
      res.status(500).json({ message: "Failed to create payroll export job" });
    }
  });

  // Escalation Triggers
  app.get('/api/escalation-triggers', isAuthenticated, async (req, res) => {
    try {
      const { ruleId, triggerType, isActive } = req.query;
      const triggers = await storage.listEscalationTriggers({
        ruleId: ruleId as string,
        triggerType: triggerType as string,
        isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined
      });
      res.json(triggers);
    } catch (error) {
      console.error("Error listing escalation triggers:", error);
      res.status(500).json({ message: "Failed to list escalation triggers" });
    }
  });

  app.post('/api/escalation-triggers', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const trigger = await storage.createEscalationTrigger({
        ...req.body,
        createdByUserId: userId
      });
      res.status(201).json(trigger);
    } catch (error) {
      console.error("Error creating escalation trigger:", error);
      res.status(500).json({ message: "Failed to create escalation trigger" });
    }
  });

  app.patch('/api/escalation-triggers/:id', isAuthenticated, async (req, res) => {
    try {
      const updated = await storage.updateEscalationTrigger(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ message: "Trigger not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating escalation trigger:", error);
      res.status(500).json({ message: "Failed to update escalation trigger" });
    }
  });

  app.delete('/api/escalation-triggers/:id', isAuthenticated, async (req, res) => {
    try {
      const deleted = await storage.deleteEscalationTrigger(req.params.id);
      res.json({ success: deleted });
    } catch (error) {
      console.error("Error deleting escalation trigger:", error);
      res.status(500).json({ message: "Failed to delete escalation trigger" });
    }
  });

  // Escalation Events
  app.get('/api/escalation-events', isAuthenticated, async (req, res) => {
    try {
      const { triggerId, ticketId, incidentId } = req.query;
      const events = await storage.listEscalationEvents({
        triggerId: triggerId as string,
        ticketId: ticketId as string,
        incidentId: incidentId as string
      });
      res.json(events);
    } catch (error) {
      console.error("Error listing escalation events:", error);
      res.status(500).json({ message: "Failed to list escalation events" });
    }
  });

  app.post('/api/escalation-events/:id/acknowledge', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const updated = await storage.updateEscalationEvent(req.params.id, {
        acknowledgedAt: new Date(),
        acknowledgedByUserId: userId
      });
      if (!updated) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error acknowledging escalation event:", error);
      res.status(500).json({ message: "Failed to acknowledge escalation event" });
    }
  });

  // Automation Workflows
  app.get('/api/automation/workflows', isAuthenticated, async (req, res) => {
    try {
      const { category, triggerEvent, isActive } = req.query;
      const workflows = await storage.listAutomationWorkflows({
        category: category as string,
        triggerEvent: triggerEvent as string,
        isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined
      });
      res.json(workflows);
    } catch (error) {
      console.error("Error listing automation workflows:", error);
      res.status(500).json({ message: "Failed to list automation workflows" });
    }
  });

  app.get('/api/automation/workflows/:id', isAuthenticated, async (req, res) => {
    try {
      const workflow = await storage.getAutomationWorkflow(req.params.id);
      if (!workflow) {
        return res.status(404).json({ message: "Workflow not found" });
      }
      const executions = await storage.listWorkflowExecutions({ workflowId: workflow.id });
      res.json({ ...workflow, recentExecutions: executions.slice(0, 10) });
    } catch (error) {
      console.error("Error getting automation workflow:", error);
      res.status(500).json({ message: "Failed to get automation workflow" });
    }
  });

  app.post('/api/automation/workflows', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const workflow = await storage.createAutomationWorkflow({
        ...req.body,
        createdByUserId: userId
      });
      res.status(201).json(workflow);
    } catch (error) {
      console.error("Error creating automation workflow:", error);
      res.status(500).json({ message: "Failed to create automation workflow" });
    }
  });

  app.patch('/api/automation/workflows/:id', isAuthenticated, async (req, res) => {
    try {
      const updated = await storage.updateAutomationWorkflow(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ message: "Workflow not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating automation workflow:", error);
      res.status(500).json({ message: "Failed to update automation workflow" });
    }
  });

  app.delete('/api/automation/workflows/:id', isAuthenticated, async (req, res) => {
    try {
      const deleted = await storage.deleteAutomationWorkflow(req.params.id);
      res.json({ success: deleted });
    } catch (error) {
      console.error("Error deleting automation workflow:", error);
      res.status(500).json({ message: "Failed to delete automation workflow" });
    }
  });

  // Workflow Executions
  app.get('/api/automation/executions', isAuthenticated, async (req, res) => {
    try {
      const { workflowId, status } = req.query;
      const executions = await storage.listWorkflowExecutions({
        workflowId: workflowId as string,
        status: status as string
      });
      res.json(executions);
    } catch (error) {
      console.error("Error listing workflow executions:", error);
      res.status(500).json({ message: "Failed to list workflow executions" });
    }
  });

  app.post('/api/automation/workflows/:id/execute', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const workflow = await storage.getAutomationWorkflow(req.params.id);
      if (!workflow) {
        return res.status(404).json({ message: "Workflow not found" });
      }
      
      const execution = await storage.createWorkflowExecution({
        workflowId: workflow.id,
        triggeredByUserId: userId,
        status: 'running',
        startedAt: new Date()
      });
      
      // Simulate async workflow execution (mock for demo)
      setTimeout(async () => {
        const actions = workflow.actions as any[];
        const actionsExecuted = actions ? actions.map((action, i) => ({
          step: i + 1,
          action: action.type || 'action',
          status: 'completed',
          timestamp: new Date().toISOString()
        })) : [];
        
        await storage.updateWorkflowExecution(execution.id, {
          status: 'completed',
          completedAt: new Date(),
          actionsExecuted,
          results: { success: true, stepsCompleted: actionsExecuted.length }
        });
      }, 2000);
      
      res.status(201).json(execution);
    } catch (error) {
      console.error("Error executing workflow:", error);
      res.status(500).json({ message: "Failed to execute workflow" });
    }
  });

  // Integration Analytics
  app.get('/api/analytics/integrations', isAuthenticated, async (req, res) => {
    try {
      const analytics = await storage.getIntegrationAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error("Error getting integration analytics:", error);
      res.status(500).json({ message: "Failed to get integration analytics" });
    }
  });

  app.get('/api/analytics/ehr-monitoring', isAuthenticated, async (req, res) => {
    try {
      const analytics = await storage.getEhrMonitoringAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error("Error getting EHR monitoring analytics:", error);
      res.status(500).json({ message: "Failed to get EHR monitoring analytics" });
    }
  });

  app.get('/api/analytics/escalations', isAuthenticated, async (req, res) => {
    try {
      const analytics = await storage.getEscalationAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error("Error getting escalation analytics:", error);
      res.status(500).json({ message: "Failed to get escalation analytics" });
    }
  });

  // ============================================
  // PHASE 4: ADVANCED ANALYTICS ROUTES
  // ============================================

  // Get summary of all advanced analytics
  app.get('/api/analytics/advanced', isAuthenticated, requirePermission('analytics:view'), async (req: any, res) => {
    try {
      const projectId = req.query.projectId as string | undefined;
      const summary = await storage.getAdvancedAnalyticsSummary(projectId);
      res.json(summary);
    } catch (error) {
      console.error("Error getting advanced analytics summary:", error);
      res.status(500).json({ message: "Failed to get advanced analytics summary" });
    }
  });

  // Go-Live Readiness Analytics
  app.get('/api/analytics/advanced/readiness', isAuthenticated, requirePermission('analytics:view'), async (req: any, res) => {
    try {
      const projectId = req.query.projectId as string | undefined;
      const snapshots = await storage.getGoLiveReadinessSnapshots(projectId);
      res.json(snapshots);
    } catch (error) {
      console.error("Error getting go-live readiness snapshots:", error);
      res.status(500).json({ message: "Failed to get go-live readiness snapshots" });
    }
  });

  app.get('/api/analytics/advanced/readiness/:projectId', isAuthenticated, requirePermission('analytics:view'), async (req: any, res) => {
    try {
      const { projectId } = req.params;
      const snapshot = await storage.getLatestGoLiveReadiness(projectId);
      if (!snapshot) {
        return res.status(404).json({ message: "No readiness snapshot found for this project" });
      }
      res.json(snapshot);
    } catch (error) {
      console.error("Error getting go-live readiness:", error);
      res.status(500).json({ message: "Failed to get go-live readiness" });
    }
  });

  app.post('/api/analytics/advanced/readiness/:projectId/compute', isAuthenticated, requirePermission('analytics:manage'), async (req: any, res) => {
    try {
      const { projectId } = req.params;
      const userId = req.user?.id;
      const snapshot = await storage.computeGoLiveReadinessScore(projectId, userId);
      res.status(201).json(snapshot);
    } catch (error) {
      console.error("Error computing go-live readiness:", error);
      res.status(500).json({ message: "Failed to compute go-live readiness" });
    }
  });

  // Consultant Utilization Analytics
  app.get('/api/analytics/advanced/utilization', isAuthenticated, requirePermission('analytics:view'), async (req: any, res) => {
    try {
      const projectId = req.query.projectId as string | undefined;
      const snapshots = await storage.getConsultantUtilizationSnapshots(projectId);
      res.json(snapshots);
    } catch (error) {
      console.error("Error getting utilization snapshots:", error);
      res.status(500).json({ message: "Failed to get utilization snapshots" });
    }
  });

  app.get('/api/analytics/advanced/utilization/:projectId', isAuthenticated, requirePermission('analytics:view'), async (req: any, res) => {
    try {
      const { projectId } = req.params;
      const snapshot = await storage.getLatestConsultantUtilization(projectId);
      if (!snapshot) {
        return res.status(404).json({ message: "No utilization snapshot found" });
      }
      res.json(snapshot);
    } catch (error) {
      console.error("Error getting utilization:", error);
      res.status(500).json({ message: "Failed to get utilization" });
    }
  });

  app.post('/api/analytics/advanced/utilization/compute', isAuthenticated, requirePermission('analytics:manage'), async (req: any, res) => {
    try {
      const { projectId, periodStart, periodEnd } = req.body;
      
      const startDate = periodStart ? new Date(periodStart) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const endDate = periodEnd ? new Date(periodEnd) : new Date();
      
      const snapshot = await storage.computeConsultantUtilization(projectId, startDate, endDate);
      res.status(201).json(snapshot);
    } catch (error) {
      console.error("Error computing utilization:", error);
      res.status(500).json({ message: "Failed to compute utilization" });
    }
  });

  // Timeline Forecast Analytics
  app.get('/api/analytics/advanced/forecasts', isAuthenticated, requirePermission('analytics:view'), async (req: any, res) => {
    try {
      const projectId = req.query.projectId as string;
      if (!projectId) {
        return res.status(400).json({ message: "Project ID is required" });
      }
      const snapshots = await storage.getTimelineForecastSnapshots(projectId);
      res.json(snapshots);
    } catch (error) {
      console.error("Error getting timeline forecasts:", error);
      res.status(500).json({ message: "Failed to get timeline forecasts" });
    }
  });

  app.get('/api/analytics/advanced/forecasts/:projectId', isAuthenticated, requirePermission('analytics:view'), async (req: any, res) => {
    try {
      const { projectId } = req.params;
      const snapshot = await storage.getLatestTimelineForecast(projectId);
      if (!snapshot) {
        return res.status(404).json({ message: "No timeline forecast found for this project" });
      }
      res.json(snapshot);
    } catch (error) {
      console.error("Error getting timeline forecast:", error);
      res.status(500).json({ message: "Failed to get timeline forecast" });
    }
  });

  app.post('/api/analytics/advanced/forecasts/:projectId/compute', isAuthenticated, requirePermission('analytics:manage'), async (req: any, res) => {
    try {
      const { projectId } = req.params;
      const userId = req.user?.id;
      const snapshot = await storage.computeTimelineForecast(projectId, userId);
      res.status(201).json(snapshot);
    } catch (error) {
      console.error("Error computing timeline forecast:", error);
      res.status(500).json({ message: "Failed to compute timeline forecast" });
    }
  });

  // Cost Variance Analytics
  app.get('/api/analytics/advanced/cost-variance', isAuthenticated, requirePermission('analytics:view'), async (req: any, res) => {
    try {
      const projectId = req.query.projectId as string;
      if (!projectId) {
        return res.status(400).json({ message: "Project ID is required" });
      }
      const snapshots = await storage.getCostVarianceSnapshots(projectId);
      res.json(snapshots);
    } catch (error) {
      console.error("Error getting cost variance snapshots:", error);
      res.status(500).json({ message: "Failed to get cost variance snapshots" });
    }
  });

  app.get('/api/analytics/advanced/cost-variance/:projectId', isAuthenticated, requirePermission('analytics:view'), async (req: any, res) => {
    try {
      const { projectId } = req.params;
      const snapshot = await storage.getLatestCostVariance(projectId);
      if (!snapshot) {
        return res.status(404).json({ message: "No cost variance snapshot found for this project" });
      }
      res.json(snapshot);
    } catch (error) {
      console.error("Error getting cost variance:", error);
      res.status(500).json({ message: "Failed to get cost variance" });
    }
  });

  app.post('/api/analytics/advanced/cost-variance/:projectId/compute', isAuthenticated, requirePermission('analytics:manage'), async (req: any, res) => {
    try {
      const { projectId } = req.params;
      const snapshot = await storage.computeCostVariance(projectId);
      res.status(201).json(snapshot);
    } catch (error) {
      console.error("Error computing cost variance:", error);
      res.status(500).json({ message: "Failed to compute cost variance" });
    }
  });

  // ============================================
  // RACI MATRIX ROUTES
  // ============================================

  // Get all RACI assignments for a project
  app.get('/api/projects/:projectId/raci', isAuthenticated, requireAnyPermission('projects:raci_view', 'admin:manage'), async (req: any, res) => {
    try {
      const { projectId } = req.params;
      const assignments = await storage.getRaciAssignmentsByProject(projectId);
      res.json(assignments);
    } catch (error) {
      console.error("Error fetching RACI assignments:", error);
      res.status(500).json({ message: "Failed to fetch RACI assignments" });
    }
  });

  // Create a RACI assignment
  app.post('/api/projects/:projectId/raci', isAuthenticated, requireAnyPermission('projects:raci_manage', 'admin:manage'), async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { projectId } = req.params;
      const validated = insertRaciAssignmentSchema.parse({
        ...req.body,
        projectId,
        createdBy: userId,
      });
      const assignment = await storage.createRaciAssignment(validated);
      res.status(201).json(assignment);
    } catch (error) {
      console.error("Error creating RACI assignment:", error);
      res.status(400).json({ message: "Failed to create RACI assignment" });
    }
  });

  // Update a RACI assignment
  app.put('/api/raci/:id', isAuthenticated, requireAnyPermission('projects:raci_manage', 'admin:manage'), async (req: any, res) => {
    try {
      const { id } = req.params;
      const updated = await storage.updateRaciAssignment(id, req.body);
      if (!updated) {
        return res.status(404).json({ message: "RACI assignment not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating RACI assignment:", error);
      res.status(400).json({ message: "Failed to update RACI assignment" });
    }
  });

  // Delete a RACI assignment
  app.delete('/api/raci/:id', isAuthenticated, requireAnyPermission('projects:raci_manage', 'admin:manage'), async (req: any, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteRaciAssignment(id);
      if (!deleted) {
        return res.status(404).json({ message: "RACI assignment not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting RACI assignment:", error);
      res.status(500).json({ message: "Failed to delete RACI assignment" });
    }
  });

  // Bulk update RACI assignments for a project
  app.post('/api/projects/:projectId/raci/bulk', isAuthenticated, requireAnyPermission('projects:raci_manage', 'admin:manage'), async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { projectId } = req.params;
      const { assignments } = req.body;
      
      if (!Array.isArray(assignments)) {
        return res.status(400).json({ message: "assignments must be an array" });
      }
      
      const validatedAssignments = assignments.map(a => ({
        ...a,
        projectId,
        createdBy: userId,
      }));
      
      const result = await storage.bulkUpsertRaciAssignments(projectId, validatedAssignments);
      res.json(result);
    } catch (error) {
      console.error("Error bulk updating RACI assignments:", error);
      res.status(400).json({ message: "Failed to bulk update RACI assignments" });
    }
  });

  // ============================================
  // NOTIFICATION COUNTS ROUTE
  // ============================================

  // Get notification badge counts for sidebar
  app.get('/api/notifications/counts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const userRole = req.user?.claims?.metadata?.role || 'consultant';

      // Initialize counts
      const counts: Record<string, number> = {};

      // Get pending shift swap requests (for admins and consultants)
      if (userRole === 'admin' || userRole === 'consultant') {
        const pendingSwaps = await storage.getPendingSwapRequests();
        if (userRole === 'admin') {
          counts['shift-swaps'] = pendingSwaps.length;
        } else {
          // For consultants, show swaps relevant to them
          const consultant = await storage.getConsultantByUserId(userId);
          if (consultant) {
            counts['shift-swaps'] = pendingSwaps.filter(
              s => s.requesterId === consultant.id || s.targetConsultantId === consultant.id
            ).length;
          }
        }
      }

      // Get open support tickets
      const allTickets = await storage.getAllSupportTickets();
      const openTickets = allTickets.filter(t => t.status === 'open' || t.status === 'in_progress');
      if (userRole === 'admin') {
        counts['tickets'] = openTickets.length;
      } else {
        // For non-admins, count tickets they created or are assigned to
        counts['tickets'] = openTickets.filter(
          t => t.reportedById === userId || t.assignedToId === userId
        ).length;
      }

      // Get pending invitations (admin only)
      if (userRole === 'admin') {
        const pendingInvitations = await storage.getInvitationsByStatus('pending');
        counts['invitations'] = pendingInvitations.length;
      }

      // Get pending timesheets needing approval (for admins/leadership)
      if (userRole === 'admin' || userRole === 'hospital_leadership') {
        const timesheets = await storage.getAllTimesheets();
        counts['timesheets'] = timesheets.filter(t => t.status === 'submitted').length;
      }

      res.json(counts);
    } catch (error) {
      console.error("Error fetching notification counts:", error);
      res.status(500).json({ message: "Failed to fetch notification counts" });
    }
  });

  // Setup WebSocket server for real-time chat
  const { setupWebSocket } = await import('./websocket');
  setupWebSocket(httpServer);

  return httpServer;
}
