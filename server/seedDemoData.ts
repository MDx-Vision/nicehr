import { db } from "./db";
import { 
  hospitals, 
  hospitalUnits, 
  hospitalModules, 
  hospitalStaff,
  users,
  consultants,
  consultantAvailability,
  consultantCertifications,
  consultantSkills,
  consultantEhrExperience,
  projects,
  projectRequirements,
  projectSchedules,
  scheduleAssignments,
  projectPhases,
  projectTasks,
  projectMilestones,
  projectRisks,
  phaseSteps,
  phaseDeliverables,
  documentTypes,
  consultantDocuments,
  courses,
  courseModules,
  courseEnrollments,
  budgetCalculations,
  supportTickets,
  timesheets,
  timesheetEntries,
  expenses,
  notifications,
  integrationConnections,
  syncJobs,
  syncEvents,
  ehrSystems,
  ehrStatusMetrics,
  ehrIncidents,
  payrollSyncProfiles,
  payrollExportJobs,
  escalationRules,
  escalationTriggers,
  escalationEvents,
  automationWorkflows,
  workflowExecutions,
  goLiveReadinessSnapshots,
  consultantUtilizationSnapshots,
  timelineForecastSnapshots,
  costVarianceSnapshots,
  raciAssignments,
} from "@shared/schema";
import { eq, sql } from "drizzle-orm";

const demoHospitals = [
  {
    id: "hospital-1",
    name: "Mercy Regional Medical Center",
    address: "1200 Hospital Drive",
    city: "Chicago",
    state: "IL",
    zipCode: "60601",
    phone: "(312) 555-0100",
    email: "admin@mercyregional.org",
    website: "https://mercyregional.org",
    emrSystem: "Epic",
    totalStaff: 2500,
    isActive: true,
  },
  {
    id: "hospital-2",
    name: "St. Luke's Healthcare System",
    address: "4500 Medical Center Blvd",
    city: "Houston",
    state: "TX",
    zipCode: "77030",
    phone: "(713) 555-0200",
    email: "info@stlukes.org",
    website: "https://stlukeshealthcare.org",
    emrSystem: "Cerner",
    totalStaff: 3200,
    isActive: true,
  },
  {
    id: "hospital-3",
    name: "Pacific Northwest Health Network",
    address: "8900 Healthcare Way",
    city: "Seattle",
    state: "WA",
    zipCode: "98101",
    phone: "(206) 555-0300",
    email: "contact@pnwhealth.org",
    website: "https://pnwhealth.org",
    emrSystem: "Epic",
    totalStaff: 1800,
    isActive: true,
  },
];

const hospitalUnitsByHospital: Record<string, { id: string; name: string; description: string; staffCount: number }[]> = {
  "hospital-1": [
    { id: "unit-1-1", name: "Emergency Department", description: "24/7 emergency care services", staffCount: 150 },
    { id: "unit-1-2", name: "Intensive Care Unit", description: "Critical care for severely ill patients", staffCount: 80 },
    { id: "unit-1-3", name: "Surgery", description: "Surgical services and operating rooms", staffCount: 120 },
    { id: "unit-1-4", name: "Oncology", description: "Cancer treatment and care", staffCount: 60 },
    { id: "unit-1-5", name: "Cardiology", description: "Heart and cardiovascular services", staffCount: 75 },
  ],
  "hospital-2": [
    { id: "unit-2-1", name: "Emergency Department", description: "Level 1 trauma center", staffCount: 200 },
    { id: "unit-2-2", name: "Pediatrics", description: "Children's care services", staffCount: 90 },
    { id: "unit-2-3", name: "Neurology", description: "Brain and nervous system care", staffCount: 55 },
    { id: "unit-2-4", name: "Orthopedics", description: "Bone and joint specialists", staffCount: 70 },
    { id: "unit-2-5", name: "Labor & Delivery", description: "Maternity and birthing services", staffCount: 85 },
  ],
  "hospital-3": [
    { id: "unit-3-1", name: "Emergency Department", description: "Comprehensive emergency services", staffCount: 100 },
    { id: "unit-3-2", name: "Psychiatry", description: "Mental health services", staffCount: 45 },
    { id: "unit-3-3", name: "Radiology", description: "Imaging and diagnostics", staffCount: 40 },
    { id: "unit-3-4", name: "Pharmacy", description: "Clinical pharmacy services", staffCount: 30 },
    { id: "unit-3-5", name: "Rehabilitation", description: "Physical therapy and rehab", staffCount: 50 },
  ],
};

const modulesByUnit: Record<string, { id: string; name: string; description: string; consultantsRequired: number }[]> = {
  "unit-1-1": [
    { id: "mod-1-1-1", name: "ADT (Admission/Discharge/Transfer)", description: "Patient flow management", consultantsRequired: 2 },
    { id: "mod-1-1-2", name: "EDIS (Emergency Department IS)", description: "ED tracking and management", consultantsRequired: 3 },
    { id: "mod-1-1-3", name: "Orders Management", description: "Clinical order entry", consultantsRequired: 2 },
  ],
  "unit-1-2": [
    { id: "mod-1-2-1", name: "Clinical Documentation", description: "ICU charting and notes", consultantsRequired: 2 },
    { id: "mod-1-2-2", name: "Medication Administration", description: "MAR and medication safety", consultantsRequired: 2 },
  ],
  "unit-2-1": [
    { id: "mod-2-1-1", name: "FirstNet", description: "Cerner ED solution", consultantsRequired: 4 },
    { id: "mod-2-1-2", name: "PowerChart", description: "Clinical documentation", consultantsRequired: 3 },
  ],
  "unit-2-2": [
    { id: "mod-2-2-1", name: "Pediatric Flowsheets", description: "Pediatric-specific documentation", consultantsRequired: 2 },
  ],
  "unit-3-1": [
    { id: "mod-3-1-1", name: "MyChart Integration", description: "Patient portal configuration", consultantsRequired: 2 },
    { id: "mod-3-1-2", name: "Care Everywhere", description: "HIE connectivity", consultantsRequired: 1 },
  ],
};

const demoConsultants = [
  {
    id: "consultant-1",
    userId: "user-c1",
    firstName: "Sarah",
    lastName: "Chen",
    email: "sarah.chen@nicehr.com",
    phone: "(555) 111-0001",
    city: "San Francisco",
    state: "CA",
    yearsExperience: 12,
    emrSystems: ["Epic", "Cerner"],
    modules: ["EDIS", "ADT", "Clinical Documentation"],
    positions: ["Senior Implementation Consultant", "Project Lead"],
    bio: "Epic-certified consultant with over 12 years of experience in EMR implementations. Specialized in Emergency Department workflows and clinical documentation optimization.",
    payRate: "150.00",
    isOnboarded: true,
    isAvailable: true,
  },
  {
    id: "consultant-2",
    userId: "user-c2",
    firstName: "Michael",
    lastName: "Rodriguez",
    email: "michael.rodriguez@nicehr.com",
    phone: "(555) 111-0002",
    city: "Dallas",
    state: "TX",
    yearsExperience: 8,
    emrSystems: ["Cerner", "Meditech"],
    modules: ["PowerChart", "FirstNet", "Orders Management"],
    positions: ["Implementation Consultant"],
    bio: "Cerner specialist with strong background in acute care settings. Expert in FirstNet ED solutions and clinical order optimization.",
    payRate: "135.00",
    isOnboarded: true,
    isAvailable: true,
  },
  {
    id: "consultant-3",
    userId: "user-c3",
    firstName: "Jennifer",
    lastName: "Williams",
    email: "jennifer.williams@nicehr.com",
    phone: "(555) 111-0003",
    city: "Boston",
    state: "MA",
    yearsExperience: 15,
    emrSystems: ["Epic"],
    modules: ["MyChart", "Care Everywhere", "Healthy Planet"],
    positions: ["Principal Consultant", "Epic Certified"],
    bio: "Principal-level Epic consultant specializing in population health and patient engagement solutions. Led over 20 successful go-lives.",
    payRate: "175.00",
    isOnboarded: true,
    isAvailable: true,
  },
  {
    id: "consultant-4",
    userId: "user-c4",
    firstName: "David",
    lastName: "Thompson",
    email: "david.thompson@nicehr.com",
    phone: "(555) 111-0004",
    city: "Atlanta",
    state: "GA",
    yearsExperience: 6,
    emrSystems: ["Epic", "Cerner"],
    modules: ["Medication Administration", "Clinical Documentation"],
    positions: ["Clinical Informaticist"],
    bio: "RN-turned-informaticist with hands-on clinical experience. Specializes in medication safety and nursing workflow optimization.",
    payRate: "125.00",
    isOnboarded: true,
    isAvailable: false,
  },
  {
    id: "consultant-5",
    userId: "user-c5",
    firstName: "Emily",
    lastName: "Johnson",
    email: "emily.johnson@nicehr.com",
    phone: "(555) 111-0005",
    city: "Denver",
    state: "CO",
    yearsExperience: 10,
    emrSystems: ["Epic"],
    modules: ["Radiology", "Cardiology", "Imaging"],
    positions: ["Radiant Specialist"],
    bio: "Epic Radiant and Cardiant certified consultant. Expert in imaging workflow optimization and PACS integration.",
    payRate: "145.00",
    isOnboarded: true,
    isAvailable: true,
  },
  {
    id: "consultant-6",
    userId: "user-c6",
    firstName: "James",
    lastName: "Martinez",
    email: "james.martinez@nicehr.com",
    phone: "(555) 111-0006",
    city: "Phoenix",
    state: "AZ",
    yearsExperience: 9,
    emrSystems: ["Cerner", "Epic"],
    modules: ["Surgery", "Anesthesia", "OR Management"],
    positions: ["Surgical IS Consultant"],
    bio: "Perioperative specialist with extensive OR workflow experience. Expert in surgical scheduling and anesthesia documentation.",
    payRate: "140.00",
    isOnboarded: true,
    isAvailable: true,
  },
  {
    id: "consultant-7",
    userId: "user-c7",
    firstName: "Amanda",
    lastName: "Brown",
    email: "amanda.brown@nicehr.com",
    phone: "(555) 111-0007",
    city: "Minneapolis",
    state: "MN",
    yearsExperience: 7,
    emrSystems: ["Epic"],
    modules: ["Pediatrics", "NICU", "Mother-Baby"],
    positions: ["Pediatric Specialist"],
    bio: "Specialized in pediatric and neonatal care workflows. Expert in mother-baby documentation and pediatric-specific build.",
    payRate: "130.00",
    isOnboarded: true,
    isAvailable: true,
  },
  {
    id: "consultant-8",
    userId: "user-c8",
    firstName: "Robert",
    lastName: "Garcia",
    email: "robert.garcia@nicehr.com",
    phone: "(555) 111-0008",
    city: "Miami",
    state: "FL",
    yearsExperience: 11,
    emrSystems: ["Epic", "Allscripts"],
    modules: ["Oncology", "Pharmacy", "Infusion"],
    positions: ["Oncology IS Lead"],
    bio: "Oncology informatics expert with deep experience in chemotherapy protocols and cancer registry integration.",
    payRate: "155.00",
    isOnboarded: true,
    isAvailable: true,
  },
  {
    id: "consultant-9",
    userId: "user-c9",
    firstName: "Lisa",
    lastName: "Anderson",
    email: "lisa.anderson@nicehr.com",
    phone: "(555) 111-0009",
    city: "Portland",
    state: "OR",
    yearsExperience: 5,
    emrSystems: ["Epic"],
    modules: ["Revenue Cycle", "Billing", "Claims"],
    positions: ["Revenue Cycle Analyst"],
    bio: "Revenue cycle specialist focused on Epic Resolute and billing optimization. Strong background in claims management.",
    payRate: "120.00",
    isOnboarded: true,
    isAvailable: true,
  },
  {
    id: "consultant-10",
    userId: "user-c10",
    firstName: "Christopher",
    lastName: "Lee",
    email: "christopher.lee@nicehr.com",
    phone: "(555) 111-0010",
    city: "Philadelphia",
    state: "PA",
    yearsExperience: 14,
    emrSystems: ["Cerner", "Epic", "Meditech"],
    modules: ["Integration", "Interfaces", "HL7"],
    positions: ["Integration Architect"],
    bio: "Senior integration architect with expertise in HL7, FHIR, and healthcare interoperability standards.",
    payRate: "165.00",
    isOnboarded: true,
    isAvailable: false,
  },
  {
    id: "consultant-11",
    userId: "user-c11",
    firstName: "Michelle",
    lastName: "Taylor",
    email: "michelle.taylor@nicehr.com",
    phone: "(555) 111-0011",
    city: "Nashville",
    state: "TN",
    yearsExperience: 8,
    emrSystems: ["Epic"],
    modules: ["Training", "Adoption", "Change Management"],
    positions: ["Training Lead"],
    bio: "End-user training specialist with expertise in change management and adoption strategies for EMR implementations.",
    payRate: "115.00",
    isOnboarded: true,
    isAvailable: true,
  },
  {
    id: "consultant-12",
    userId: "user-c12",
    firstName: "Daniel",
    lastName: "Wilson",
    email: "daniel.wilson@nicehr.com",
    phone: "(555) 111-0012",
    city: "Charlotte",
    state: "NC",
    yearsExperience: 6,
    emrSystems: ["Cerner"],
    modules: ["Laboratory", "Pathology", "Blood Bank"],
    positions: ["Laboratory Informaticist"],
    bio: "Lab systems specialist with experience in Cerner PathNet and laboratory workflow optimization.",
    payRate: "125.00",
    isOnboarded: true,
    isAvailable: true,
  },
];

