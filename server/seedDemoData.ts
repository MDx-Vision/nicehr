import { db } from "./db";
import bcrypt from "bcryptjs";
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
  userActivities,
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
  projectTeamAssignments,
  contracts,
  travelBookings,
  eodReports,
  invoices,
  invoiceLineItems,
  changeRequests,
  changeRequestImpacts,
  changeRequestApprovals,
  changeRequestComments,
  onboardingTemplates,
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
    // Organizational Info
    facilityType: "Acute Care",
    bedCount: 850,
    traumaLevel: "Level I",
    teachingStatus: "Academic Medical Center",
    ownershipType: "Non-profit",
    healthSystemAffiliation: "Mercy Health System",
    npiNumber: "1234567890",
    cmsNumber: "140001",
    // Technical/IT Info
    emrSystem: "Epic",
    currentEmrVersion: "Epic 2024",
    targetEmrSystem: null,
    dataCenter: "Hybrid",
    itStaffCount: 120,
    networkInfrastructure: "10Gbps fiber backbone, redundant WAN connections, Cisco infrastructure",
    // Implementation-Specific
    goLiveDate: new Date("2025-06-15"),
    implementationPhase: "Build",
    contractValue: "$2,500,000",
    primaryContactName: "Dr. James Wilson",
    primaryContactEmail: "jwilson@mercyregional.org",
    primaryContactPhone: "(312) 555-0105",
    executiveSponsor: "Sarah Mitchell, CEO",
    // Compliance
    jointCommissionAccredited: true,
    lastAuditDate: new Date("2024-09-15"),
    hipaaOfficerName: "Patricia Chen",
    hipaaOfficerEmail: "pchen@mercyregional.org",
    // General
    totalStaff: 2500,
    notes: "Primary Epic implementation site. Strong IT team with previous EMR experience.",
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
    // Organizational Info
    facilityType: "Acute Care",
    bedCount: 1200,
    traumaLevel: "Level II",
    teachingStatus: "Teaching Affiliate",
    ownershipType: "For-profit",
    healthSystemAffiliation: "HCA Healthcare",
    npiNumber: "2345678901",
    cmsNumber: "450002",
    // Technical/IT Info
    emrSystem: "Cerner",
    currentEmrVersion: "Cerner Millennium 2023",
    targetEmrSystem: "Epic",
    dataCenter: "Cloud",
    itStaffCount: 85,
    networkInfrastructure: "AWS-hosted, 5Gbps dedicated connections",
    // Implementation-Specific
    goLiveDate: new Date("2025-09-01"),
    implementationPhase: "Design",
    contractValue: "$4,200,000",
    primaryContactName: "Michael Torres",
    primaryContactEmail: "mtorres@stlukes.org",
    primaryContactPhone: "(713) 555-0210",
    executiveSponsor: "Robert Anderson, CFO",
    // Compliance
    jointCommissionAccredited: true,
    lastAuditDate: new Date("2024-06-20"),
    hipaaOfficerName: "Jennifer Adams",
    hipaaOfficerEmail: "jadams@stlukes.org",
    // General
    totalStaff: 3200,
    notes: "Migrating from Cerner to Epic. Large multi-facility implementation.",
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
    // Organizational Info
    facilityType: "Acute Care",
    bedCount: 650,
    traumaLevel: "Level III",
    teachingStatus: "Community Hospital",
    ownershipType: "Non-profit",
    healthSystemAffiliation: "Pacific Health Partners",
    npiNumber: "3456789012",
    cmsNumber: "500003",
    // Technical/IT Info
    emrSystem: "Epic",
    currentEmrVersion: "Epic 2023",
    targetEmrSystem: null,
    dataCenter: "On-premise",
    itStaffCount: 65,
    networkInfrastructure: "Upgraded to 10Gbps in 2024, new Cisco switches deployed",
    // Implementation-Specific
    goLiveDate: new Date("2024-11-15"),
    implementationPhase: "Optimization",
    contractValue: "$1,800,000",
    primaryContactName: "Linda Chen",
    primaryContactEmail: "lchen@pnwhealth.org",
    primaryContactPhone: "(206) 555-0315",
    executiveSponsor: "David Kim, CMO",
    // Compliance
    jointCommissionAccredited: true,
    lastAuditDate: new Date("2024-11-01"),
    hipaaOfficerName: "Marcus Johnson",
    hipaaOfficerEmail: "mjohnson@pnwhealth.org",
    // General
    totalStaff: 1800,
    notes: "Recent go-live, now in optimization phase. Focus on MyChart adoption.",
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
    shiftPreference: "day",
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
    shiftPreference: "swing",
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
    shiftPreference: "day",
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
    shiftPreference: "night",
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
    shiftPreference: "day",
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
    shiftPreference: "swing",
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
    shiftPreference: "day",
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
    shiftPreference: "day",
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
    shiftPreference: "day",
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
    shiftPreference: "night",
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
    shiftPreference: "day",
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
    shiftPreference: "swing",
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
    originalEndDate: "2025-05-31", // Originally planned 1 month earlier
    status: "active" as const,
    estimatedConsultants: 8,
    actualConsultants: 6,

    // Contract Details
    contractType: "Fixed Price",
    contractValue: "2850000.00", // What client pays
    billingRate: "175.00",
    paymentTerms: "Milestone-based",

    // Budget Breakdown
    laborBudget: "1800000.00",
    travelBudget: "280000.00",
    softwareBudget: "150000.00",
    trainingBudget: "120000.00",
    infrastructureBudget: "100000.00",
    contingencyBudget: "50000.00",

    // Actual Spend
    laborActual: "1350000.00",
    travelActual: "195000.00",
    softwareActual: "145000.00",
    trainingActual: "85000.00",
    infrastructureActual: "75000.00",
    contingencyActual: "0.00",

    // Totals
    estimatedBudget: "2500000.00",
    actualBudget: "1850000.00",

    // ROI & Savings
    baselineCost: "4200000.00", // What manual processes / old system would cost over 3 years
    projectedSavings: "1700000.00",
    actualSavings: "650000.00", // So far - project not complete
    roiPercentage: "185.00",
    paybackPeriodMonths: 14,

    // Savings Breakdown
    savingsLaborEfficiency: "280000.00", // 2 FTE reduction in data entry
    savingsErrorReduction: "150000.00", // Fewer medication errors, rework
    savingsRevenueCycle: "120000.00", // Faster claims processing
    savingsPatientThroughput: "75000.00", // Increased ED capacity
    savingsCompliance: "25000.00", // Avoided audit findings
    savingsOther: "0.00",
    savingsNotes: "Savings calculated based on pre-implementation baseline study. FTE reduction reflects reallocation of 2 chart abstractors to patient care roles. Revenue cycle improvement from 12% reduction in claim denials.",

    // Financial Status
    invoicedAmount: "2100000.00",
    paidAmount: "1900000.00",

    savings: "650000.00",
  },
  {
    id: "project-2",
    hospitalId: "hospital-2",
    name: "Cerner Millennium Optimization",
    description: "System-wide optimization of Cerner Millennium including FirstNet upgrade and PowerChart enhancements for improved clinical workflows.",
    startDate: "2024-10-15",
    endDate: "2025-04-15",
    originalEndDate: "2025-04-15", // On schedule
    status: "active" as const,
    estimatedConsultants: 6,
    actualConsultants: 5,

    // Contract Details
    contractType: "Time & Materials",
    contractValue: "2100000.00",
    billingRate: "165.00",
    paymentTerms: "Net 30",

    // Budget Breakdown
    laborBudget: "1350000.00",
    travelBudget: "180000.00",
    softwareBudget: "120000.00",
    trainingBudget: "80000.00",
    infrastructureBudget: "50000.00",
    contingencyBudget: "20000.00",

    // Actual Spend
    laborActual: "1050000.00",
    travelActual: "165000.00",
    softwareActual: "118000.00",
    trainingActual: "72000.00",
    infrastructureActual: "45000.00",
    contingencyActual: "0.00",

    // Totals
    estimatedBudget: "1800000.00",
    actualBudget: "1450000.00",

    // ROI & Savings
    baselineCost: "2800000.00",
    projectedSavings: "650000.00",
    actualSavings: "350000.00",
    roiPercentage: "156.00",
    paybackPeriodMonths: 18,

    // Savings Breakdown
    savingsLaborEfficiency: "145000.00",
    savingsErrorReduction: "85000.00",
    savingsRevenueCycle: "75000.00",
    savingsPatientThroughput: "35000.00",
    savingsCompliance: "10000.00",
    savingsOther: "0.00",
    savingsNotes: "Optimization project focused on workflow efficiency. FirstNet upgrade reduced ED documentation time by 23%. PowerChart enhancements improved order entry speed by 18%.",

    // Financial Status
    invoicedAmount: "1550000.00",
    paidAmount: "1400000.00",

    savings: "350000.00",
  },
  {
    id: "project-3",
    hospitalId: "hospital-3",
    name: "Epic MyChart Patient Portal Launch",
    description: "Implementation and launch of MyChart patient portal with Care Everywhere integration for improved patient engagement and health information exchange.",
    startDate: "2024-12-01",
    endDate: "2025-03-31",
    originalEndDate: "2025-03-31",
    status: "active" as const,
    estimatedConsultants: 4,
    actualConsultants: 4,

    // Contract Details
    contractType: "Fixed Price",
    contractValue: "1100000.00",
    billingRate: "155.00",
    paymentTerms: "50% upfront, 50% at go-live",

    // Budget Breakdown
    laborBudget: "680000.00",
    travelBudget: "95000.00",
    softwareBudget: "85000.00",
    trainingBudget: "55000.00",
    infrastructureBudget: "25000.00",
    contingencyBudget: "10000.00",

    // Actual Spend
    laborActual: "625000.00",
    travelActual: "88000.00",
    softwareActual: "82000.00",
    trainingActual: "50000.00",
    infrastructureActual: "22000.00",
    contingencyActual: "8000.00",

    // Totals
    estimatedBudget: "950000.00",
    actualBudget: "875000.00",

    // ROI & Savings
    baselineCost: "1400000.00", // Baseline: call center costs, manual appointment scheduling, paper statements
    projectedSavings: "525000.00",
    actualSavings: "75000.00", // Early in project
    roiPercentage: "147.00",
    paybackPeriodMonths: 22,

    // Savings Breakdown - MyChart specific
    savingsLaborEfficiency: "32000.00", // Reduced call center volume - 15% decrease
    savingsErrorReduction: "8000.00", // Fewer scheduling errors
    savingsRevenueCycle: "18000.00", // Online bill pay, faster collections
    savingsPatientThroughput: "12000.00", // Self-scheduling reduces no-shows by 8%
    savingsCompliance: "5000.00", // Better patient communication documentation
    savingsOther: "0.00",
    savingsNotes: "ROI based on projected 40% patient adoption rate within 6 months. Call center volume expected to decrease 15% based on peer hospital benchmarks. Self-scheduling projected to reduce no-show rate from 12% to 4%.",

    // Financial Status
    invoicedAmount: "550000.00", // 50% upfront
    paidAmount: "550000.00",

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
  {
    id: "project-5",
    hospitalId: "hospital-2",
    name: "Radiology PACS Integration - Phase 1",
    description: "Completed integration of radiology PACS system with Cerner for seamless image viewing and diagnostic workflow.",
    startDate: "2024-03-01",
    endDate: "2024-09-30",
    status: "completed" as const,
    estimatedConsultants: 4,
    actualConsultants: 4,
    estimatedBudget: "650000.00",
    actualBudget: "625000.00",
    savings: "180000.00",
  },
];

