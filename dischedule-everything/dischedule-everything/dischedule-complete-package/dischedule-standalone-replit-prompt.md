# DiSChedule - Standalone Replit Development Prompt

## Project Context

**PROJECT NAME:** DiSChedule (standalone)

**RELATIONSHIP TO NICEHR:** This is a standalone platform that will later integrate into the NICEHR healthcare IT consulting platform. Build it independently but use the same tech stack and design patterns for seamless future integration.

**CORE VALUE PROPOSITION:** "Teams that actually work." — Combine DiSC behavioral assessments with skills matching to build teams with the right chemistry, not just the right credentials.

**CREATED BY:** Wendy Perdomo, Certified DiSC Professional (Coaching Women of Color)

---

## Tech Stack (Match NICEHR Exactly)

| Layer | Technology |
|-------|------------|
| Frontend | React 18+ with TypeScript |
| Styling | Tailwind CSS + shadcn/ui components |
| Backend | Node.js with Express |
| Database | PostgreSQL with Prisma ORM |
| Authentication | Session-based auth (simple for MVP, upgrade later) |
| State | React Query for server state, Zustand for client state |
| Deployment | Replit |

---

## Design System: Apple-Inspired

### Core Principles
- **Extreme white space** — let content breathe
- **Minimal color** — black, white, grays, one accent color
- **Typography hierarchy** — large headlines, small body text
- **One idea per section**
- **Rounded corners** — 12px-18px radius consistently
- **Subtle shadows** — barely there, never heavy
- **SF Pro-style fonts** — system fonts, -apple-system first

### Color Tokens
```css
:root {
  --text-primary: #1d1d1f;
  --text-secondary: #86868b;
  --bg-primary: #ffffff;
  --bg-subtle: #f5f5f7;
  --border: #e8e8ed;
  --accent: #6B9BD1; /* TNG blue - change per branding */
  --success: #4A9B5D;
  --warning: #F4B942;
  --error: #D64933;
}
```

### Typography Scale
```css
--text-hero: 44px, weight 600, tracking -0.025em
--text-title: 28px, weight 600, tracking -0.02em
--text-heading: 22px, weight 600, tracking -0.015em
--text-subheading: 14px, weight 600
--text-body: 14px, weight 400
--text-small: 11px, weight 500
--text-caption: 9px, weight 500, uppercase, tracking 0.04em
```

### Component Patterns
- **Cards:** bg-white, rounded-xl (12px), subtle shadow, p-6
- **Buttons:** rounded-full for primary CTA, rounded-lg for secondary
- **Inputs:** minimal borders, focus:ring-accent
- **Tables:** clean lines, hover states, no heavy borders
- **Modals:** centered, backdrop blur, slide-up animation

---

## Core Data Models

### Organization (Multi-tenant)
```prisma
model Organization {
  id                String   @id @default(uuid())
  name              String
  industryType      String   // healthcare, manufacturing, professional_services, etc.
  subscriptionTier  String   @default("starter") // starter, professional, enterprise
  logoUrl           String?
  primaryColor      String   @default("#6B9BD1")
  settings          Json     @default("{}")
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  divisions         Division[]
  people            Person[]
  projects          Project[]
  teams             Team[]
  compatibilityRules CompatibilityRule[]
}
```

### Person
```prisma
model Person {
  id                  String   @id @default(uuid())
  orgId               String
  email               String
  firstName           String
  lastName            String
  profilePhotoUrl     String?
  roleTitle           String?
  employmentType      String   @default("full_time") // full_time, part_time, contractor, consultant
  divisionId          String?
  managerId           String?
  availabilityStatus  String   @default("available") // available, partially_available, unavailable
  locationCity        String?
  locationState       String?
  remoteEligible      Boolean  @default(true)
  travelEligible      Boolean  @default(false)
  isActive            Boolean  @default(true)
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
  
  organization        Organization @relation(fields: [orgId], references: [id])
  division            Division?    @relation(fields: [divisionId], references: [id])
  manager             Person?      @relation("ManagerReports", fields: [managerId], references: [id])
  directReports       Person[]     @relation("ManagerReports")
  discAssessment      DiscAssessment?
  skills              PersonSkill[]
  teamAssignments     TeamAssignment[]

  @@unique([orgId, email])
}
```