const cSuiteStaff = [
  {
    id: "cstaff-1",
    userId: "user-cs1",
    firstName: "Dr. Margaret",
    lastName: "Harrison",
    email: "m.harrison@mercyregional.org",
    hospitalId: "hospital-1",
    position: "Chief Medical Officer",
    department: "Executive Leadership",
  },
  {
    id: "cstaff-2",
    userId: "user-cs2",
    firstName: "Thomas",
    lastName: "Bradley",
    email: "t.bradley@mercyregional.org",
    hospitalId: "hospital-1",
    position: "Chief Information Officer",
    department: "Information Technology",
  },
  {
    id: "cstaff-3",
    userId: "user-cs3",
    firstName: "Patricia",
    lastName: "Nguyen",
    email: "p.nguyen@mercyregional.org",
    hospitalId: "hospital-1",
    position: "Chief Nursing Officer",
    department: "Nursing Administration",
  },
  {
    id: "cstaff-4",
    userId: "user-cs4",
    firstName: "Dr. Richard",
    lastName: "Foster",
    email: "r.foster@stlukes.org",
    hospitalId: "hospital-2",
    position: "Chief Executive Officer",
    department: "Executive Leadership",
  },
  {
    id: "cstaff-5",
    userId: "user-cs5",
    firstName: "Katherine",
    lastName: "Moore",
    email: "k.moore@stlukes.org",
    hospitalId: "hospital-2",
    position: "Chief Financial Officer",
    department: "Finance",
  },
  {
    id: "cstaff-6",
    userId: "user-cs6",
    firstName: "Dr. Steven",
    lastName: "Park",
    email: "s.park@stlukes.org",
    hospitalId: "hospital-2",
    position: "Chief Medical Informatics Officer",
    department: "Clinical Informatics",
  },
  {
    id: "cstaff-7",
    userId: "user-cs7",
    firstName: "Elizabeth",
    lastName: "Campbell",
    email: "e.campbell@pnwhealth.org",
    hospitalId: "hospital-3",
    position: "Chief Operating Officer",
    department: "Operations",
  },
  {
    id: "cstaff-8",
    userId: "user-cs8",
    firstName: "Dr. William",
    lastName: "Chang",
    email: "w.chang@pnwhealth.org",
    hospitalId: "hospital-3",
    position: "Chief Medical Officer",
    department: "Medical Affairs",
  },
];

const demoProjects = [
  {
    id: "project-1",
    hospitalId: "hospital-1",
    name: "Epic EHR Implementation - Phase 2",
    description: "Complete Epic implementation for Emergency Department and ICU with focus on clinical documentation and orders management. This phase includes go-live support and optimization.",
    startDate: "2024-11-01",
    endDate: "2025-06-30",
    status: "active" as const,
    estimatedConsultants: 8,
    actualConsultants: 6,
    estimatedBudget: "2500000.00",
    actualBudget: "1850000.00",
    savings: "650000.00",
  },
  {
    id: "project-2",
    hospitalId: "hospital-2",
    name: "Cerner Millennium Optimization",
    description: "System-wide optimization of Cerner Millennium including FirstNet upgrade and PowerChart enhancements for improved clinical workflows.",
    startDate: "2024-10-15",
    endDate: "2025-04-15",
    status: "active" as const,
    estimatedConsultants: 6,
    actualConsultants: 5,
    estimatedBudget: "1800000.00",
    actualBudget: "1450000.00",
    savings: "350000.00",
  },
  {
    id: "project-3",
    hospitalId: "hospital-3",
    name: "Epic MyChart Patient Portal Launch",
    description: "Implementation and launch of MyChart patient portal with Care Everywhere integration for improved patient engagement and health information exchange.",
    startDate: "2024-12-01",
    endDate: "2025-03-31",
    status: "active" as const,
    estimatedConsultants: 4,
    actualConsultants: 4,
    estimatedBudget: "950000.00",
    actualBudget: "875000.00",
    savings: "75000.00",
  },
  {
    id: "project-4",
    hospitalId: "hospital-1",
    name: "Oncology EMR Expansion",
    description: "Expansion of Epic Beacon for comprehensive oncology care including chemotherapy protocols, cancer registry, and infusion management.",
    startDate: "2025-01-15",
    endDate: "2025-08-30",
    status: "draft" as const,
    estimatedConsultants: 5,
    actualConsultants: 0,
    estimatedBudget: "1200000.00",
    actualBudget: "0.00",
    savings: "0.00",
  },
];

const projectPhaseData = [
  {
    id: "phase-1-1",
    projectId: "project-1",
    phaseName: "Discovery & Planning",
    phaseNumber: 1,
    description: "Initial assessment, workflow analysis, and project planning",
    plannedStartDate: "2024-11-01",
    plannedEndDate: "2024-12-15",
    actualStartDate: "2024-11-01",
    actualEndDate: "2024-12-15",
    status: "completed" as const,
    completionPercentage: 100,
  },
  {
    id: "phase-1-2",
    projectId: "project-1",
    phaseName: "Build & Configuration",
    phaseNumber: 2,
    description: "System build, configuration, and integration setup",
    plannedStartDate: "2024-12-16",
    plannedEndDate: "2025-03-15",
    actualStartDate: "2024-12-16",
    status: "in_progress" as const,
    completionPercentage: 65,
  },
  {
    id: "phase-1-3",
    projectId: "project-1",
    phaseName: "Testing & Validation",
    phaseNumber: 3,
    description: "Comprehensive testing including unit, integration, and user acceptance testing",
    plannedStartDate: "2025-03-16",
    plannedEndDate: "2025-05-15",
    status: "not_started" as const,
    completionPercentage: 0,
  },
  {
    id: "phase-1-4",
    projectId: "project-1",
    phaseName: "Go-Live & Support",
    phaseNumber: 4,
    description: "Go-live execution and post-go-live support",
    plannedStartDate: "2025-05-16",
    plannedEndDate: "2025-06-30",
    status: "not_started" as const,
    completionPercentage: 0,
  },
  {
    id: "phase-2-1",
    projectId: "project-2",
    phaseName: "Assessment Phase",
    phaseNumber: 1,
    description: "Current state analysis and optimization opportunities",
    plannedStartDate: "2024-10-15",
    plannedEndDate: "2024-11-30",
    actualStartDate: "2024-10-15",
    actualEndDate: "2024-11-30",
    status: "completed" as const,
    completionPercentage: 100,
  },
  {
    id: "phase-2-2",
    projectId: "project-2",
    phaseName: "Optimization Build",
    phaseNumber: 2,
    description: "Implementing optimization changes and enhancements",
    plannedStartDate: "2024-12-01",
    plannedEndDate: "2025-02-28",
    actualStartDate: "2024-12-01",
    status: "in_progress" as const,
    completionPercentage: 45,
  },
];

// Phase Steps demo data - detailed implementation steps within each phase
const demoPhaseSteps = [
  // Phase 1-1 Steps (Discovery & Planning - Completed)
  {
    id: "step-1-1-1",
    phaseId: "phase-1-1",
    stepNumber: 1,
    title: "Kickoff & Project Charter",
    description: "Establish project governance, define scope, and obtain executive sponsorship",
    keyActivities: ["Conduct kickoff meeting", "Define project charter", "Identify stakeholders", "Establish governance structure"],
    expectedDeliverables: ["Project Charter Document", "Stakeholder Register", "Governance Matrix"],
    timelineWeeks: "2 weeks",
    status: "completed" as const,
    completionPercentage: 100,
  },
  {
    id: "step-1-1-2",
    phaseId: "phase-1-1",
    stepNumber: 2,
    title: "Current State Assessment",
    description: "Analyze existing workflows, systems, and identify gaps",
    keyActivities: ["Document current workflows", "Inventory existing systems", "Identify pain points", "Interview key users"],
    expectedDeliverables: ["Current State Assessment Report", "Gap Analysis Document", "Process Maps"],
    timelineWeeks: "3 weeks",
    status: "completed" as const,
    completionPercentage: 100,
  },
  {
    id: "step-1-1-3",
    phaseId: "phase-1-1",
    stepNumber: 3,
    title: "Requirements Gathering",
    description: "Collect and document functional and technical requirements",
    keyActivities: ["Conduct requirements workshops", "Document use cases", "Define data requirements", "Prioritize features"],
    expectedDeliverables: ["Requirements Document", "Use Case Specifications", "Data Dictionary"],
    timelineWeeks: "2 weeks",
    status: "completed" as const,
    completionPercentage: 100,
  },
  // Phase 1-2 Steps (Build & Configuration - In Progress)
  {
    id: "step-1-2-1",
    phaseId: "phase-1-2",
    stepNumber: 1,
    title: "Environment Setup",
    description: "Configure development, test, and production environments",
    keyActivities: ["Provision infrastructure", "Configure environments", "Set up CI/CD pipeline", "Establish security controls"],
    expectedDeliverables: ["Environment Documentation", "Infrastructure Diagram", "Security Baseline"],
    timelineWeeks: "2 weeks",
    status: "completed" as const,
    completionPercentage: 100,
  },
  {
    id: "step-1-2-2",
    phaseId: "phase-1-2",
    stepNumber: 2,
    title: "Core System Configuration",
    description: "Configure core EHR modules and clinical workflows",
    keyActivities: ["Configure clinical modules", "Set up order sets", "Define clinical decision support", "Configure documentation templates"],
    expectedDeliverables: ["Configuration Workbook", "Order Set Library", "Clinical Templates"],
    timelineWeeks: "4 weeks",
    status: "in_progress" as const,
    completionPercentage: 60,
  },
  {
    id: "step-1-2-3",
    phaseId: "phase-1-2",
    stepNumber: 3,
    title: "Integration Development",
    description: "Build interfaces and integrations with external systems",
    keyActivities: ["Develop interfaces", "Configure data mappings", "Test connectivity", "Document integration specs"],
    expectedDeliverables: ["Interface Specifications", "Data Mapping Documents", "Integration Test Results"],
    timelineWeeks: "3 weeks",
    status: "not_started" as const,
    completionPercentage: 0,
  },
  {
    id: "step-1-2-4",
    phaseId: "phase-1-2",
    stepNumber: 4,
    title: "Data Migration Planning",
    description: "Plan and prepare for data migration activities",
    keyActivities: ["Inventory source data", "Define migration strategy", "Build extraction tools", "Validate data quality"],
    expectedDeliverables: ["Migration Strategy Document", "Data Quality Report", "Conversion Scripts"],
    timelineWeeks: "3 weeks",
    status: "not_started" as const,
    completionPercentage: 0,
  },
  // Phase 1-3 Steps (Testing & Validation - Not Started)
  {
    id: "step-1-3-1",
    phaseId: "phase-1-3",
    stepNumber: 1,
    title: "Test Planning",
    description: "Develop comprehensive test strategy and test cases",
    keyActivities: ["Define test strategy", "Create test cases", "Set up test environment", "Train test team"],
    expectedDeliverables: ["Test Strategy Document", "Test Case Repository", "Test Environment Guide"],
    timelineWeeks: "2 weeks",
    status: "not_started" as const,
    completionPercentage: 0,
  },
  {
    id: "step-1-3-2",
    phaseId: "phase-1-3",
    stepNumber: 2,
    title: "System Integration Testing",
    description: "Execute end-to-end system integration tests",
    keyActivities: ["Execute integration tests", "Log and track defects", "Validate interfaces", "Verify data flows"],
    expectedDeliverables: ["Test Execution Reports", "Defect Log", "Integration Validation Report"],
    timelineWeeks: "4 weeks",
    status: "not_started" as const,
    completionPercentage: 0,
  },
  {
    id: "step-1-3-3",
    phaseId: "phase-1-3",
    stepNumber: 3,
    title: "User Acceptance Testing",
    description: "Conduct UAT with end users and clinical staff",
    keyActivities: ["Train UAT participants", "Execute UAT scenarios", "Collect feedback", "Sign off on acceptance"],
    expectedDeliverables: ["UAT Report", "Sign-off Documents", "Feedback Summary"],
    timelineWeeks: "3 weeks",
    status: "not_started" as const,
    completionPercentage: 0,
  },
  // Phase 2-1 Steps (Assessment Phase - Completed)
  {
    id: "step-2-1-1",
    phaseId: "phase-2-1",
    stepNumber: 1,
    title: "System Health Check",
    description: "Assess current system performance and configuration",
    keyActivities: ["Review system logs", "Analyze performance metrics", "Audit configurations", "Identify bottlenecks"],
    expectedDeliverables: ["Health Check Report", "Performance Analysis", "Configuration Audit"],
    timelineWeeks: "2 weeks",
    status: "completed" as const,
    completionPercentage: 100,
  },
  {
    id: "step-2-1-2",
    phaseId: "phase-2-1",
    stepNumber: 2,
    title: "User Feedback Collection",
    description: "Gather end user feedback on system usability and issues",
    keyActivities: ["Conduct surveys", "Hold focus groups", "Review help desk tickets", "Interview power users"],
    expectedDeliverables: ["User Feedback Report", "Issue Registry", "Enhancement Requests"],
    timelineWeeks: "2 weeks",
    status: "completed" as const,
    completionPercentage: 100,
  },
  // Phase 2-2 Steps (Optimization Build - In Progress)
  {
    id: "step-2-2-1",
    phaseId: "phase-2-2",
    stepNumber: 1,
    title: "Quick Wins Implementation",
    description: "Implement low-effort, high-impact improvements",
    keyActivities: ["Prioritize quick wins", "Configure improvements", "Deploy changes", "Validate results"],
    expectedDeliverables: ["Quick Wins Report", "Change Documentation", "Validation Results"],
    timelineWeeks: "2 weeks",
    status: "completed" as const,
    completionPercentage: 100,
  },
  {
    id: "step-2-2-2",
    phaseId: "phase-2-2",
    stepNumber: 2,
    title: "Workflow Optimization",
    description: "Redesign and optimize clinical workflows",
    keyActivities: ["Map target workflows", "Configure changes", "Train users", "Monitor adoption"],
    expectedDeliverables: ["Workflow Designs", "Training Materials", "Adoption Metrics"],
    timelineWeeks: "4 weeks",
    status: "in_progress" as const,
    completionPercentage: 35,
  },
];