const projectPhaseData = [
  // Project 1 - Full 11-Phase Implementation
  {
    id: "phase-1-1",
    projectId: "project-1",
    phaseName: "Discovery & Planning",
    phaseNumber: 1,
    description: "Initial assessment, workflow analysis, and project planning. Establish governance and define scope.",
    plannedStartDate: "2024-09-01",
    plannedEndDate: "2024-10-15",
    actualStartDate: "2024-09-01",
    actualEndDate: "2024-10-15",
    status: "completed" as const,
    completionPercentage: 100,
  },
  {
    id: "phase-1-2",
    projectId: "project-1",
    phaseName: "Design & Validation",
    phaseNumber: 2,
    description: "Future state workflow design, system design validation, and integration architecture planning.",
    plannedStartDate: "2024-10-16",
    plannedEndDate: "2024-11-30",
    actualStartDate: "2024-10-16",
    actualEndDate: "2024-11-30",
    status: "completed" as const,
    completionPercentage: 100,
  },
  {
    id: "phase-1-3",
    projectId: "project-1",
    phaseName: "Build & Configuration",
    phaseNumber: 3,
    description: "System build, configuration, and integration setup. Build environments and configure modules.",
    plannedStartDate: "2024-12-01",
    plannedEndDate: "2025-02-28",
    actualStartDate: "2024-12-01",
    status: "in_progress" as const,
    completionPercentage: 75,
  },
  {
    id: "phase-1-4",
    projectId: "project-1",
    phaseName: "Testing & Validation",
    phaseNumber: 4,
    description: "Comprehensive testing including unit, integration, and user acceptance testing.",
    plannedStartDate: "2025-03-01",
    plannedEndDate: "2025-04-15",
    status: "not_started" as const,
    completionPercentage: 0,
  },
  {
    id: "phase-1-5",
    projectId: "project-1",
    phaseName: "Training & Education",
    phaseNumber: 5,
    description: "End-user training, super user certification, and training material development.",
    plannedStartDate: "2025-04-01",
    plannedEndDate: "2025-05-15",
    status: "not_started" as const,
    completionPercentage: 0,
  },
  {
    id: "phase-1-6",
    projectId: "project-1",
    phaseName: "Go-Live Readiness",
    phaseNumber: 6,
    description: "Final readiness assessment, dress rehearsals, and cutover planning.",
    plannedStartDate: "2025-05-01",
    plannedEndDate: "2025-05-31",
    status: "not_started" as const,
    completionPercentage: 0,
  },
  {
    id: "phase-1-7",
    projectId: "project-1",
    phaseName: "Go-Live / Cutover",
    phaseNumber: 7,
    description: "System cutover execution, at-the-elbow support, and command center operations.",
    plannedStartDate: "2025-06-01",
    plannedEndDate: "2025-06-07",
    status: "not_started" as const,
    completionPercentage: 0,
  },
  {
    id: "phase-1-8",
    projectId: "project-1",
    phaseName: "Stabilization",
    phaseNumber: 8,
    description: "Post go-live stabilization, issue resolution, and workflow refinement.",
    plannedStartDate: "2025-06-08",
    plannedEndDate: "2025-07-31",
    status: "not_started" as const,
    completionPercentage: 0,
  },
  {
    id: "phase-1-9",
    projectId: "project-1",
    phaseName: "Optimization",
    phaseNumber: 9,
    description: "System optimization, workflow improvements, and efficiency gains.",
    plannedStartDate: "2025-08-01",
    plannedEndDate: "2025-09-30",
    status: "not_started" as const,
    completionPercentage: 0,
  },
  {
    id: "phase-1-10",
    projectId: "project-1",
    phaseName: "Sustainment",
    phaseNumber: 10,
    description: "Knowledge transfer, ongoing support transition, and maintenance planning.",
    plannedStartDate: "2025-10-01",
    plannedEndDate: "2025-11-30",
    status: "not_started" as const,
    completionPercentage: 0,
  },
  {
    id: "phase-1-11",
    projectId: "project-1",
    phaseName: "Continuous Improvement",
    phaseNumber: 11,
    description: "Ongoing enhancement identification, metrics monitoring, and iterative improvements.",
    plannedStartDate: "2025-12-01",
    plannedEndDate: "2026-02-28",
    status: "not_started" as const,
    completionPercentage: 0,
  },
  // Project 2 - Optimization Project (6 Phases)
  {
    id: "phase-2-1",
    projectId: "project-2",
    phaseName: "Assessment Phase",
    phaseNumber: 1,
    description: "Current state analysis and optimization opportunities identification.",
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
    phaseName: "Design & Planning",
    phaseNumber: 2,
    description: "Optimization design, workflow redesign, and implementation planning.",
    plannedStartDate: "2024-12-01",
    plannedEndDate: "2024-12-31",
    actualStartDate: "2024-12-01",
    actualEndDate: "2024-12-31",
    status: "completed" as const,
    completionPercentage: 100,
  },
  {
    id: "phase-2-3",
    projectId: "project-2",
    phaseName: "Optimization Build",
    phaseNumber: 3,
    description: "Implementing optimization changes and enhancements.",
    plannedStartDate: "2025-01-01",
    plannedEndDate: "2025-02-28",
    actualStartDate: "2025-01-01",
    status: "in_progress" as const,
    completionPercentage: 60,
  },
  {
    id: "phase-2-4",
    projectId: "project-2",
    phaseName: "Testing & Validation",
    phaseNumber: 4,
    description: "Testing optimizations and validating improvements.",
    plannedStartDate: "2025-03-01",
    plannedEndDate: "2025-03-31",
    status: "not_started" as const,
    completionPercentage: 0,
  },
  {
    id: "phase-2-5",
    projectId: "project-2",
    phaseName: "Deployment",
    phaseNumber: 5,
    description: "Rolling out optimizations to production environment.",
    plannedStartDate: "2025-04-01",
    plannedEndDate: "2025-04-15",
    status: "not_started" as const,
    completionPercentage: 0,
  },
  {
    id: "phase-2-6",
    projectId: "project-2",
    phaseName: "Benefits Realization",
    phaseNumber: 6,
    description: "Measuring optimization benefits and documenting improvements.",
    plannedStartDate: "2025-04-16",
    plannedEndDate: "2025-05-31",
    status: "not_started" as const,
    completionPercentage: 0,
  },
  // Project 3 - New Implementation (11 Phases)
  {
    id: "phase-3-1",
    projectId: "project-3",
    phaseName: "Discovery & Planning",
    phaseNumber: 1,
    description: "Initial assessment and project kickoff for new implementation.",
    plannedStartDate: "2025-01-15",
    plannedEndDate: "2025-02-28",
    status: "not_started" as const,
    completionPercentage: 0,
  },
  {
    id: "phase-3-2",
    projectId: "project-3",
    phaseName: "Design & Validation",
    phaseNumber: 2,
    description: "Future state design and workflow validation.",
    plannedStartDate: "2025-03-01",
    plannedEndDate: "2025-04-30",
    status: "not_started" as const,
    completionPercentage: 0,
  },
  {
    id: "phase-3-3",
    projectId: "project-3",
    phaseName: "Build & Configuration",
    phaseNumber: 3,
    description: "System build and configuration.",
    plannedStartDate: "2025-05-01",
    plannedEndDate: "2025-08-31",
    status: "not_started" as const,
    completionPercentage: 0,
  },
  {
    id: "phase-3-4",
    projectId: "project-3",
    phaseName: "Testing & Validation",
    phaseNumber: 4,
    description: "Comprehensive system testing.",
    plannedStartDate: "2025-09-01",
    plannedEndDate: "2025-10-31",
    status: "not_started" as const,
    completionPercentage: 0,
  },
  {
    id: "phase-3-5",
    projectId: "project-3",
    phaseName: "Training & Education",
    phaseNumber: 5,
    description: "End-user and super user training.",
    plannedStartDate: "2025-10-01",
    plannedEndDate: "2025-11-30",
    status: "not_started" as const,
    completionPercentage: 0,
  },
  {
    id: "phase-3-6",
    projectId: "project-3",
    phaseName: "Go-Live Readiness",
    phaseNumber: 6,
    description: "Final readiness and cutover planning.",
    plannedStartDate: "2025-11-15",
    plannedEndDate: "2025-12-15",
    status: "not_started" as const,
    completionPercentage: 0,
  },
  {
    id: "phase-3-7",
    projectId: "project-3",
    phaseName: "Go-Live / Cutover",
    phaseNumber: 7,
    description: "System go-live execution.",
    plannedStartDate: "2026-01-05",
    plannedEndDate: "2026-01-12",
    status: "not_started" as const,
    completionPercentage: 0,
  },
  {
    id: "phase-3-8",
    projectId: "project-3",
    phaseName: "Stabilization",
    phaseNumber: 8,
    description: "Post go-live stabilization.",
    plannedStartDate: "2026-01-13",
    plannedEndDate: "2026-03-31",
    status: "not_started" as const,
    completionPercentage: 0,
  },
  {
    id: "phase-3-9",
    projectId: "project-3",
    phaseName: "Optimization",
    phaseNumber: 9,
    description: "System optimization.",
    plannedStartDate: "2026-04-01",
    plannedEndDate: "2026-05-31",
    status: "not_started" as const,
    completionPercentage: 0,
  },
  {
    id: "phase-3-10",
    projectId: "project-3",
    phaseName: "Sustainment",
    phaseNumber: 10,
    description: "Knowledge transfer and support transition.",
    plannedStartDate: "2026-06-01",
    plannedEndDate: "2026-07-31",
    status: "not_started" as const,
    completionPercentage: 0,
  },
  {
    id: "phase-3-11",
    projectId: "project-3",
    phaseName: "Continuous Improvement",
    phaseNumber: 11,
    description: "Ongoing improvements and enhancements.",
    plannedStartDate: "2026-08-01",
    plannedEndDate: "2026-10-31",
    status: "not_started" as const,
    completionPercentage: 0,
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

// Project Team Assignments - Team members assigned to projects
const demoProjectTeamAssignments = [
  // Project 1 team
  { id: "team-1-1", projectId: "project-1", userId: "user-c1", customRoleName: "Project Lead", isPrimary: true },
  { id: "team-1-2", projectId: "project-1", userId: "user-c2", customRoleName: "Clinical Analyst", isPrimary: false },
  { id: "team-1-3", projectId: "project-1", userId: "user-c3", customRoleName: "Technical Lead", isPrimary: false },
  { id: "team-1-4", projectId: "project-1", userId: "user-c4", customRoleName: "Training Coordinator", isPrimary: false },
  { id: "team-1-5", projectId: "project-1", userId: "user-c5", customRoleName: "Integration Specialist", isPrimary: false },
  { id: "team-1-6", projectId: "project-1", userId: "user-c6", customRoleName: "Data Migration Lead", isPrimary: false },
  // Project 2 team
  { id: "team-2-1", projectId: "project-2", userId: "user-c2", customRoleName: "Optimization Lead", isPrimary: true },
  { id: "team-2-2", projectId: "project-2", userId: "user-c1", customRoleName: "Executive Sponsor", isPrimary: false },
  { id: "team-2-3", projectId: "project-2", userId: "user-c5", customRoleName: "Workflow Analyst", isPrimary: false },
  { id: "team-2-4", projectId: "project-2", userId: "user-c3", customRoleName: "Technical Support", isPrimary: false },
  // Project 3 team
  { id: "team-3-1", projectId: "project-3", userId: "user-c4", customRoleName: "Project Manager", isPrimary: true },
  { id: "team-3-2", projectId: "project-3", userId: "user-c6", customRoleName: "Clinical SME", isPrimary: false },
  { id: "team-3-3", projectId: "project-3", userId: "user-c7", customRoleName: "Patient Portal Specialist", isPrimary: false },
  { id: "team-3-4", projectId: "project-3", userId: "user-c8", customRoleName: "Integration Engineer", isPrimary: false },
];

const demoDocumentTypes = [
  // Professional Documents
  { id: "doctype-1", name: "Resume/CV", description: "Professional resume or curriculum vitae", isRequired: true, hasExpiration: false, category: "Professional" },
  { id: "doctype-2", name: "RN License", description: "Registered Nurse license", isRequired: false, hasExpiration: true, expirationMonths: 24, category: "License" },
  { id: "doctype-3", name: "Epic Certification", description: "Epic Systems certification badge", isRequired: false, hasExpiration: true, expirationMonths: 36, category: "Certification" },
  { id: "doctype-4", name: "Cerner Certification", description: "Cerner certification credential", isRequired: false, hasExpiration: true, expirationMonths: 36, category: "Certification" },

  // Compliance Documents
  { id: "doctype-5", name: "Background Check", description: "Criminal background check clearance", isRequired: true, hasExpiration: true, expirationMonths: 12, category: "Compliance" },
  { id: "doctype-6", name: "Drug Screen", description: "Drug screening results", isRequired: true, hasExpiration: true, expirationMonths: 12, category: "Compliance" },
  { id: "doctype-7", name: "HIPAA Training", description: "HIPAA compliance training certificate", isRequired: true, hasExpiration: true, expirationMonths: 12, category: "Training" },
  { id: "doctype-9", name: "Proof of Insurance", description: "Professional liability insurance", isRequired: true, hasExpiration: true, expirationMonths: 12, category: "Insurance" },

  // Tax Documents
  { id: "doctype-8", name: "W-9 Form", description: "Tax identification form", isRequired: true, hasExpiration: false, category: "Tax" },

  // Legal Documents
  { id: "doctype-10", name: "NDA Agreement", description: "Non-disclosure agreement", isRequired: true, hasExpiration: false, category: "Legal" },
  { id: "doctype-11", name: "Employment Agreement", description: "Consultant employment agreement", isRequired: true, hasExpiration: false, category: "Legal" },
  { id: "doctype-12", name: "Employment Contract", description: "Consultant contractor agreement", isRequired: false, hasExpiration: false, category: "Legal" },

  // TNG Onboarding Forms
  { id: "doctype-13", name: "Employment Application", description: "TNG employment application form", isRequired: true, hasExpiration: false, category: "Onboarding" },
  { id: "doctype-14", name: "Direct Deposit Authorization", description: "Bank account information for payroll", isRequired: true, hasExpiration: false, category: "Onboarding" },
  { id: "doctype-15", name: "Emergency Contact Form", description: "Emergency contact information", isRequired: true, hasExpiration: false, category: "Onboarding" },
  { id: "doctype-16", name: "Photo/Media Release", description: "Authorization for photo and media use", isRequired: false, hasExpiration: false, category: "Onboarding" },
  { id: "doctype-17", name: "Professional References", description: "Three professional references", isRequired: true, hasExpiration: false, category: "Onboarding" },
  { id: "doctype-18", name: "Professional Headshot", description: "Current professional photo for badges", isRequired: true, hasExpiration: true, expirationMonths: 12, category: "Onboarding" },

  // Policy Acknowledgments
  { id: "doctype-19", name: "Employee Handbook Acknowledgment", description: "Signed acknowledgment of employee handbook", isRequired: true, hasExpiration: false, category: "Policy" },
  { id: "doctype-20", name: "Code of Conduct Acknowledgment", description: "Signed acknowledgment of code of conduct", isRequired: true, hasExpiration: false, category: "Policy" },
  { id: "doctype-21", name: "IT Systems Agreement", description: "Acceptable use policy for IT systems", isRequired: true, hasExpiration: false, category: "Policy" },

  // I-9 Identity Documents
  { id: "doctype-22", name: "I-9 List A Document", description: "Identity and work authorization (passport, green card)", isRequired: false, hasExpiration: true, expirationMonths: 120, category: "Identity" },
  { id: "doctype-23", name: "I-9 List B Document", description: "Identity document (driver's license, state ID)", isRequired: false, hasExpiration: true, expirationMonths: 48, category: "Identity" },
  { id: "doctype-24", name: "I-9 List C Document", description: "Work authorization (social security card, birth certificate)", isRequired: false, hasExpiration: false, category: "Identity" },

  // Immunization Documents - Vaccines
  { id: "doctype-25", name: "Hepatitis B Vaccine", description: "Hepatitis B vaccination series (3 doses) or titer", isRequired: true, hasExpiration: false, category: "Immunization" },
  { id: "doctype-26", name: "MMR Vaccine", description: "Measles, Mumps, Rubella vaccination (2 doses) or titer", isRequired: true, hasExpiration: false, category: "Immunization" },
  { id: "doctype-27", name: "Varicella Vaccine", description: "Chickenpox vaccination (2 doses) or titer", isRequired: true, hasExpiration: false, category: "Immunization" },
  { id: "doctype-28", name: "Tdap Vaccine", description: "Tetanus, Diphtheria, Pertussis booster", isRequired: true, hasExpiration: true, expirationMonths: 120, category: "Immunization" },
  { id: "doctype-29", name: "Influenza Vaccine", description: "Annual flu vaccination", isRequired: true, hasExpiration: true, expirationMonths: 12, category: "Immunization" },
  { id: "doctype-30", name: "COVID-19 Vaccine", description: "COVID-19 vaccination record with boosters", isRequired: false, hasExpiration: false, category: "Immunization" },

  // TB Screening
  { id: "doctype-31", name: "TB Test - PPD/TST", description: "Tuberculosis skin test (2-step)", isRequired: false, hasExpiration: true, expirationMonths: 12, category: "Immunization" },
  { id: "doctype-32", name: "TB Test - QuantiFERON", description: "TB blood test (IGRA)", isRequired: false, hasExpiration: true, expirationMonths: 12, category: "Immunization" },
  { id: "doctype-33", name: "TB Chest X-Ray", description: "Chest X-ray for positive TB history", isRequired: false, hasExpiration: true, expirationMonths: 12, category: "Immunization" },

  // Immunization Tracking Forms
  { id: "doctype-34", name: "Immunization Record", description: "Complete immunization history form", isRequired: true, hasExpiration: false, category: "Immunization" },
  { id: "doctype-35", name: "Titer Results", description: "Blood test immunity verification", isRequired: false, hasExpiration: false, category: "Immunization" },

  // Declination Forms
  { id: "doctype-36", name: "Flu Vaccine Declination", description: "Influenza vaccine declination form", isRequired: false, hasExpiration: true, expirationMonths: 12, category: "Declination" },
  { id: "doctype-37", name: "Hepatitis B Declination", description: "Hepatitis B vaccine declination form", isRequired: false, hasExpiration: false, category: "Declination" },
  { id: "doctype-38", name: "COVID-19 Declination", description: "COVID-19 vaccine declination form", isRequired: false, hasExpiration: false, category: "Declination" },

  // Background/Screening Authorizations
  { id: "doctype-39", name: "Background Check Authorization", description: "Authorization for criminal background check", isRequired: true, hasExpiration: false, category: "Authorization" },
  { id: "doctype-40", name: "Drug Screening Consent", description: "Consent for drug and alcohol testing", isRequired: true, hasExpiration: false, category: "Authorization" },
];

// Onboarding Templates - Standard tasks for new consultant onboarding organized by phase
// Task types: form_fill (fill out on-site form), e_sign (review & sign), document_upload (upload external file)
const demoOnboardingTemplates = [
  // Phase 1: Personal Information (Due Day 1)
  { id: "template-1", documentTypeId: "doctype-13", taskType: "form_fill", title: "Employment Application", description: "Complete and submit TNG employment application", phase: 1, phaseName: "Personal Information", orderIndex: 1, isRequired: true, dueDays: 1, instructions: "Fill out all sections completely. Use your legal name as it appears on your ID.", formUrl: "/docs/business/TNG_EMPLOYMENT_APPLICATION.html" },
  { id: "template-2", documentTypeId: "doctype-15", taskType: "form_fill", title: "Emergency Contact Form", description: "Provide emergency contact information", phase: 1, phaseName: "Personal Information", orderIndex: 2, isRequired: true, dueDays: 1, instructions: "List at least two emergency contacts with current phone numbers.", formUrl: "/docs/business/TNG_EMERGENCY_CONTACT_FORM.html" },
  { id: "template-3", documentTypeId: "doctype-14", taskType: "form_fill", title: "Direct Deposit Authorization", description: "Set up direct deposit for payroll", phase: 1, phaseName: "Personal Information", orderIndex: 3, isRequired: true, dueDays: 1, instructions: "Enter your bank account and routing numbers for payroll deposits.", formUrl: "/docs/business/TNG_DIRECT_DEPOSIT_FORM.html" },
  { id: "template-4", documentTypeId: "doctype-8", taskType: "form_fill", title: "W-4 Tax Withholding (Employees)", description: "Complete W-4 for federal tax withholding", phase: 1, phaseName: "Personal Information", orderIndex: 4, isRequired: true, dueDays: 1, instructions: "Required for W-2 employees. Complete all sections including filing status and dependents.", formUrl: "/docs/business/TNG_W4_FORM.html" },
  { id: "template-4b", documentTypeId: "doctype-8", taskType: "form_fill", title: "W-9 Tax Form (Contractors)", description: "Complete W-9 for 1099 contractors", phase: 1, phaseName: "Personal Information", orderIndex: 5, isRequired: false, dueDays: 1, instructions: "Required for 1099 independent contractors only. Complete all fields including your SSN or EIN.", formUrl: "/docs/business/TNG_W9_INSTRUCTIONS.html" },
  { id: "template-5", documentTypeId: "doctype-18", taskType: "document_upload", title: "Professional Headshot", description: "Upload current professional photo", phase: 1, phaseName: "Personal Information", orderIndex: 6, isRequired: true, dueDays: 1, instructions: "Submit a high-resolution professional photo for your ID badge. Business attire preferred." },
  { id: "template-6", documentTypeId: "doctype-22", taskType: "document_upload", title: "I-9 Identity Document (List A)", description: "Passport, Green Card, or equivalent document", phase: 1, phaseName: "Personal Information", orderIndex: 6, isRequired: false, dueDays: 1, instructions: "Upload a clear copy of your passport or other List A document. Must be unexpired." },
  { id: "template-7", documentTypeId: "doctype-23", taskType: "document_upload", title: "I-9 Identity Document (List B)", description: "Driver's license or state ID", phase: 1, phaseName: "Personal Information", orderIndex: 7, isRequired: false, dueDays: 1, instructions: "If not using List A, upload a clear copy of your driver's license or state ID." },
  { id: "template-8", documentTypeId: "doctype-24", taskType: "document_upload", title: "I-9 Work Authorization (List C)", description: "Social Security card or birth certificate", phase: 1, phaseName: "Personal Information", orderIndex: 8, isRequired: false, dueDays: 1, instructions: "If using List B, also upload your Social Security card or birth certificate." },

  // Phase 2: Legal Agreements (Due Day 3) - e_sign docs with formUrl to view the document
  { id: "template-9", documentTypeId: "doctype-11", taskType: "e_sign", title: "Employment Agreement", description: "Review and sign employment agreement", phase: 2, phaseName: "Legal Agreements", orderIndex: 1, isRequired: true, dueDays: 3, instructions: "Read the agreement carefully before signing. Contact HR with any questions.", formUrl: "/docs/business/TNG_EMPLOYMENT_AGREEMENT.html" },
  { id: "template-10", documentTypeId: "doctype-10", taskType: "e_sign", title: "Non-Disclosure Agreement", description: "Sign confidentiality agreement", phase: 2, phaseName: "Legal Agreements", orderIndex: 2, isRequired: true, dueDays: 3, instructions: "This NDA protects client and company confidential information.", formUrl: "/docs/business/TNG_NDA_AGREEMENT.html" },
  { id: "template-11", documentTypeId: "doctype-19", taskType: "e_sign", title: "Employee Handbook Acknowledgment", description: "Review and acknowledge employee handbook", phase: 2, phaseName: "Legal Agreements", orderIndex: 3, isRequired: true, dueDays: 3, instructions: "Read the complete handbook before signing. Keep a copy for your records.", formUrl: "/docs/business/TNG_EMPLOYEE_HANDBOOK.html" },
  { id: "template-12", documentTypeId: "doctype-20", taskType: "e_sign", title: "Code of Conduct", description: "Review and sign code of conduct", phase: 2, phaseName: "Legal Agreements", orderIndex: 4, isRequired: true, dueDays: 3, instructions: "Our code of conduct outlines expected professional behavior.", formUrl: "/docs/business/TNG_CODE_OF_CONDUCT.html" },
  { id: "template-13", documentTypeId: "doctype-21", taskType: "e_sign", title: "IT Systems Agreement", description: "Sign IT acceptable use policy", phase: 2, phaseName: "Legal Agreements", orderIndex: 5, isRequired: true, dueDays: 3, instructions: "Covers proper use of company IT systems and devices.", formUrl: "/docs/business/TNG_IT_SYSTEMS_AGREEMENT.html" },
  { id: "template-14", documentTypeId: "doctype-16", taskType: "e_sign", title: "Photo/Media Release", description: "Authorize use of photo and media", phase: 2, phaseName: "Legal Agreements", orderIndex: 6, isRequired: false, dueDays: 3, instructions: "Optional: allows use of your image for company materials.", formUrl: "/docs/business/TNG_PHOTO_MEDIA_RELEASE.html" },

  // Phase 3: Background & Compliance (Due Day 7)
  { id: "template-15", documentTypeId: "doctype-39", taskType: "e_sign", title: "Background Check Authorization", description: "Authorize criminal background check", phase: 3, phaseName: "Background & Compliance", orderIndex: 1, isRequired: true, dueDays: 7, instructions: "Authorization for third-party background verification. Required for hospital access.", formUrl: "/docs/business/TNG_BACKGROUND_CHECK_AUTHORIZATION.html" },
  { id: "template-16", documentTypeId: "doctype-40", taskType: "e_sign", title: "Drug Screening Consent", description: "Consent to pre-employment drug test", phase: 3, phaseName: "Background & Compliance", orderIndex: 2, isRequired: true, dueDays: 7, instructions: "Drug screening is required per hospital facility requirements.", formUrl: "/docs/business/TNG_DRUG_SCREENING_CONSENT.html" },
  { id: "template-17", documentTypeId: "doctype-7", taskType: "document_upload", title: "HIPAA Training Certificate", description: "Complete HIPAA training and upload certificate", phase: 3, phaseName: "Background & Compliance", orderIndex: 3, isRequired: true, dueDays: 7, instructions: "Complete HIPAA training if you don't have a valid certificate from the past 12 months." },
  { id: "template-18", documentTypeId: "doctype-17", taskType: "form_fill", title: "Professional References", description: "Provide three professional references", phase: 3, phaseName: "Background & Compliance", orderIndex: 4, isRequired: true, dueDays: 7, instructions: "List 3 professional references with name, title, organization, phone, and email.", formUrl: "/docs/business/TNG_REFERENCE_FORM.html" },

  // Phase 4: Credentials (Due Day 14) - all external uploads
  { id: "template-19", documentTypeId: "doctype-1", taskType: "document_upload", title: "Resume/CV", description: "Upload current resume or CV", phase: 4, phaseName: "Credentials", orderIndex: 1, isRequired: true, dueDays: 14, instructions: "Submit your most recent resume with all relevant experience and certifications." },
  { id: "template-20", documentTypeId: "doctype-2", taskType: "document_upload", title: "RN License (if applicable)", description: "Upload nursing license", phase: 4, phaseName: "Credentials", orderIndex: 2, isRequired: false, dueDays: 14, instructions: "Required for clinical consultant roles. Upload front and back of license." },
  { id: "template-21", documentTypeId: "doctype-3", taskType: "document_upload", title: "Epic Certification", description: "Upload Epic certification badge", phase: 4, phaseName: "Credentials", orderIndex: 3, isRequired: false, dueDays: 14, instructions: "If Epic certified, upload your current certification badge/proof." },
  { id: "template-22", documentTypeId: "doctype-4", taskType: "document_upload", title: "Cerner Certification", description: "Upload Cerner certification credential", phase: 4, phaseName: "Credentials", orderIndex: 4, isRequired: false, dueDays: 14, instructions: "If Cerner certified, upload your current certification credential." },
  { id: "template-23", documentTypeId: "doctype-9", taskType: "document_upload", title: "Proof of Insurance", description: "Upload professional liability insurance", phase: 4, phaseName: "Credentials", orderIndex: 5, isRequired: true, dueDays: 14, instructions: "Provide certificate of professional liability insurance with current coverage dates." },

  // Phase 5: Immunizations (Due Day 30) - form_fill for record, uploads for vaccine proof
  { id: "template-24", documentTypeId: "doctype-34", taskType: "form_fill", title: "Immunization Record", description: "Complete immunization history form", phase: 5, phaseName: "Immunizations", orderIndex: 1, isRequired: true, dueDays: 30, instructions: "Complete the TNG Immunization Record form with your vaccination history.", formUrl: "/docs/business/TNG_IMMUNIZATION_RECORD.html" },
  { id: "template-25", documentTypeId: "doctype-25", taskType: "document_upload", title: "Hepatitis B Vaccine", description: "Hepatitis B vaccination series or titer", phase: 5, phaseName: "Immunizations", orderIndex: 2, isRequired: true, dueDays: 30, instructions: "Upload proof of Hep B series (3 doses) or positive titer. Submit declination if refusing." },
  { id: "template-26", documentTypeId: "doctype-26", taskType: "document_upload", title: "MMR Vaccine", description: "Measles, Mumps, Rubella vaccination", phase: 5, phaseName: "Immunizations", orderIndex: 3, isRequired: true, dueDays: 30, instructions: "Upload proof of 2-dose MMR series or positive titers for all 3 components." },
  { id: "template-27", documentTypeId: "doctype-27", taskType: "document_upload", title: "Varicella Vaccine", description: "Chickenpox vaccination or titer", phase: 5, phaseName: "Immunizations", orderIndex: 4, isRequired: true, dueDays: 30, instructions: "Upload proof of 2-dose Varicella series or positive titer." },
  { id: "template-28", documentTypeId: "doctype-28", taskType: "document_upload", title: "Tdap Vaccine", description: "Tetanus, Diphtheria, Pertussis booster", phase: 5, phaseName: "Immunizations", orderIndex: 5, isRequired: true, dueDays: 30, instructions: "Tdap booster required within the last 10 years." },
  { id: "template-29", documentTypeId: "doctype-29", taskType: "document_upload", title: "Influenza Vaccine", description: "Annual flu vaccination", phase: 5, phaseName: "Immunizations", orderIndex: 6, isRequired: true, dueDays: 30, instructions: "Current season flu vaccine required. Submit declination if refusing." },
  { id: "template-30", documentTypeId: "doctype-30", taskType: "document_upload", title: "COVID-19 Vaccine", description: "COVID-19 vaccination record", phase: 5, phaseName: "Immunizations", orderIndex: 7, isRequired: false, dueDays: 30, instructions: "Upload COVID-19 vaccination card if available. Hospital requirements may vary." },
  { id: "template-31", documentTypeId: "doctype-31", taskType: "document_upload", title: "TB Test - PPD/TST", description: "Tuberculosis skin test (2-step)", phase: 5, phaseName: "Immunizations", orderIndex: 8, isRequired: false, dueDays: 30, instructions: "2-step PPD or single blood test required. Upload within 12 months." },
  { id: "template-32", documentTypeId: "doctype-32", taskType: "document_upload", title: "TB Test - QuantiFERON", description: "TB blood test (IGRA)", phase: 5, phaseName: "Immunizations", orderIndex: 9, isRequired: false, dueDays: 30, instructions: "Alternative to PPD skin test. Upload lab results." },
  { id: "template-33", documentTypeId: "doctype-35", taskType: "document_upload", title: "Titer Results", description: "Blood test immunity verification", phase: 5, phaseName: "Immunizations", orderIndex: 10, isRequired: false, dueDays: 30, instructions: "If lacking vaccination records, submit lab titer results to prove immunity." },
];

// Consultant documents - onboarded consultants should have their required docs
const demoConsultantDocuments = [
  // Consultant 1 - Sarah Chen (Epic certified, available) - All docs approved
  { id: "doc-1-1", consultantId: "consultant-1", documentTypeId: "doctype-1", fileName: "sarah_chen_resume.pdf", fileUrl: "/documents/sarah_chen_resume.pdf", status: "approved" as const, reviewedBy: "demo-admin", reviewedAt: new Date("2024-06-15"), notes: "Excellent credentials" },
  { id: "doc-1-2", consultantId: "consultant-1", documentTypeId: "doctype-3", fileName: "sarah_chen_epic_cert.pdf", fileUrl: "/documents/sarah_chen_epic_cert.pdf", status: "approved" as const, expirationDate: "2027-03-15", reviewedBy: "demo-admin", reviewedAt: new Date("2024-06-15") },
  { id: "doc-1-3", consultantId: "consultant-1", documentTypeId: "doctype-5", fileName: "sarah_chen_background.pdf", fileUrl: "/documents/sarah_chen_background.pdf", status: "approved" as const, expirationDate: "2025-06-15", reviewedBy: "demo-admin", reviewedAt: new Date("2024-06-16") },
  { id: "doc-1-4", consultantId: "consultant-1", documentTypeId: "doctype-6", fileName: "sarah_chen_drugscreen.pdf", fileUrl: "/documents/sarah_chen_drugscreen.pdf", status: "approved" as const, expirationDate: "2025-06-15", reviewedBy: "demo-admin", reviewedAt: new Date("2024-06-16") },
  { id: "doc-1-5", consultantId: "consultant-1", documentTypeId: "doctype-7", fileName: "sarah_chen_hipaa.pdf", fileUrl: "/documents/sarah_chen_hipaa.pdf", status: "approved" as const, expirationDate: "2025-06-15", reviewedBy: "demo-admin", reviewedAt: new Date("2024-06-17") },
  { id: "doc-1-6", consultantId: "consultant-1", documentTypeId: "doctype-8", fileName: "sarah_chen_w9.pdf", fileUrl: "/documents/sarah_chen_w9.pdf", status: "approved" as const, reviewedBy: "demo-admin", reviewedAt: new Date("2024-06-17") },
  { id: "doc-1-7", consultantId: "consultant-1", documentTypeId: "doctype-9", fileName: "sarah_chen_insurance.pdf", fileUrl: "/documents/sarah_chen_insurance.pdf", status: "approved" as const, expirationDate: "2025-06-15", reviewedBy: "demo-admin", reviewedAt: new Date("2024-06-17") },
  { id: "doc-1-8", consultantId: "consultant-1", documentTypeId: "doctype-11", fileName: "sarah_chen_nda.pdf", fileUrl: "/documents/sarah_chen_nda.pdf", status: "approved" as const, reviewedBy: "demo-admin", reviewedAt: new Date("2024-06-15") },
  { id: "doc-1-9", consultantId: "consultant-1", documentTypeId: "doctype-12", fileName: "sarah_chen_contract.pdf", fileUrl: "/documents/sarah_chen_contract.pdf", status: "approved" as const, reviewedBy: "demo-admin", reviewedAt: new Date("2024-06-15") },

  // Consultant 2 - Michael Rodriguez (Cerner certified, on assignment)
  { id: "doc-2-1", consultantId: "consultant-2", documentTypeId: "doctype-1", fileName: "michael_rodriguez_resume.pdf", fileUrl: "/documents/michael_rodriguez_resume.pdf", status: "approved" as const, reviewedBy: "demo-admin", reviewedAt: new Date("2024-05-10") },
  { id: "doc-2-2", consultantId: "consultant-2", documentTypeId: "doctype-4", fileName: "michael_rodriguez_cerner_cert.pdf", fileUrl: "/documents/michael_rodriguez_cerner_cert.pdf", status: "approved" as const, expirationDate: "2026-11-20", reviewedBy: "demo-admin", reviewedAt: new Date("2024-05-10") },
  { id: "doc-2-3", consultantId: "consultant-2", documentTypeId: "doctype-5", fileName: "michael_rodriguez_background.pdf", fileUrl: "/documents/michael_rodriguez_background.pdf", status: "approved" as const, expirationDate: "2025-05-10", reviewedBy: "demo-admin", reviewedAt: new Date("2024-05-11") },
  { id: "doc-2-4", consultantId: "consultant-2", documentTypeId: "doctype-6", fileName: "michael_rodriguez_drugscreen.pdf", fileUrl: "/documents/michael_rodriguez_drugscreen.pdf", status: "approved" as const, expirationDate: "2025-05-10", reviewedBy: "demo-admin", reviewedAt: new Date("2024-05-11") },
  { id: "doc-2-5", consultantId: "consultant-2", documentTypeId: "doctype-7", fileName: "michael_rodriguez_hipaa.pdf", fileUrl: "/documents/michael_rodriguez_hipaa.pdf", status: "approved" as const, expirationDate: "2025-05-10", reviewedBy: "demo-admin", reviewedAt: new Date("2024-05-12") },
  { id: "doc-2-6", consultantId: "consultant-2", documentTypeId: "doctype-8", fileName: "michael_rodriguez_w9.pdf", fileUrl: "/documents/michael_rodriguez_w9.pdf", status: "approved" as const, reviewedBy: "demo-admin", reviewedAt: new Date("2024-05-12") },
  { id: "doc-2-7", consultantId: "consultant-2", documentTypeId: "doctype-9", fileName: "michael_rodriguez_insurance.pdf", fileUrl: "/documents/michael_rodriguez_insurance.pdf", status: "approved" as const, expirationDate: "2025-05-10", reviewedBy: "demo-admin", reviewedAt: new Date("2024-05-12") },
  { id: "doc-2-8", consultantId: "consultant-2", documentTypeId: "doctype-11", fileName: "michael_rodriguez_nda.pdf", fileUrl: "/documents/michael_rodriguez_nda.pdf", status: "approved" as const, reviewedBy: "demo-admin", reviewedAt: new Date("2024-05-10") },
  { id: "doc-2-9", consultantId: "consultant-2", documentTypeId: "doctype-12", fileName: "michael_rodriguez_contract.pdf", fileUrl: "/documents/michael_rodriguez_contract.pdf", status: "approved" as const, reviewedBy: "demo-admin", reviewedAt: new Date("2024-05-10") },

  // Consultant 3 - Jennifer Williams (Epic & Cerner, on assignment)
  { id: "doc-3-1", consultantId: "consultant-3", documentTypeId: "doctype-1", fileName: "jennifer_williams_resume.pdf", fileUrl: "/documents/jennifer_williams_resume.pdf", status: "approved" as const, reviewedBy: "demo-admin", reviewedAt: new Date("2024-04-20") },
  { id: "doc-3-2", consultantId: "consultant-3", documentTypeId: "doctype-3", fileName: "jennifer_williams_epic_cert.pdf", fileUrl: "/documents/jennifer_williams_epic_cert.pdf", status: "approved" as const, expirationDate: "2026-08-15", reviewedBy: "demo-admin", reviewedAt: new Date("2024-04-20") },
  { id: "doc-3-3", consultantId: "consultant-3", documentTypeId: "doctype-4", fileName: "jennifer_williams_cerner_cert.pdf", fileUrl: "/documents/jennifer_williams_cerner_cert.pdf", status: "approved" as const, expirationDate: "2027-01-10", reviewedBy: "demo-admin", reviewedAt: new Date("2024-04-20") },
  { id: "doc-3-4", consultantId: "consultant-3", documentTypeId: "doctype-5", fileName: "jennifer_williams_background.pdf", fileUrl: "/documents/jennifer_williams_background.pdf", status: "approved" as const, expirationDate: "2025-04-20", reviewedBy: "demo-admin", reviewedAt: new Date("2024-04-21") },
  { id: "doc-3-5", consultantId: "consultant-3", documentTypeId: "doctype-7", fileName: "jennifer_williams_hipaa.pdf", fileUrl: "/documents/jennifer_williams_hipaa.pdf", status: "approved" as const, expirationDate: "2025-04-20", reviewedBy: "demo-admin", reviewedAt: new Date("2024-04-22") },
  { id: "doc-3-6", consultantId: "consultant-3", documentTypeId: "doctype-8", fileName: "jennifer_williams_w9.pdf", fileUrl: "/documents/jennifer_williams_w9.pdf", status: "approved" as const, reviewedBy: "demo-admin", reviewedAt: new Date("2024-04-22") },
  { id: "doc-3-7", consultantId: "consultant-3", documentTypeId: "doctype-11", fileName: "jennifer_williams_nda.pdf", fileUrl: "/documents/jennifer_williams_nda.pdf", status: "approved" as const, reviewedBy: "demo-admin", reviewedAt: new Date("2024-04-20") },
  { id: "doc-3-8", consultantId: "consultant-3", documentTypeId: "doctype-12", fileName: "jennifer_williams_contract.pdf", fileUrl: "/documents/jennifer_williams_contract.pdf", status: "approved" as const, reviewedBy: "demo-admin", reviewedAt: new Date("2024-04-20") },

  // Consultant 4 - David Kim (Epic, available) - has an expiring document
  { id: "doc-4-1", consultantId: "consultant-4", documentTypeId: "doctype-1", fileName: "david_kim_resume.pdf", fileUrl: "/documents/david_kim_resume.pdf", status: "approved" as const, reviewedBy: "demo-admin", reviewedAt: new Date("2024-03-01") },
  { id: "doc-4-2", consultantId: "consultant-4", documentTypeId: "doctype-3", fileName: "david_kim_epic_cert.pdf", fileUrl: "/documents/david_kim_epic_cert.pdf", status: "approved" as const, expirationDate: "2025-09-30", reviewedBy: "demo-admin", reviewedAt: new Date("2024-03-01") },
  { id: "doc-4-3", consultantId: "consultant-4", documentTypeId: "doctype-5", fileName: "david_kim_background.pdf", fileUrl: "/documents/david_kim_background.pdf", status: "approved" as const, expirationDate: "2025-01-15", reviewedBy: "demo-admin", reviewedAt: new Date("2024-03-02"), notes: "Expiring soon - renewal needed" },
  { id: "doc-4-4", consultantId: "consultant-4", documentTypeId: "doctype-7", fileName: "david_kim_hipaa.pdf", fileUrl: "/documents/david_kim_hipaa.pdf", status: "approved" as const, expirationDate: "2025-03-01", reviewedBy: "demo-admin", reviewedAt: new Date("2024-03-03") },
  { id: "doc-4-5", consultantId: "consultant-4", documentTypeId: "doctype-8", fileName: "david_kim_w9.pdf", fileUrl: "/documents/david_kim_w9.pdf", status: "approved" as const, reviewedBy: "demo-admin", reviewedAt: new Date("2024-03-03") },
  { id: "doc-4-6", consultantId: "consultant-4", documentTypeId: "doctype-11", fileName: "david_kim_nda.pdf", fileUrl: "/documents/david_kim_nda.pdf", status: "approved" as const, reviewedBy: "demo-admin", reviewedAt: new Date("2024-03-01") },
  { id: "doc-4-7", consultantId: "consultant-4", documentTypeId: "doctype-12", fileName: "david_kim_contract.pdf", fileUrl: "/documents/david_kim_contract.pdf", status: "approved" as const, reviewedBy: "demo-admin", reviewedAt: new Date("2024-03-01") },

  // Consultant 5 - Amanda Foster (Meditech, available)
  { id: "doc-5-1", consultantId: "consultant-5", documentTypeId: "doctype-1", fileName: "amanda_foster_resume.pdf", fileUrl: "/documents/amanda_foster_resume.pdf", status: "approved" as const, reviewedBy: "demo-admin", reviewedAt: new Date("2024-07-01") },
  { id: "doc-5-2", consultantId: "consultant-5", documentTypeId: "doctype-5", fileName: "amanda_foster_background.pdf", fileUrl: "/documents/amanda_foster_background.pdf", status: "approved" as const, expirationDate: "2025-07-01", reviewedBy: "demo-admin", reviewedAt: new Date("2024-07-02") },
  { id: "doc-5-3", consultantId: "consultant-5", documentTypeId: "doctype-7", fileName: "amanda_foster_hipaa.pdf", fileUrl: "/documents/amanda_foster_hipaa.pdf", status: "approved" as const, expirationDate: "2025-07-01", reviewedBy: "demo-admin", reviewedAt: new Date("2024-07-03") },
  { id: "doc-5-4", consultantId: "consultant-5", documentTypeId: "doctype-8", fileName: "amanda_foster_w9.pdf", fileUrl: "/documents/amanda_foster_w9.pdf", status: "approved" as const, reviewedBy: "demo-admin", reviewedAt: new Date("2024-07-03") },
  { id: "doc-5-5", consultantId: "consultant-5", documentTypeId: "doctype-11", fileName: "amanda_foster_nda.pdf", fileUrl: "/documents/amanda_foster_nda.pdf", status: "approved" as const, reviewedBy: "demo-admin", reviewedAt: new Date("2024-07-01") },
  { id: "doc-5-6", consultantId: "consultant-5", documentTypeId: "doctype-12", fileName: "amanda_foster_contract.pdf", fileUrl: "/documents/amanda_foster_contract.pdf", status: "approved" as const, reviewedBy: "demo-admin", reviewedAt: new Date("2024-07-01") },

  // Consultant 6 - Robert Thompson (Epic, on assignment)
  { id: "doc-6-1", consultantId: "consultant-6", documentTypeId: "doctype-1", fileName: "robert_thompson_resume.pdf", fileUrl: "/documents/robert_thompson_resume.pdf", status: "approved" as const, reviewedBy: "demo-admin", reviewedAt: new Date("2024-02-15") },
  { id: "doc-6-2", consultantId: "consultant-6", documentTypeId: "doctype-3", fileName: "robert_thompson_epic_cert.pdf", fileUrl: "/documents/robert_thompson_epic_cert.pdf", status: "approved" as const, expirationDate: "2026-05-20", reviewedBy: "demo-admin", reviewedAt: new Date("2024-02-15") },
  { id: "doc-6-3", consultantId: "consultant-6", documentTypeId: "doctype-5", fileName: "robert_thompson_background.pdf", fileUrl: "/documents/robert_thompson_background.pdf", status: "approved" as const, expirationDate: "2025-02-15", reviewedBy: "demo-admin", reviewedAt: new Date("2024-02-16") },
  { id: "doc-6-4", consultantId: "consultant-6", documentTypeId: "doctype-7", fileName: "robert_thompson_hipaa.pdf", fileUrl: "/documents/robert_thompson_hipaa.pdf", status: "approved" as const, expirationDate: "2025-02-15", reviewedBy: "demo-admin", reviewedAt: new Date("2024-02-17") },
  { id: "doc-6-5", consultantId: "consultant-6", documentTypeId: "doctype-8", fileName: "robert_thompson_w9.pdf", fileUrl: "/documents/robert_thompson_w9.pdf", status: "approved" as const, reviewedBy: "demo-admin", reviewedAt: new Date("2024-02-17") },
  { id: "doc-6-6", consultantId: "consultant-6", documentTypeId: "doctype-11", fileName: "robert_thompson_nda.pdf", fileUrl: "/documents/robert_thompson_nda.pdf", status: "approved" as const, reviewedBy: "demo-admin", reviewedAt: new Date("2024-02-15") },
  { id: "doc-6-7", consultantId: "consultant-6", documentTypeId: "doctype-12", fileName: "robert_thompson_contract.pdf", fileUrl: "/documents/robert_thompson_contract.pdf", status: "approved" as const, reviewedBy: "demo-admin", reviewedAt: new Date("2024-02-15") },

  // Consultant 7 - Emily Martinez (Epic, available) - RN license
  { id: "doc-7-1", consultantId: "consultant-7", documentTypeId: "doctype-1", fileName: "emily_martinez_resume.pdf", fileUrl: "/documents/emily_martinez_resume.pdf", status: "approved" as const, reviewedBy: "demo-admin", reviewedAt: new Date("2024-08-01") },
  { id: "doc-7-2", consultantId: "consultant-7", documentTypeId: "doctype-2", fileName: "emily_martinez_rn_license.pdf", fileUrl: "/documents/emily_martinez_rn_license.pdf", status: "approved" as const, expirationDate: "2026-08-01", reviewedBy: "demo-admin", reviewedAt: new Date("2024-08-01") },
  { id: "doc-7-3", consultantId: "consultant-7", documentTypeId: "doctype-3", fileName: "emily_martinez_epic_cert.pdf", fileUrl: "/documents/emily_martinez_epic_cert.pdf", status: "approved" as const, expirationDate: "2027-02-15", reviewedBy: "demo-admin", reviewedAt: new Date("2024-08-01") },
  { id: "doc-7-4", consultantId: "consultant-7", documentTypeId: "doctype-5", fileName: "emily_martinez_background.pdf", fileUrl: "/documents/emily_martinez_background.pdf", status: "approved" as const, expirationDate: "2025-08-01", reviewedBy: "demo-admin", reviewedAt: new Date("2024-08-02") },
  { id: "doc-7-5", consultantId: "consultant-7", documentTypeId: "doctype-7", fileName: "emily_martinez_hipaa.pdf", fileUrl: "/documents/emily_martinez_hipaa.pdf", status: "approved" as const, expirationDate: "2025-08-01", reviewedBy: "demo-admin", reviewedAt: new Date("2024-08-03") },
  { id: "doc-7-6", consultantId: "consultant-7", documentTypeId: "doctype-8", fileName: "emily_martinez_w9.pdf", fileUrl: "/documents/emily_martinez_w9.pdf", status: "approved" as const, reviewedBy: "demo-admin", reviewedAt: new Date("2024-08-03") },
  { id: "doc-7-7", consultantId: "consultant-7", documentTypeId: "doctype-11", fileName: "emily_martinez_nda.pdf", fileUrl: "/documents/emily_martinez_nda.pdf", status: "approved" as const, reviewedBy: "demo-admin", reviewedAt: new Date("2024-08-01") },
  { id: "doc-7-8", consultantId: "consultant-7", documentTypeId: "doctype-12", fileName: "emily_martinez_contract.pdf", fileUrl: "/documents/emily_martinez_contract.pdf", status: "approved" as const, reviewedBy: "demo-admin", reviewedAt: new Date("2024-08-01") },

  // Consultant 8 - James Wilson (Allscripts, available)
  { id: "doc-8-1", consultantId: "consultant-8", documentTypeId: "doctype-1", fileName: "james_wilson_resume.pdf", fileUrl: "/documents/james_wilson_resume.pdf", status: "approved" as const, reviewedBy: "demo-admin", reviewedAt: new Date("2024-09-01") },
  { id: "doc-8-2", consultantId: "consultant-8", documentTypeId: "doctype-5", fileName: "james_wilson_background.pdf", fileUrl: "/documents/james_wilson_background.pdf", status: "approved" as const, expirationDate: "2025-09-01", reviewedBy: "demo-admin", reviewedAt: new Date("2024-09-02") },
  { id: "doc-8-3", consultantId: "consultant-8", documentTypeId: "doctype-7", fileName: "james_wilson_hipaa.pdf", fileUrl: "/documents/james_wilson_hipaa.pdf", status: "approved" as const, expirationDate: "2025-09-01", reviewedBy: "demo-admin", reviewedAt: new Date("2024-09-03") },
  { id: "doc-8-4", consultantId: "consultant-8", documentTypeId: "doctype-8", fileName: "james_wilson_w9.pdf", fileUrl: "/documents/james_wilson_w9.pdf", status: "approved" as const, reviewedBy: "demo-admin", reviewedAt: new Date("2024-09-03") },
  { id: "doc-8-5", consultantId: "consultant-8", documentTypeId: "doctype-11", fileName: "james_wilson_nda.pdf", fileUrl: "/documents/james_wilson_nda.pdf", status: "approved" as const, reviewedBy: "demo-admin", reviewedAt: new Date("2024-09-01") },
  { id: "doc-8-6", consultantId: "consultant-8", documentTypeId: "doctype-12", fileName: "james_wilson_contract.pdf", fileUrl: "/documents/james_wilson_contract.pdf", status: "approved" as const, reviewedBy: "demo-admin", reviewedAt: new Date("2024-09-01") },

  // Consultant 9 - Lisa Anderson (Epic, on assignment)
  { id: "doc-9-1", consultantId: "consultant-9", documentTypeId: "doctype-1", fileName: "lisa_anderson_resume.pdf", fileUrl: "/documents/lisa_anderson_resume.pdf", status: "approved" as const, reviewedBy: "demo-admin", reviewedAt: new Date("2024-01-15") },
  { id: "doc-9-2", consultantId: "consultant-9", documentTypeId: "doctype-3", fileName: "lisa_anderson_epic_cert.pdf", fileUrl: "/documents/lisa_anderson_epic_cert.pdf", status: "approved" as const, expirationDate: "2026-07-20", reviewedBy: "demo-admin", reviewedAt: new Date("2024-01-15") },
  { id: "doc-9-3", consultantId: "consultant-9", documentTypeId: "doctype-5", fileName: "lisa_anderson_background.pdf", fileUrl: "/documents/lisa_anderson_background.pdf", status: "approved" as const, expirationDate: "2025-01-15", reviewedBy: "demo-admin", reviewedAt: new Date("2024-01-16") },
  { id: "doc-9-4", consultantId: "consultant-9", documentTypeId: "doctype-7", fileName: "lisa_anderson_hipaa.pdf", fileUrl: "/documents/lisa_anderson_hipaa.pdf", status: "approved" as const, expirationDate: "2025-01-15", reviewedBy: "demo-admin", reviewedAt: new Date("2024-01-17") },
  { id: "doc-9-5", consultantId: "consultant-9", documentTypeId: "doctype-8", fileName: "lisa_anderson_w9.pdf", fileUrl: "/documents/lisa_anderson_w9.pdf", status: "approved" as const, reviewedBy: "demo-admin", reviewedAt: new Date("2024-01-17") },
  { id: "doc-9-6", consultantId: "consultant-9", documentTypeId: "doctype-11", fileName: "lisa_anderson_nda.pdf", fileUrl: "/documents/lisa_anderson_nda.pdf", status: "approved" as const, reviewedBy: "demo-admin", reviewedAt: new Date("2024-01-15") },
  { id: "doc-9-7", consultantId: "consultant-9", documentTypeId: "doctype-12", fileName: "lisa_anderson_contract.pdf", fileUrl: "/documents/lisa_anderson_contract.pdf", status: "approved" as const, reviewedBy: "demo-admin", reviewedAt: new Date("2024-01-15") },

  // Consultant 10 - Christopher Lee (Cerner, unavailable) - Some docs pending
  { id: "doc-10-1", consultantId: "consultant-10", documentTypeId: "doctype-1", fileName: "christopher_lee_resume.pdf", fileUrl: "/documents/christopher_lee_resume.pdf", status: "approved" as const, reviewedBy: "demo-admin", reviewedAt: new Date("2024-10-01") },
  { id: "doc-10-2", consultantId: "consultant-10", documentTypeId: "doctype-4", fileName: "christopher_lee_cerner_cert.pdf", fileUrl: "/documents/christopher_lee_cerner_cert.pdf", status: "approved" as const, expirationDate: "2026-12-15", reviewedBy: "demo-admin", reviewedAt: new Date("2024-10-01") },
  { id: "doc-10-3", consultantId: "consultant-10", documentTypeId: "doctype-5", fileName: "christopher_lee_background.pdf", fileUrl: "/documents/christopher_lee_background.pdf", status: "pending" as const, notes: "Waiting for results from vendor" },
  { id: "doc-10-4", consultantId: "consultant-10", documentTypeId: "doctype-7", fileName: "christopher_lee_hipaa.pdf", fileUrl: "/documents/christopher_lee_hipaa.pdf", status: "approved" as const, expirationDate: "2025-10-01", reviewedBy: "demo-admin", reviewedAt: new Date("2024-10-03") },
  { id: "doc-10-5", consultantId: "consultant-10", documentTypeId: "doctype-8", fileName: "christopher_lee_w9.pdf", fileUrl: "/documents/christopher_lee_w9.pdf", status: "approved" as const, reviewedBy: "demo-admin", reviewedAt: new Date("2024-10-03") },
  { id: "doc-10-6", consultantId: "consultant-10", documentTypeId: "doctype-11", fileName: "christopher_lee_nda.pdf", fileUrl: "/documents/christopher_lee_nda.pdf", status: "approved" as const, reviewedBy: "demo-admin", reviewedAt: new Date("2024-10-01") },

  // Consultant 11 - Patricia Brown (Epic, available)
  { id: "doc-11-1", consultantId: "consultant-11", documentTypeId: "doctype-1", fileName: "patricia_brown_resume.pdf", fileUrl: "/documents/patricia_brown_resume.pdf", status: "approved" as const, reviewedBy: "demo-admin", reviewedAt: new Date("2024-11-01") },
  { id: "doc-11-2", consultantId: "consultant-11", documentTypeId: "doctype-3", fileName: "patricia_brown_epic_cert.pdf", fileUrl: "/documents/patricia_brown_epic_cert.pdf", status: "approved" as const, expirationDate: "2027-05-15", reviewedBy: "demo-admin", reviewedAt: new Date("2024-11-01") },
  { id: "doc-11-3", consultantId: "consultant-11", documentTypeId: "doctype-5", fileName: "patricia_brown_background.pdf", fileUrl: "/documents/patricia_brown_background.pdf", status: "approved" as const, expirationDate: "2025-11-01", reviewedBy: "demo-admin", reviewedAt: new Date("2024-11-02") },
  { id: "doc-11-4", consultantId: "consultant-11", documentTypeId: "doctype-7", fileName: "patricia_brown_hipaa.pdf", fileUrl: "/documents/patricia_brown_hipaa.pdf", status: "approved" as const, expirationDate: "2025-11-01", reviewedBy: "demo-admin", reviewedAt: new Date("2024-11-03") },
  { id: "doc-11-5", consultantId: "consultant-11", documentTypeId: "doctype-8", fileName: "patricia_brown_w9.pdf", fileUrl: "/documents/patricia_brown_w9.pdf", status: "approved" as const, reviewedBy: "demo-admin", reviewedAt: new Date("2024-11-03") },
  { id: "doc-11-6", consultantId: "consultant-11", documentTypeId: "doctype-9", fileName: "patricia_brown_insurance.pdf", fileUrl: "/documents/patricia_brown_insurance.pdf", status: "approved" as const, expirationDate: "2025-11-01", reviewedBy: "demo-admin", reviewedAt: new Date("2024-11-03") },
  { id: "doc-11-7", consultantId: "consultant-11", documentTypeId: "doctype-11", fileName: "patricia_brown_nda.pdf", fileUrl: "/documents/patricia_brown_nda.pdf", status: "approved" as const, reviewedBy: "demo-admin", reviewedAt: new Date("2024-11-01") },
  { id: "doc-11-8", consultantId: "consultant-11", documentTypeId: "doctype-12", fileName: "patricia_brown_contract.pdf", fileUrl: "/documents/patricia_brown_contract.pdf", status: "approved" as const, reviewedBy: "demo-admin", reviewedAt: new Date("2024-11-01") },

  // Consultant 12 - Daniel Wilson (Epic & Cerner, on assignment)
  { id: "doc-12-1", consultantId: "consultant-12", documentTypeId: "doctype-1", fileName: "daniel_wilson_resume.pdf", fileUrl: "/documents/daniel_wilson_resume.pdf", status: "approved" as const, reviewedBy: "demo-admin", reviewedAt: new Date("2024-06-01") },
  { id: "doc-12-2", consultantId: "consultant-12", documentTypeId: "doctype-3", fileName: "daniel_wilson_epic_cert.pdf", fileUrl: "/documents/daniel_wilson_epic_cert.pdf", status: "approved" as const, expirationDate: "2026-10-20", reviewedBy: "demo-admin", reviewedAt: new Date("2024-06-01") },
  { id: "doc-12-3", consultantId: "consultant-12", documentTypeId: "doctype-4", fileName: "daniel_wilson_cerner_cert.pdf", fileUrl: "/documents/daniel_wilson_cerner_cert.pdf", status: "approved" as const, expirationDate: "2027-03-15", reviewedBy: "demo-admin", reviewedAt: new Date("2024-06-01") },
  { id: "doc-12-4", consultantId: "consultant-12", documentTypeId: "doctype-5", fileName: "daniel_wilson_background.pdf", fileUrl: "/documents/daniel_wilson_background.pdf", status: "approved" as const, expirationDate: "2025-06-01", reviewedBy: "demo-admin", reviewedAt: new Date("2024-06-02") },
  { id: "doc-12-5", consultantId: "consultant-12", documentTypeId: "doctype-6", fileName: "daniel_wilson_drugscreen.pdf", fileUrl: "/documents/daniel_wilson_drugscreen.pdf", status: "approved" as const, expirationDate: "2025-06-01", reviewedBy: "demo-admin", reviewedAt: new Date("2024-06-02") },
  { id: "doc-12-6", consultantId: "consultant-12", documentTypeId: "doctype-7", fileName: "daniel_wilson_hipaa.pdf", fileUrl: "/documents/daniel_wilson_hipaa.pdf", status: "approved" as const, expirationDate: "2025-06-01", reviewedBy: "demo-admin", reviewedAt: new Date("2024-06-03") },
  { id: "doc-12-7", consultantId: "consultant-12", documentTypeId: "doctype-8", fileName: "daniel_wilson_w9.pdf", fileUrl: "/documents/daniel_wilson_w9.pdf", status: "approved" as const, reviewedBy: "demo-admin", reviewedAt: new Date("2024-06-03") },
  { id: "doc-12-8", consultantId: "consultant-12", documentTypeId: "doctype-9", fileName: "daniel_wilson_insurance.pdf", fileUrl: "/documents/daniel_wilson_insurance.pdf", status: "approved" as const, expirationDate: "2025-06-01", reviewedBy: "demo-admin", reviewedAt: new Date("2024-06-03") },
  { id: "doc-12-9", consultantId: "consultant-12", documentTypeId: "doctype-10", fileName: "daniel_wilson_covid.pdf", fileUrl: "/documents/daniel_wilson_covid.pdf", status: "approved" as const, reviewedBy: "demo-admin", reviewedAt: new Date("2024-06-01") },
  { id: "doc-12-10", consultantId: "consultant-12", documentTypeId: "doctype-11", fileName: "daniel_wilson_nda.pdf", fileUrl: "/documents/daniel_wilson_nda.pdf", status: "approved" as const, reviewedBy: "demo-admin", reviewedAt: new Date("2024-06-01") },
  { id: "doc-12-11", consultantId: "consultant-12", documentTypeId: "doctype-12", fileName: "daniel_wilson_contract.pdf", fileUrl: "/documents/daniel_wilson_contract.pdf", status: "approved" as const, reviewedBy: "demo-admin", reviewedAt: new Date("2024-06-01") },
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

// Demo Project Tasks for Dashboard
const demoProjectTasks = [
  // Epic EHR Implementation tasks
  {
    id: "task-1",
    projectId: "project-1",
    title: "Complete ED workflow documentation",
    description: "Document all Emergency Department workflows for Epic implementation",
    priority: "high" as const,
    status: "in_progress" as const,
    dueDate: "2025-01-02",
    assignedTo: "user-c1", // Sarah Chen
  },
  {
    id: "task-2",
    projectId: "project-1",
    title: "Review ICU order sets with clinical team",
    description: "Validate all ICU-specific order sets with the clinical leadership",
    priority: "high" as const,
    status: "pending" as const,
    dueDate: "2025-01-05",
    assignedTo: "user-c3", // Emily Davis
  },
  {
    id: "task-3",
    projectId: "project-1",
    title: "Configure medication administration records",
    description: "Set up MAR templates for nursing documentation",
    priority: "medium" as const,
    status: "pending" as const,
    dueDate: "2025-01-08",
    assignedTo: "user-c4", // David Kim
  },
  {
    id: "task-4",
    projectId: "project-1",
    title: "Test physician order entry workflows",
    description: "Complete end-to-end testing of CPOE functionality",
    priority: "high" as const,
    status: "pending" as const,
    dueDate: "2025-01-10",
    assignedTo: "user-c1", // Sarah Chen
  },
  // Cerner Millennium Optimization tasks
  {
    id: "task-5",
    projectId: "project-2",
    title: "Analyze FirstNet response time metrics",
    description: "Review performance data and identify optimization opportunities",
    priority: "medium" as const,
    status: "in_progress" as const,
    dueDate: "2025-01-03",
    assignedTo: "user-c2", // Michael Johnson
  },
  {
    id: "task-6",
    projectId: "project-2",
    title: "Deploy PowerChart enhancements to production",
    description: "Coordinate deployment of approved workflow improvements",
    priority: "high" as const,
    status: "pending" as const,
    dueDate: "2025-01-06",
    assignedTo: "user-c2", // Michael Johnson
  },
  // MyChart Patient Portal tasks
  {
    id: "task-7",
    projectId: "project-3",
    title: "Configure patient self-scheduling rules",
    description: "Set up appointment type availability for patient scheduling",
    priority: "medium" as const,
    status: "completed" as const,
    dueDate: "2024-12-28",
    completedAt: new Date("2024-12-27T16:30:00Z"),
    assignedTo: "user-c3", // Emily Davis
  },
  {
    id: "task-8",
    projectId: "project-3",
    title: "Test Care Everywhere data exchange",
    description: "Validate HIE connectivity with external health systems",
    priority: "high" as const,
    status: "in_progress" as const,
    dueDate: "2025-01-04",
    assignedTo: "user-c10", // Christopher Lee (Integration Architect)
  },
  {
    id: "task-9",
    projectId: "project-3",
    title: "Train patient access staff on MyChart activation",
    description: "Conduct training sessions for front desk staff",
    priority: "medium" as const,
    status: "pending" as const,
    dueDate: "2025-01-07",
    assignedTo: "user-c11", // Michelle Taylor (Training Lead)
  },
  {
    id: "task-10",
    projectId: "project-1",
    title: "Validate lab result routing rules",
    description: "Ensure lab results route correctly to ordering providers",
    priority: "low" as const,
    status: "pending" as const,
    dueDate: "2025-01-12",
    assignedTo: "user-c12", // Daniel Wilson (Lab Systems)
  },
];

// Demo User Activities for Recent Activity Feed
const demoUserActivities = [
  {
    id: "activity-1",
    userId: "user-c1",
    activityType: "update" as const,
    resourceType: "project",
    resourceId: "project-1",
    resourceName: "Epic EHR Implementation - Phase 2",
    description: "Updated project timeline and milestones",
    createdAt: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
  },
  {
    id: "activity-2",
    userId: "user-c3",
    activityType: "approve" as const,
    resourceType: "document",
    resourceId: "doc-1-1",
    resourceName: "ED Workflow Documentation v2.1",
    description: "Approved workflow documentation for ED module",
    createdAt: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
  },
  {
    id: "activity-3",
    userId: "user-c2",
    activityType: "create" as const,
    resourceType: "ticket",
    resourceId: "ticket-new-1",
    resourceName: "FirstNet Performance Issue",
    description: "Created support ticket for performance optimization",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
  },
  {
    id: "activity-4",
    userId: "user-c10",
    activityType: "submit" as const,
    resourceType: "timesheet",
    resourceId: "ts-weekly-1",
    resourceName: "Week of Dec 23, 2024",
    description: "Submitted weekly timesheet for approval",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
  },
  {
    id: "activity-5",
    userId: "user-c11",
    activityType: "create" as const,
    resourceType: "training",
    resourceId: "training-session-1",
    resourceName: "MyChart Staff Training - Session 3",
    description: "Scheduled training session for patient access team",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
  },
  {
    id: "activity-6",
    userId: "demo-admin",
    activityType: "assign" as const,
    resourceType: "consultant",
    resourceId: "consultant-5",
    resourceName: "Emily Johnson",
    description: "Assigned to Epic EHR Implementation project",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
  },
  {
    id: "activity-7",
    userId: "user-c4",
    activityType: "update" as const,
    resourceType: "task",
    resourceId: "task-3",
    resourceName: "Configure medication administration records",
    description: "Updated task status and added notes",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
  },
  {
    id: "activity-8",
    userId: "user-c6",
    activityType: "upload" as const,
    resourceType: "document",
    resourceId: "doc-surgery-1",
    resourceName: "OR Integration Specifications.pdf",
    description: "Uploaded surgical workflow documentation",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
  },
  {
    id: "activity-9",
    userId: "user-c8",
    activityType: "approve" as const,
    resourceType: "expense",
    resourceId: "exp-travel-1",
    resourceName: "Travel Reimbursement - Miami Site Visit",
    description: "Approved travel expense report",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36), // 1.5 days ago
  },
  {
    id: "activity-10",
    userId: "user-c7",
    activityType: "create" as const,
    resourceType: "report",
    resourceId: "eod-report-1",
    resourceName: "EOD Report - Dec 26, 2024",
    description: "Submitted end-of-day status report",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
  },
];

// Demo Timesheets for Performance Metrics (using current month dates)
const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth();

// Helper to get week start/end dates for current month
const getWeekDates = (weekNum: number) => {
  const start = new Date(currentYear, currentMonth, 1 + (weekNum * 7));
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  };
};

const week1 = getWeekDates(0);
const week2 = getWeekDates(1);
const week3 = getWeekDates(2);

const demoTimesheets = [
  {
    id: "timesheet-1",
    consultantId: "consultant-1",
    projectId: "project-1",
    weekStartDate: week1.start,
    weekEndDate: week1.end,
    status: "approved" as const,
    totalHours: 45,
    regularHours: 40,
    overtimeHours: 5,
    notes: "Epic ED workflow optimization",
  },
  {
    id: "timesheet-2",
    consultantId: "consultant-2",
    projectId: "project-1",
    weekStartDate: week1.start,
    weekEndDate: week1.end,
    status: "approved" as const,
    totalHours: 42,
    regularHours: 40,
    overtimeHours: 2,
    notes: "Revenue cycle training sessions",
  },
  {
    id: "timesheet-3",
    consultantId: "consultant-3",
    projectId: "project-2",
    weekStartDate: week1.start,
    weekEndDate: week1.end,
    status: "approved" as const,
    totalHours: 40,
    regularHours: 40,
    overtimeHours: 0,
    notes: "Cerner migration data validation",
  },
  {
    id: "timesheet-4",
    consultantId: "consultant-4",
    projectId: "project-1",
    weekStartDate: week2.start,
    weekEndDate: week2.end,
    status: "approved" as const,
    totalHours: 48,
    regularHours: 40,
    overtimeHours: 8,
    notes: "Surgical workflows and OR integration",
  },
  {
    id: "timesheet-5",
    consultantId: "consultant-5",
    projectId: "project-3",
    weekStartDate: week2.start,
    weekEndDate: week2.end,
    status: "approved" as const,
    totalHours: 38,
    regularHours: 38,
    overtimeHours: 0,
    notes: "System upgrades and testing",
  },
  {
    id: "timesheet-6",
    consultantId: "consultant-6",
    projectId: "project-2",
    weekStartDate: week3.start,
    weekEndDate: week3.end,
    status: "approved" as const,
    totalHours: 44,
    regularHours: 40,
    overtimeHours: 4,
    notes: "End-user training preparation",
  },
  {
    id: "timesheet-7",
    consultantId: "consultant-7",
    projectId: "project-1",
    weekStartDate: week3.start,
    weekEndDate: week3.end,
    status: "approved" as const,
    totalHours: 40,
    regularHours: 40,
    overtimeHours: 0,
    notes: "Pharmacy module configuration",
  },
  {
    id: "timesheet-8",
    consultantId: "consultant-8",
    projectId: "project-3",
    weekStartDate: week3.start,
    weekEndDate: week3.end,
    status: "approved" as const,
    totalHours: 46,
    regularHours: 40,
    overtimeHours: 6,
    notes: "Go-live support preparation",
  },
];

// Demo Support Tickets for Ticket Resolution Rate
const demoSupportTickets = [
  {
    id: "ticket-1",
    ticketNumber: "TKT-2024-001",
    projectId: "project-1",
    reportedById: "user-c1",
    assignedToId: "consultant-1",
    title: "Epic MyChart login timeout issue",
    description: "Users experiencing timeout after 5 minutes of inactivity",
    category: "access" as const,
    priority: "high" as const,
    status: "resolved" as const,
    resolution: "Adjusted session timeout settings from 5 to 30 minutes",
    responseTime: 45,
    resolutionTime: 180,
  },
  {
    id: "ticket-2",
    ticketNumber: "TKT-2024-002",
    projectId: "project-1",
    reportedById: "user-c2",
    assignedToId: "consultant-2",
    title: "Revenue cycle report formatting",
    description: "Monthly revenue reports showing incorrect date format",
    category: "technical" as const,
    priority: "medium" as const,
    status: "resolved" as const,
    resolution: "Updated report template date format to MM/DD/YYYY",
    responseTime: 30,
    resolutionTime: 120,
  },
  {
    id: "ticket-3",
    ticketNumber: "TKT-2024-003",
    projectId: "project-2",
    reportedById: "user-c3",
    assignedToId: "consultant-3",
    title: "Cerner data migration validation errors",
    description: "Patient records showing duplicate entries after migration",
    category: "integration" as const,
    priority: "critical" as const,
    status: "resolved" as const,
    resolution: "Implemented deduplication logic and re-ran migration scripts",
    responseTime: 15,
    resolutionTime: 480,
  },
  {
    id: "ticket-4",
    ticketNumber: "TKT-2024-004",
    projectId: "project-1",
    reportedById: "user-c4",
    assignedToId: "consultant-4",
    title: "OR scheduling conflict",
    description: "Double-booking allowed in surgical scheduling module",
    category: "workflow" as const,
    priority: "high" as const,
    status: "closed" as const,
    resolution: "Enabled conflict detection rules and validation",
    responseTime: 20,
    resolutionTime: 240,
  },
  {
    id: "ticket-5",
    ticketNumber: "TKT-2024-005",
    projectId: "project-1",
    reportedById: "user-c5",
    assignedToId: "consultant-1",
    title: "ED triage form missing fields",
    description: "Custom assessment fields not appearing in triage forms",
    category: "technical" as const,
    priority: "medium" as const,
    status: "resolved" as const,
    resolution: "Added missing fields to form builder configuration",
    responseTime: 60,
    resolutionTime: 90,
  },
  {
    id: "ticket-6",
    ticketNumber: "TKT-2024-006",
    projectId: "project-3",
    reportedById: "user-c6",
    assignedToId: "consultant-5",
    title: "Performance degradation on reports",
    description: "Weekly reports taking 10+ minutes to generate",
    category: "technical" as const,
    priority: "high" as const,
    status: "in_progress" as const,
    resolution: null,
    responseTime: 25,
    resolutionTime: null,
  },
  {
    id: "ticket-7",
    ticketNumber: "TKT-2024-007",
    projectId: "project-2",
    reportedById: "user-c7",
    assignedToId: "consultant-6",
    title: "User access request for new department",
    description: "Need to provision Epic access for 15 new oncology staff",
    category: "access" as const,
    priority: "medium" as const,
    status: "resolved" as const,
    resolution: "Created user accounts and assigned appropriate role templates",
    responseTime: 35,
    resolutionTime: 60,
  },
  {
    id: "ticket-8",
    ticketNumber: "TKT-2024-008",
    projectId: "project-1",
    reportedById: "user-c8",
    assignedToId: "consultant-7",
    title: "Pharmacy order verification issue",
    description: "Some orders skipping pharmacist verification step",
    category: "workflow" as const,
    priority: "critical" as const,
    status: "resolved" as const,
    resolution: "Fixed order routing rules and added verification checkpoint",
    responseTime: 10,
    resolutionTime: 150,
  },
  {
    id: "ticket-9",
    ticketNumber: "TKT-2024-009",
    projectId: "project-3",
    reportedById: "user-c9",
    assignedToId: "consultant-8",
    title: "Training environment sync issue",
    description: "Test data not refreshing in training environment",
    category: "training" as const,
    priority: "low" as const,
    status: "open" as const,
    resolution: null,
    responseTime: null,
    resolutionTime: null,
  },
  {
    id: "ticket-10",
    ticketNumber: "TKT-2024-010",
    projectId: "project-1",
    reportedById: "user-c10",
    assignedToId: "consultant-1",
    title: "Lab results interface delay",
    description: "Lab results taking 30+ seconds to appear in patient chart",
    category: "integration" as const,
    priority: "high" as const,
    status: "closed" as const,
    resolution: "Optimized interface engine and increased polling frequency",
    responseTime: 20,
    resolutionTime: 360,
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
    // Seed login users with passwords
    console.log("Seeding login users with passwords...");
    const hashedPassword = await bcrypt.hash("password123", 10);

    // Consultant user for testing - update existing or insert new
    await db.execute(sql`
      INSERT INTO users (id, email, password, first_name, last_name, role, is_active, access_status)
      VALUES ('consultant-login-user', 'consultant@nicehr.local', ${hashedPassword}, 'Sarah', 'Johnson', 'consultant', true, 'active')
      ON CONFLICT (email) DO UPDATE SET
        password = ${hashedPassword},
        first_name = 'Sarah',
        last_name = 'Johnson',
        role = 'consultant',
        is_active = true,
        access_status = 'active'
    `);
    console.log("  - Consultant user: consultant@nicehr.local / password123");

    // Admin user for testing - update existing or insert new
    await db.execute(sql`
      INSERT INTO users (id, email, password, first_name, last_name, role, is_active, access_status)
      VALUES ('admin-login-user', 'admin@nicehr.local', ${hashedPassword}, 'Admin', 'User', 'admin', true, 'active')
      ON CONFLICT (email) DO UPDATE SET
        password = ${hashedPassword},
        first_name = 'Admin',
        last_name = 'User',
        role = 'admin',
        is_active = true,
        access_status = 'active'
    `);
    console.log("  - Admin user: admin@nicehr.local / password123");

    console.log("Seeding hospitals...");
    for (const hospital of demoHospitals) {
      await db.insert(hospitals).values(hospital).onConflictDoUpdate({
        target: hospitals.id,
        set: {
          name: hospital.name,
          address: hospital.address,
          city: hospital.city,
          state: hospital.state,
          zipCode: hospital.zipCode,
          phone: hospital.phone,
          email: hospital.email,
          website: hospital.website,
          facilityType: hospital.facilityType,
          bedCount: hospital.bedCount,
          traumaLevel: hospital.traumaLevel,
          teachingStatus: hospital.teachingStatus,
          ownershipType: hospital.ownershipType,
          healthSystemAffiliation: hospital.healthSystemAffiliation,
          npiNumber: hospital.npiNumber,
          cmsNumber: hospital.cmsNumber,
          emrSystem: hospital.emrSystem,
          currentEmrVersion: hospital.currentEmrVersion,
          targetEmrSystem: hospital.targetEmrSystem,
          dataCenter: hospital.dataCenter,
          itStaffCount: hospital.itStaffCount,
          networkInfrastructure: hospital.networkInfrastructure,
          goLiveDate: hospital.goLiveDate,
          implementationPhase: hospital.implementationPhase,
          contractValue: hospital.contractValue,
          primaryContactName: hospital.primaryContactName,
          primaryContactEmail: hospital.primaryContactEmail,
          primaryContactPhone: hospital.primaryContactPhone,
          executiveSponsor: hospital.executiveSponsor,
          jointCommissionAccredited: hospital.jointCommissionAccredited,
          lastAuditDate: hospital.lastAuditDate,
          hipaaOfficerName: hospital.hipaaOfficerName,
          hipaaOfficerEmail: hospital.hipaaOfficerEmail,
          totalStaff: hospital.totalStaff,
          notes: hospital.notes,
          isActive: hospital.isActive,
        },
      });
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
      }).onConflictDoUpdate({
        target: users.id,
        set: {
          email: consultant.email,
          firstName: consultant.firstName,
          lastName: consultant.lastName,
          role: "consultant",
          isActive: true,
          accessStatus: "active",
        },
      });

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
        shiftPreference: consultant.shiftPreference,
        isOnboarded: consultant.isOnboarded,
        isAvailable: consultant.isAvailable,
      }).onConflictDoUpdate({
        target: consultants.id,
        set: {
          phone: consultant.phone,
          city: consultant.city,
          state: consultant.state,
          yearsExperience: consultant.yearsExperience,
          emrSystems: consultant.emrSystems,
          modules: consultant.modules,
          positions: consultant.positions,
          bio: consultant.bio,
          payRate: consultant.payRate,
          shiftPreference: consultant.shiftPreference,
          isOnboarded: consultant.isOnboarded,
          isAvailable: consultant.isAvailable,
        },
      });
    }

    console.log("Seeding document types...");
    for (const docType of demoDocumentTypes) {
      await db.insert(documentTypes).values(docType).onConflictDoNothing();
    }

    console.log("Seeding onboarding templates...");
    for (const template of demoOnboardingTemplates) {
      await db.insert(onboardingTemplates).values(template).onConflictDoUpdate({
        target: onboardingTemplates.id,
        set: {
          documentTypeId: template.documentTypeId,
          taskType: template.taskType,
          title: template.title,
          description: template.description,
          phase: template.phase,
          phaseName: template.phaseName,
          orderIndex: template.orderIndex,
          isRequired: template.isRequired,
          dueDays: template.dueDays,
          instructions: template.instructions,
          formUrl: template.formUrl,
          isActive: true,
        },
      });
    }

    console.log("Seeding consultant documents...");
    for (const doc of demoConsultantDocuments) {
      await db.insert(consultantDocuments).values(doc).onConflictDoNothing();
    }

    console.log("Seeding projects...");
    for (const project of demoProjects) {
      await db.insert(projects).values(project).onConflictDoUpdate({
        target: projects.id,
        set: {
          name: project.name,
          description: project.description,
          startDate: project.startDate,
          endDate: project.endDate,
          originalEndDate: project.originalEndDate,
          status: project.status,
          estimatedConsultants: project.estimatedConsultants,
          actualConsultants: project.actualConsultants,
          contractType: project.contractType,
          contractValue: project.contractValue,
          billingRate: project.billingRate,
          paymentTerms: project.paymentTerms,
          laborBudget: project.laborBudget,
          travelBudget: project.travelBudget,
          softwareBudget: project.softwareBudget,
          trainingBudget: project.trainingBudget,
          infrastructureBudget: project.infrastructureBudget,
          contingencyBudget: project.contingencyBudget,
          laborActual: project.laborActual,
          travelActual: project.travelActual,
          softwareActual: project.softwareActual,
          trainingActual: project.trainingActual,
          infrastructureActual: project.infrastructureActual,
          contingencyActual: project.contingencyActual,
          estimatedBudget: project.estimatedBudget,
          actualBudget: project.actualBudget,
          baselineCost: project.baselineCost,
          projectedSavings: project.projectedSavings,
          actualSavings: project.actualSavings,
          roiPercentage: project.roiPercentage,
          paybackPeriodMonths: project.paybackPeriodMonths,
          savingsLaborEfficiency: project.savingsLaborEfficiency,
          savingsErrorReduction: project.savingsErrorReduction,
          savingsRevenueCycle: project.savingsRevenueCycle,
          savingsPatientThroughput: project.savingsPatientThroughput,
          savingsCompliance: project.savingsCompliance,
          savingsOther: project.savingsOther,
          savingsNotes: project.savingsNotes,
          invoicedAmount: project.invoicedAmount,
          paidAmount: project.paidAmount,
          savings: project.savings,
        },
      });
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

    console.log("Seeding project tasks...");
    for (const task of demoProjectTasks) {
      await db.insert(projectTasks).values(task).onConflictDoNothing();
    }

    console.log("Seeding user activities...");
    for (const activity of demoUserActivities) {
      await db.insert(userActivities).values(activity).onConflictDoNothing();
    }

    console.log("Seeding timesheets for performance metrics...");
    for (const timesheet of demoTimesheets) {
      await db.insert(timesheets).values(timesheet).onConflictDoUpdate({
        target: timesheets.id,
        set: {
          weekStartDate: timesheet.weekStartDate,
          weekEndDate: timesheet.weekEndDate,
          totalHours: timesheet.totalHours,
          regularHours: timesheet.regularHours,
          overtimeHours: timesheet.overtimeHours,
          status: timesheet.status,
        },
      });
    }

    console.log("Seeding support tickets for performance metrics...");
    for (const ticket of demoSupportTickets) {
      await db.insert(supportTickets).values(ticket).onConflictDoNothing();
    }

    console.log("Seeding project team assignments...");
    for (const assignment of demoProjectTeamAssignments) {
      await db.insert(projectTeamAssignments).values(assignment).onConflictDoNothing();
    }

    console.log("Seeding RACI assignments...");
    for (const assignment of demoRaciAssignments) {
      await db.insert(raciAssignments).values(assignment).onConflictDoNothing();
    }

    console.log("Seeding training courses...");
    for (const course of demoCourses) {
      await db.insert(courses).values(course).onConflictDoNothing();
    }

    // Create demo-admin user for foreign key references
    console.log("Seeding admin user...");
    await db.insert(users).values({
      id: "demo-admin",
      email: "admin@nicehr.local",
      firstName: "Demo",
      lastName: "Admin",
      role: "admin",
      isActive: true,
      accessStatus: "active",
    }).onConflictDoNothing();

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

    // Seed Contracts
    console.log("Seeding contracts...");
    const contractData = [
      {
        id: "contract-1",
        contractNumber: "CONT-2024-001",
        title: "Independent Consultant Agreement - Sarah Chen",
        content: "This Independent Consultant Agreement is entered into between NiceHR Consulting and Sarah Chen for consulting services at Memorial Hospital. Services include Epic EMR implementation support, workflow optimization, and clinical training.",
        consultantId: "consultant-1",
        projectId: "project-1",
        hospitalId: "hospital-1",
        status: "completed" as const,
        effectiveDate: "2024-11-01",
        expirationDate: "2025-04-30",
        metadata: {
          payRate: "150.00",
          billableHours: "40",
          travelReimbursement: true,
        },
        completedAt: new Date("2024-11-05"),
      },
      {
        id: "contract-2",
        contractNumber: "CONT-2024-002",
        title: "Independent Consultant Agreement - Michael Rodriguez",
        content: "This Independent Consultant Agreement is entered into between NiceHR Consulting and Michael Rodriguez for consulting services at Memorial Hospital. Services include Revenue Cycle optimization and Epic Resolute configuration.",
        consultantId: "consultant-2",
        projectId: "project-1",
        hospitalId: "hospital-1",
        status: "completed" as const,
        effectiveDate: "2024-11-01",
        expirationDate: "2025-04-30",
        metadata: {
          payRate: "150.00",
          billableHours: "40",
          travelReimbursement: true,
        },
        completedAt: new Date("2024-11-02"),
      },
      {
        id: "contract-3",
        contractNumber: "CONT-2024-003",
        title: "Independent Consultant Agreement - Jennifer Williams",
        content: "This Independent Consultant Agreement is entered into between NiceHR Consulting and Jennifer Williams for consulting services at St. Luke's Medical Center. Services include Cerner optimization and data migration support.",
        consultantId: "consultant-3",
        projectId: "project-2",
        hospitalId: "hospital-2",
        status: "completed" as const,
        effectiveDate: "2024-10-15",
        expirationDate: "2025-03-31",
        metadata: {
          payRate: "140.00",
          billableHours: "40",
          travelReimbursement: false,
        },
        completedAt: new Date("2024-10-18"),
      },
      {
        id: "contract-4",
        contractNumber: "CONT-2025-004",
        title: "Independent Consultant Agreement - David Kim",
        content: "This Independent Consultant Agreement is entered into between NiceHR Consulting and David Kim for consulting services at Pacific Northwest Regional Hospital. Services include Meditech implementation and clinical workflow design.",
        consultantId: "consultant-4",
        projectId: "project-3",
        hospitalId: "hospital-3",
        status: "pending_signature" as const,
        effectiveDate: "2025-02-01",
        expirationDate: "2025-07-31",
        metadata: {
          payRate: "155.00",
          billableHours: "40",
          travelReimbursement: true,
        },
      },
      {
        id: "contract-5",
        contractNumber: "CONT-2025-005",
        title: "Statement of Work - Epic Go-Live Support",
        content: "This Statement of Work covers go-live support services for Memorial Hospital Epic implementation, including at-elbow support, issue resolution, and post go-live optimization.",
        projectId: "project-1",
        hospitalId: "hospital-1",
        status: "draft" as const,
        effectiveDate: "2025-03-01",
        expirationDate: "2025-04-30",
        metadata: {
          totalBudget: "250000.00",
          consultantCount: 8,
          supportHours: "24/7",
        },
      },
    ];
    for (const contract of contractData) {
      await db.insert(contracts).values(contract).onConflictDoNothing();
    }

    // Seed Travel Bookings
    console.log("Seeding travel bookings...");
    const travelBookingData = [
      {
        id: "travel-1",
        consultantId: "consultant-1",
        projectId: "project-1",
        bookingType: "flight" as const,
        status: "confirmed" as const,
        departureDate: "2025-01-19",
        returnDate: "2025-01-26",
        airline: "United Airlines",
        flightNumber: "UA 1234",
        departureAirport: "SFO",
        arrivalAirport: "ORD",
        departureTime: "08:00",
        arrivalTime: "14:30",
        estimatedCost: "450.00",
        actualCost: "425.00",
        confirmationNumber: "ABC123XYZ",
        notes: "Direct flight, aisle seat confirmed",
      },
      {
        id: "travel-2",
        consultantId: "consultant-1",
        projectId: "project-1",
        bookingType: "hotel" as const,
        status: "confirmed" as const,
        hotelName: "Hilton Garden Inn Downtown",
        hotelAddress: "123 Main St, Chicago, IL 60601",
        hotelConfirmationNumber: "HILTON456789",
        checkInDate: "2025-01-19",
        checkOutDate: "2025-01-26",
        estimatedCost: "1400.00",
        actualCost: "1400.00",
        confirmationNumber: "HILTON456789",
        notes: "Corporate rate applied, breakfast included",
      },
      {
        id: "travel-3",
        consultantId: "consultant-2",
        projectId: "project-1",
        bookingType: "rental_car" as const,
        status: "confirmed" as const,
        departureDate: "2025-01-20",
        returnDate: "2025-01-27",
        rentalCompany: "Enterprise",
        pickupLocation: "Chicago O'Hare Airport",
        dropoffLocation: "Chicago O'Hare Airport",
        vehicleType: "Midsize SUV",
        rentalConfirmationNumber: "ENT789456",
        estimatedCost: "350.00",
        actualCost: "350.00",
        confirmationNumber: "ENT789456",
        notes: "GPS included, full coverage insurance",
      },
      {
        id: "travel-4",
        consultantId: "consultant-3",
        projectId: "project-2",
        bookingType: "flight" as const,
        status: "pending" as const,
        departureDate: "2025-02-01",
        returnDate: "2025-02-08",
        airline: "Delta",
        flightNumber: "DL 5678",
        departureAirport: "ATL",
        arrivalAirport: "SEA",
        departureTime: "10:15",
        arrivalTime: "13:45",
        estimatedCost: "520.00",
        notes: "Awaiting approval for business class upgrade",
      },
      {
        id: "travel-5",
        consultantId: "consultant-4",
        projectId: "project-3",
        bookingType: "hotel" as const,
        status: "confirmed" as const,
        hotelName: "Marriott Residence Inn",
        hotelAddress: "456 Pacific Ave, Portland, OR 97201",
        hotelConfirmationNumber: "MAR987654",
        checkInDate: "2025-01-22",
        checkOutDate: "2025-01-29",
        estimatedCost: "1050.00",
        actualCost: "1050.00",
        confirmationNumber: "MAR987654",
        notes: "Extended stay, full kitchen suite",
      },
    ];
    for (const booking of travelBookingData) {
      await db.insert(travelBookings).values(booking).onConflictDoNothing();
    }

    // Seed Schedules (Shift Schedules)
    console.log("Seeding schedules...");
    const scheduleData = [
      {
        id: "sched-1",
        projectId: "project-1",
        scheduleDate: "2025-01-20",
        shiftType: "day" as const,
        status: "approved" as const,
      },
      {
        id: "sched-2",
        projectId: "project-1",
        scheduleDate: "2025-01-21",
        shiftType: "day" as const,
        status: "approved" as const,
      },
      {
        id: "sched-3",
        projectId: "project-2",
        scheduleDate: "2025-01-22",
        shiftType: "night" as const,
        status: "approved" as const,
      },
      {
        id: "sched-4",
        projectId: "project-3",
        scheduleDate: "2025-01-23",
        shiftType: "swing" as const,
        status: "pending" as const,
      },
      {
        id: "sched-5",
        projectId: "project-1",
        scheduleDate: "2025-01-24",
        shiftType: "day" as const,
        status: "approved" as const,
      },
    ];
    for (const schedule of scheduleData) {
      await db.insert(projectSchedules).values(schedule).onConflictDoNothing();
    }

    // Seed EOD Reports
    console.log("Seeding EOD reports...");
    const eodReportData = [
      {
        id: "eod-1",
        projectId: "project-1",
        reportDate: "2025-01-17",
        submittedById: "user-c1",
        status: "submitted" as const,
        issuesResolved: 3,
        issuesPending: 2,
        issuesEscalated: 0,
        resolvedSummary: "Fixed 3 ED workflow issues related to triage documentation",
        pendingSummary: "Waiting for clinical review on 2 order set configurations",
        highlights: "Successfully completed ED workflow documentation review and validation with nursing leadership",
        challenges: "Minor scheduling conflict with pharmacy director meeting caused slight delay",
        tomorrowPlan: "Finalize medication reconciliation workflows and schedule training session with ED staff",
      },
      {
        id: "eod-2",
        projectId: "project-1",
        reportDate: "2025-01-17",
        submittedById: "user-c2",
        status: "submitted" as const,
        issuesResolved: 5,
        issuesPending: 0,
        issuesEscalated: 0,
        resolvedSummary: "Completed all ICU configuration tasks ahead of schedule",
        highlights: "Configured 15 ICU order sets in test environment and validated critical care flowsheets",
        tomorrowPlan: "Begin UAT for ICU order sets with clinical staff",
      },
      {
        id: "eod-3",
        projectId: "project-2",
        reportDate: "2025-01-16",
        submittedById: "user-c3",
        status: "approved" as const,
        issuesResolved: 2,
        issuesPending: 1,
        issuesEscalated: 1,
        resolvedSummary: "Optimized PowerChart lab results display, reducing load time by 40%",
        pendingSummary: "Complex lab query performance issue under investigation",
        challenges: "Database query timeout on complex lab result searches - escalated to Cerner vendor",
        tomorrowPlan: "Work with vendor on query optimization and test fixes in staging",
      },
      {
        id: "eod-4",
        projectId: "project-3",
        reportDate: "2025-01-15",
        submittedById: "user-c4",
        status: "submitted" as const,
        issuesResolved: 4,
        issuesPending: 0,
        issuesEscalated: 0,
        highlights: "Configured MyChart patient portal preferences and proxy access workflows successfully",
        tomorrowPlan: "Begin staff training on patient activation process",
      },
    ];
    for (const report of eodReportData) {
      await db.insert(eodReports).values(report).onConflictDoNothing();
    }

    // Seed Invoices
    console.log("Seeding invoices...");
    const invoiceData = [
      {
        id: "inv-1",
        projectId: "project-1",
        invoiceNumber: "INV-2025-001",
        invoiceDate: "2025-01-01",
        dueDate: "2025-01-31",
        status: "paid" as const,
        subtotal: "125000.00",
        taxAmount: "0.00",
        totalAmount: "125000.00",
        paidAmount: "125000.00",
        paidDate: "2025-01-15",
        paymentMethod: "wire_transfer" as const,
        notes: "Monthly consulting services - December 2024",
      },
      {
        id: "inv-2",
        projectId: "project-1",
        invoiceNumber: "INV-2025-002",
        invoiceDate: "2025-01-15",
        dueDate: "2025-02-14",
        status: "sent" as const,
        subtotal: "132500.00",
        taxAmount: "0.00",
        totalAmount: "132500.00",
        paidAmount: "0.00",
        notes: "Monthly consulting services - January 2025 (first half)",
      },
      {
        id: "inv-3",
        projectId: "project-2",
        invoiceNumber: "INV-2025-003",
        invoiceDate: "2025-01-01",
        dueDate: "2025-01-31",
        status: "paid" as const,
        subtotal: "87500.00",
        taxAmount: "0.00",
        totalAmount: "87500.00",
        paidAmount: "87500.00",
        paidDate: "2025-01-20",
        paymentMethod: "ach" as const,
        notes: "Cerner optimization services - December 2024",
      },
      {
        id: "inv-4",
        projectId: "project-3",
        invoiceNumber: "INV-2025-004",
        invoiceDate: "2025-01-10",
        dueDate: "2025-02-09",
        status: "draft" as const,
        subtotal: "45000.00",
        taxAmount: "0.00",
        totalAmount: "45000.00",
        paidAmount: "0.00",
        notes: "MyChart portal implementation - Phase 1 milestone",
      },
    ];
    for (const invoice of invoiceData) {
      await db.insert(invoices).values(invoice).onConflictDoNothing();
    }

    // Seed Invoice Line Items
    console.log("Seeding invoice line items...");
    const invoiceLineItemData = [
      {
        id: "inv-line-1-1",
        invoiceId: "inv-1",
        description: "Senior Consultant - Sarah Chen (160 hours @ $150/hr)",
        quantity: 160,
        unitPrice: "150.00",
        amount: "24000.00",
      },
      {
        id: "inv-line-1-2",
        invoiceId: "inv-1",
        description: "Senior Consultant - Michael Rodriguez (160 hours @ $150/hr)",
        quantity: 160,
        unitPrice: "150.00",
        amount: "24000.00",
      },
      {
        id: "inv-line-1-3",
        invoiceId: "inv-1",
        description: "Consultant - Jennifer Williams (152 hours @ $125/hr)",
        quantity: 152,
        unitPrice: "125.00",
        amount: "19000.00",
      },
      {
        id: "inv-line-1-4",
        invoiceId: "inv-1",
        description: "Travel & Expenses",
        quantity: 1,
        unitPrice: "8000.00",
        amount: "8000.00",
      },
      {
        id: "inv-line-2-1",
        invoiceId: "inv-2",
        description: "Senior Consultant - Sarah Chen (168 hours @ $150/hr)",
        quantity: 168,
        unitPrice: "150.00",
        amount: "25200.00",
      },
      {
        id: "inv-line-2-2",
        invoiceId: "inv-2",
        description: "Senior Consultant - Michael Rodriguez (162 hours @ $150/hr)",
        quantity: 162,
        unitPrice: "150.00",
        amount: "24300.00",
      },
      {
        id: "inv-line-3-1",
        invoiceId: "inv-3",
        description: "Optimization Services - Month of December",
        quantity: 1,
        unitPrice: "87500.00",
        amount: "87500.00",
      },
    ];
    for (const lineItem of invoiceLineItemData) {
      await db.insert(invoiceLineItems).values(lineItem).onConflictDoNothing();
    }

    // Seed Phase 4 Advanced Analytics data
    await seedPhase4AnalyticsData();

    // Seed Change Management data
    console.log("Seeding change management data...");
    const changeRequestData = [
      {
        id: "cr-1",
        projectId: "project-1",
        requestNumber: "CR-2026-0001",
        title: "Add pharmacy interface to Epic integration",
        description: "Request to include the pharmacy module in the Epic interface build. This will enable bidirectional medication orders and dispensing data exchange.",
        category: "scope" as const,
        priority: "high" as const,
        status: "approved" as const,
        impactLevel: "significant" as const,
        requestedById: "demo-admin",
        requestedByName: "Dev Admin",
        justification: "Pharmacy is critical for medication reconciliation during go-live. Without this interface, nurses will need to manually enter medications.",
        proposedSolution: "Add HL7 ADT and RDE message types to the existing interface engine configuration.",
        estimatedEffort: "80 hours",
        estimatedCost: 12000,
        targetImplementationDate: new Date("2025-05-01"),
        submittedAt: new Date("2025-01-10"),
        decidedAt: new Date("2025-01-12"),
        createdAt: new Date("2025-01-08"),
        updatedAt: new Date("2025-01-12"),
      },
      {
        id: "cr-2",
        projectId: "project-1",
        requestNumber: "CR-2026-0002",
        title: "Extend training timeline by 1 week",
        description: "Request to extend the end-user training period from 3 weeks to 4 weeks to accommodate staff scheduling constraints.",
        category: "timeline" as const,
        priority: "medium" as const,
        status: "submitted" as const,
        impactLevel: "moderate" as const,
        requestedById: "user-c2",
        requestedByName: "Michael Rodriguez",
        justification: "Nursing leadership has indicated that 3 weeks is insufficient to train all shifts without impacting patient care. An additional week allows for overlap training.",
        proposedSolution: "Extend training from Feb 15-Mar 8 to Feb 15-Mar 15. This still allows 2 weeks before go-live for remediation.",
        estimatedEffort: "40 hours additional",
        estimatedCost: 8000,
        targetImplementationDate: new Date("2025-02-01"),
        submittedAt: new Date("2025-01-15"),
        createdAt: new Date("2025-01-14"),
        updatedAt: new Date("2025-01-15"),
      },
      {
        id: "cr-3",
        projectId: "project-1",
        requestNumber: "CR-2026-0003",
        title: "Add 5 additional workstations in ED",
        description: "Emergency Department requires 5 additional mobile workstations to support the new Epic workflow.",
        category: "budget" as const,
        priority: "critical" as const,
        status: "implemented" as const,
        impactLevel: "major" as const,
        requestedById: "user-c3",
        requestedByName: "Jennifer Williams",
        justification: "Current workstation density is 1:4 (provider:workstation). Epic workflow requires 1:2 ratio for efficient patient throughput.",
        proposedSolution: "Procure 5 additional Ergotron mobile workstations with barcode scanners.",
        estimatedEffort: "16 hours",
        estimatedCost: 35000,
        targetImplementationDate: new Date("2025-04-15"),
        actualImplementationDate: new Date("2025-01-10"),
        submittedAt: new Date("2024-12-20"),
        decidedAt: new Date("2024-12-22"),
        implementedAt: new Date("2025-01-10"),
        createdAt: new Date("2024-12-18"),
        updatedAt: new Date("2025-01-10"),
      },
      {
        id: "cr-4",
        projectId: "project-1",
        requestNumber: "CR-2026-0004",
        title: "Switch lab interface from HL7 v2.3 to v2.5.1",
        description: "Lab vendor recommends upgrading the interface specification from HL7 v2.3 to v2.5.1 for better structured data support.",
        category: "technical" as const,
        priority: "medium" as const,
        status: "rejected" as const,
        impactLevel: "moderate" as const,
        requestedById: "user-c4",
        requestedByName: "David Kim",
        justification: "HL7 v2.5.1 provides better support for microbiology results and allows for more granular result codes.",
        proposedSolution: "Rebuild the outbound lab results interface using v2.5.1 message specification.",
        estimatedEffort: "120 hours",
        estimatedCost: 18000,
        targetImplementationDate: new Date("2025-04-01"),
        submittedAt: new Date("2025-01-05"),
        decidedAt: new Date("2025-01-08"),
        createdAt: new Date("2025-01-03"),
        updatedAt: new Date("2025-01-08"),
      },
      {
        id: "cr-5",
        projectId: "project-1",
        requestNumber: "CR-2026-0005",
        title: "Add after-hours support consultant",
        description: "Request for one additional consultant to provide 24/7 coverage during the go-live week.",
        category: "resource" as const,
        priority: "high" as const,
        status: "draft" as const,
        impactLevel: "moderate" as const,
        requestedById: "demo-admin",
        requestedByName: "Dev Admin",
        justification: "Current staffing model provides coverage from 6am-10pm only. Hospital operates 24/7 and needs support during overnight hours.",
        proposedSolution: "Engage additional consultant with inpatient experience for overnight shift (10pm-6am) during go-live week.",
        estimatedEffort: "56 hours",
        estimatedCost: 14000,
        targetImplementationDate: new Date("2025-06-01"),
        createdAt: new Date("2025-01-16"),
        updatedAt: new Date("2025-01-16"),
      },
      {
        id: "cr-6",
        projectId: "project-2",
        requestNumber: "CR-2026-0006",
        title: "Include patient portal in Phase 1",
        description: "Request to add MyChart patient portal configuration to Phase 1 go-live scope.",
        category: "scope" as const,
        priority: "medium" as const,
        status: "under_review" as const,
        impactLevel: "significant" as const,
        requestedById: "user-c5",
        requestedByName: "Amanda Foster",
        justification: "Patient portal was originally planned for Phase 2, but hospital marketing has committed to patients that it will be available at go-live.",
        proposedSolution: "Add MyChart configuration tasks to the project plan and include in Phase 1 training curriculum.",
        estimatedEffort: "200 hours",
        estimatedCost: 45000,
        targetImplementationDate: new Date("2025-09-01"),
        submittedAt: new Date("2025-01-14"),
        reviewStartedAt: new Date("2025-01-16"),
        createdAt: new Date("2025-01-12"),
        updatedAt: new Date("2025-01-16"),
      },
    ];
    for (const changeRequest of changeRequestData) {
      await db.insert(changeRequests).values(changeRequest).onConflictDoNothing();
    }

    // Seed Change Request Impacts
    const changeImpactData = [
      {
        id: "impact-1",
        changeRequestId: "cr-1",
        impactArea: "scope" as const,
        description: "Adds 15 new interface message types to the build scope",
        severity: "medium" as const,
      },
      {
        id: "impact-2",
        changeRequestId: "cr-1",
        impactArea: "resources" as const,
        description: "Requires interface analyst availability for 2 additional weeks",
        severity: "low" as const,
      },
      {
        id: "impact-3",
        changeRequestId: "cr-2",
        impactArea: "schedule" as const,
        description: "Delays start of remediation week by 7 days",
        severity: "medium" as const,
      },
      {
        id: "impact-4",
        changeRequestId: "cr-2",
        impactArea: "budget" as const,
        description: "Additional trainer costs for extended training period",
        severity: "low" as const,
      },
      {
        id: "impact-5",
        changeRequestId: "cr-3",
        impactArea: "budget" as const,
        description: "Hardware procurement exceeds original equipment budget by 15%",
        severity: "high" as const,
      },
      {
        id: "impact-6",
        changeRequestId: "cr-6",
        impactArea: "schedule" as const,
        description: "May delay go-live if portal build extends beyond Phase 1 timeline",
        severity: "high" as const,
      },
      {
        id: "impact-7",
        changeRequestId: "cr-6",
        impactArea: "resources" as const,
        description: "Requires dedicated portal analyst - currently not staffed",
        severity: "high" as const,
      },
    ];
    for (const impact of changeImpactData) {
      await db.insert(changeRequestImpacts).values(impact).onConflictDoNothing();
    }

    // Seed Change Request Approvals
    const changeApprovalData = [
      {
        id: "approval-1",
        changeRequestId: "cr-1",
        approverId: "demo-admin",
        approverName: "Patricia Chen",
        approverRole: "Project Director",
        decision: "approved" as const,
        comments: "Approved - pharmacy interface is critical for medication safety. Budget increase approved by steering committee.",
        decidedAt: new Date("2025-01-12"),
        createdAt: new Date("2025-01-12"),
      },
      {
        id: "approval-2",
        changeRequestId: "cr-3",
        approverId: "demo-admin",
        approverName: "Patricia Chen",
        approverRole: "Project Director",
        decision: "approved" as const,
        comments: "Approved per ED medical director request. Critical for patient throughput.",
        decidedAt: new Date("2024-12-22"),
        createdAt: new Date("2024-12-22"),
      },
      {
        id: "approval-3",
        changeRequestId: "cr-4",
        approverId: "demo-admin",
        approverName: "Patricia Chen",
        approverRole: "Project Director",
        decision: "rejected" as const,
        comments: "Rejected - risk too high to change interface specification at this stage. Lab vendor has confirmed v2.3 meets all requirements. Can revisit post go-live.",
        decidedAt: new Date("2025-01-08"),
        createdAt: new Date("2025-01-08"),
      },
    ];
    for (const approval of changeApprovalData) {
      await db.insert(changeRequestApprovals).values(approval).onConflictDoNothing();
    }

    // Seed Change Request Comments
    const changeCommentData = [
      {
        id: "comment-1",
        changeRequestId: "cr-2",
        userId: "demo-admin",
        userName: "Dev Admin",
        content: "I support this request. The nursing staff has been vocal about the compressed training timeline.",
        createdAt: new Date("2025-01-15T09:30:00"),
      },
      {
        id: "comment-2",
        changeRequestId: "cr-2",
        userId: "user-c3",
        userName: "Jennifer Williams",
        content: "Training team has confirmed they can accommodate the extended timeline with current staffing.",
        createdAt: new Date("2025-01-15T14:15:00"),
      },
      {
        id: "comment-3",
        changeRequestId: "cr-4",
        userId: "user-c4",
        userName: "David Kim",
        content: "Understood. We will proceed with v2.3 as planned and document the v2.5.1 upgrade for Phase 2.",
        createdAt: new Date("2025-01-08T16:45:00"),
      },
      {
        id: "comment-4",
        changeRequestId: "cr-6",
        userId: "user-c5",
        userName: "Amanda Foster",
        content: "Marketing has agreed to adjust messaging if needed. However, they strongly prefer portal at go-live.",
        createdAt: new Date("2025-01-16T10:00:00"),
      },
      {
        id: "comment-5",
        changeRequestId: "cr-6",
        userId: "demo-admin",
        userName: "Patricia Chen",
        content: "Scheduling meeting with steering committee on Thursday to discuss scope implications.",
        createdAt: new Date("2025-01-16T11:30:00"),
      },
    ];
    for (const comment of changeCommentData) {
      await db.insert(changeRequestComments).values(comment).onConflictDoNothing();
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