### DiSC Assessment
```prisma
model DiscAssessment {
  id                  String   @id @default(uuid())
  personId            String   @unique
  primaryStyle        String   // D, i, S, C
  secondaryStyle      String?  // D, i, S, C (optional)
  dScore              Int      // 0-100
  iScore              Int      // 0-100
  sScore              Int      // 0-100
  cScore              Int      // 0-100
  assessmentDate      DateTime
  validUntil          DateTime // typically 2 years from assessment
  assessorName        String?  // Wendy Perdomo, etc.
  notes               String?
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
  
  person              Person   @relation(fields: [personId], references: [id])
}
```

### Skill & PersonSkill
```prisma
model Skill {
  id              String   @id @default(uuid())
  orgId           String
  name            String
  category        String   // EHR Systems, Clinical, Technical, Soft Skills
  subcategory     String?  // Epic, Cerner, etc.
  description     String?
  isCertifiable   Boolean  @default(false)
  isActive        Boolean  @default(true)
  
  organization    Organization @relation(fields: [orgId], references: [id])
  personSkills    PersonSkill[]

  @@unique([orgId, name])
}

model PersonSkill {
  id              String   @id @default(uuid())
  personId        String
  skillId         String
  proficiencyLevel Int     // 1-5
  yearsExperience Decimal?
  certificationName String?
  certificationDate DateTime?
  certificationExpiry DateTime?
  lastUsedDate    DateTime?
  notes           String?
  
  person          Person   @relation(fields: [personId], references: [id])
  skill           Skill    @relation(fields: [skillId], references: [id])

  @@unique([personId, skillId])
}
```

### Project
```prisma
model Project {
  id              String   @id @default(uuid())
  orgId           String
  name            String
  clientName      String?
  description     String?
  status          String   @default("planning") // planning, active, on_hold, completed, cancelled
  currentPhase    String?  // Discovery, Design, Build, Testing, Training, Go-Live, etc.
  startDate       DateTime?
  endDate         DateTime?
  location        String?
  isRemote        Boolean  @default(false)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  organization    Organization @relation(fields: [orgId], references: [id])
  teams           Team[]
}
```

### Team & TeamAssignment
```prisma
model Team {
  id              String   @id @default(uuid())
  orgId           String
  projectId       String?
  name            String
  purpose         String?  // training, command_center, build, support
  targetSize      Int?
  status          String   @default("forming") // forming, active, completed
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  organization    Organization @relation(fields: [orgId], references: [id])
  project         Project?     @relation(fields: [projectId], references: [id])
  assignments     TeamAssignment[]
  analyses        TeamAnalysis[]
}

model TeamAssignment {
  id              String   @id @default(uuid())
  teamId          String
  personId        String
  role            String?  // Lead, Member, Advisor
  startDate       DateTime?
  endDate         DateTime?
  allocationPercent Int    @default(100)
  status          String   @default("active") // proposed, active, completed, removed
  createdAt       DateTime @default(now())
  
  team            Team     @relation(fields: [teamId], references: [id])
  person          Person   @relation(fields: [personId], references: [id])

  @@unique([teamId, personId])
}
```

### Team Analysis
```prisma
model TeamAnalysis {
  id                  String   @id @default(uuid())
  teamId              String
  analysisDate        DateTime @default(now())
  overallScore        Int      // 0-100
  styleDistribution   Json     // { D: 25, i: 25, S: 25, C: 25 }
  compatibilityMatrix Json     // pairwise scores
  strengths           String[] 
  risks               String[]
  recommendations     String[]
  flagsTriggered      Json     // which compatibility rules fired
  
  team                Team     @relation(fields: [teamId], references: [id])
}
```

### Compatibility Rule
```prisma
model CompatibilityRule {
  id              String   @id @default(uuid())
  orgId           String
  name            String
  description     String
  ruleType        String   // composition, pairing, skill_gap, workload
  severity        String   @default("warning") // info, warning, critical
  isActive        Boolean  @default(true)
  conditions      Json     // the rule logic
  messageTemplate String   // "Team has {count} high-D members, which may cause conflict"
  suggestion      String?  // "Consider adding an S-style mediator"
  
  organization    Organization @relation(fields: [orgId], references: [id])
}
```

---

## DiSC Seed Data