// Project Risks demo data - risk register entries
// status values: "identified", "mitigating", "resolved", "accepted"
const demoProjectRisks = [
  // Project 1 Risks
  {
    id: "risk-1-1",
    projectId: "project-1",
    phaseId: "phase-1-2",
    title: "Integration Complexity",
    description: "Complex integrations with legacy systems may cause delays and require additional resources",
    probability: "high" as const,
    impact: "high" as const,
    status: "identified" as const,
    mitigationPlan: "Engage integration specialists early, create detailed interface specifications, allocate buffer time",
    contingencyPlan: "Implement phased integration approach, use temporary middleware if needed",
    owner: "user-c3",
    identifiedDate: "2024-12-01",
  },
  {
    id: "risk-1-2",
    projectId: "project-1",
    phaseId: "phase-1-2",
    title: "Resource Availability",
    description: "Key clinical staff may not be available for configuration reviews and UAT",
    probability: "medium" as const,
    impact: "high" as const,
    status: "mitigating" as const,
    mitigationPlan: "Schedule sessions in advance, identify backup SMEs, create flexible review schedules",
    contingencyPlan: "Utilize remote sessions, extend UAT timeline if needed",
    owner: "user-c1",
    identifiedDate: "2024-12-15",
  },
  {
    id: "risk-1-3",
    projectId: "project-1",
    phaseId: "phase-1-3",
    title: "Data Quality Issues",
    description: "Legacy data may have quality issues that affect migration and system functionality",
    probability: "medium" as const,
    impact: "medium" as const,
    status: "identified" as const,
    mitigationPlan: "Conduct data quality assessment, establish data cleansing procedures, validate migration scripts",
    contingencyPlan: "Implement data correction process post-go-live, prioritize critical data elements",
    owner: "user-c5",
    identifiedDate: "2024-11-20",
  },
  {
    id: "risk-1-4",
    projectId: "project-1",
    phaseId: "phase-1-1",
    title: "Scope Creep",
    description: "Stakeholders may request additional features beyond the original scope",
    probability: "high" as const,
    impact: "medium" as const,
    status: "resolved" as const,
    mitigationPlan: "Establish formal change control process, maintain requirements traceability matrix",
    contingencyPlan: "Defer non-essential features to future phases",
    owner: "user-c2",
    identifiedDate: "2024-11-01",
  },
  // Project 2 Risks
  {
    id: "risk-2-1",
    projectId: "project-2",
    phaseId: "phase-2-2",
    title: "User Adoption Resistance",
    description: "End users may resist workflow changes during optimization",
    probability: "medium" as const,
    impact: "high" as const,
    status: "mitigating" as const,
    mitigationPlan: "Involve users in design process, provide comprehensive training, communicate benefits clearly",
    contingencyPlan: "Implement gradual rollout, provide additional at-elbow support",
    owner: "user-c1",
    identifiedDate: "2024-12-10",
  },
  {
    id: "risk-2-2",
    projectId: "project-2",
    phaseId: "phase-2-2",
    title: "Performance Impact",
    description: "Optimization changes may negatively impact system performance",
    probability: "low" as const,
    impact: "high" as const,
    status: "accepted" as const,
    mitigationPlan: "Test changes in non-production environment, monitor performance metrics, implement gradual rollout",
    contingencyPlan: "Rollback changes if performance degrades, optimize infrastructure",
    owner: "user-c3",
    identifiedDate: "2024-12-20",
  },
];

// Project Milestones demo data
const demoProjectMilestones = [
  // Project 1 Milestones
  {
    id: "milestone-1-1",
    projectId: "project-1",
    phaseId: "phase-1-1",
    title: "Project Kickoff Complete",
    description: "Project charter approved, governance established, and team mobilized",
    dueDate: "2024-11-15",
    completedDate: "2024-11-14",
    isCompleted: true,
    isCritical: true,
  },
  {
    id: "milestone-1-2",
    projectId: "project-1",
    phaseId: "phase-1-1",
    title: "Requirements Sign-off",
    description: "All requirements documented and approved by stakeholders",
    dueDate: "2024-12-15",
    completedDate: "2024-12-15",
    isCompleted: true,
    isCritical: true,
  },
  {
    id: "milestone-1-3",
    projectId: "project-1",
    phaseId: "phase-1-2",
    title: "Development Environment Ready",
    description: "All development and test environments configured and operational",
    dueDate: "2024-12-31",
    completedDate: "2024-12-28",
    isCompleted: true,
    isCritical: false,
  },
  {
    id: "milestone-1-4",
    projectId: "project-1",
    phaseId: "phase-1-2",
    title: "Core Module Configuration Complete",
    description: "Primary clinical modules configured and validated",
    dueDate: "2025-02-15",
    isCompleted: false,
    isCritical: true,
  },
  {
    id: "milestone-1-5",
    projectId: "project-1",
    phaseId: "phase-1-2",
    title: "Integration Testing Complete",
    description: "All interfaces built and integration testing passed",
    dueDate: "2025-03-15",
    isCompleted: false,
    isCritical: true,
  },
  {
    id: "milestone-1-6",
    projectId: "project-1",
    phaseId: "phase-1-3",
    title: "UAT Sign-off",
    description: "User acceptance testing completed with formal sign-off",
    dueDate: "2025-05-15",
    isCompleted: false,
    isCritical: true,
  },
  {
    id: "milestone-1-7",
    projectId: "project-1",
    phaseId: "phase-1-4",
    title: "Go-Live",
    description: "System goes live with full production support",
    dueDate: "2025-06-01",
    isCompleted: false,
    isCritical: true,
  },
  // Project 2 Milestones
  {
    id: "milestone-2-1",
    projectId: "project-2",
    phaseId: "phase-2-1",
    title: "Assessment Complete",
    description: "System health check and user feedback collection completed",
    dueDate: "2024-11-30",
    completedDate: "2024-11-30",
    isCompleted: true,
    isCritical: true,
  },
  {
    id: "milestone-2-2",
    projectId: "project-2",
    phaseId: "phase-2-2",
    title: "Quick Wins Deployed",
    description: "Initial optimization improvements deployed to production",
    dueDate: "2025-01-15",
    completedDate: "2025-01-12",
    isCompleted: true,
    isCritical: false,
  },
  {
    id: "milestone-2-3",
    projectId: "project-2",
    phaseId: "phase-2-2",
    title: "Optimization Phase Complete",
    description: "All workflow optimizations implemented and validated",
    dueDate: "2025-02-28",
    isCompleted: false,
    isCritical: true,
  },
];

// Phase Deliverables demo data
const demoPhaseDeliverables = [
  // Phase 1-1 Deliverables
  {
    id: "deliverable-1-1-1",
    phaseId: "phase-1-1",
    stepId: "step-1-1-1",
    title: "Project Charter",
    description: "Formal project charter document with scope, objectives, and governance structure",
    isRequired: true,
    isSubmitted: true,
    submittedAt: new Date("2024-11-14"),
    isApproved: true,
    approvedAt: new Date("2024-11-15"),
  },
  {
    id: "deliverable-1-1-2",
    phaseId: "phase-1-1",
    stepId: "step-1-1-2",
    title: "Current State Assessment Report",
    description: "Comprehensive analysis of existing systems and processes",
    isRequired: true,
    isSubmitted: true,
    submittedAt: new Date("2024-12-01"),
    isApproved: true,
    approvedAt: new Date("2024-12-05"),
  },
  {
    id: "deliverable-1-1-3",
    phaseId: "phase-1-1",
    stepId: "step-1-1-3",
    title: "Requirements Document",
    description: "Complete functional and technical requirements specification",
    isRequired: true,
    isSubmitted: true,
    submittedAt: new Date("2024-12-12"),
    isApproved: true,
    approvedAt: new Date("2024-12-15"),
  },
  // Phase 1-2 Deliverables
  {
    id: "deliverable-1-2-1",
    phaseId: "phase-1-2",
    stepId: "step-1-2-1",
    title: "Environment Documentation",
    description: "Technical documentation for all configured environments",
    isRequired: true,
    isSubmitted: true,
    submittedAt: new Date("2024-12-28"),
    isApproved: true,
    approvedAt: new Date("2024-12-30"),
  },
  {
    id: "deliverable-1-2-2",
    phaseId: "phase-1-2",
    stepId: "step-1-2-2",
    title: "Configuration Workbook",
    description: "Detailed configuration settings for all clinical modules",
    isRequired: true,
    isSubmitted: false,
    isApproved: false,
  },
  {
    id: "deliverable-1-2-3",
    phaseId: "phase-1-2",
    stepId: "step-1-2-3",
    title: "Interface Specifications",
    description: "Technical specifications for all system interfaces",
    isRequired: true,
    isSubmitted: false,
    isApproved: false,
  },
];

