import { db } from "./db";
import { 
  courseModules,
  courseEnrollments,
  knowledgeArticles,
  assessments,
  assessmentQuestions,
  loginLabs,
  supportTickets,
  ticketComments,
  eodReports,
  escalationRules,
  goLiveSignIns,
  shiftHandoffs,
  incidents,
  timesheets,
  timesheetEntries,
  projectSchedules,
  scheduleAssignments,
  consultantAvailability,
  shiftSwapRequests,
  expenses,
  invoices,
  invoiceLineItems,
  payrollBatches,
  payrollEntries,
  budgetCalculations,
  budgetScenarios,
  travelPreferences,
  travelBookings,
  travelItineraries,
  transportationContacts,
  shuttleSchedules,
  consultantScorecards,
  consultantRatings,
  pulseSurveys,
  pulseResponses,
  npsResponses,
  complianceChecks,
  complianceAudits,
  consultantDocuments,
  contractTemplates,
  contracts,
  achievementBadges,
  consultantBadges,
  pointTransactions,
  referrals,
  reportTemplates,
  savedReports,
  executiveDashboards,
  projectRequirements,
  projectTasks,
  projectMilestones,
  projectRisks,
  phaseDeliverables,
  projectTeamAssignments,
  chatChannels,
  chatMessages,
  channelMembers,
  roiSurveys,
  roiQuestions,
  roiResponses,
  onboardingTasks,
  notifications,
} from "@shared/schema";