### Style Descriptors
```json
{
  "D": {
    "name": "Dominance",
    "shortDesc": "Direct, results-oriented, firm, strong-willed, forceful",
    "strengths": ["Decisive", "Problem solver", "Risk taker", "Self-starter"],
    "challenges": ["Impatient", "Insensitive", "Poor listener", "Demanding"],
    "idealRoles": ["Project Lead", "Command Center Director", "Executive Sponsor"],
    "stressResponse": "Becomes more controlling, demanding",
    "color": "#D64933"
  },
  "i": {
    "name": "Influence", 
    "shortDesc": "Outgoing, enthusiastic, optimistic, high-spirited, lively",
    "strengths": ["Enthusiastic", "Collaborative", "Creative", "Motivating"],
    "challenges": ["Disorganized", "Impulsive", "Lacks follow-through"],
    "idealRoles": ["Trainer", "End-user liaison", "Change champion", "Stakeholder engagement"],
    "stressResponse": "Becomes disorganized, overly talkative",
    "color": "#F4B942"
  },
  "S": {
    "name": "Steadiness",
    "shortDesc": "Even-tempered, accommodating, patient, humble, tactful",
    "strengths": ["Patient", "Team player", "Reliable", "Good listener"],
    "challenges": ["Resistant to change", "Avoids conflict", "Indecisive"],
    "idealRoles": ["At-the-elbow support", "Documentation", "Super user coach", "Help desk"],
    "stressResponse": "Withdraws, becomes passive-aggressive",
    "color": "#4A9B5D"
  },
  "C": {
    "name": "Conscientiousness",
    "shortDesc": "Analytical, reserved, precise, private, systematic",
    "strengths": ["Accurate", "Detail-oriented", "Quality-focused", "Systematic"],
    "challenges": ["Overly critical", "Analysis paralysis", "Perfectionist"],
    "idealRoles": ["Build analyst", "Testing lead", "Data validation", "Compliance"],
    "stressResponse": "Becomes withdrawn, overly critical",
    "color": "#3B82C4"
  }
}
```

### Default Compatibility Rules
```json
[
  {
    "name": "HIGH_D_CONCENTRATION",
    "description": "Multiple high-D personalities may create power struggles",
    "ruleType": "composition",
    "severity": "warning",
    "conditions": {
      "type": "style_count",
      "style": "D",
      "threshold": 2,
      "scoreThreshold": 70
    },
    "messageTemplate": "Team has {count} high-D members. Consider balancing with S-style mediators.",
    "suggestion": "Add team members with high S scores to balance assertiveness"
  },
  {
    "name": "NO_DETAIL_ORIENTATION",
    "description": "Team lacks conscientiousness for detail work",
    "ruleType": "composition", 
    "severity": "critical",
    "conditions": {
      "type": "style_minimum",
      "style": "C",
      "minimumCount": 1,
      "scoreThreshold": 50
    },
    "messageTemplate": "No team members with strong C-style. Quality and accuracy may suffer.",
    "suggestion": "Add at least one detail-oriented C-style member"
  },
  {
    "name": "ALL_SAME_STYLE",
    "description": "Homogeneous teams lack diverse perspectives",
    "ruleType": "composition",
    "severity": "warning",
    "conditions": {
      "type": "style_diversity",
      "minimumStyles": 2
    },
    "messageTemplate": "Team is dominated by {dominantStyle}-style. Diverse perspectives may be missing.",
    "suggestion": "Consider adding members with complementary styles"
  },
  {
    "name": "HIGH_FRICTION_PAIRING",
    "description": "Certain style combinations require extra communication support",
    "ruleType": "pairing",
    "severity": "info",
    "conditions": {
      "type": "pairwise_friction",
      "pairs": [["D", "S"], ["i", "C"]]
    },
    "messageTemplate": "Pairing of {person1} ({style1}) and {person2} ({style2}) may need communication coaching.",
    "suggestion": "Establish clear communication protocols for this pairing"
  },
  {
    "name": "GO_LIVE_READINESS",
    "description": "Go-live teams need balance of all styles",
    "ruleType": "composition",
    "severity": "critical",
    "conditions": {
      "type": "phase_composition",
      "phase": "go_live",
      "requiredStyles": ["D", "i", "S", "C"]
    },
    "messageTemplate": "Go-live team is missing {missingStyles} representation.",
    "suggestion": "Go-live requires decisive leaders (D), enthusiastic trainers (i), patient supporters (S), and detail checkers (C)"
  }
]
```

---

## API Endpoints (Phase 1 MVP)

### Auth
```
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
```

### Organizations
```
GET    /api/organizations/:id
PUT    /api/organizations/:id
```