// RACI Matrix demo data - assigns team members to project phases with RACI roles
const demoRaciAssignments = [
  // Project 1 - Phase 1 (Discovery & Planning) assignments
  {
    id: "raci-1",
    projectId: "project-1",
    phaseId: "phase-1-1",
    userId: "user-c1",
    role: "responsible" as const,
    notes: "Lead discovery sessions and workflow analysis",
    createdBy: "user-c1",
  },
  {
    id: "raci-2",
    projectId: "project-1",
    phaseId: "phase-1-1",
    userId: "user-c2",
    role: "accountable" as const,
    notes: "Overall accountability for discovery phase completion",
    createdBy: "user-c1",
  },
  {
    id: "raci-3",
    projectId: "project-1",
    phaseId: "phase-1-1",
    userId: "user-c3",
    role: "consulted" as const,
    notes: "Provide input on technical requirements",
    createdBy: "user-c1",
  },
  {
    id: "raci-4",
    projectId: "project-1",
    phaseId: "phase-1-1",
    userId: "user-c4",
    role: "informed" as const,
    notes: "Keep informed of project progress",
    createdBy: "user-c1",
  },
  // Project 1 - Phase 2 (Build & Configuration) assignments
  {
    id: "raci-5",
    projectId: "project-1",
    phaseId: "phase-1-2",
    userId: "user-c3",
    role: "responsible" as const,
    notes: "Lead system configuration and build activities",
    createdBy: "user-c1",
  },
  {
    id: "raci-6",
    projectId: "project-1",
    phaseId: "phase-1-2",
    userId: "user-c1",
    role: "accountable" as const,
    notes: "Approve all configuration changes",
    createdBy: "user-c1",
  },
  {
    id: "raci-7",
    projectId: "project-1",
    phaseId: "phase-1-2",
    userId: "user-c5",
    role: "consulted" as const,
    notes: "Consult on integration requirements",
    createdBy: "user-c1",
  },
  {
    id: "raci-8",
    projectId: "project-1",
    phaseId: "phase-1-2",
    userId: "user-c2",
    role: "informed" as const,
    notes: "Status updates on build progress",
    createdBy: "user-c1",
  },
  // Project 1 - Phase 3 (Testing & Validation) assignments
  {
    id: "raci-9",
    projectId: "project-1",
    phaseId: "phase-1-3",
    userId: "user-c4",
    role: "responsible" as const,
    notes: "Lead testing coordination and execution",
    createdBy: "user-c1",
  },
  {
    id: "raci-10",
    projectId: "project-1",
    phaseId: "phase-1-3",
    userId: "user-c1",
    role: "accountable" as const,
    notes: "Sign off on testing results",
    createdBy: "user-c1",
  },
  {
    id: "raci-11",
    projectId: "project-1",
    phaseId: "phase-1-3",
    userId: "user-c3",
    role: "consulted" as const,
    notes: "Provide technical support for testing issues",
    createdBy: "user-c1",
  },
  // Project 1 - Phase 4 (Go-Live & Support) assignments
  {
    id: "raci-12",
    projectId: "project-1",
    phaseId: "phase-1-4",
    userId: "user-c1",
    role: "responsible" as const,
    notes: "Lead go-live execution and command center",
    createdBy: "user-c1",
  },
  {
    id: "raci-13",
    projectId: "project-1",
    phaseId: "phase-1-4",
    userId: "user-c2",
    role: "accountable" as const,
    notes: "Final go-live approval and escalation decisions",
    createdBy: "user-c1",
  },
  {
    id: "raci-14",
    projectId: "project-1",
    phaseId: "phase-1-4",
    userId: "user-c3",
    role: "responsible" as const,
    notes: "At-the-elbow support during go-live",
    createdBy: "user-c1",
  },
  {
    id: "raci-15",
    projectId: "project-1",
    phaseId: "phase-1-4",
    userId: "user-c4",
    role: "consulted" as const,
    notes: "Issue resolution and troubleshooting",
    createdBy: "user-c1",
  },
  // Project 2 - Phase 1 (Assessment Phase) assignments
  {
    id: "raci-16",
    projectId: "project-2",
    phaseId: "phase-2-1",
    userId: "user-c2",
    role: "responsible" as const,
    notes: "Lead Cerner optimization assessment",
    createdBy: "user-c2",
  },
  {
    id: "raci-17",
    projectId: "project-2",
    phaseId: "phase-2-1",
    userId: "user-c1",
    role: "accountable" as const,
    notes: "Overall project accountability",
    createdBy: "user-c2",
  },
  {
    id: "raci-18",
    projectId: "project-2",
    phaseId: "phase-2-1",
    userId: "user-c5",
    role: "informed" as const,
    notes: "Kept informed for knowledge transfer",
    createdBy: "user-c2",
  },
  // Project 2 - Phase 2 (Optimization Build) assignments
  {
    id: "raci-19",
    projectId: "project-2",
    phaseId: "phase-2-2",
    userId: "user-c2",
    role: "responsible" as const,
    notes: "Lead optimization implementation",
    createdBy: "user-c2",
  },
  {
    id: "raci-20",
    projectId: "project-2",
    phaseId: "phase-2-2",
    userId: "user-c1",
    role: "accountable" as const,
    notes: "Approve optimization changes",
    createdBy: "user-c2",
  },
  {
    id: "raci-21",
    projectId: "project-2",
    phaseId: "phase-2-2",
    userId: "user-c4",
    role: "consulted" as const,
    notes: "Consulted on workflow optimizations",
    createdBy: "user-c2",
  },
  {
    id: "raci-22",
    projectId: "project-2",
    phaseId: "phase-2-2",
    userId: "user-c3",
    role: "informed" as const,
    notes: "Updates on optimization progress",
    createdBy: "user-c2",
  },
];

const demoDocumentTypes = [
  { id: "doctype-1", name: "Resume/CV", description: "Professional resume or curriculum vitae", isRequired: true, hasExpiration: false, category: "Professional" },
  { id: "doctype-2", name: "RN License", description: "Registered Nurse license", isRequired: false, hasExpiration: true, expirationMonths: 24, category: "License" },
  { id: "doctype-3", name: "Epic Certification", description: "Epic Systems certification badge", isRequired: false, hasExpiration: true, expirationMonths: 36, category: "Certification" },
  { id: "doctype-4", name: "Cerner Certification", description: "Cerner certification credential", isRequired: false, hasExpiration: true, expirationMonths: 36, category: "Certification" },
  { id: "doctype-5", name: "Background Check", description: "Criminal background check clearance", isRequired: true, hasExpiration: true, expirationMonths: 12, category: "Compliance" },
  { id: "doctype-6", name: "Drug Screen", description: "Drug screening results", isRequired: true, hasExpiration: true, expirationMonths: 12, category: "Compliance" },
  { id: "doctype-7", name: "HIPAA Training", description: "HIPAA compliance training certificate", isRequired: true, hasExpiration: true, expirationMonths: 12, category: "Training" },
  { id: "doctype-8", name: "W-9 Form", description: "Tax identification form", isRequired: true, hasExpiration: false, category: "Tax" },
  { id: "doctype-9", name: "Proof of Insurance", description: "Professional liability insurance", isRequired: true, hasExpiration: true, expirationMonths: 12, category: "Insurance" },
  { id: "doctype-10", name: "COVID Vaccination", description: "COVID-19 vaccination record", isRequired: false, hasExpiration: false, category: "Health" },
];

const demoCourses = [
  {
    id: "course-1",
    title: "Epic EHR Fundamentals",
    description: "Comprehensive introduction to Epic electronic health record system, covering core modules, navigation, and best practices for implementation consultants.",
    category: "EMR Training",
    duration: 480,
    isRequired: true,
    isActive: true,
  },
  {
    id: "course-2",
    title: "Healthcare Privacy & Security",
    description: "Essential HIPAA compliance training covering patient privacy, data security, breach prevention, and regulatory requirements.",
    category: "Compliance",
    duration: 120,
    isRequired: true,
    isActive: true,
  },
  {
    id: "course-3",
    title: "Clinical Workflow Optimization",
    description: "Advanced techniques for analyzing and optimizing clinical workflows in healthcare settings. Includes case studies and hands-on exercises.",
    category: "Professional Development",
    duration: 240,
    isRequired: false,
    isActive: true,
  },
  {
    id: "course-4",
    title: "Cerner PowerChart Training",
    description: "In-depth training on Cerner PowerChart including clinical documentation, order entry, and medication administration features.",
    category: "EMR Training",
    duration: 360,
    isRequired: false,
    isActive: true,
  },
  {
    id: "course-5",
    title: "Change Management for Healthcare IT",
    description: "Strategies and techniques for managing organizational change during healthcare IT implementations.",
    category: "Professional Development",
    duration: 180,
    isRequired: false,
    isActive: true,
  },
];

// Integration Hub - Connections Demo Data (matching actual schema)
const demoIntegrationConnections = [
  {
    id: "int-conn-1",
    name: "Mercy Regional - Google Calendar",
    provider: "google_calendar" as const,
    category: "calendar",
    status: "connected" as const,
    configuration: { calendarId: "primary", syncFrequency: "hourly" },
    credentials: { clientId: "mock-client-id", refreshToken: "mock-refresh-token" },
    lastSyncAt: new Date("2024-11-29T08:00:00Z"),
    lastSyncStatus: "completed" as const,
    syncFrequency: "hourly",
    isActive: true,
    connectedByUserId: "demo-admin",
    connectedAt: new Date("2024-10-01T10:00:00Z"),
  },
  {
    id: "int-conn-2",
    name: "Mercy Regional - Outlook Calendar",
    provider: "outlook_calendar" as const,
    category: "calendar",
    status: "connected" as const,
    configuration: { tenantId: "mock-tenant" },
    credentials: { accessToken: "mock-access-token" },
    lastSyncAt: new Date("2024-11-29T07:45:00Z"),
    lastSyncStatus: "completed" as const,
    syncFrequency: "daily",
    isActive: true,
    connectedByUserId: "demo-admin",
    connectedAt: new Date("2024-10-05T14:00:00Z"),
  },
  {
    id: "int-conn-3",
    name: "St. Luke's - ADP Payroll",
    provider: "adp" as const,
    category: "payroll",
    status: "connected" as const,
    configuration: { companyCode: "STLUKES" },
    credentials: { apiKey: "mock-adp-key" },
    lastSyncAt: new Date("2024-11-28T22:00:00Z"),
    lastSyncStatus: "completed" as const,
    syncFrequency: "weekly",
    isActive: true,
    connectedByUserId: "demo-admin",
    connectedAt: new Date("2024-09-15T09:00:00Z"),
  },
  {
    id: "int-conn-4",
    name: "Pacific NW - Workday HR",
    provider: "workday" as const,
    category: "payroll",
    status: "error" as const,
    configuration: { tenantUrl: "pnw.workday.com" },
    credentials: { username: "api-user" },
    lastSyncAt: new Date("2024-11-27T12:00:00Z"),
    lastSyncStatus: "failed" as const,
    syncFrequency: "daily",
    isActive: true,
    connectedByUserId: "demo-admin",
    connectedAt: new Date("2024-08-20T11:00:00Z"),
    errorMessage: "Authentication token expired. Please reconnect.",
  },
  {
    id: "int-conn-5",
    name: "Mercy Regional - Epic FHIR",
    provider: "epic" as const,
    category: "ehr",
    status: "connected" as const,
    configuration: { baseUrl: "https://fhir.mercy.org" },
    credentials: { clientId: "nicehr-client" },
    lastSyncAt: new Date("2024-11-29T09:00:00Z"),
    lastSyncStatus: "completed" as const,
    syncFrequency: "hourly",
    isActive: true,
    connectedByUserId: "demo-admin",
    connectedAt: new Date("2024-07-01T08:00:00Z"),
  },
];

