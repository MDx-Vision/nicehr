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

    console.log("Seeding training courses...");
    for (const course of demoCourses) {
      await db.insert(courses).values(course).onConflictDoNothing();
    }

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