### People
```
GET    /api/people                    # list with filters
POST   /api/people                    # create
GET    /api/people/:id                # get detail
PUT    /api/people/:id                # update
DELETE /api/people/:id                # soft delete
GET    /api/people/:id/disc           # get DiSC assessment
PUT    /api/people/:id/disc           # update DiSC assessment
GET    /api/people/:id/skills         # get skills
POST   /api/people/:id/skills         # add skill
PUT    /api/people/:id/skills/:skillId # update skill
DELETE /api/people/:id/skills/:skillId # remove skill
```

### Skills
```
GET    /api/skills                    # list org skills
POST   /api/skills                    # create skill
PUT    /api/skills/:id                # update skill
```

### Projects
```
GET    /api/projects                  # list
POST   /api/projects                  # create
GET    /api/projects/:id              # detail
PUT    /api/projects/:id              # update
```

### Teams
```
GET    /api/teams                     # list
POST   /api/teams                     # create
GET    /api/teams/:id                 # detail with assignments
PUT    /api/teams/:id                 # update
POST   /api/teams/:id/members         # add member
DELETE /api/teams/:id/members/:personId # remove member
POST   /api/teams/:id/analyze         # run analysis
GET    /api/teams/:id/analyses        # get analysis history
POST   /api/teams/:id/simulate        # what-if simulation
```

### Compatibility Rules
```
GET    /api/rules                     # list org rules
POST   /api/rules                     # create custom rule
PUT    /api/rules/:id                 # update rule
DELETE /api/rules/:id                 # delete custom rule
```

### Dashboard
```
GET    /api/dashboard/stats           # key metrics
GET    /api/dashboard/recent-teams    # recent team activity
GET    /api/dashboard/alerts          # active compatibility alerts
```

---

## UI Pages (Phase 1 MVP)

### 1. Dashboard
- Welcome message with org name
- Key stats: Total people, Active teams, Avg compatibility score, Alerts
- Recent team analyses
- Quick actions: Create team, Add person, Run analysis

### 2. People
- List view with search/filter
- Grid of person cards (photo, name, DiSC badge, role)
- Click to view/edit detail
- DiSC wheel visualization per person
- Skills list with proficiency bars

### 3. Person Detail / Edit
- Profile section (photo, name, role, contact)
- DiSC Assessment section (scores, style, date)
- Skills section (add/remove/rate)
- Team history

### 4. Teams
- List of teams with status badges
- Each card shows: name, project, member count, compatibility score
- Color-coded score (green/yellow/red)

### 5. Team Detail
- Team info header
- Member list with DiSC badges
- Compatibility score donut chart
- Analysis results: Strengths, Risks, Recommendations
- Triggered rules/flags
- "Analyze" button
- "Simulate" button (add/remove members to see impact)

### 6. Team Builder (Create/Edit Team)
- Step 1: Name, project, purpose
- Step 2: Add members (search, filter by skill/availability/DiSC)
- Step 3: Preview analysis before saving
- Real-time compatibility score as members added

### 7. Skills Management
- List of org skills by category
- Add/edit skills
- See how many people have each skill

### 8. Settings
- Organization profile
- Compatibility rules (view/toggle/edit)
- User management (future)

---

## Matching Algorithm (Simplified for MVP)

### Team Analysis Scoring

```typescript
interface TeamAnalysisResult {
  overallScore: number;           // 0-100
  styleDistribution: StyleDist;   // { D: %, i: %, S: %, C: % }
  pairwiseScores: PairScore[];    // compatibility between each pair
  flagsTriggered: RuleFlag[];     // which rules fired
  strengths: string[];            // generated insights
  risks: string[];                // generated warnings
  recommendations: string[];      // actionable suggestions
}

function analyzeTeam(members: PersonWithDisc[]): TeamAnalysisResult {
  // 1. Calculate style distribution
  const distribution = calculateStyleDistribution(members);
  
  // 2. Calculate pairwise compatibility
  const pairScores = calculatePairwiseScores(members);
  
  // 3. Run compatibility rules
  const flags = evaluateRules(members, distribution, pairScores);
  
  // 4. Calculate overall score
  const overallScore = calculateOverallScore(distribution, pairScores, flags);
  
  // 5. Generate insights
  const { strengths, risks, recommendations } = generateInsights(
    distribution, pairScores, flags
  );
  
  return {
    overallScore,
    styleDistribution: distribution,
    pairwiseScores: pairScores,
    flagsTriggered: flags,
    strengths,
    risks,
    recommendations
  };
}
```