// Sync Jobs Demo Data (needed for Sync Events)
const demoSyncJobs = [
  {
    id: "sync-job-1",
    connectionId: "int-conn-1",
    direction: "import" as const,
    status: "completed" as const,
    startedAt: new Date("2024-11-29T08:00:00Z"),
    completedAt: new Date("2024-11-29T08:00:32Z"),
    recordsProcessed: 45,
    recordsSucceeded: 45,
    recordsFailed: 0,
    triggeredByUserId: "demo-admin",
  },
  {
    id: "sync-job-2",
    connectionId: "int-conn-3",
    direction: "export" as const,
    status: "partial" as const,
    startedAt: new Date("2024-11-28T22:00:00Z"),
    completedAt: new Date("2024-11-28T22:02:15Z"),
    recordsProcessed: 150,
    recordsSucceeded: 147,
    recordsFailed: 3,
    errorLog: [{ recordId: "rec-1", error: "Invalid format" }],
    triggeredByUserId: "demo-admin",
  },
  {
    id: "sync-job-3",
    connectionId: "int-conn-4",
    direction: "bidirectional" as const,
    status: "failed" as const,
    startedAt: new Date("2024-11-27T12:00:00Z"),
    completedAt: new Date("2024-11-27T12:00:05Z"),
    recordsProcessed: 0,
    recordsSucceeded: 0,
    recordsFailed: 0,
    errorLog: [{ error: "Authentication failed" }],
    triggeredByUserId: "demo-admin",
  },
  {
    id: "sync-job-4",
    connectionId: "int-conn-5",
    direction: "import" as const,
    status: "completed" as const,
    startedAt: new Date("2024-11-29T09:00:00Z"),
    completedAt: new Date("2024-11-29T09:01:45Z"),
    recordsProcessed: 892,
    recordsSucceeded: 892,
    recordsFailed: 0,
    triggeredByUserId: "demo-admin",
  },
];

// Sync Events Demo Data (matching actual schema)
const demoSyncEvents = [
  {
    id: "sync-evt-1",
    syncJobId: "sync-job-1",
    eventType: "created",
    resourceType: "schedule",
    resourceId: "schedule-001",
    externalId: "gcal-evt-123",
    details: { summary: "Mercy Regional Shift" },
  },
  {
    id: "sync-evt-2",
    syncJobId: "sync-job-1",
    eventType: "updated",
    resourceType: "schedule",
    resourceId: "schedule-002",
    externalId: "gcal-evt-124",
    details: { summary: "Training Session Updated" },
  },
  {
    id: "sync-evt-3",
    syncJobId: "sync-job-2",
    eventType: "created",
    resourceType: "payroll_entry",
    resourceId: "payroll-001",
    externalId: "adp-ent-456",
    details: { employeeName: "John Consultant" },
  },
  {
    id: "sync-evt-4",
    syncJobId: "sync-job-2",
    eventType: "error",
    resourceType: "payroll_entry",
    resourceId: "payroll-002",
    errorMessage: "Invalid tax ID format",
    details: { employeeName: "Jane Consultant" },
  },
  {
    id: "sync-evt-5",
    syncJobId: "sync-job-4",
    eventType: "created",
    resourceType: "patient_data",
    resourceId: "patient-001",
    externalId: "epic-pt-789",
    details: { dataType: "encounter" },
  },
];

// EHR Systems Demo Data (matching actual schema)
const demoEhrSystems = [
  {
    id: "ehr-1",
    name: "Mercy Regional Epic Production",
    vendor: "Epic",
    version: "2024.2",
    hospitalId: "hospital-1",
    environment: "production",
    status: "operational" as const,
    baseUrl: "https://epic.mercy-regional.org",
    healthCheckEndpoint: "/api/health",
    lastHealthCheck: new Date("2024-11-29T09:30:00Z"),
    uptimePercent: "99.98",
    avgResponseTime: 145,
    isMonitored: true,
    alertThresholds: { responseTime: 500, errorRate: 1.0 },
    notificationChannels: ["email", "slack"],
  },
  {
    id: "ehr-2",
    name: "Mercy Regional Epic Training",
    vendor: "Epic",
    version: "2024.2",
    hospitalId: "hospital-1",
    environment: "training",
    status: "operational" as const,
    baseUrl: "https://epic-train.mercy-regional.org",
    healthCheckEndpoint: "/api/health",
    lastHealthCheck: new Date("2024-11-29T09:30:00Z"),
    uptimePercent: "100.00",
    avgResponseTime: 98,
    isMonitored: true,
    alertThresholds: { responseTime: 1000, errorRate: 5.0 },
    notificationChannels: ["email"],
  },
  {
    id: "ehr-3",
    name: "St. Luke's Cerner Production",
    vendor: "Cerner",
    version: "2024.1",
    hospitalId: "hospital-2",
    environment: "production",
    status: "degraded" as const,
    baseUrl: "https://cerner.stlukes.org",
    healthCheckEndpoint: "/api/health",
    lastHealthCheck: new Date("2024-11-29T09:28:00Z"),
    uptimePercent: "97.50",
    avgResponseTime: 890,
    isMonitored: true,
    alertThresholds: { responseTime: 500, errorRate: 1.0 },
    notificationChannels: ["email", "slack", "sms"],
  },
  {
    id: "ehr-4",
    name: "St. Luke's Cerner Test",
    vendor: "Cerner",
    version: "2024.2",
    hospitalId: "hospital-2",
    environment: "staging",
    status: "operational" as const,
    baseUrl: "https://cerner-test.stlukes.org",
    healthCheckEndpoint: "/api/health",
    lastHealthCheck: new Date("2024-11-29T09:30:00Z"),
    uptimePercent: "99.95",
    avgResponseTime: 110,
    isMonitored: true,
    alertThresholds: { responseTime: 1000, errorRate: 5.0 },
    notificationChannels: ["email"],
  },
  {
    id: "ehr-5",
    name: "Pacific NW Epic Production",
    vendor: "Epic",
    version: "2024.1",
    hospitalId: "hospital-3",
    environment: "production",
    status: "maintenance" as const,
    baseUrl: "https://epic.pnwhealth.org",
    healthCheckEndpoint: "/api/health",
    lastHealthCheck: new Date("2024-11-29T09:15:00Z"),
    uptimePercent: "95.00",
    avgResponseTime: 0,
    isMonitored: true,
    alertThresholds: { responseTime: 500, errorRate: 1.0 },
    notificationChannels: ["email", "slack"],
  },
];

// EHR Status Metrics Demo Data (matching actual schema)
const demoEhrMetrics = [
  { id: "metric-1", ehrSystemId: "ehr-1", timestamp: new Date("2024-11-29T09:00:00Z"), status: "operational" as const, responseTime: 145, errorRate: "0.01", activeUsers: 342, transactionsPerMinute: 1250 },
  { id: "metric-2", ehrSystemId: "ehr-1", timestamp: new Date("2024-11-29T09:30:00Z"), status: "operational" as const, responseTime: 152, errorRate: "0.02", activeUsers: 338, transactionsPerMinute: 1180 },
  { id: "metric-3", ehrSystemId: "ehr-2", timestamp: new Date("2024-11-29T09:00:00Z"), status: "operational" as const, responseTime: 98, errorRate: "0.00", activeUsers: 45, transactionsPerMinute: 180 },
  { id: "metric-4", ehrSystemId: "ehr-3", timestamp: new Date("2024-11-29T09:00:00Z"), status: "degraded" as const, responseTime: 890, errorRate: "2.50", activeUsers: 512, transactionsPerMinute: 2100 },
  { id: "metric-5", ehrSystemId: "ehr-4", timestamp: new Date("2024-11-29T09:00:00Z"), status: "operational" as const, responseTime: 110, errorRate: "0.05", activeUsers: 28, transactionsPerMinute: 95 },
  { id: "metric-6", ehrSystemId: "ehr-5", timestamp: new Date("2024-11-29T09:00:00Z"), status: "maintenance" as const, responseTime: 0, errorRate: "0.00", activeUsers: 0, transactionsPerMinute: 0 },
];

// EHR Incidents Demo Data (matching actual schema)
const demoEhrIncidents = [
  {
    id: "incident-1",
    ehrSystemId: "ehr-3",
    title: "High Response Time - Cerner Production",
    description: "Response times elevated above 500ms threshold. Database query optimization in progress.",
    severity: "major" as const,
    status: "investigating",
    startedAt: new Date("2024-11-29T08:45:00Z"),
    identifiedAt: new Date("2024-11-29T08:52:00Z"),
    impactedModules: ["Orders", "Documentation"],
    affectedUsers: 150,
    reportedByUserId: "demo-admin",
    notificationsSent: true,
  },
  {
    id: "incident-2",
    ehrSystemId: "ehr-5",
    title: "Scheduled Maintenance - Epic Production",
    description: "Scheduled system maintenance window for version upgrade to Epic 2024.3",
    severity: "informational" as const,
    status: "monitoring",
    startedAt: new Date("2024-11-29T06:00:00Z"),
    identifiedAt: new Date("2024-11-29T06:00:00Z"),
    impactedModules: ["All"],
    affectedUsers: 0,
    reportedByUserId: "demo-admin",
    notificationsSent: true,
  },
  {
    id: "incident-3",
    ehrSystemId: "ehr-1",
    title: "Brief Authentication Delay",
    description: "Users experienced 2-second delays during login authentication. Issue automatically resolved.",
    severity: "minor" as const,
    status: "resolved",
    startedAt: new Date("2024-11-28T14:30:00Z"),
    identifiedAt: new Date("2024-11-28T14:35:00Z"),
    resolvedAt: new Date("2024-11-28T14:42:00Z"),
    resolution: "Cache refresh resolved the authentication delay. Monitoring for recurrence.",
    rootCause: "Cache invalidation issue after maintenance window",
    impactedModules: ["Authentication"],
    affectedUsers: 45,
    reportedByUserId: "demo-admin",
    notificationsSent: true,
  },
];

// Payroll Sync Profiles Demo Data (matching actual schema)
const demoPayrollProfiles = [
  {
    id: "payroll-1",
    name: "Mercy Regional ADP Export",
    connectionId: "int-conn-3",
    exportFormat: "csv",
    fieldMappings: { employeeId: "consultant_id", hours: "total_hours", rate: "pay_rate" },
    includeOvertime: true,
    includeBonuses: true,
    includeDeductions: true,
    autoExportSchedule: "0 2 * * 1",
    lastExportAt: new Date("2024-11-25T02:00:00Z"),
    isActive: true,
    createdByUserId: "demo-admin",
  },
  {
    id: "payroll-2",
    name: "St. Luke's Paychex Export",
    exportFormat: "xml",
    fieldMappings: { employeeId: "emp_number", hours: "worked_hours", rate: "hourly_rate" },
    includeOvertime: true,
    includeBonuses: false,
    includeDeductions: true,
    autoExportSchedule: "0 3 * * 1",
    lastExportAt: new Date("2024-11-25T03:00:00Z"),
    isActive: true,
    createdByUserId: "demo-admin",
  },
  {
    id: "payroll-3",
    name: "Pacific NW Workday Export",
    connectionId: "int-conn-4",
    exportFormat: "api",
    fieldMappings: { employeeId: "worker_id", hours: "time_worked", rate: "compensation" },
    includeOvertime: true,
    includeBonuses: true,
    includeDeductions: true,
    autoExportSchedule: "0 1 * * 1",
    lastExportAt: new Date("2024-11-18T01:00:00Z"),
    isActive: false,
    createdByUserId: "demo-admin",
  },
];

// Payroll Export Jobs Demo Data (matching actual schema)
const demoPayrollJobs = [
  {
    id: "pay-job-1",
    profileId: "payroll-1",
    status: "completed" as const,
    exportFormat: "csv",
    periodStart: "2024-11-11",
    periodEnd: "2024-11-24",
    recordCount: 24,
    totalAmount: "84500.00",
    fileName: "payroll_export_2024-11-24.csv",
    fileSize: 15234,
    exportedByUserId: "demo-admin",
    startedAt: new Date("2024-11-25T02:00:00Z"),
    completedAt: new Date("2024-11-25T02:15:00Z"),
  },
  {
    id: "pay-job-2",
    profileId: "payroll-2",
    status: "completed" as const,
    exportFormat: "xml",
    periodStart: "2024-11-11",
    periodEnd: "2024-11-24",
    recordCount: 18,
    totalAmount: "67200.00",
    fileName: "payroll_export_2024-11-24.xml",
    fileSize: 28456,
    errorMessage: "1 record skipped due to missing tax ID",
    exportedByUserId: "demo-admin",
    startedAt: new Date("2024-11-25T03:00:00Z"),
    completedAt: new Date("2024-11-25T03:22:00Z"),
  },
  {
    id: "pay-job-3",
    profileId: "payroll-1",
    status: "completed" as const,
    exportFormat: "csv",
    periodStart: "2024-10-28",
    periodEnd: "2024-11-10",
    recordCount: 22,
    totalAmount: "78900.00",
    fileName: "payroll_export_2024-11-10.csv",
    fileSize: 14123,
    exportedByUserId: "demo-admin",
    startedAt: new Date("2024-11-11T02:00:00Z"),
    completedAt: new Date("2024-11-11T02:18:00Z"),
  },
];

