# DiSChedule - Claude Code Development Prompt

## What You're Building

DiSChedule — a standalone workforce optimization platform that combines DiSC behavioral assessments with skills matching to build high-performing teams. "Teams that actually work."

This will later integrate into NICEHR platform. Build standalone first using identical tech stack and patterns.

---

## Tech Stack (Use Exactly)

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS + shadcn/ui
- **Backend:** Node.js + Express + TypeScript
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** Simple session-based (upgrade later)
- **State:** React Query + Zustand

---

## Design System

Apple-inspired. Minimal. Clean.

### Colors
```css
--text-primary: #1d1d1f
--text-secondary: #86868b
--bg-primary: #ffffff
--bg-subtle: #f5f5f7
--border: #e8e8ed
--accent: #6B9BD1
--success: #4A9B5D
--warning: #F4B942
--error: #D64933
```

### Typography
- Hero: 44px, weight 600, tracking -0.025em
- Title: 28px, weight 600
- Heading: 22px, weight 600
- Body: 14px, weight 400
- Small: 11px, weight 500
- Caption: 9px, uppercase, tracking 0.04em

### Principles
- Extreme white space
- One accent color
- 12-18px border radius
- Subtle shadows only
- System fonts (-apple-system first)

---

## Database Schema

Create this Prisma schema:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Organization {
  id               String   @id @default(uuid())
  name             String
  industryType     String   @default("healthcare")
  subscriptionTier String   @default("starter")
  logoUrl          String?
  primaryColor     String   @default("#6B9BD1")
  settings         Json     @default("{}")
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  people             Person[]
  skills             Skill[]
  projects           Project[]
  teams              Team[]
  compatibilityRules CompatibilityRule[]
}

model Person {
  id                 String    @id @default(uuid())
  orgId              String
  email              String
  firstName          String
  lastName           String
  profilePhotoUrl    String?
  roleTitle          String?
  employmentType     String    @default("consultant")
  availabilityStatus String    @default("available")
  locationCity       String?
  locationState      String?
  remoteEligible     Boolean   @default(true)
  travelEligible     Boolean   @default(false)
  isActive           Boolean   @default(true)
  createdAt          DateTime  @default(now())
  updatedAt          DateTime  @updatedAt

  organization    Organization     @relation(fields: [orgId], references: [id])
  discAssessment  DiscAssessment?
  skills          PersonSkill[]
  teamAssignments TeamAssignment[]

  @@unique([orgId, email])
}

model DiscAssessment {
  id             String   @id @default(uuid())
  personId       String   @unique
  primaryStyle   String   // D, i, S, C
  secondaryStyle String?
  dScore         Int      // 0-100
  iScore         Int      // 0-100
  sScore         Int      // 0-100
  cScore         Int      // 0-100
  assessmentDate DateTime
  validUntil     DateTime
  assessorName   String?
  notes          String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  person Person @relation(fields: [personId], references: [id], onDelete: Cascade)
}

model Skill {
  id            String   @id @default(uuid())
  orgId         String
  name          String
  category      String
  subcategory   String?
  description   String?
  isCertifiable Boolean  @default(false)
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())

  organization Organization  @relation(fields: [orgId], references: [id])
  personSkills PersonSkill[]

  @@unique([orgId, name])
}

model PersonSkill {
  id                  String    @id @default(uuid())
  personId            String
  skillId             String
  proficiencyLevel    Int       // 1-5
  yearsExperience     Decimal?
  certificationName   String?
  certificationDate   DateTime?
  certificationExpiry DateTime?
  lastUsedDate        DateTime?
  notes               String?
  createdAt           DateTime  @default(now())

  person Person @relation(fields: [personId], references: [id], onDelete: Cascade)
  skill  Skill  @relation(fields: [skillId], references: [id])

  @@unique([personId, skillId])
}