export async function seedExpandedDemoData() {
  console.log("Starting expanded demo data seeding...");

  try {
    console.log("Seeding course modules...");
    const demoModules = [
      { id: "mod-1", courseId: "course-1", title: "Introduction to Epic", description: "Overview of Epic EHR system architecture and navigation", orderIndex: 1, durationMinutes: 60, contentType: "video" as const },
      { id: "mod-2", courseId: "course-1", title: "Epic Clinical Documentation", description: "Mastering clinical documentation in Epic", orderIndex: 2, durationMinutes: 90, contentType: "video" as const },
      { id: "mod-3", courseId: "course-1", title: "Epic Orders Management", description: "Clinical order entry and management", orderIndex: 3, durationMinutes: 75, contentType: "interactive" as const },
      { id: "mod-4", courseId: "course-2", title: "HIPAA Fundamentals", description: "Understanding HIPAA regulations", orderIndex: 1, durationMinutes: 45, contentType: "video" as const },
      { id: "mod-5", courseId: "course-2", title: "Data Security Best Practices", description: "Protecting patient information", orderIndex: 2, durationMinutes: 30, contentType: "document" as const },
      { id: "mod-6", courseId: "course-3", title: "Workflow Analysis Techniques", description: "Methods for analyzing clinical workflows", orderIndex: 1, durationMinutes: 60, contentType: "interactive" as const },
    ];
    for (const mod of demoModules) {
      await db.insert(courseModules).values(mod).onConflictDoNothing();
    }

    console.log("Seeding course enrollments...");
    const demoEnrollments = [
      { id: "enroll-1", userId: "user-c1", courseId: "course-1", status: "completed" as const, progress: 100, startedAt: new Date("2024-10-01"), completedAt: new Date("2024-10-15") },
      { id: "enroll-2", userId: "user-c2", courseId: "course-1", status: "in_progress" as const, progress: 65, startedAt: new Date("2024-11-01") },
      { id: "enroll-3", userId: "user-c3", courseId: "course-2", status: "completed" as const, progress: 100, startedAt: new Date("2024-09-15"), completedAt: new Date("2024-09-20") },
      { id: "enroll-4", userId: "user-c4", courseId: "course-3", status: "in_progress" as const, progress: 40, startedAt: new Date("2024-11-15") },
      { id: "enroll-5", userId: "user-c5", courseId: "course-1", status: "completed" as const, progress: 100, startedAt: new Date("2024-08-01"), completedAt: new Date("2024-08-20") },
    ];
    for (const enroll of demoEnrollments) {
      await db.insert(courseEnrollments).values(enroll).onConflictDoNothing();
    }

    console.log("Seeding knowledge articles...");
    const demoArticles = [
      { id: "article-1", title: "Epic Navigation Tips and Tricks", content: "A comprehensive guide to navigating Epic EHR efficiently. Learn keyboard shortcuts, quick actions, and navigation best practices that will save you time during go-live support.", category: "Epic", tags: ["epic", "navigation", "tips"], authorId: "user-c1", viewCount: 156, status: "published" as const },
      { id: "article-2", title: "Cerner PowerChart Best Practices", content: "Essential techniques for using Cerner PowerChart effectively. Covers clinical documentation, order entry, and medication administration workflows.", category: "Cerner", tags: ["cerner", "powerchart", "clinical"], authorId: "user-c2", viewCount: 89, status: "published" as const },
      { id: "article-3", title: "Go-Live Support Checklist", content: "Complete checklist for go-live support consultants. Includes pre-go-live preparation, day-of activities, and post-go-live follow-up tasks.", category: "Go-Live", tags: ["go-live", "checklist", "support"], authorId: "user-c3", viewCount: 234, status: "published" as const },
      { id: "article-4", title: "Troubleshooting Common Epic Errors", content: "Quick reference guide for resolving the most common Epic error messages encountered during implementations.", category: "Epic", tags: ["epic", "troubleshooting", "errors"], authorId: "user-c1", viewCount: 312, status: "published" as const },
      { id: "article-5", title: "HIPAA Compliance Quick Reference", content: "Essential HIPAA guidelines for healthcare IT consultants. Covers PHI handling, security requirements, and breach reporting procedures.", category: "Compliance", tags: ["hipaa", "compliance", "security"], authorId: "user-c3", viewCount: 178, status: "published" as const },
    ];
    for (const article of demoArticles) {
      await db.insert(knowledgeArticles).values(article).onConflictDoNothing();
    }

    console.log("Seeding assessments...");
    const demoAssessments = [
      { id: "assess-1", title: "Epic Fundamentals Assessment", description: "Test your knowledge of Epic EHR fundamentals", courseId: "course-1", passingScore: 80, timeLimit: 30, isActive: true },
      { id: "assess-2", title: "HIPAA Compliance Certification", description: "Annual HIPAA compliance certification exam", courseId: "course-2", passingScore: 90, timeLimit: 45, isActive: true },
      { id: "assess-3", title: "Clinical Workflow Analysis", description: "Assessment of workflow optimization skills", courseId: "course-3", passingScore: 75, timeLimit: 60, isActive: true },
    ];
    for (const assess of demoAssessments) {
      await db.insert(assessments).values(assess).onConflictDoNothing();
    }

    console.log("Seeding assessment questions...");
    const demoQuestions = [
      { id: "q-1", assessmentId: "assess-1", questionText: "What is the primary purpose of Epic's ADT module?", questionType: "multiple_choice" as const, options: JSON.stringify(["Patient registration", "Medication administration", "Lab results", "Surgical scheduling"]), correctAnswer: "Patient registration", points: 10, orderIndex: 1 },
      { id: "q-2", assessmentId: "assess-1", questionText: "Which Epic module handles clinical documentation?", questionType: "multiple_choice" as const, options: JSON.stringify(["Cadence", "Stork", "EpicCare", "Prelude"]), correctAnswer: "EpicCare", points: 10, orderIndex: 2 },
      { id: "q-3", assessmentId: "assess-2", questionText: "What does PHI stand for?", questionType: "multiple_choice" as const, options: JSON.stringify(["Protected Health Information", "Patient Health Index", "Private Hospital Information", "Public Health Initiative"]), correctAnswer: "Protected Health Information", points: 10, orderIndex: 1 },
      { id: "q-4", assessmentId: "assess-2", questionText: "How long must HIPAA breach notifications be retained?", questionType: "multiple_choice" as const, options: JSON.stringify(["1 year", "3 years", "6 years", "Indefinitely"]), correctAnswer: "6 years", points: 10, orderIndex: 2 },
    ];
    for (const q of demoQuestions) {
      await db.insert(assessmentQuestions).values(q).onConflictDoNothing();
    }

    console.log("Seeding login labs...");
    const demoLoginLabs = [
      { id: "lab-1", title: "Epic Navigation Practice Lab", description: "Hands-on practice with Epic system navigation and basic workflows", projectId: "project-1", hospitalId: "hospital-1", facilitatorId: "user-c1", scheduledAt: new Date("2024-12-02T09:00:00"), durationMinutes: 180, maxParticipants: 15, status: "scheduled" as const },
      { id: "lab-2", title: "Cerner PowerChart Training Lab", description: "Interactive Cerner training session for clinical documentation", projectId: "project-2", hospitalId: "hospital-2", facilitatorId: "user-c2", scheduledAt: new Date("2024-12-05T13:00:00"), durationMinutes: 180, maxParticipants: 12, status: "scheduled" as const },
      { id: "lab-3", title: "Epic Orders Entry Practice", description: "Practice lab for clinical order entry in Epic", projectId: "project-1", hospitalId: "hospital-1", facilitatorId: "user-c3", scheduledAt: new Date("2024-11-25T10:00:00"), durationMinutes: 240, maxParticipants: 20, status: "completed" as const },
    ];
    for (const lab of demoLoginLabs) {
      await db.insert(loginLabs).values(lab).onConflictDoNothing();
    }

    console.log("Seeding support tickets...");
    const demoTickets = [
      { id: "ticket-1", projectId: "project-1", title: "Epic login issues in ED", description: "Multiple users in the Emergency Department are experiencing intermittent login failures. Error message: 'Session timeout exceeded'", priority: "high" as const, status: "in_progress" as const, category: "access" as const, assignedToId: "consultant-1", reportedById: "user-cs1", createdAt: new Date("2024-11-26T08:30:00") },
      { id: "ticket-2", projectId: "project-1", title: "Missing medication in formulary", description: "Cardiology reports that Metoprolol 25mg is not appearing in the medication search. Urgent for patient care.", priority: "critical" as const, status: "open" as const, category: "clinical" as const, reportedById: "user-cs3", createdAt: new Date("2024-11-27T14:15:00") },
      { id: "ticket-3", projectId: "project-2", title: "PowerChart slowness during peak hours", description: "Clinical staff reporting 30+ second delays when opening patient charts between 8am-10am.", priority: "medium" as const, status: "in_progress" as const, category: "technical" as const, assignedToId: "consultant-2", reportedById: "user-cs4", createdAt: new Date("2024-11-25T09:00:00") },
      { id: "ticket-4", projectId: "project-3", title: "MyChart patient messages not syncing", description: "Patient messages sent through MyChart are not appearing in provider inboxes. Started after yesterday's update.", priority: "high" as const, status: "open" as const, category: "integration" as const, reportedById: "user-cs7", createdAt: new Date("2024-11-27T16:45:00") },
      { id: "ticket-5", projectId: "project-1", title: "Printer configuration for wristbands", description: "Nursing unit 4B needs help configuring wristband printers. New printers installed yesterday.", priority: "low" as const, status: "resolved" as const, category: "technical" as const, assignedToId: "consultant-4", reportedById: "user-cs3", resolvedAt: new Date("2024-11-26T11:00:00"), createdAt: new Date("2024-11-25T15:30:00") },
    ];
    for (const ticket of demoTickets) {
      await db.insert(supportTickets).values(ticket).onConflictDoNothing();
    }

    console.log("Seeding ticket comments...");
    const demoComments = [
      { id: "comment-1", ticketId: "ticket-1", authorId: "user-c1", content: "Investigating the issue. Appears to be related to session token expiration settings.", createdAt: new Date("2024-11-26T09:15:00") },
      { id: "comment-2", ticketId: "ticket-1", authorId: "user-c1", content: "Found the root cause - authentication server timeout was set too low. Adjusting now.", createdAt: new Date("2024-11-26T10:30:00") },
      { id: "comment-3", ticketId: "ticket-3", authorId: "user-c2", content: "Performance analysis shows database queries are taking longer during peak hours. Escalating to DBA team.", createdAt: new Date("2024-11-25T11:00:00") },
      { id: "comment-4", ticketId: "ticket-5", authorId: "user-c4", content: "Printer drivers installed and configured. Tested successfully with multiple wristband prints.", createdAt: new Date("2024-11-26T10:45:00") },
    ];
    for (const comment of demoComments) {
      await db.insert(ticketComments).values(comment).onConflictDoNothing();
    }

    console.log("Seeding EOD reports...");
    const demoEodReports = [
      { id: "eod-1", projectId: "project-1", reportDate: "2024-11-26", submittedById: "user-c1", status: "submitted" as const, issuesResolved: 5, issuesPending: 1, issuesEscalated: 1, resolvedSummary: "Resolved 5 access issues in ED", pendingSummary: "1 critical medication formulary issue pending Epic support response", highlights: "Successfully completed Epic navigation training for 15 nurses", challenges: "Database performance issues during morning peak", submittedAt: new Date("2024-11-26T18:00:00") },
      { id: "eod-2", projectId: "project-1", reportDate: "2024-11-26", submittedById: "user-c4", status: "submitted" as const, issuesResolved: 2, issuesPending: 0, issuesEscalated: 0, resolvedSummary: "Quiet night shift, resolved 2 minor printing issues", highlights: "Prepared documentation for tomorrow's training session", challenges: "None significant", submittedAt: new Date("2024-11-27T07:00:00") },
      { id: "eod-3", projectId: "project-2", reportDate: "2024-11-25", submittedById: "user-c2", status: "submitted" as const, issuesResolved: 4, issuesPending: 2, issuesEscalated: 2, resolvedSummary: "Performance issues ongoing, working with infrastructure team", highlights: "Identified query optimization opportunities", challenges: "Peak hour slowness affecting multiple units", submittedAt: new Date("2024-11-25T20:00:00") },
    ];
    for (const report of demoEodReports) {
      await db.insert(eodReports).values(report).onConflictDoNothing();
    }

    console.log("Seeding escalation rules...");
    const demoEscalationRules = [
      { id: "rule-1", name: "Critical Ticket Escalation", description: "Auto-escalate critical priority tickets after 30 minutes", priority: "critical" as const, timeThresholdMinutes: 30, notifyRoles: ["leadership@nicehr.com"], isActive: true },
      { id: "rule-2", name: "High Priority After 2 Hours", description: "Escalate high priority tickets if unassigned after 2 hours", priority: "high" as const, timeThresholdMinutes: 120, notifyRoles: ["support-lead@nicehr.com"], isActive: true },
      { id: "rule-3", name: "Stale Ticket Warning", description: "Alert when any ticket has no activity for 24 hours", priority: "medium" as const, timeThresholdMinutes: 1440, notifyRoles: ["project-manager@nicehr.com"], isActive: true },
    ];
    for (const rule of demoEscalationRules) {
      await db.insert(escalationRules).values(rule).onConflictDoNothing();
    }

    console.log("Seeding go-live sign-ins...");
    const demoSignins = [
      { id: "signin-1", projectId: "project-1", consultantId: "consultant-1", signInTime: new Date("2024-11-26T07:00:00"), signOutTime: new Date("2024-11-26T15:30:00"), location: "ED Command Center", notes: "Ready for go-live support", status: "checked_out" as const },
      { id: "signin-2", projectId: "project-1", consultantId: "consultant-3", signInTime: new Date("2024-11-26T07:15:00"), signOutTime: new Date("2024-11-26T15:45:00"), location: "ICU Floor 3", notes: "At-the-elbow support", status: "checked_out" as const },
      { id: "signin-3", projectId: "project-1", consultantId: "consultant-4", signInTime: new Date("2024-11-26T19:00:00"), location: "Main Command Center", notes: "Night shift support", status: "checked_in" as const },
    ];
    for (const signin of demoSignins) {
      await db.insert(goLiveSignIns).values(signin).onConflictDoNothing();
    }

    console.log("Seeding shift handoffs...");
    const demoHandoffs = [
      { id: "handoff-1", projectId: "project-1", outgoingConsultantId: "consultant-1", incomingConsultantId: "consultant-4", shiftDate: "2024-11-26", outgoingShiftType: "day" as const, incomingShiftType: "night" as const, activeIssues: "1 critical medication formulary issue pending Epic support response", pendingTasks: "Follow up on ED login performance after config change", generalNotes: "Overall good day, formulary issue is the main concern for night team to monitor", status: "acknowledged" as const },
      { id: "handoff-2", projectId: "project-2", outgoingConsultantId: "consultant-2", incomingConsultantId: "consultant-6", shiftDate: "2024-11-25", outgoingShiftType: "day" as const, incomingShiftType: "night" as const, activeIssues: "Database performance investigation ongoing", pendingTasks: "DBA team to implement query optimizations overnight", generalNotes: "Expect improved performance by morning", status: "acknowledged" as const },
    ];
    for (const handoff of demoHandoffs) {
      await db.insert(shiftHandoffs).values(handoff).onConflictDoNothing();
    }

    console.log("Seeding incidents...");
    const demoIncidents = [
      { id: "incident-1", projectId: "project-1", hospitalId: "hospital-1", title: "Brief System Outage", description: "Epic system experienced 5-minute outage affecting all users", severity: "critical" as const, status: "resolved" as const, reportedById: "user-c1", incidentDate: new Date("2024-11-20T10:30:00"), resolvedAt: new Date("2024-11-20T10:35:00"), rootCause: "Network switch failure in data center", resolution: "Failover to backup network infrastructure" },
      { id: "incident-2", projectId: "project-2", hospitalId: "hospital-2", title: "Lab Interface Delay", description: "Lab results delayed by 15 minutes due to interface queue backup", severity: "high" as const, status: "resolved" as const, reportedById: "user-c2", incidentDate: new Date("2024-11-22T14:00:00"), resolvedAt: new Date("2024-11-22T14:45:00"), rootCause: "Interface server memory limit reached", resolution: "Increased server memory and restarted interface engine" },
    ];
    for (const incident of demoIncidents) {
      await db.insert(incidents).values(incident).onConflictDoNothing();
    }

    console.log("Seeding timesheets...");
    const demoTimesheets = [
      { id: "ts-1", consultantId: "consultant-1", weekStartDate: "2024-11-18", weekEndDate: "2024-11-24", status: "approved" as const, totalHours: 44, regularHours: 40, overtimeHours: 4, submittedAt: new Date("2024-11-24T18:00:00"), approvedAt: new Date("2024-11-25T09:00:00"), approvedBy: "user-cs1" },
      { id: "ts-2", consultantId: "consultant-2", weekStartDate: "2024-11-18", weekEndDate: "2024-11-24", status: "approved" as const, totalHours: 48, regularHours: 40, overtimeHours: 8, submittedAt: new Date("2024-11-24T17:30:00"), approvedAt: new Date("2024-11-25T10:00:00"), approvedBy: "user-cs4" },
      { id: "ts-3", consultantId: "consultant-1", weekStartDate: "2024-11-25", weekEndDate: "2024-12-01", status: "submitted" as const, totalHours: 40, regularHours: 40, overtimeHours: 0, submittedAt: new Date("2024-11-28T17:00:00") },
      { id: "ts-4", consultantId: "consultant-3", weekStartDate: "2024-11-25", weekEndDate: "2024-12-01", status: "draft" as const, totalHours: 32, regularHours: 32, overtimeHours: 0 },
    ];
    for (const ts of demoTimesheets) {
      await db.insert(timesheets).values(ts).onConflictDoNothing();
    }

    console.log("Seeding timesheet entries...");
    const demoTimesheetEntries = [
      { id: "tse-1", timesheetId: "ts-1", entryDate: "2024-11-18", clockIn: new Date("2024-11-18T08:00:00"), clockOut: new Date("2024-11-18T16:00:00"), totalHours: 8, notes: "Go-live support - ED" },
      { id: "tse-2", timesheetId: "ts-1", entryDate: "2024-11-19", clockIn: new Date("2024-11-19T07:00:00"), clockOut: new Date("2024-11-19T16:00:00"), totalHours: 9, notes: "Training session + support" },
      { id: "tse-3", timesheetId: "ts-1", entryDate: "2024-11-20", clockIn: new Date("2024-11-20T06:00:00"), clockOut: new Date("2024-11-20T16:00:00"), totalHours: 10, notes: "Critical issue resolution" },
      { id: "tse-4", timesheetId: "ts-2", entryDate: "2024-11-18", clockIn: new Date("2024-11-18T08:00:00"), clockOut: new Date("2024-11-18T16:00:00"), totalHours: 8, notes: "System optimization" },
      { id: "tse-5", timesheetId: "ts-2", entryDate: "2024-11-19", clockIn: new Date("2024-11-19T06:00:00"), clockOut: new Date("2024-11-19T16:00:00"), totalHours: 10, notes: "Performance analysis" },
    ];
    for (const entry of demoTimesheetEntries) {
      await db.insert(timesheetEntries).values(entry).onConflictDoNothing();
    }

    console.log("Seeding project schedules...");
    const demoSchedules = [
      { id: "sched-1", projectId: "project-1", scheduleDate: "2024-11-25", shiftType: "day" as const, status: "approved" as const },
      { id: "sched-2", projectId: "project-1", scheduleDate: "2024-11-25", shiftType: "night" as const, status: "approved" as const },
      { id: "sched-3", projectId: "project-2", scheduleDate: "2024-11-18", shiftType: "day" as const, status: "approved" as const },
    ];
    for (const sched of demoSchedules) {
      await db.insert(projectSchedules).values(sched).onConflictDoNothing();
    }

    console.log("Seeding schedule assignments...");
    const demoAssignments = [
      { id: "assign-1", scheduleId: "sched-1", consultantId: "consultant-1" },
      { id: "assign-2", scheduleId: "sched-1", consultantId: "consultant-3" },
      { id: "assign-3", scheduleId: "sched-1", consultantId: "consultant-5" },
      { id: "assign-4", scheduleId: "sched-2", consultantId: "consultant-4" },
      { id: "assign-5", scheduleId: "sched-3", consultantId: "consultant-2" },
      { id: "assign-6", scheduleId: "sched-3", consultantId: "consultant-6" },
    ];
    for (const assign of demoAssignments) {
      await db.insert(scheduleAssignments).values(assign).onConflictDoNothing();
    }

    console.log("Seeding consultant availability...");
    const demoAvailability = [
      { id: "avail-1", consultantId: "consultant-1", startDate: "2024-12-01", endDate: "2024-12-31", isAvailable: true, notes: "Available for new assignments" },
      { id: "avail-2", consultantId: "consultant-2", startDate: "2024-12-15", endDate: "2024-12-31", isAvailable: false, notes: "Holiday vacation" },
      { id: "avail-3", consultantId: "consultant-3", startDate: "2024-12-01", endDate: "2025-01-15", isAvailable: true, notes: "Flexible schedule" },
      { id: "avail-4", consultantId: "consultant-4", startDate: "2024-12-01", endDate: "2024-12-20", isAvailable: true, notes: "Night shift preferred" },
    ];
    for (const avail of demoAvailability) {
      await db.insert(consultantAvailability).values(avail).onConflictDoNothing();
    }

    console.log("Seeding expenses...");
    const demoExpenses = [
      { id: "exp-1", consultantId: "consultant-1", projectId: "project-1", category: "travel" as const, amount: "450.00", description: "Flight Chicago to Dallas", expenseDate: "2024-11-20", receiptUrl: "/receipts/flight-001.pdf", status: "approved" as const, submittedAt: new Date("2024-11-20"), reviewedAt: new Date("2024-11-21"), reviewedBy: "user-cs1" },
      { id: "exp-2", consultantId: "consultant-1", projectId: "project-1", category: "lodging" as const, amount: "175.00", description: "Hotel - Marriott Downtown", expenseDate: "2024-11-20", receiptUrl: "/receipts/hotel-001.pdf", status: "approved" as const, submittedAt: new Date("2024-11-20"), reviewedAt: new Date("2024-11-21"), reviewedBy: "user-cs1" },
      { id: "exp-3", consultantId: "consultant-2", projectId: "project-2", category: "meals" as const, amount: "65.00", description: "Client dinner meeting", expenseDate: "2024-11-25", receiptUrl: "/receipts/meal-001.pdf", status: "submitted" as const, submittedAt: new Date("2024-11-25") },
      { id: "exp-4", consultantId: "consultant-3", projectId: "project-3", category: "transportation" as const, amount: "85.00", description: "Uber rides to/from hospital", expenseDate: "2024-11-26", receiptUrl: "/receipts/uber-001.pdf", status: "submitted" as const, submittedAt: new Date("2024-11-26") },
      { id: "exp-5", consultantId: "consultant-1", projectId: "project-1", category: "supplies" as const, amount: "45.00", description: "Training materials", expenseDate: "2024-11-27", status: "draft" as const },
    ];
    for (const exp of demoExpenses) {
      await db.insert(expenses).values(exp).onConflictDoNothing();
    }

    console.log("Seeding invoices...");
    const demoInvoices = [
      { id: "inv-1", hospitalId: "hospital-1", projectId: "project-1", invoiceNumber: "INV-2024-001", totalAmount: "125000.00", status: "paid" as const, dueDate: "2024-11-30", paidAt: new Date("2024-11-28"), notes: "October 2024 consulting services" },
      { id: "inv-2", hospitalId: "hospital-1", projectId: "project-1", invoiceNumber: "INV-2024-002", totalAmount: "148000.00", status: "sent" as const, dueDate: "2024-12-15", notes: "November 2024 consulting services" },
      { id: "inv-3", hospitalId: "hospital-2", projectId: "project-2", invoiceNumber: "INV-2024-003", totalAmount: "95000.00", status: "paid" as const, dueDate: "2024-11-15", paidAt: new Date("2024-11-12"), notes: "October optimization services" },
      { id: "inv-4", hospitalId: "hospital-3", projectId: "project-3", invoiceNumber: "INV-2024-004", totalAmount: "72000.00", status: "draft" as const, dueDate: "2024-12-31", notes: "MyChart implementation Phase 1" },
    ];
    for (const inv of demoInvoices) {
      await db.insert(invoices).values(inv).onConflictDoNothing();
    }

    console.log("Seeding invoice line items...");
    const demoLineItems = [
      { id: "line-1", invoiceId: "inv-1", description: "Senior Consultant - 160 hours @ $150/hr", quantity: "160", unitPrice: "150.00", amount: "24000.00" },
      { id: "line-2", invoiceId: "inv-1", description: "Project Manager - 80 hours @ $175/hr", quantity: "80", unitPrice: "175.00", amount: "14000.00" },
      { id: "line-3", invoiceId: "inv-2", description: "Go-Live Support Team - 200 hours @ $140/hr", quantity: "200", unitPrice: "140.00", amount: "28000.00" },
      { id: "line-4", invoiceId: "inv-2", description: "Travel expenses", quantity: "1", unitPrice: "3500.00", amount: "3500.00" },
    ];
    for (const item of demoLineItems) {
      await db.insert(invoiceLineItems).values(item).onConflictDoNothing();
    }

    console.log("Seeding payroll batches...");
    const demoPayrollBatches = [
      { id: "payroll-1", name: "November 1-15 2024 Payroll", periodStart: "2024-11-01", periodEnd: "2024-11-15", status: "paid" as const, totalAmount: "87500.00", processedAt: new Date("2024-11-18") },
      { id: "payroll-2", name: "November 16-30 2024 Payroll", periodStart: "2024-11-16", periodEnd: "2024-11-30", status: "draft" as const, totalAmount: "92000.00" },
    ];
    for (const batch of demoPayrollBatches) {
      await db.insert(payrollBatches).values(batch).onConflictDoNothing();
    }

    console.log("Seeding payroll entries...");
    const demoPayrollEntries = [
      { id: "pay-1", batchId: "payroll-1", consultantId: "consultant-1", regularHours: "80.00", overtimeHours: "8.00", hourlyRate: "150.00", overtimeRate: "225.00", grossPay: "13800.00" },
      { id: "pay-2", batchId: "payroll-1", consultantId: "consultant-2", regularHours: "80.00", overtimeHours: "12.00", hourlyRate: "135.00", overtimeRate: "202.50", grossPay: "13230.00" },
      { id: "pay-3", batchId: "payroll-1", consultantId: "consultant-3", regularHours: "76.00", overtimeHours: "0.00", hourlyRate: "175.00", overtimeRate: "262.50", grossPay: "13300.00" },
    ];
    for (const entry of demoPayrollEntries) {
      await db.insert(payrollEntries).values(entry).onConflictDoNothing();
    }

    console.log("Seeding budget calculations...");
    const demoBudgets = [
      { id: "budget-1", projectId: "project-1", estimatedConsultants: 8, optimizedConsultants: 6, avgPayRate: "155.00", avgFlightCost: "450.00", avgHotelCost: "175.00", avgPerDiem: "75.00", totalEstimatedCost: "2500000.00", totalOptimizedCost: "2000000.00", totalSavings: "500000.00", savingsPercentage: "20.00", notes: "Q4 2024 Budget" },
      { id: "budget-2", projectId: "project-2", estimatedConsultants: 6, optimizedConsultants: 5, avgPayRate: "145.00", avgFlightCost: "375.00", avgHotelCost: "150.00", avgPerDiem: "65.00", totalEstimatedCost: "1800000.00", totalOptimizedCost: "1550000.00", totalSavings: "250000.00", savingsPercentage: "13.89", notes: "Optimization Budget" },
    ];
    for (const budget of demoBudgets) {
      await db.insert(budgetCalculations).values(budget).onConflictDoNothing();
    }

    console.log("Seeding travel preferences...");
    const demoTravelPrefs = [
      { id: "pref-1", consultantId: "consultant-1", preferredAirline: "United", frequentFlyerNumber: "UA12345678", seatPreference: "aisle" as const, mealPreference: "vegetarian", hotelChain: "Marriott", hotelLoyaltyNumber: "MAR98765432", roomPreference: "Non-smoking, high floor", rentalCarCompany: "Enterprise" },
      { id: "pref-2", consultantId: "consultant-2", preferredAirline: "American", frequentFlyerNumber: "AA87654321", seatPreference: "window" as const, mealPreference: "standard", hotelChain: "Hilton", hotelLoyaltyNumber: "HH11223344", roomPreference: "Ground floor preferred", rentalCarCompany: "Hertz" },
      { id: "pref-3", consultantId: "consultant-3", preferredAirline: "Delta", frequentFlyerNumber: "DL55667788", seatPreference: "aisle" as const, mealPreference: "gluten-free", hotelChain: "Hyatt", hotelLoyaltyNumber: "HY99887766", roomPreference: "King bed, quiet room" },
    ];
    for (const pref of demoTravelPrefs) {
      await db.insert(travelPreferences).values(pref).onConflictDoNothing();
    }

    console.log("Seeding travel bookings...");
    const demoBookings = [
      { id: "book-1", consultantId: "consultant-1", projectId: "project-1", bookingType: "flight" as const, confirmationNumber: "UA123ABC", departureDate: "2024-12-01", returnDate: "2024-12-15", origin: "SFO", destination: "ORD", totalCost: "485.00", status: "confirmed" as const, notes: "Direct flight" },
      { id: "book-2", consultantId: "consultant-1", projectId: "project-1", bookingType: "hotel" as const, confirmationNumber: "MAR456DEF", departureDate: "2024-12-01", returnDate: "2024-12-15", origin: "Chicago Marriott Downtown", totalCost: "2450.00", status: "confirmed" as const, notes: "14 nights" },
      { id: "book-3", consultantId: "consultant-2", projectId: "project-2", bookingType: "flight" as const, confirmationNumber: "AA789GHI", departureDate: "2024-12-02", returnDate: "2024-12-09", origin: "DFW", destination: "IAH", totalCost: "325.00", status: "confirmed" as const },
      { id: "book-4", consultantId: "consultant-2", projectId: "project-2", bookingType: "rental_car" as const, confirmationNumber: "HZ321JKL", departureDate: "2024-12-02", returnDate: "2024-12-09", origin: "Houston IAH", totalCost: "385.00", status: "confirmed" as const, notes: "Intermediate SUV" },
    ];
    for (const book of demoBookings) {
      await db.insert(travelBookings).values(book).onConflictDoNothing();
    }

    console.log("Seeding transportation contacts...");
    const demoTransportContacts = [
      { id: "trans-1", hospitalId: "hospital-1", name: "Chicago Corporate Transportation", phone: "(312) 555-8888", email: "dispatch@chicagocorp.com", contactType: "shuttle" as const, notes: "Primary shuttle service" },
      { id: "trans-2", hospitalId: "hospital-2", name: "Houston Medical Rides", phone: "(713) 555-9999", email: "booking@houstonmed.com", contactType: "shuttle" as const, notes: "Hospital shuttle service" },
      { id: "trans-3", hospitalId: "hospital-3", name: "Seattle Exec Cars", phone: "(206) 555-7777", email: "reserve@seattleexec.com", contactType: "car_service" as const, notes: "Black car service" },
    ];
    for (const contact of demoTransportContacts) {
      await db.insert(transportationContacts).values(contact).onConflictDoNothing();
    }

    console.log("Seeding shuttle schedules...");
    const demoShuttles = [
      { id: "shuttle-1", projectId: "project-1", shuttleName: "Airport Shuttle A", route: "O'Hare to Mercy Regional", departureLocation: "O'Hare Airport Terminal 3", arrivalLocation: "Mercy Regional Medical Center", departureTime: "07:00", arrivalTime: "08:15", daysOfWeek: ["monday", "tuesday", "wednesday", "thursday", "friday"], capacity: 12, isActive: true },
      { id: "shuttle-2", projectId: "project-1", shuttleName: "Airport Shuttle B", route: "Mercy Regional to O'Hare", departureLocation: "Mercy Regional Medical Center", arrivalLocation: "O'Hare Airport Terminal 3", departureTime: "17:30", arrivalTime: "18:45", daysOfWeek: ["monday", "tuesday", "wednesday", "thursday", "friday"], capacity: 12, isActive: true },
      { id: "shuttle-3", projectId: "project-2", shuttleName: "Houston Shuttle", route: "IAH to St. Luke's", departureLocation: "Houston IAH Airport", arrivalLocation: "St. Luke's Healthcare System", departureTime: "06:30", arrivalTime: "07:30", daysOfWeek: ["monday", "tuesday", "wednesday", "thursday", "friday"], capacity: 8, isActive: true },
    ];
    for (const shuttle of demoShuttles) {
      await db.insert(shuttleSchedules).values(shuttle).onConflictDoNothing();
    }

    console.log("Seeding consultant scorecards...");
    const demoScorecards = [
      { id: "score-1", consultantId: "consultant-1", projectId: "project-1", periodStart: "2024-10-01", periodEnd: "2024-12-31", overallScore: "95.00", qualityScore: "95.00", punctualityScore: "98.00", communicationScore: "92.00", technicalScore: "95.00", teamworkScore: "94.00", ticketsResolved: 45, avgResponseTime: 25, trainingsCompleted: 3, attendanceRate: "98.00", status: "active" as const, notes: "Exceptional performance during go-live. Strong technical skills and excellent communication with clinical staff.", reviewedById: "user-cs1", reviewedAt: new Date("2024-11-15") },
      { id: "score-2", consultantId: "consultant-2", projectId: "project-2", periodStart: "2024-10-01", periodEnd: "2024-12-31", overallScore: "91.00", qualityScore: "88.00", punctualityScore: "95.00", communicationScore: "90.00", technicalScore: "88.00", teamworkScore: "92.00", ticketsResolved: 32, avgResponseTime: 30, trainingsCompleted: 2, attendanceRate: "96.00", status: "active" as const, notes: "Strong Cerner expertise. Good at identifying optimization opportunities.", reviewedById: "user-cs4", reviewedAt: new Date("2024-11-20") },
      { id: "score-3", consultantId: "consultant-3", projectId: "project-3", periodStart: "2024-10-01", periodEnd: "2024-12-31", overallScore: "97.00", qualityScore: "98.00", punctualityScore: "97.00", communicationScore: "96.00", technicalScore: "98.00", teamworkScore: "96.00", ticketsResolved: 28, avgResponseTime: 20, trainingsCompleted: 4, attendanceRate: "99.00", status: "active" as const, notes: "Outstanding MyChart implementation lead. Excellent stakeholder management.", reviewedById: "user-cs7", reviewedAt: new Date("2024-11-22") },
    ];
    for (const score of demoScorecards) {
      await db.insert(consultantScorecards).values(score).onConflictDoNothing();
    }

    console.log("Seeding consultant ratings...");
    const demoRatings = [
      { id: "rating-1", consultantId: "consultant-1", projectId: "project-1", ratedBy: "user-cs3", overallRating: 5, comments: "Excellent Epic knowledge", createdAt: new Date("2024-11-10") },
      { id: "rating-2", consultantId: "consultant-1", projectId: "project-1", ratedBy: "user-cs1", overallRating: 5, comments: "Great at explaining complex topics", createdAt: new Date("2024-11-12") },
      { id: "rating-3", consultantId: "consultant-2", projectId: "project-2", ratedBy: "user-cs4", overallRating: 4, comments: "Strong Cerner skills", createdAt: new Date("2024-11-15") },
    ];
    for (const rating of demoRatings) {
      await db.insert(consultantRatings).values(rating).onConflictDoNothing();
    }

    console.log("Seeding pulse surveys...");
    const demoPulseSurveys = [
      { id: "pulse-1", projectId: "project-1", title: "Go-Live Week 1 Feedback", description: "Quick check-in on first week of go-live", surveyType: "pulse" as const, questions: JSON.stringify([{ id: "q1", question: "How was your first week?", type: "rating" }]), isActive: true, startDate: "2024-11-25", frequency: "weekly", createdById: "demo-admin" },
      { id: "pulse-2", projectId: "project-2", title: "Optimization Satisfaction", description: "How satisfied are you with the optimization progress?", surveyType: "feedback" as const, questions: JSON.stringify([{ id: "q1", question: "Rate your satisfaction", type: "rating" }]), isActive: true, startDate: "2024-11-20", frequency: "weekly", createdById: "demo-admin" },
    ];
    for (const survey of demoPulseSurveys) {
      await db.insert(pulseSurveys).values(survey).onConflictDoNothing();
    }

    console.log("Seeding pulse responses...");
    const demoPulseResponses = [
      { id: "pr-1", surveyId: "pulse-1", consultantId: "consultant-1", responses: JSON.stringify({ q1: 4 }), mood: 4, sentiment: "positive", submittedAt: new Date("2024-11-26") },
      { id: "pr-2", surveyId: "pulse-1", consultantId: "consultant-3", responses: JSON.stringify({ q1: 5 }), mood: 5, sentiment: "positive", submittedAt: new Date("2024-11-26") },
      { id: "pr-3", surveyId: "pulse-2", consultantId: "consultant-2", responses: JSON.stringify({ q1: 4 }), mood: 4, sentiment: "positive", submittedAt: new Date("2024-11-22") },
    ];
    for (const response of demoPulseResponses) {
      await db.insert(pulseResponses).values(response).onConflictDoNothing();
    }

    console.log("Seeding NPS responses...");
    const demoNpsResponses = [
      { id: "nps-1", consultantId: "consultant-1", hospitalId: "hospital-1", projectId: "project-1", score: 9, feedback: "Would highly recommend NICEHR consultants", category: "consultant", respondentType: "hospital_staff", respondentId: "user-cs1", submittedAt: new Date("2024-11-20") },
      { id: "nps-2", consultantId: "consultant-2", hospitalId: "hospital-2", projectId: "project-2", score: 8, feedback: "Great technical expertise", category: "consultant", respondentType: "hospital_staff", respondentId: "user-cs4", submittedAt: new Date("2024-11-18") },
      { id: "nps-3", consultantId: "consultant-3", hospitalId: "hospital-3", projectId: "project-3", score: 10, feedback: "Exceptional service", category: "consultant", respondentType: "hospital_staff", respondentId: "user-cs7", submittedAt: new Date("2024-11-22") },
    ];
    for (const nps of demoNpsResponses) {
      await db.insert(npsResponses).values(nps).onConflictDoNothing();
    }

    console.log("Seeding compliance checks...");
    const demoComplianceChecks = [
      { id: "comp-1", consultantId: "consultant-1", checkType: "hipaa" as const, status: "passed" as const, checkDate: "2024-11-15", expirationDate: "2025-11-15", verificationSource: "Training Platform", notes: "Annual HIPAA training completed", checkedById: "demo-admin" },
      { id: "comp-2", consultantId: "consultant-1", checkType: "background" as const, status: "passed" as const, checkDate: "2024-06-01", expirationDate: "2025-06-01", verificationSource: "Sterling", notes: "Background check cleared", checkedById: "demo-admin" },
      { id: "comp-3", consultantId: "consultant-2", checkType: "hipaa" as const, status: "passed" as const, checkDate: "2024-10-20", expirationDate: "2025-10-20", verificationSource: "Training Platform", notes: "Annual HIPAA training completed", checkedById: "demo-admin" },
      { id: "comp-4", consultantId: "consultant-3", checkType: "credential" as const, status: "pending" as const, checkDate: "2024-12-15", expirationDate: "2024-12-15", notes: "Credential verification in progress", checkedById: "demo-admin" },
    ];
    for (const check of demoComplianceChecks) {
      await db.insert(complianceChecks).values(check).onConflictDoNothing();
    }

    console.log("Seeding contract templates...");
    const demoContractTemplates = [
      { id: "template-1", name: "Standard Consulting Agreement", description: "Standard consultant engagement contract", templateType: "ica", content: "CONSULTING AGREEMENT\n\nThis Agreement is entered into...", isActive: true, createdById: "demo-admin" },
      { id: "template-2", name: "Non-Disclosure Agreement", description: "Standard NDA for consultant engagements", templateType: "nda", content: "NON-DISCLOSURE AGREEMENT\n\nThis NDA is entered into...", isActive: true, createdById: "demo-admin" },
      { id: "template-3", name: "Hospital Services Agreement", description: "Contract template for hospital clients", templateType: "general", content: "SERVICES AGREEMENT\n\nThis Agreement for professional services...", isActive: true, createdById: "demo-admin" },
    ];
    for (const template of demoContractTemplates) {
      await db.insert(contractTemplates).values(template).onConflictDoNothing();
    }

    console.log("Seeding contracts...");
    const demoContracts = [
      { id: "contract-1", contractNumber: "CON-2024-001", templateId: "template-1", title: "Sarah Chen - Consultant Agreement 2024", content: "CONSULTING AGREEMENT\n\nThis Agreement is entered into between NICEHR Group and Sarah Chen...", consultantId: "consultant-1", status: "completed" as const, effectiveDate: "2024-01-01", expirationDate: "2024-12-31", createdById: "demo-admin", completedAt: new Date("2024-01-01") },
      { id: "contract-2", contractNumber: "CON-2024-002", templateId: "template-3", title: "Mercy Regional - Services Agreement", content: "SERVICES AGREEMENT\n\nThis Agreement for professional services between NICEHR Group and Mercy Regional Medical Center...", hospitalId: "hospital-1", status: "completed" as const, effectiveDate: "2024-10-01", expirationDate: "2025-09-30", createdById: "demo-admin", completedAt: new Date("2024-10-01") },
      { id: "contract-3", contractNumber: "CON-2024-003", templateId: "template-2", title: "St. Luke's NDA", content: "NON-DISCLOSURE AGREEMENT\n\nThis NDA is entered into between NICEHR Group and St. Luke's Healthcare System...", hospitalId: "hospital-2", status: "completed" as const, effectiveDate: "2024-09-15", createdById: "demo-admin", completedAt: new Date("2024-09-15") },
    ];
    for (const contract of demoContracts) {
      await db.insert(contracts).values(contract).onConflictDoNothing();
    }

    console.log("Seeding achievement badges...");
    const demoBadges = [
      { id: "badge-1", name: "First Go-Live", description: "Successfully completed your first go-live support", iconUrl: "rocket", pointValue: 100, category: "milestone" as const, isActive: true },
      { id: "badge-2", name: "Problem Solver", description: "Resolved 50 support tickets", iconUrl: "lightbulb", pointValue: 250, category: "performance" as const, isActive: true },
      { id: "badge-3", name: "Epic Expert", description: "Completed all Epic training modules", iconUrl: "star", pointValue: 500, category: "training" as const, isActive: true },
      { id: "badge-4", name: "Team Player", description: "Participated in 10 shift handoffs", iconUrl: "users", pointValue: 150, category: "engagement" as const, isActive: true },
      { id: "badge-5", name: "Perfect Attendance", description: "No missed shifts for 3 months", iconUrl: "calendar-check", pointValue: 300, category: "milestone" as const, isActive: true },
      { id: "badge-6", name: "Top Performer", description: "Scored 95+ on performance review", iconUrl: "trophy", pointValue: 750, category: "performance" as const, isActive: true },
    ];
    for (const badge of demoBadges) {
      await db.insert(achievementBadges).values(badge).onConflictDoNothing();
    }

    console.log("Seeding consultant badges...");
    const demoConsultantBadges = [
      { id: "cb-1", consultantId: "consultant-1", badgeId: "badge-1", earnedAt: new Date("2024-03-15") },
      { id: "cb-2", consultantId: "consultant-1", badgeId: "badge-2", earnedAt: new Date("2024-08-20") },
      { id: "cb-3", consultantId: "consultant-1", badgeId: "badge-3", earnedAt: new Date("2024-06-10") },
      { id: "cb-4", consultantId: "consultant-1", badgeId: "badge-6", earnedAt: new Date("2024-11-15") },
      { id: "cb-5", consultantId: "consultant-2", badgeId: "badge-1", earnedAt: new Date("2024-05-20") },
      { id: "cb-6", consultantId: "consultant-3", badgeId: "badge-1", earnedAt: new Date("2024-02-10") },
      { id: "cb-7", consultantId: "consultant-3", badgeId: "badge-6", earnedAt: new Date("2024-11-22") },
    ];
    for (const cb of demoConsultantBadges) {
      await db.insert(consultantBadges).values(cb).onConflictDoNothing();
    }

    console.log("Seeding point transactions...");
    const demoPoints = [
      { id: "pt-1", consultantId: "consultant-1", points: 100, balance: 100, type: "earned" as const, description: "Earned badge: First Go-Live", createdAt: new Date("2024-03-15") },
      { id: "pt-2", consultantId: "consultant-1", points: 250, balance: 350, type: "earned" as const, description: "Earned badge: Problem Solver", createdAt: new Date("2024-08-20") },
      { id: "pt-3", consultantId: "consultant-1", points: 500, balance: 850, type: "earned" as const, description: "Earned badge: Epic Expert", createdAt: new Date("2024-06-10") },
      { id: "pt-4", consultantId: "consultant-2", points: 100, balance: 100, type: "earned" as const, description: "Earned badge: First Go-Live", createdAt: new Date("2024-05-20") },
      { id: "pt-5", consultantId: "consultant-3", points: 100, balance: 100, type: "earned" as const, description: "Earned badge: First Go-Live", createdAt: new Date("2024-02-10") },
    ];
    for (const pt of demoPoints) {
      await db.insert(pointTransactions).values(pt).onConflictDoNothing();
    }

    console.log("Seeding referrals...");
    const demoReferrals = [
      { id: "ref-1", referrerId: "consultant-1", referredEmail: "new.consultant@email.com", referredName: "Alex Johnson", status: "pending" as const, createdAt: new Date("2024-11-20") },
      { id: "ref-2", referrerId: "consultant-3", referredEmail: "jane.smith@email.com", referredName: "Jane Smith", status: "hired" as const, bonusPaid: true, createdAt: new Date("2024-09-15") },
    ];
    for (const ref of demoReferrals) {
      await db.insert(referrals).values(ref).onConflictDoNothing();
    }

    console.log("Seeding report templates...");
    const demoReportTemplates = [
      { id: "rpt-1", name: "Weekly Status Report", description: "Standard weekly project status report", category: "projects", dataSource: "projects", availableColumns: JSON.stringify([{ name: "projectName", label: "Project Name", type: "text" }, { name: "ticketsResolved", label: "Tickets Resolved", type: "number" }, { name: "ticketsOpen", label: "Tickets Open", type: "number" }, { name: "hoursWorked", label: "Hours Worked", type: "number" }]), defaultColumns: ["projectName", "ticketsResolved", "ticketsOpen", "hoursWorked"], supportedFormats: ["csv", "pdf", "excel"], createdById: "demo-admin", isActive: true },
      { id: "rpt-2", name: "Monthly Financial Summary", description: "Monthly invoice and expense summary", category: "financial", dataSource: "invoices", availableColumns: JSON.stringify([{ name: "totalInvoiced", label: "Total Invoiced", type: "currency" }, { name: "totalExpenses", label: "Total Expenses", type: "currency" }, { name: "netRevenue", label: "Net Revenue", type: "currency" }]), defaultColumns: ["totalInvoiced", "totalExpenses", "netRevenue"], supportedFormats: ["csv", "pdf", "excel"], createdById: "demo-admin", isActive: true },
      { id: "rpt-3", name: "Consultant Utilization Report", description: "Consultant hours and project assignments", category: "consultants", dataSource: "consultants", availableColumns: JSON.stringify([{ name: "consultantName", label: "Consultant Name", type: "text" }, { name: "assignedProjects", label: "Assigned Projects", type: "number" }, { name: "billableHours", label: "Billable Hours", type: "number" }, { name: "utilizationRate", label: "Utilization Rate", type: "percent" }]), defaultColumns: ["consultantName", "assignedProjects", "billableHours", "utilizationRate"], supportedFormats: ["csv", "pdf", "excel"], createdById: "demo-admin", isActive: true },
    ];
    for (const rpt of demoReportTemplates) {
      await db.insert(reportTemplates).values(rpt).onConflictDoNothing();
    }

    console.log("Seeding saved reports...");
    const demoSavedReports = [
      { id: "saved-1", templateId: "rpt-1", name: "Project 1 - Week 47 Status", description: "Weekly status for Project Alpha", userId: "demo-admin", selectedColumns: ["projectName", "ticketsResolved", "ticketsOpen", "hoursWorked"], filters: JSON.stringify({ projectId: "project-1", weekNumber: 47 }), sortBy: "projectName", sortOrder: "asc", isPublic: false, isFavorite: true },
      { id: "saved-2", templateId: "rpt-2", name: "October 2024 Financials", description: "Financial summary for October 2024", userId: "demo-admin", selectedColumns: ["totalInvoiced", "totalExpenses", "netRevenue"], filters: JSON.stringify({ month: 10, year: 2024 }), sortBy: "totalInvoiced", sortOrder: "desc", isPublic: true, isFavorite: false },
    ];
    for (const saved of demoSavedReports) {
      await db.insert(savedReports).values(saved).onConflictDoNothing();
    }

    console.log("Seeding executive dashboards...");
    const demoDashboards = [
      { id: "dash-1", userId: "demo-admin", name: "CEO Overview", description: "Executive overview dashboard", layout: JSON.stringify({ widgets: ["activeProjects", "totalRevenue", "consultantUtilization", "clientSatisfaction"] }), refreshInterval: 300, isDefault: true, isPublic: false, theme: "light" },
      { id: "dash-2", userId: "user-cs1", name: "CMO Dashboard", description: "Chief Medical Officer dashboard", layout: JSON.stringify({ widgets: ["goLiveProgress", "incidentCount", "trainingCompletion"] }), refreshInterval: 300, isDefault: true, isPublic: false, theme: "light" },
    ];
    for (const dash of demoDashboards) {
      await db.insert(executiveDashboards).values(dash).onConflictDoNothing();
    }

    console.log("Seeding project requirements...");
    const demoRequirements = [
      { id: "req-1", projectId: "project-1", unitId: "unit-1-1", consultantsNeeded: 3, shiftType: "day" as const, notes: "ED go-live support" },
      { id: "req-2", projectId: "project-1", unitId: "unit-1-2", consultantsNeeded: 2, shiftType: "day" as const, notes: "ICU super users" },
      { id: "req-3", projectId: "project-2", unitId: "unit-2-1", consultantsNeeded: 4, shiftType: "day" as const, notes: "FirstNet optimization" },
      { id: "req-4", projectId: "project-3", unitId: "unit-3-1", consultantsNeeded: 2, shiftType: "day" as const, notes: "MyChart integration" },
    ];
    for (const req of demoRequirements) {
      await db.insert(projectRequirements).values(req).onConflictDoNothing();
    }

    console.log("Seeding project tasks...");
    const demoTasks = [
      { id: "task-1", projectId: "project-1", phaseId: "phase-1-2", title: "Complete ED workflow documentation", description: "Document all ED clinical workflows", assignedTo: "user-c1", priority: "high" as const, status: "completed" as const, dueDate: "2024-12-15", completedAt: new Date("2024-12-10"), estimatedHours: "24.00", actualHours: "20.00", orderIndex: 1, createdBy: "demo-admin" },
      { id: "task-2", projectId: "project-1", phaseId: "phase-1-2", title: "Configure order sets", description: "Build and test clinical order sets", assignedTo: "user-c3", priority: "high" as const, status: "in_progress" as const, dueDate: "2024-12-20", estimatedHours: "40.00", orderIndex: 2, createdBy: "demo-admin" },
      { id: "task-3", projectId: "project-1", phaseId: "phase-1-2", title: "Train super users", description: "Conduct super user training sessions", assignedTo: "user-c1", priority: "medium" as const, status: "pending" as const, dueDate: "2025-01-15", estimatedHours: "32.00", orderIndex: 3, createdBy: "demo-admin" },
    ];
    for (const task of demoTasks) {
      await db.insert(projectTasks).values(task).onConflictDoNothing();
    }

    console.log("Seeding project milestones...");
    const demoMilestones = [
      { id: "mile-1", projectId: "project-1", phaseId: "phase-1-1", title: "Discovery Complete", description: "Initial assessment and requirements gathering completed", dueDate: "2024-12-15", completedDate: "2024-12-10", isCompleted: true, isCritical: true, reminderDays: 7, createdBy: "demo-admin" },
      { id: "mile-2", projectId: "project-1", phaseId: "phase-1-2", title: "Build Complete", description: "System build and configuration completed", dueDate: "2025-03-15", isCompleted: false, isCritical: true, reminderDays: 14, createdBy: "demo-admin" },
      { id: "mile-3", projectId: "project-1", phaseId: "phase-1-3", title: "Go-Live", description: "System goes live for all users", dueDate: "2025-06-01", isCompleted: false, isCritical: true, reminderDays: 30, createdBy: "demo-admin" },
    ];
    for (const mile of demoMilestones) {
      await db.insert(projectMilestones).values(mile).onConflictDoNothing();
    }

    console.log("Seeding project risks...");
    const demoRisks = [
      { id: "risk-1", projectId: "project-1", phaseId: "phase-1-2", title: "Staff Training Delays", description: "Risk of training schedule slipping due to staff availability", probability: "medium" as const, impact: "high" as const, riskScore: 6, mitigation: "Schedule additional evening and weekend training sessions", contingency: "Hire additional trainers if needed", status: "identified" as const, ownerId: "user-c1", identifiedDate: "2024-11-01", createdBy: "demo-admin" },
      { id: "risk-2", projectId: "project-1", phaseId: "phase-1-2", title: "Integration Complexity", description: "Legacy system integration may require more time than estimated", probability: "high" as const, impact: "medium" as const, riskScore: 6, mitigation: "Engage additional integration specialists early", contingency: "Extend timeline if needed", status: "mitigating" as const, ownerId: "user-c3", identifiedDate: "2024-11-15", createdBy: "demo-admin" },
    ];
    for (const risk of demoRisks) {
      await db.insert(projectRisks).values(risk).onConflictDoNothing();
    }

    console.log("Seeding phase deliverables...");
    const demoDeliverables = [
      { id: "deliv-1", phaseId: "phase-1-1", title: "Current State Assessment", description: "Document current workflows and systems", isRequired: true, isSubmitted: true, submittedAt: new Date("2024-11-10"), submittedBy: "user-c1", isApproved: true, approvedAt: new Date("2024-11-12"), approvedBy: "demo-admin", notes: "Comprehensive assessment completed" },
      { id: "deliv-2", phaseId: "phase-1-1", title: "Gap Analysis Report", description: "Identify gaps between current and future state", isRequired: true, isSubmitted: true, submittedAt: new Date("2024-11-28"), submittedBy: "user-c1", isApproved: true, approvedAt: new Date("2024-11-29"), approvedBy: "demo-admin", notes: "All gaps identified and documented" },
      { id: "deliv-3", phaseId: "phase-1-2", title: "System Configuration Document", description: "Detailed configuration specifications", isRequired: true, isSubmitted: false, notes: "In progress - expected completion 2024-12-31" },
    ];
    for (const deliv of demoDeliverables) {
      await db.insert(phaseDeliverables).values(deliv).onConflictDoNothing();
    }

    console.log("Seeding project team assignments...");
    const demoTeamAssignments = [
      { id: "team-1", projectId: "project-1", userId: "user-c1", customRoleName: "Lead Consultant", startDate: "2024-10-01", isActive: true, notes: "Primary project lead" },
      { id: "team-2", projectId: "project-1", userId: "user-c3", customRoleName: "Implementation Specialist", startDate: "2024-10-15", isActive: true, notes: "Epic implementation expert" },
      { id: "team-3", projectId: "project-2", userId: "user-c2", customRoleName: "Technical Lead", startDate: "2024-09-01", isActive: true, notes: "Cerner optimization lead" },
    ];
    for (const team of demoTeamAssignments) {
      await db.insert(projectTeamAssignments).values(team).onConflictDoNothing();
    }

    console.log("Seeding chat channels...");
    const demoChatChannels = [
      { id: "channel-1", name: "Project Alpha - General", description: "General discussion for Project Alpha", channelType: "project", projectId: "project-1", isPrivate: false, createdById: "demo-admin" },
      { id: "channel-2", name: "Go-Live Command Center", description: "Real-time coordination during go-live", channelType: "project", projectId: "project-1", isPrivate: false, createdById: "demo-admin" },
      { id: "channel-3", name: "Leadership Updates", description: "Updates for hospital leadership", channelType: "announcement", isPrivate: true, createdById: "demo-admin" },
    ];
    for (const channel of demoChatChannels) {
      await db.insert(chatChannels).values(channel).onConflictDoNothing();
    }

    console.log("Seeding chat messages...");
    const demoChatMessages = [
      { id: "msg-1", channelId: "channel-1", senderId: "user-c1", content: "Welcome to the Project Alpha channel! Let's use this for coordination.", messageType: "text", createdAt: new Date("2024-11-20T09:00:00") },
      { id: "msg-2", channelId: "channel-2", senderId: "user-c1", content: "Go-live begins tomorrow at 6 AM. All consultants please confirm your assignments.", messageType: "text", createdAt: new Date("2024-11-25T14:00:00") },
      { id: "msg-3", channelId: "channel-2", senderId: "user-c3", content: "Confirmed - I'll be at ICU Floor 3", messageType: "text", createdAt: new Date("2024-11-25T14:15:00") },
    ];
    for (const msg of demoChatMessages) {
      await db.insert(chatMessages).values(msg).onConflictDoNothing();
    }

    console.log("Seeding channel members...");
    const demoChannelMembers = [
      { id: "member-1", channelId: "channel-1", userId: "user-c1", role: "admin" },
      { id: "member-2", channelId: "channel-1", userId: "user-c3", role: "member" },
      { id: "member-3", channelId: "channel-2", userId: "user-c1", role: "admin" },
      { id: "member-4", channelId: "channel-2", userId: "user-c3", role: "member" },
      { id: "member-5", channelId: "channel-2", userId: "user-c4", role: "member" },
    ];
    for (const member of demoChannelMembers) {
      await db.insert(channelMembers).values(member).onConflictDoNothing();
    }

    console.log("Seeding ROI surveys...");
    const demoRoiSurveys = [
      { id: "roi-survey-1", projectId: "project-1", respondentId: "user-cs1", isComplete: true, completedAt: new Date("2024-11-27") },
      { id: "roi-survey-2", projectId: "project-1", respondentId: "user-cs3", isComplete: false },
    ];
    for (const survey of demoRoiSurveys) {
      await db.insert(roiSurveys).values(survey).onConflictDoNothing();
    }

    console.log("Seeding ROI questions...");
    const demoRoiQuestions = [
      { id: "roi-q-1", question: "Has the new system improved workflow efficiency?", category: "efficiency", questionType: "rating", isActive: true, orderIndex: 1 },
      { id: "roi-q-2", question: "What is the estimated time savings per day?", category: "time_savings", questionType: "text", isActive: true, orderIndex: 2 },
      { id: "roi-q-3", question: "How satisfied are you with the implementation?", category: "satisfaction", questionType: "rating", isActive: true, orderIndex: 3 },
    ];
    for (const question of demoRoiQuestions) {
      await db.insert(roiQuestions).values(question).onConflictDoNothing();
    }

    console.log("Seeding ROI responses...");
    const demoRoiResponses = [
      { id: "roi-resp-1", surveyId: "roi-survey-1", questionId: "roi-q-1", rating: 4 },
      { id: "roi-resp-2", surveyId: "roi-survey-1", questionId: "roi-q-2", textResponse: "About 2 hours per clinician per day" },
      { id: "roi-resp-3", surveyId: "roi-survey-1", questionId: "roi-q-3", rating: 5 },
    ];
    for (const response of demoRoiResponses) {
      await db.insert(roiResponses).values(response).onConflictDoNothing();
    }

    console.log("Seeding onboarding tasks...");
    const demoOnboardingTasks = [
      { id: "onboard-1", consultantId: "consultant-1", taskType: "profile", title: "Complete Profile", description: "Fill out all profile information", isRequired: true, status: "approved" as const, dueDate: "2024-01-15", submittedAt: new Date("2024-01-10"), reviewedBy: "demo-admin", reviewedAt: new Date("2024-01-12"), orderIndex: 1 },
      { id: "onboard-2", consultantId: "consultant-1", taskType: "documents", title: "Upload Credentials", description: "Upload all required certifications", isRequired: true, status: "approved" as const, dueDate: "2024-01-20", submittedAt: new Date("2024-01-18"), reviewedBy: "demo-admin", reviewedAt: new Date("2024-01-19"), orderIndex: 2 },
      { id: "onboard-3", consultantId: "consultant-6", taskType: "profile", title: "Complete Profile", description: "Fill out all profile information", isRequired: true, status: "pending" as const, dueDate: "2024-12-15", orderIndex: 1 },
    ];
    for (const task of demoOnboardingTasks) {
      await db.insert(onboardingTasks).values(task).onConflictDoNothing();
    }

    console.log("Seeding notifications...");
    const demoNotifications = [
      { id: "notif-1", userId: "user-c1", title: "New Assignment", message: "You have been assigned to Project Alpha go-live support", type: "project" as const, link: "/projects/project-1", isRead: true, readAt: new Date("2024-11-20") },
      { id: "notif-2", userId: "user-c1", title: "Timesheet Reminder", message: "Please submit your timesheet for the week ending 11/24", type: "schedule" as const, link: "/timesheets", isRead: false },
      { id: "notif-3", userId: "user-c3", title: "Badge Earned", message: "Congratulations! You earned the Top Performer badge", type: "success" as const, link: "/badges", isRead: false },
    ];
    for (const notif of demoNotifications) {
      await db.insert(notifications).values(notif).onConflictDoNothing();
    }

    console.log("Expanded demo data seeding completed successfully!");
    return { success: true };
  } catch (error) {
    console.error("Error seeding expanded demo data:", error);
    throw error;
  }
}

seedExpandedDemoData()
  .then(() => {
    console.log("Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Failed to seed demo data:", error);
    process.exit(1);
  });