// Escalation Rules Demo Data (using existing table from schema)
const demoEscalationRules = [
  {
    id: "esc-rule-1",
    projectId: "project-1",
    name: "Critical Ticket Auto-Escalation",
    description: "Automatically escalate critical support tickets that are unacknowledged for 30 minutes",
    triggerType: "sla_breach" as const,
    conditions: { priority: "critical", maxAgeMinutes: 30, status: "open" },
    actions: { notifyRoles: ["project_manager", "admin"], escalateLevel: 2, sendSms: true },
    escalationLevel: 2,
    notificationChannels: ["email", "sms", "in_app"],
    isActive: true,
    createdByUserId: "demo-admin",
  },
  {
    id: "esc-rule-2",
    projectId: "project-1",
    name: "High Priority Ticket Escalation",
    description: "Escalate high priority tickets after 2 hours without resolution",
    triggerType: "time_based" as const,
    conditions: { priority: "high", maxAgeMinutes: 120, status: ["open", "in_progress"] },
    actions: { notifyRoles: ["project_manager"], escalateLevel: 1, sendSms: false },
    escalationLevel: 1,
    notificationChannels: ["email", "in_app"],
    isActive: true,
    createdByUserId: "demo-admin",
  },
  {
    id: "esc-rule-3",
    projectId: "project-2",
    name: "EHR System Downtime Alert",
    description: "Immediate escalation when EHR system shows critical status for more than 5 minutes",
    triggerType: "priority_based" as const,
    conditions: { systemType: "ehr", status: "critical", durationMinutes: 5 },
    actions: { notifyRoles: ["admin", "hospital_it", "project_manager"], escalateLevel: 3, sendSms: true },
    escalationLevel: 3,
    notificationChannels: ["email", "sms", "in_app"],
    isActive: true,
    createdByUserId: "demo-admin",
  },
];

// Escalation Triggers Demo Data (matching actual schema)
const demoEscalationTriggers = [
  {
    id: "trigger-1",
    ruleId: "esc-rule-1",
    name: "30-Minute SLA Breach Trigger",
    triggerType: "time_based",
    conditions: { maxAgeMinutes: 30, priority: "critical" },
    actions: [{ type: "notify_email", recipients: ["admin@nicehr.com"] }],
    cooldownMinutes: 60,
    maxTriggersPerHour: 5,
    isActive: true,
    lastTriggeredAt: new Date("2024-11-29T07:15:00Z"),
    triggerCount: 3,
  },
  {
    id: "trigger-2",
    ruleId: "esc-rule-2",
    name: "2-Hour Response Trigger",
    triggerType: "time_based",
    conditions: { maxAgeMinutes: 120, priority: "high" },
    actions: [{ type: "notify_email", recipients: ["pm@nicehr.com"] }],
    cooldownMinutes: 30,
    maxTriggersPerHour: 3,
    isActive: true,
    lastTriggeredAt: new Date("2024-11-28T14:00:00Z"),
    triggerCount: 7,
  },
  {
    id: "trigger-3",
    ruleId: "esc-rule-3",
    name: "EHR Critical Alert Trigger",
    triggerType: "sla_breach",
    conditions: { systemType: "ehr", status: "critical" },
    actions: [{ type: "notify_sms", recipients: ["+15551234567"] }, { type: "create_incident" }],
    cooldownMinutes: 15,
    maxTriggersPerHour: 10,
    isActive: true,
    lastTriggeredAt: new Date("2024-11-27T16:30:00Z"),
    triggerCount: 2,
  },
];

// Escalation Events Demo Data (matching actual schema)
const demoEscalationEvents = [
  {
    id: "esc-evt-1",
    triggerId: "trigger-1",
    triggerReason: "Critical ticket exceeded 30-minute SLA threshold",
    actionsTaken: [{ type: "email", status: "sent", recipient: "admin@nicehr.com" }],
    notificationsSent: { email: 2, sms: 1 },
    previousPriority: "high",
    newPriority: "critical",
    wasSuccessful: true,
    acknowledgedByUserId: "demo-admin",
    acknowledgedAt: new Date("2024-11-29T07:22:00Z"),
  },
  {
    id: "esc-evt-2",
    triggerId: "trigger-2",
    triggerReason: "High priority ticket response time exceeded 2 hours",
    actionsTaken: [{ type: "email", status: "sent", recipient: "pm@nicehr.com" }],
    notificationsSent: { email: 1 },
    wasSuccessful: true,
    acknowledgedByUserId: "demo-admin",
    acknowledgedAt: new Date("2024-11-28T14:45:00Z"),
  },
  {
    id: "esc-evt-3",
    triggerId: "trigger-3",
    triggerReason: "EHR system critical status detected for 5+ minutes",
    actionsTaken: [{ type: "sms", status: "sent" }, { type: "incident", status: "created" }],
    notificationsSent: { sms: 3, email: 2 },
    wasSuccessful: true,
    acknowledgedByUserId: "demo-admin",
    acknowledgedAt: new Date("2024-11-27T16:35:00Z"),
  },
];

// Automation Workflows Demo Data (matching actual schema)
const demoAutomationWorkflows = [
  {
    id: "auto-wf-1",
    name: "Ticket SLA Escalation Workflow",
    description: "Automatically escalate tickets when SLA is breached",
    category: "escalation",
    triggerEvent: "ticket_sla_warning",
    conditions: { priority: ["critical", "high"], timeRemaining: 15 },
    actions: [{ type: "notify_email", template: "sla_warning" }, { type: "assign_user", role: "supervisor" }],
    isActive: true,
    executionCount: 45,
    lastExecutedAt: new Date("2024-11-29T07:15:00Z"),
    createdByUserId: "demo-admin",
  },
  {
    id: "auto-wf-2",
    name: "Compliance Due Notification",
    description: "Notify managers when compliance items are due within 7 days",
    category: "compliance",
    triggerEvent: "compliance_due",
    conditions: { daysUntilDue: 7 },
    actions: [{ type: "notify_email", template: "compliance_reminder" }],
    isActive: true,
    executionCount: 128,
    lastExecutedAt: new Date("2024-11-28T09:00:00Z"),
    createdByUserId: "demo-admin",
  },
  {
    id: "auto-wf-3",
    name: "Daily Sync Workflow",
    description: "Automatically sync data with external systems daily",
    category: "data_sync",
    triggerEvent: "scheduled",
    conditions: { schedule: "0 2 * * *" },
    actions: [{ type: "sync_calendar" }, { type: "sync_payroll" }],
    isActive: true,
    executionCount: 89,
    lastExecutedAt: new Date("2024-11-29T02:00:00Z"),
    createdByUserId: "demo-admin",
  },
];

// Workflow Executions Demo Data (matching actual schema)
const demoWorkflowExecutions = [
  {
    id: "wf-exec-1",
    workflowId: "auto-wf-1",
    triggerData: { ticketId: "ticket-1", priority: "critical", timeRemaining: 10 },
    status: "completed",
    startedAt: new Date("2024-11-29T07:15:00Z"),
    completedAt: new Date("2024-11-29T07:15:05Z"),
    actionsExecuted: [{ action: "notify_email", status: "success" }, { action: "assign_user", status: "success" }],
    results: { emailsSent: 2, usersAssigned: 1 },
    triggeredByUserId: "demo-admin",
  },
  {
    id: "wf-exec-2",
    workflowId: "auto-wf-2",
    triggerData: { complianceItemId: "comp-1", daysUntilDue: 5 },
    status: "completed",
    startedAt: new Date("2024-11-28T09:00:00Z"),
    completedAt: new Date("2024-11-28T09:00:03Z"),
    actionsExecuted: [{ action: "notify_email", status: "success" }],
    results: { emailsSent: 3 },
    triggeredByUserId: "demo-admin",
  },
  {
    id: "wf-exec-3",
    workflowId: "auto-wf-3",
    triggerData: { scheduledTime: "2024-11-29T02:00:00Z" },
    status: "completed",
    startedAt: new Date("2024-11-29T02:00:00Z"),
    completedAt: new Date("2024-11-29T02:05:30Z"),
    actionsExecuted: [{ action: "sync_calendar", status: "success" }, { action: "sync_payroll", status: "success" }],
    results: { calendarEventsSync: 45, payrollRecordsSync: 22 },
    triggeredByUserId: "demo-admin",
  },
  {
    id: "wf-exec-4",
    workflowId: "auto-wf-1",
    triggerData: { ticketId: "ticket-2", priority: "high", timeRemaining: 12 },
    status: "failed",
    startedAt: new Date("2024-11-26T09:15:00Z"),
    completedAt: new Date("2024-11-26T09:15:02Z"),
    actionsExecuted: [{ action: "notify_email", status: "failed", error: "SMTP timeout" }],
    errorMessage: "Email delivery failed: SMTP connection timeout",
    triggeredByUserId: "demo-admin",
  },
];

// Phase 4 Advanced Analytics Demo Data

// Go-Live Readiness Snapshots - Weekly snapshots showing go-live readiness progression
const demoGoLiveReadinessSnapshots = [
  {
    id: "golive-snap-1",
    projectId: "project-1",
    snapshotDate: "2024-10-21",
    overallScore: "72.50",
    confidenceLevel: "78.00",
    indicators: {
      training: 68,
      documentation: 72,
      testing: 55,
      staffing: 85,
      riskMitigation: 62,
      systemIntegration: 70,
      dataValidation: 75,
    },
    riskFactors: [
      "Insufficient training coverage in ED module",
      "Integration testing incomplete for lab interfaces",
      "Documentation gaps in ICU workflows",
    ],
    recommendations: [
      "Schedule additional training sessions for ED staff",
      "Complete integration testing by week 3",
      "Assign technical writer to complete ICU documentation",
    ],
    calculatedByUserId: "demo-admin",
  },
  {
    id: "golive-snap-2",
    projectId: "project-1",
    snapshotDate: "2024-10-28",
    overallScore: "78.25",
    confidenceLevel: "82.00",
    indicators: {
      training: 75,
      documentation: 78,
      testing: 65,
      staffing: 88,
      riskMitigation: 70,
      systemIntegration: 78,
      dataValidation: 80,
    },
    riskFactors: [
      "Integration testing still in progress",
      "Minor documentation gaps remain",
    ],
    recommendations: [
      "Continue focused training for night shift staff",
      "Schedule go-live rehearsal for week 5",
    ],
    calculatedByUserId: "demo-admin",
  },
  {
    id: "golive-snap-3",
    projectId: "project-1",
    snapshotDate: "2024-11-04",
    overallScore: "84.75",
    confidenceLevel: "88.00",
    indicators: {
      training: 85,
      documentation: 85,
      testing: 78,
      staffing: 90,
      riskMitigation: 82,
      systemIntegration: 85,
      dataValidation: 88,
    },
    riskFactors: [
      "Final user acceptance testing pending",
    ],
    recommendations: [
      "Complete UAT by week 6",
      "Finalize contingency plans",
    ],
    calculatedByUserId: "demo-admin",
  },
  {
    id: "golive-snap-4",
    projectId: "project-2",
    snapshotDate: "2024-10-21",
    overallScore: "65.00",
    confidenceLevel: "72.00",
    indicators: {
      training: 58,
      documentation: 65,
      testing: 48,
      staffing: 78,
      riskMitigation: 55,
      systemIntegration: 68,
      dataValidation: 72,
    },
    riskFactors: [
      "PowerChart configuration behind schedule",
      "FirstNet upgrade testing incomplete",
      "Staff availability concerns during holiday period",
      "Vendor support response times slower than expected",
    ],
    recommendations: [
      "Accelerate PowerChart configuration work",
      "Request dedicated vendor support resources",
      "Schedule additional training sessions before holidays",
      "Develop detailed contingency plan",
    ],
    calculatedByUserId: "demo-admin",
  },
  {
    id: "golive-snap-5",
    projectId: "project-2",
    snapshotDate: "2024-11-04",
    overallScore: "75.50",
    confidenceLevel: "80.00",
    indicators: {
      training: 72,
      documentation: 75,
      testing: 68,
      staffing: 82,
      riskMitigation: 70,
      systemIntegration: 78,
      dataValidation: 80,
    },
    riskFactors: [
      "Some integration testing still pending",
      "Holiday staffing may impact timeline",
    ],
    recommendations: [
      "Complete remaining integration tests",
      "Confirm holiday coverage schedule",
    ],
    calculatedByUserId: "demo-admin",
  },
  {
    id: "golive-snap-6",
    projectId: "project-3",
    snapshotDate: "2024-11-11",
    overallScore: "88.25",
    confidenceLevel: "92.00",
    indicators: {
      training: 92,
      documentation: 88,
      testing: 85,
      staffing: 95,
      riskMitigation: 85,
      systemIntegration: 88,
      dataValidation: 90,
    },
    riskFactors: [
      "Minor Care Everywhere interface adjustments needed",
    ],
    recommendations: [
      "Complete final interface testing",
      "Schedule patient portal soft launch",
    ],
    calculatedByUserId: "demo-admin",
  },
  {
    id: "golive-snap-7",
    projectId: "project-3",
    snapshotDate: "2024-11-18",
    overallScore: "92.00",
    confidenceLevel: "95.00",
    indicators: {
      training: 95,
      documentation: 92,
      testing: 90,
      staffing: 95,
      riskMitigation: 90,
      systemIntegration: 92,
      dataValidation: 94,
    },
    riskFactors: [],
    recommendations: [
      "Proceed with go-live as planned",
      "Ensure 24/7 support coverage for first week",
    ],
    calculatedByUserId: "demo-admin",
  },
  {
    id: "golive-snap-8",
    projectId: "project-1",
    snapshotDate: "2024-11-25",
    overallScore: "89.50",
    confidenceLevel: "91.00",
    indicators: {
      training: 90,
      documentation: 90,
      testing: 85,
      staffing: 92,
      riskMitigation: 88,
      systemIntegration: 90,
      dataValidation: 92,
    },
    riskFactors: [
      "Minor testing gaps in edge cases",
    ],
    recommendations: [
      "Complete edge case testing",
      "Finalize go-live command center setup",
    ],
    calculatedByUserId: "demo-admin",
  },
];