model Project {
  id           String    @id @default(uuid())
  orgId        String
  name         String
  clientName   String?
  description  String?
  status       String    @default("planning")
  currentPhase String?
  startDate    DateTime?
  endDate      DateTime?
  location     String?
  isRemote     Boolean   @default(false)
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  organization Organization @relation(fields: [orgId], references: [id])
  teams        Team[]
}

model Team {
  id         String   @id @default(uuid())
  orgId      String
  projectId  String?
  name       String
  purpose    String?
  targetSize Int?
  status     String   @default("forming")
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  organization Organization     @relation(fields: [orgId], references: [id])
  project      Project?         @relation(fields: [projectId], references: [id])
  assignments  TeamAssignment[]
  analyses     TeamAnalysis[]
}

model TeamAssignment {
  id                String    @id @default(uuid())
  teamId            String
  personId          String
  role              String?
  startDate         DateTime?
  endDate           DateTime?
  allocationPercent Int       @default(100)
  status            String    @default("active")
  createdAt         DateTime  @default(now())

  team   Team   @relation(fields: [teamId], references: [id], onDelete: Cascade)
  person Person @relation(fields: [personId], references: [id])

  @@unique([teamId, personId])
}

model TeamAnalysis {
  id                  String   @id @default(uuid())
  teamId              String
  analysisDate        DateTime @default(now())
  overallScore        Int
  styleDistribution   Json
  compatibilityMatrix Json
  strengths           String[]
  risks               String[]
  recommendations     String[]
  flagsTriggered      Json
  createdAt           DateTime @default(now())

  team Team @relation(fields: [teamId], references: [id], onDelete: Cascade)
}