### Pairwise Compatibility Matrix
```
        D       i       S       C
D       70      80      60      75
i       80      75      85      65
S       60      85      80      75
C       75      65      75      85
```

Higher = more natural compatibility. Lower = requires more intentional communication.

---

## Phase 1 MVP Checklist

### Week 1-2: Foundation
- [ ] Replit project setup
- [ ] Database schema + Prisma setup
- [ ] Basic Express API structure
- [ ] React app with routing
- [ ] Tailwind + shadcn/ui setup
- [ ] Apple design system tokens
- [ ] Simple auth (hardcoded user for now)

### Week 3-4: Core CRUD
- [ ] Organization settings page
- [ ] People list + detail pages
- [ ] Person create/edit forms
- [ ] DiSC assessment entry
- [ ] Skills management
- [ ] Seed data script

### Week 5-6: Teams & Analysis
- [ ] Team list + detail pages
- [ ] Team builder wizard
- [ ] Compatibility analysis engine
- [ ] Analysis results display
- [ ] 5 core compatibility rules
- [ ] What-if simulation (basic)

### Week 7-8: Polish & Demo
- [ ] Dashboard with stats
- [ ] Alerts/notifications
- [ ] Demo data + personas
- [ ] Bug fixes
- [ ] Documentation

---

## Future NICEHR Integration Points

When ready to integrate into NICEHR:

1. **Shared Auth** — DiSChedule will use NICEHR's existing auth system
2. **Shared Database** — Models will merge into NICEHR's PostgreSQL
3. **Navigation** — DiSChedule becomes a module in NICEHR's sidebar
4. **Consultants = People** — NICEHR consultant profiles gain DiSC data
5. **Projects** — Link to NICEHR's project/engagement tracking
6. **Remote Support** — DiSC matching can inform consultant-to-hospital pairing

### Integration Preparation
- Use consistent ID formats (UUID)
- Use consistent API patterns
- Use same component library (shadcn/ui)
- Use same styling (Tailwind + Apple tokens)
- Document all API contracts

---

## File Structure

```
/dischedule
  /prisma
    schema.prisma
    /seed
      index.ts
      disc-data.ts
      skills-data.ts
      demo-people.ts
  /server
    index.ts
    /routes
      auth.ts
      people.ts
      teams.ts
      skills.ts
      projects.ts
      rules.ts
      dashboard.ts
    /services
      analysis.ts
      matching.ts
    /middleware
      auth.ts
      validation.ts
    /utils
  /client
    /src
      /components
        /ui (shadcn)
        /layout
          Sidebar.tsx
          Header.tsx
          PageContainer.tsx
        /dashboard
        /people
          PersonCard.tsx
          PersonDetail.tsx
          PersonForm.tsx
          DiscBadge.tsx
          DiscWheel.tsx
        /teams
          TeamCard.tsx
          TeamDetail.tsx
          TeamBuilder.tsx
          AnalysisResults.tsx
          CompatibilityScore.tsx
        /skills
      /pages
        Dashboard.tsx
        People.tsx
        PersonDetail.tsx
        Teams.tsx
        TeamDetail.tsx
        TeamBuilder.tsx
        Skills.tsx
        Settings.tsx
      /hooks
        useTeamAnalysis.ts
        usePeople.ts
      /services
        api.ts
      /styles
        globals.css
      App.tsx
      main.tsx
  package.json
  tsconfig.json
  tailwind.config.js
```

---

## Demo Personas (Seed Data)

### Organization: THE NICEHR GROUP

### People:
1. **Marcus Chen** — D/C style, Epic Ambulatory certified, Project Lead type
2. **Priya Sharma** — i/S style, Training specialist, End-user engagement  
3. **David Okonkwo** — S/C style, At-the-elbow support, Patient and thorough
4. **Jessica Martinez** — D/i style, Command center, High energy leader
5. **Michael Thompson** — C/S style, Build analyst, Detail-oriented
6. **Aisha Johnson** — i style, Trainer, Enthusiastic communicator
7. **Robert Kim** — C style, Testing lead, Quality-focused
8. **Sarah Williams** — S style, Support specialist, Reliable and calm

### Demo Team Scenarios:
1. **Balanced Go-Live Team** — High compatibility score, all styles represented
2. **High-D Conflict Team** — Shows warning for too many dominant personalities
3. **Missing Detail Team** — Shows risk for no C-style members

---

*Build this standalone. Make it work. Then we integrate into NICEHR.*