// Consultant Utilization Snapshots - Weekly utilization tracking
const demoConsultantUtilizationSnapshots = [
  {
    id: "util-snap-1",
    projectId: null,
    periodStart: "2024-10-14",
    periodEnd: "2024-10-20",
    totalConsultants: 10,
    averageUtilization: "82.50",
    scheduledHours: "1800.00",
    actualHours: "1485.00",
    billableHours: "1420.00",
    utilizationByRole: {
      "Senior Consultant": 92,
      "Implementation Specialist": 85,
      "Trainer": 78,
      "Clinical Informaticist": 80,
      "Integration Architect": 88,
    },
    utilizationTrend: {
      week1: 78,
      week2: 80,
      week3: 82,
      week4: 85,
    },
  },
  {
    id: "util-snap-2",
    projectId: null,
    periodStart: "2024-10-21",
    periodEnd: "2024-10-27",
    totalConsultants: 11,
    averageUtilization: "85.25",
    scheduledHours: "1980.00",
    actualHours: "1686.00",
    billableHours: "1620.00",
    utilizationByRole: {
      "Senior Consultant": 94,
      "Implementation Specialist": 88,
      "Trainer": 80,
      "Clinical Informaticist": 82,
      "Integration Architect": 90,
    },
    utilizationTrend: {
      week1: 80,
      week2: 82,
      week3: 85,
      week4: 88,
    },
  },
  {
    id: "util-snap-3",
    projectId: "project-1",
    periodStart: "2024-10-28",
    periodEnd: "2024-11-03",
    totalConsultants: 6,
    averageUtilization: "88.75",
    scheduledHours: "1080.00",
    actualHours: "958.00",
    billableHours: "920.00",
    utilizationByRole: {
      "Senior Consultant": 95,
      "Implementation Specialist": 90,
      "Trainer": 82,
      "Clinical Informaticist": 88,
    },
    utilizationTrend: {
      week1: 85,
      week2: 87,
      week3: 88,
      week4: 90,
    },
  },
  {
    id: "util-snap-4",
    projectId: "project-2",
    periodStart: "2024-10-28",
    periodEnd: "2024-11-03",
    totalConsultants: 5,
    averageUtilization: "78.50",
    scheduledHours: "900.00",
    actualHours: "706.50",
    billableHours: "680.00",
    utilizationByRole: {
      "Senior Consultant": 88,
      "Implementation Specialist": 75,
      "Trainer": 72,
    },
    utilizationTrend: {
      week1: 72,
      week2: 75,
      week3: 78,
      week4: 80,
    },
  },
  {
    id: "util-snap-5",
    projectId: null,
    periodStart: "2024-11-04",
    periodEnd: "2024-11-10",
    totalConsultants: 12,
    averageUtilization: "91.25",
    scheduledHours: "2160.00",
    actualHours: "1971.00",
    billableHours: "1890.00",
    utilizationByRole: {
      "Senior Consultant": 96,
      "Implementation Specialist": 92,
      "Trainer": 88,
      "Clinical Informaticist": 90,
      "Integration Architect": 94,
    },
    utilizationTrend: {
      week1: 85,
      week2: 88,
      week3: 91,
      week4: 92,
    },
  },
  {
    id: "util-snap-6",
    projectId: null,
    periodStart: "2024-11-11",
    periodEnd: "2024-11-17",
    totalConsultants: 11,
    averageUtilization: "87.00",
    scheduledHours: "1980.00",
    actualHours: "1722.60",
    billableHours: "1650.00",
    utilizationByRole: {
      "Senior Consultant": 92,
      "Implementation Specialist": 88,
      "Trainer": 82,
      "Clinical Informaticist": 85,
      "Integration Architect": 90,
    },
    utilizationTrend: {
      week1: 88,
      week2: 91,
      week3: 87,
      week4: 85,
    },
  },
  {
    id: "util-snap-7",
    projectId: "project-3",
    periodStart: "2024-11-18",
    periodEnd: "2024-11-24",
    totalConsultants: 4,
    averageUtilization: "92.50",
    scheduledHours: "720.00",
    actualHours: "666.00",
    billableHours: "640.00",
    utilizationByRole: {
      "Senior Consultant": 95,
      "Implementation Specialist": 92,
      "Trainer": 90,
    },
    utilizationTrend: {
      week1: 88,
      week2: 90,
      week3: 92,
      week4: 94,
    },
  },
  {
    id: "util-snap-8",
    projectId: null,
    periodStart: "2024-11-18",
    periodEnd: "2024-11-24",
    totalConsultants: 10,
    averageUtilization: "68.50",
    scheduledHours: "1800.00",
    actualHours: "1233.00",
    billableHours: "1180.00",
    utilizationByRole: {
      "Senior Consultant": 78,
      "Implementation Specialist": 65,
      "Trainer": 60,
      "Clinical Informaticist": 70,
      "Integration Architect": 75,
    },
    utilizationTrend: {
      week1: 91,
      week2: 87,
      week3: 72,
      week4: 68,
    },
  },
];

// Timeline Forecast Snapshots - Project timeline predictions
const demoTimelineForecastSnapshots = [
  {
    id: "timeline-snap-1",
    projectId: "project-1",
    forecastDate: "2024-10-21",
    originalEndDate: "2025-06-30",
    predictedEndDate: "2025-07-15",
    confidenceLevel: "75.00",
    varianceDays: 15,
    riskDrivers: [
      "Resource constraints during holiday period",
      "Integration testing complexity higher than expected",
      "Staff availability challenges",
    ],
    scenarioAnalysis: {
      best: "2025-06-15",
      likely: "2025-07-15",
      worst: "2025-08-01",
    },
    assumptions: {
      avgTaskDuration: 5,
      resourceAvailability: 80,
      scopeStability: 85,
      vendorResponseTime: 3,
    },
    createdByUserId: "demo-admin",
  },
  {
    id: "timeline-snap-2",
    projectId: "project-1",
    forecastDate: "2024-11-04",
    originalEndDate: "2025-06-30",
    predictedEndDate: "2025-07-10",
    confidenceLevel: "80.00",
    varianceDays: 10,
    riskDrivers: [
      "Integration testing complexity",
      "Staff availability challenges",
    ],
    scenarioAnalysis: {
      best: "2025-06-25",
      likely: "2025-07-10",
      worst: "2025-07-25",
    },
    assumptions: {
      avgTaskDuration: 4.5,
      resourceAvailability: 85,
      scopeStability: 88,
      vendorResponseTime: 2,
    },
    createdByUserId: "demo-admin",
  },
  {
    id: "timeline-snap-3",
    projectId: "project-1",
    forecastDate: "2024-11-25",
    originalEndDate: "2025-06-30",
    predictedEndDate: "2025-06-30",
    confidenceLevel: "88.00",
    varianceDays: 0,
    riskDrivers: [],
    scenarioAnalysis: {
      best: "2025-06-20",
      likely: "2025-06-30",
      worst: "2025-07-10",
    },
    assumptions: {
      avgTaskDuration: 4,
      resourceAvailability: 90,
      scopeStability: 92,
      vendorResponseTime: 1,
    },
    createdByUserId: "demo-admin",
  },
  {
    id: "timeline-snap-4",
    projectId: "project-2",
    forecastDate: "2024-10-21",
    originalEndDate: "2025-04-15",
    predictedEndDate: "2025-05-15",
    confidenceLevel: "70.00",
    varianceDays: 30,
    riskDrivers: [
      "Scope changes from stakeholder feedback",
      "Technical challenges with FirstNet upgrade",
      "Vendor delays on critical patches",
      "Resource constraints",
    ],
    scenarioAnalysis: {
      best: "2025-04-15",
      likely: "2025-05-15",
      worst: "2025-06-15",
    },
    assumptions: {
      avgTaskDuration: 6,
      resourceAvailability: 75,
      scopeStability: 70,
      vendorResponseTime: 5,
    },
    createdByUserId: "demo-admin",
  },
  {
    id: "timeline-snap-5",
    projectId: "project-2",
    forecastDate: "2024-11-18",
    originalEndDate: "2025-04-15",
    predictedEndDate: "2025-05-01",
    confidenceLevel: "78.00",
    varianceDays: 16,
    riskDrivers: [
      "Scope changes partially addressed",
      "Vendor response improved",
    ],
    scenarioAnalysis: {
      best: "2025-04-20",
      likely: "2025-05-01",
      worst: "2025-05-20",
    },
    assumptions: {
      avgTaskDuration: 5,
      resourceAvailability: 82,
      scopeStability: 80,
      vendorResponseTime: 3,
    },
    createdByUserId: "demo-admin",
  },
  {
    id: "timeline-snap-6",
    projectId: "project-3",
    forecastDate: "2024-11-04",
    originalEndDate: "2025-03-31",
    predictedEndDate: "2025-03-20",
    confidenceLevel: "85.00",
    varianceDays: -11,
    riskDrivers: [],
    scenarioAnalysis: {
      best: "2025-03-10",
      likely: "2025-03-20",
      worst: "2025-03-31",
    },
    assumptions: {
      avgTaskDuration: 4,
      resourceAvailability: 92,
      scopeStability: 95,
      vendorResponseTime: 1,
    },
    createdByUserId: "demo-admin",
  },
  {
    id: "timeline-snap-7",
    projectId: "project-3",
    forecastDate: "2024-11-25",
    originalEndDate: "2025-03-31",
    predictedEndDate: "2025-03-15",
    confidenceLevel: "90.00",
    varianceDays: -16,
    riskDrivers: [],
    scenarioAnalysis: {
      best: "2025-03-01",
      likely: "2025-03-15",
      worst: "2025-03-25",
    },
    assumptions: {
      avgTaskDuration: 3.5,
      resourceAvailability: 95,
      scopeStability: 98,
      vendorResponseTime: 1,
    },
    createdByUserId: "demo-admin",
  },
  {
    id: "timeline-snap-8",
    projectId: "project-2",
    forecastDate: "2024-11-25",
    originalEndDate: "2025-04-15",
    predictedEndDate: "2025-04-25",
    confidenceLevel: "82.00",
    varianceDays: 10,
    riskDrivers: [
      "Minor scope adjustments pending approval",
    ],
    scenarioAnalysis: {
      best: "2025-04-15",
      likely: "2025-04-25",
      worst: "2025-05-10",
    },
    assumptions: {
      avgTaskDuration: 4.5,
      resourceAvailability: 85,
      scopeStability: 85,
      vendorResponseTime: 2,
    },
    createdByUserId: "demo-admin",
  },
];