model CompatibilityRule {
  id              String   @id @default(uuid())
  orgId           String
  name            String
  description     String
  ruleType        String
  severity        String   @default("warning")
  isActive        Boolean  @default(true)
  conditions      Json
  messageTemplate String
  suggestion      String?
  createdAt       DateTime @default(now())

  organization Organization @relation(fields: [orgId], references: [id])

  @@unique([orgId, name])
}
```

---

## Project Structure

Create this structure:

```
/dischedule
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── .env
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── server/
│   ├── index.ts
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── people.ts
│   │   ├── teams.ts
│   │   ├── skills.ts
│   │   ├── projects.ts
│   │   ├── rules.ts
│   │   └── dashboard.ts
│   ├── services/
│   │   ├── analysis.ts
│   │   └── matching.ts
│   └── middleware/
│       └── auth.ts
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── components/
│   │   ├── ui/ (shadcn components)
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   └── PageContainer.tsx
│   │   ├── people/
│   │   │   ├── PersonCard.tsx
│   │   │   ├── PersonForm.tsx
│   │   │   ├── DiscBadge.tsx
│   │   │   └── DiscWheel.tsx
│   │   └── teams/
│   │       ├── TeamCard.tsx
│   │       ├── TeamBuilder.tsx
│   │       ├── AnalysisResults.tsx
│   │       └── CompatibilityScore.tsx
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── People.tsx
│   │   ├── PersonDetail.tsx
│   │   ├── Teams.tsx
│   │   ├── TeamDetail.tsx
│   │   └── Settings.tsx
│   ├── hooks/
│   │   ├── usePeople.ts
│   │   └── useTeams.ts
│   └── lib/
│       ├── api.ts
│       └── utils.ts
└── public/
```

---

## API Endpoints

### Auth
```
POST /api/auth/login
POST /api/auth/logout  
GET  /api/auth/me
```

### People
```
GET    /api/people
POST   /api/people
GET    /api/people/:id
PUT    /api/people/:id
DELETE /api/people/:id
GET    /api/people/:id/disc
PUT    /api/people/:id/disc
GET    /api/people/:id/skills
POST   /api/people/:id/skills
PUT    /api/people/:id/skills/:skillId
DELETE /api/people/:id/skills/:skillId
```

### Teams
```
GET    /api/teams
POST   /api/teams
GET    /api/teams/:id
PUT    /api/teams/:id
DELETE /api/teams/:id
POST   /api/teams/:id/members
DELETE /api/teams/:id/members/:personId
POST   /api/teams/:id/analyze
GET    /api/teams/:id/analyses
```

### Skills
```
GET    /api/skills
POST   /api/skills
PUT    /api/skills/:id
DELETE /api/skills/:id
```

### Projects
```
GET    /api/projects
POST   /api/projects
GET    /api/projects/:id
PUT    /api/projects/:id
```

### Dashboard
```
GET    /api/dashboard/stats
GET    /api/dashboard/recent-teams
GET    /api/dashboard/alerts
```

---

## Seed Data

Create seed file with:

### DiSC Style Data
```typescript
const discStyles = {
  D: {
    name: "Dominance",
    color: "#D64933",
    strengths: ["Decisive", "Problem solver", "Risk taker", "Self-starter"],
    challenges: ["Impatient", "Insensitive", "Demanding"],
    idealRoles: ["Project Lead", "Command Center Director"]
  },
  i: {
    name: "Influence",
    color: "#F4B942", 
    strengths: ["Enthusiastic", "Collaborative", "Creative", "Motivating"],
    challenges: ["Disorganized", "Impulsive", "Lacks follow-through"],
    idealRoles: ["Trainer", "End-user liaison", "Change champion"]
  },
  S: {
    name: "Steadiness",
    color: "#4A9B5D",
    strengths: ["Patient", "Team player", "Reliable", "Good listener"],
    challenges: ["Resistant to change", "Avoids conflict", "Indecisive"],
    idealRoles: ["At-the-elbow support", "Super user coach", "Help desk"]
  },
  C: {
    name: "Conscientiousness",
    color: "#3B82C4",
    strengths: ["Accurate", "Detail-oriented", "Quality-focused", "Systematic"],
    challenges: ["Overly critical", "Analysis paralysis", "Perfectionist"],
    idealRoles: ["Build analyst", "Testing lead", "Data validation"]
  }
};
```

### Demo Organization
```typescript
const demoOrg = {
  name: "THE NICEHR GROUP",
  industryType: "healthcare",
  primaryColor: "#6B9BD1"
};
```

### Demo People (8 consultants)
```typescript
const demoPeople = [
  { firstName: "Marcus", lastName: "Chen", roleTitle: "Senior Consultant", primaryStyle: "D", secondaryStyle: "C", dScore: 85, iScore: 35, sScore: 25, cScore: 72 },
  { firstName: "Priya", lastName: "Sharma", roleTitle: "Training Lead", primaryStyle: "i", secondaryStyle: "S", dScore: 40, iScore: 88, sScore: 65, cScore: 30 },
  { firstName: "David", lastName: "Okonkwo", roleTitle: "Support Specialist", primaryStyle: "S", secondaryStyle: "C", dScore: 25, iScore: 45, sScore: 82, cScore: 68 },
  { firstName: "Jessica", lastName: "Martinez", roleTitle: "Command Center Lead", primaryStyle: "D", secondaryStyle: "i", dScore: 78, iScore: 72, sScore: 35, cScore: 40 },
  { firstName: "Michael", lastName: "Thompson", roleTitle: "Build Analyst", primaryStyle: "C", secondaryStyle: "S", dScore: 30, iScore: 25, sScore: 58, cScore: 90 },
  { firstName: "Aisha", lastName: "Johnson", roleTitle: "Trainer", primaryStyle: "i", dScore: 45, iScore: 92, sScore: 55, cScore: 28 },
  { firstName: "Robert", lastName: "Kim", roleTitle: "Testing Lead", primaryStyle: "C", dScore: 35, iScore: 30, sScore: 45, cScore: 88 },
  { firstName: "Sarah", lastName: "Williams", roleTitle: "Support Specialist", primaryStyle: "S", dScore: 20, iScore: 50, sScore: 90, cScore: 55 }
];
```

### Default Compatibility Rules
```typescript
const defaultRules = [
  {
    name: "HIGH_D_CONCENTRATION",
    description: "Multiple high-D personalities may create power struggles",
    ruleType: "composition",
    severity: "warning",
    conditions: { type: "style_count", style: "D", threshold: 2, scoreThreshold: 70 },
    messageTemplate: "Team has {count} high-D members. May cause power struggles.",
    suggestion: "Add S-style members to balance assertiveness"
  },
  {
    name: "NO_DETAIL_ORIENTATION",
    description: "Team lacks conscientiousness for detail work",
    ruleType: "composition",
    severity: "critical",
    conditions: { type: "style_minimum", style: "C", minimumCount: 1, scoreThreshold: 50 },
    messageTemplate: "No team members with strong C-style. Quality may suffer.",
    suggestion: "Add at least one detail-oriented C-style member"
  },
  {
    name: "ALL_SAME_STYLE",
    description: "Homogeneous teams lack diverse perspectives",
    ruleType: "composition",
    severity: "warning",
    conditions: { type: "style_diversity", minimumStyles: 2 },
    messageTemplate: "Team dominated by one style. Diverse perspectives missing.",
    suggestion: "Add members with complementary styles"
  },
  {
    name: "HIGH_FRICTION_PAIRING",
    description: "D-S and i-C pairings need extra communication support",
    ruleType: "pairing",
    severity: "info",
    conditions: { type: "pairwise_friction", pairs: [["D", "S"], ["i", "C"]] },
    messageTemplate: "{person1} and {person2} pairing may need communication coaching.",
    suggestion: "Establish clear communication protocols"
  },
  {
    name: "IDEAL_BALANCE",
    description: "Team has good style diversity",
    ruleType: "composition",
    severity: "success",
    conditions: { type: "all_styles_present" },
    messageTemplate: "Great balance! Team has all DiSC styles represented.",
    suggestion: null
  }
];
```

### Healthcare Skills
```typescript
const healthcareSkills = [
  { name: "Epic Ambulatory", category: "EHR Systems", subcategory: "Epic", isCertifiable: true },
  { name: "Epic Inpatient", category: "EHR Systems", subcategory: "Epic", isCertifiable: true },
  { name: "Epic Revenue Cycle", category: "EHR Systems", subcategory: "Epic", isCertifiable: true },
  { name: "Cerner PowerChart", category: "EHR Systems", subcategory: "Cerner", isCertifiable: true },
  { name: "MEDITECH Expanse", category: "EHR Systems", subcategory: "MEDITECH", isCertifiable: true },
  { name: "Clinical Workflow Design", category: "Clinical", isCertifiable: false },
  { name: "End User Training", category: "Training", isCertifiable: false },
  { name: "At-the-Elbow Support", category: "Support", isCertifiable: false },
  { name: "Command Center Operations", category: "Go-Live", isCertifiable: false },
  { name: "Go-Live Support", category: "Go-Live", isCertifiable: false }
];
```

---

## Team Analysis Logic

### Compatibility Matrix (base scores)
```typescript
const compatibilityMatrix = {
  D: { D: 70, i: 80, S: 60, C: 75 },
  i: { D: 80, i: 75, S: 85, C: 65 },
  S: { D: 60, i: 85, S: 80, C: 75 },
  C: { D: 75, i: 65, S: 75, C: 85 }
};
```

### Analysis Function
```typescript
function analyzeTeam(members: PersonWithDisc[]): TeamAnalysis {
  // 1. Calculate style distribution
  const distribution = { D: 0, i: 0, S: 0, C: 0 };
  members.forEach(m => {
    distribution[m.discAssessment.primaryStyle] += 1;
  });
  
  // 2. Calculate pairwise compatibility scores
  const pairScores = [];
  for (let i = 0; i < members.length; i++) {
    for (let j = i + 1; j < members.length; j++) {
      const style1 = members[i].discAssessment.primaryStyle;
      const style2 = members[j].discAssessment.primaryStyle;
      pairScores.push({
        person1: members[i].id,
        person2: members[j].id,
        score: compatibilityMatrix[style1][style2]
      });
    }
  }
  
  // 3. Evaluate rules
  const flags = evaluateRules(members, distribution);
  
  // 4. Calculate overall score
  const avgPairScore = pairScores.reduce((a, b) => a + b.score, 0) / pairScores.length;
  const criticalFlags = flags.filter(f => f.severity === 'critical').length;
  const warningFlags = flags.filter(f => f.severity === 'warning').length;
  const overallScore = Math.round(avgPairScore - (criticalFlags * 15) - (warningFlags * 5));
  
  // 5. Generate insights
  const strengths = generateStrengths(distribution, flags);
  const risks = generateRisks(flags);
  const recommendations = generateRecommendations(distribution, flags);
  
  return {
    overallScore: Math.max(0, Math.min(100, overallScore)),
    styleDistribution: distribution,
    compatibilityMatrix: pairScores,
    strengths,
    risks,
    recommendations,
    flagsTriggered: flags
  };
}
```

---

## UI Pages to Build

### 1. Dashboard
- Welcome header
- Stats cards: Total People, Active Teams, Avg Score, Alerts
- Recent team analyses list
- Quick action buttons

### 2. People List
- Search bar
- Filter by style, availability
- Grid of PersonCards
- Add Person button

### 3. Person Detail
- Profile header (photo, name, role)
- DiSC section with wheel visualization
- Skills list with proficiency bars
- Team assignments history

### 4. Teams List
- Team cards with compatibility score badge
- Status filter (forming, active, completed)
- Create Team button

### 5. Team Detail
- Team header with score donut
- Members list with DiSC badges
- Analysis results (strengths, risks, recommendations)
- Triggered rules display
- Analyze button
- Simulate button

### 6. Team Builder
- Step 1: Name, project, purpose
- Step 2: Add members (searchable list)
- Step 3: Live preview of compatibility
- Save team

---

## Component Checklist

### Layout
- [ ] Sidebar (collapsible, Apple style)
- [ ] Header (minimal)
- [ ] PageContainer (max-width, centered)

### People
- [ ] PersonCard (photo, name, DiSC badge)
- [ ] PersonForm (create/edit)
- [ ] DiscBadge (colored circle with letter)
- [ ] DiscWheel (4-quadrant visualization)
- [ ] SkillBar (proficiency indicator)

### Teams
- [ ] TeamCard (name, score badge, member count)
- [ ] TeamBuilder (multi-step wizard)
- [ ] CompatibilityScore (donut chart)
- [ ] AnalysisResults (strengths/risks/recs)
- [ ] RuleFlag (alert display)

### Shared
- [ ] StatCard
- [ ] SearchInput
- [ ] FilterDropdown
- [ ] EmptyState
- [ ] LoadingState

---

## Build Order

1. **Setup:** Project structure, dependencies, Prisma schema, database
2. **Seed:** Run seed with demo data
3. **API:** Basic CRUD for people, teams, skills
4. **Layout:** Sidebar, header, page container
5. **People:** List page, detail page, forms
6. **DiSC:** Badge component, wheel component
7. **Teams:** List page, detail page
8. **Analysis:** Service logic, results display
9. **Team Builder:** Multi-step wizard
10. **Dashboard:** Stats, recent activity
11. **Polish:** Loading states, empty states, error handling

---

## Notes

- Use shadcn/ui components — don't build from scratch
- Keep it minimal — Apple design means less, not more
- Test analysis logic with demo data
- This integrates into NICEHR later — keep patterns consistent

---

*Created by Wendy Perdomo, Certified DiSC Professional | www.coachingwomenofcolor.com*