// Cost Variance Snapshots - Budget vs actual tracking
const demoCostVarianceSnapshots = [
  {
    id: "cost-snap-1",
    projectId: "project-1",
    snapshotDate: "2024-10-21",
    budgetedAmount: "2500000.00",
    actualAmount: "680000.00",
    varianceAmount: "-1820000.00",
    variancePercentage: "-72.80",
    status: "on_track" as const,
    categoryBreakdown: {
      labor: 520000,
      travel: 85000,
      software: 45000,
      training: 25000,
      expenses: 5000,
    },
    forecastToComplete: "1750000.00",
    estimateAtCompletion: "2430000.00",
  },
  {
    id: "cost-snap-2",
    projectId: "project-1",
    snapshotDate: "2024-11-04",
    budgetedAmount: "2500000.00",
    actualAmount: "1050000.00",
    varianceAmount: "-1450000.00",
    variancePercentage: "-58.00",
    status: "on_track" as const,
    categoryBreakdown: {
      labor: 820000,
      travel: 125000,
      software: 65000,
      training: 32000,
      expenses: 8000,
    },
    forecastToComplete: "1380000.00",
    estimateAtCompletion: "2430000.00",
  },
  {
    id: "cost-snap-3",
    projectId: "project-1",
    snapshotDate: "2024-11-25",
    budgetedAmount: "2500000.00",
    actualAmount: "1650000.00",
    varianceAmount: "-850000.00",
    variancePercentage: "-34.00",
    status: "on_track" as const,
    categoryBreakdown: {
      labor: 1350000,
      travel: 165000,
      software: 85000,
      training: 40000,
      expenses: 10000,
    },
    forecastToComplete: "780000.00",
    estimateAtCompletion: "2430000.00",
  },
  {
    id: "cost-snap-4",
    projectId: "project-2",
    snapshotDate: "2024-10-21",
    budgetedAmount: "1800000.00",
    actualAmount: "520000.00",
    varianceAmount: "-1280000.00",
    variancePercentage: "-71.11",
    status: "at_risk" as const,
    categoryBreakdown: {
      labor: 420000,
      travel: 55000,
      software: 32000,
      training: 10000,
      expenses: 3000,
    },
    forecastToComplete: "1450000.00",
    estimateAtCompletion: "1970000.00",
  },
  {
    id: "cost-snap-5",
    projectId: "project-2",
    snapshotDate: "2024-11-18",
    budgetedAmount: "1800000.00",
    actualAmount: "1150000.00",
    varianceAmount: "-650000.00",
    variancePercentage: "-36.11",
    status: "at_risk" as const,
    categoryBreakdown: {
      labor: 940000,
      travel: 115000,
      software: 62000,
      training: 25000,
      expenses: 8000,
    },
    forecastToComplete: "750000.00",
    estimateAtCompletion: "1900000.00",
  },
  {
    id: "cost-snap-6",
    projectId: "project-3",
    snapshotDate: "2024-11-04",
    budgetedAmount: "950000.00",
    actualAmount: "380000.00",
    varianceAmount: "-570000.00",
    variancePercentage: "-60.00",
    status: "under_budget" as const,
    categoryBreakdown: {
      labor: 310000,
      travel: 42000,
      software: 18000,
      training: 8000,
      expenses: 2000,
    },
    forecastToComplete: "450000.00",
    estimateAtCompletion: "830000.00",
  },
  {
    id: "cost-snap-7",
    projectId: "project-3",
    snapshotDate: "2024-11-25",
    budgetedAmount: "950000.00",
    actualAmount: "680000.00",
    varianceAmount: "-270000.00",
    variancePercentage: "-28.42",
    status: "under_budget" as const,
    categoryBreakdown: {
      labor: 560000,
      travel: 72000,
      software: 28000,
      training: 15000,
      expenses: 5000,
    },
    forecastToComplete: "175000.00",
    estimateAtCompletion: "855000.00",
  },
  {
    id: "cost-snap-8",
    projectId: "project-2",
    snapshotDate: "2024-11-25",
    budgetedAmount: "1800000.00",
    actualAmount: "1420000.00",
    varianceAmount: "-380000.00",
    variancePercentage: "-21.11",
    status: "over_budget" as const,
    categoryBreakdown: {
      labor: 1180000,
      travel: 135000,
      software: 72000,
      training: 28000,
      expenses: 5000,
    },
    forecastToComplete: "480000.00",
    estimateAtCompletion: "1900000.00",
  },
];

// Seed function for Phase 4 Advanced Analytics data
async function seedPhase4AnalyticsData() {
  console.log("Seeding Phase 4 Advanced Analytics data...");

  try {
    console.log("  Seeding go-live readiness snapshots...");
    for (const snapshot of demoGoLiveReadinessSnapshots) {
      await db.insert(goLiveReadinessSnapshots).values(snapshot).onConflictDoNothing();
    }

    console.log("  Seeding consultant utilization snapshots...");
    for (const snapshot of demoConsultantUtilizationSnapshots) {
      await db.insert(consultantUtilizationSnapshots).values(snapshot).onConflictDoNothing();
    }

    console.log("  Seeding timeline forecast snapshots...");
    for (const snapshot of demoTimelineForecastSnapshots) {
      await db.insert(timelineForecastSnapshots).values(snapshot).onConflictDoNothing();
    }

    console.log("  Seeding cost variance snapshots...");
    for (const snapshot of demoCostVarianceSnapshots) {
      await db.insert(costVarianceSnapshots).values(snapshot).onConflictDoNothing();
    }

    console.log("Phase 4 Advanced Analytics data seeding completed!");
  } catch (error) {
    console.error("Error seeding Phase 4 Analytics data:", error);
    throw error;
  }
}

export async function seedDemoData() {
  console.log("Starting demo data seeding...");

  try {
    console.log("Seeding hospitals...");
    for (const hospital of demoHospitals) {
      await db.insert(hospitals).values(hospital).onConflictDoNothing();
    }

    console.log("Seeding hospital units...");
    for (const [hospitalId, units] of Object.entries(hospitalUnitsByHospital)) {
      for (const unit of units) {
        await db.insert(hospitalUnits).values({
          ...unit,
          hospitalId,
          isActive: true,
        }).onConflictDoNothing();
      }
    }

    console.log("Seeding hospital modules...");
    for (const [unitId, modules] of Object.entries(modulesByUnit)) {
      for (const mod of modules) {
        await db.insert(hospitalModules).values({
          ...mod,
          unitId,
          isActive: true,
        }).onConflictDoNothing();
      }
    }

    console.log("Seeding C-Suite staff...");
    for (const staff of cSuiteStaff) {
      await db.insert(users).values({
        id: staff.userId,
        email: staff.email,
        firstName: staff.firstName,
        lastName: staff.lastName,
        role: "hospital_staff",
        isActive: true,
        accessStatus: "active",
      }).onConflictDoNothing();

      await db.insert(hospitalStaff).values({
        id: staff.id,
        userId: staff.userId,
        hospitalId: staff.hospitalId,
        position: staff.position,
        department: staff.department,
      }).onConflictDoNothing();
    }

    console.log("Seeding consultants...");
    for (const consultant of demoConsultants) {
      await db.insert(users).values({
        id: consultant.userId,
        email: consultant.email,
        firstName: consultant.firstName,
        lastName: consultant.lastName,
        role: "consultant",
        isActive: true,
        accessStatus: "active",
      }).onConflictDoNothing();

      await db.insert(consultants).values({
        id: consultant.id,
        userId: consultant.userId,
        phone: consultant.phone,
        city: consultant.city,
        state: consultant.state,
        yearsExperience: consultant.yearsExperience,
        emrSystems: consultant.emrSystems,
        modules: consultant.modules,
        positions: consultant.positions,
        bio: consultant.bio,
        payRate: consultant.payRate,
        isOnboarded: consultant.isOnboarded,
        isAvailable: consultant.isAvailable,
      }).onConflictDoNothing();
    }

    console.log("Seeding document types...");
    for (const docType of demoDocumentTypes) {
      await db.insert(documentTypes).values(docType).onConflictDoNothing();
    }

    console.log("Seeding projects...");
    for (const project of demoProjects) {
      await db.insert(projects).values(project).onConflictDoNothing();
    }

    console.log("Seeding project phases...");
    for (const phase of projectPhaseData) {
      await db.insert(projectPhases).values(phase).onConflictDoNothing();
    }

    console.log("Seeding phase steps...");
    for (const step of demoPhaseSteps) {
      await db.insert(phaseSteps).values(step).onConflictDoNothing();
    }

    console.log("Seeding phase deliverables...");
    for (const deliverable of demoPhaseDeliverables) {
      await db.insert(phaseDeliverables).values(deliverable).onConflictDoNothing();
    }

    console.log("Seeding project risks...");
    for (const risk of demoProjectRisks) {
      await db.insert(projectRisks).values(risk).onConflictDoNothing();
    }

    console.log("Seeding project milestones...");
    for (const milestone of demoProjectMilestones) {
      await db.insert(projectMilestones).values(milestone).onConflictDoNothing();
    }

    console.log("Seeding RACI assignments...");
    for (const assignment of demoRaciAssignments) {
      await db.insert(raciAssignments).values(assignment).onConflictDoNothing();
    }

    console.log("Seeding training courses...");
    for (const course of demoCourses) {
      await db.insert(courses).values(course).onConflictDoNothing();
    }

    console.log("Seeding integration connections...");
    for (const conn of demoIntegrationConnections) {
      await db.insert(integrationConnections).values(conn).onConflictDoNothing();
    }

    console.log("Seeding sync jobs...");
    for (const job of demoSyncJobs) {
      await db.insert(syncJobs).values(job).onConflictDoNothing();
    }

    console.log("Seeding sync events...");
    for (const evt of demoSyncEvents) {
      await db.insert(syncEvents).values(evt).onConflictDoNothing();
    }

    console.log("Seeding EHR systems...");
    for (const sys of demoEhrSystems) {
      await db.insert(ehrSystems).values(sys).onConflictDoNothing();
    }

    console.log("Seeding EHR metrics...");
    for (const metric of demoEhrMetrics) {
      await db.insert(ehrStatusMetrics).values(metric).onConflictDoNothing();
    }

    console.log("Seeding EHR incidents...");
    for (const incident of demoEhrIncidents) {
      await db.insert(ehrIncidents).values(incident).onConflictDoNothing();
    }

    console.log("Seeding payroll profiles...");
    for (const profile of demoPayrollProfiles) {
      await db.insert(payrollSyncProfiles).values(profile).onConflictDoNothing();
    }

    console.log("Seeding payroll jobs...");
    for (const job of demoPayrollJobs) {
      await db.insert(payrollExportJobs).values(job).onConflictDoNothing();
    }

    console.log("Seeding escalation rules...");
    for (const rule of demoEscalationRules) {
      await db.insert(escalationRules).values(rule).onConflictDoNothing();
    }

    console.log("Seeding escalation triggers...");
    for (const trigger of demoEscalationTriggers) {
      await db.insert(escalationTriggers).values(trigger).onConflictDoNothing();
    }

    console.log("Seeding escalation events...");
    for (const evt of demoEscalationEvents) {
      await db.insert(escalationEvents).values(evt).onConflictDoNothing();
    }

    console.log("Seeding automation workflows...");
    for (const workflow of demoAutomationWorkflows) {
      await db.insert(automationWorkflows).values(workflow).onConflictDoNothing();
    }

    console.log("Seeding workflow executions...");
    for (const exec of demoWorkflowExecutions) {
      await db.insert(workflowExecutions).values(exec).onConflictDoNothing();
    }

    // Seed Phase 4 Advanced Analytics data
    await seedPhase4AnalyticsData();

    console.log("Demo data seeding completed successfully!");
    return { success: true };
  } catch (error) {
    console.error("Error seeding demo data:", error);
    throw error;
  }
}

const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  seedDemoData()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
