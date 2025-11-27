# NICEHR Healthcare Consultant Management Platform

## Overview
NICEHR is a comprehensive healthcare consultant management platform designed to streamline the process of matching healthcare consultants with hospital projects. The system supports multi-role authentication (Admin, Hospital Staff, Consultants) and provides tools for consultant onboarding, project scheduling, document management, and ROI analysis.

## Current State
- **Status**: MVP Complete
- **Last Updated**: November 27, 2025
- **Authentication**: Replit Auth with role-based access control

## Architecture

### Tech Stack
- **Frontend**: React + Vite + TypeScript
- **Backend**: Express.js
- **Database**: PostgreSQL (via Drizzle ORM)
- **UI Components**: shadcn/ui + Tailwind CSS
- **State Management**: TanStack Query v5
- **Routing**: Wouter
- **Authentication**: Replit Auth (OpenID Connect)
- **Storage**: Replit Object Storage for documents

### Project Structure
```
├── client/src/
│   ├── components/
│   │   ├── ui/           # shadcn components
│   │   ├── AppSidebar.tsx
│   │   └── ThemeToggle.tsx
│   ├── hooks/
│   │   ├── useAuth.ts    # Authentication hook
│   │   └── use-toast.ts
│   ├── lib/
│   │   ├── queryClient.ts
│   │   └── authUtils.ts
│   ├── pages/
│   │   ├── Landing.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Hospitals.tsx
│   │   ├── Consultants.tsx
│   │   ├── Projects.tsx
│   │   ├── Schedules.tsx
│   │   ├── BudgetCalculator.tsx
│   │   ├── RoiDashboard.tsx
│   │   ├── Documents.tsx
│   │   ├── Search.tsx
│   │   ├── Settings.tsx
│   │   ├── Profile.tsx
│   │   ├── MySchedule.tsx
│   │   ├── MyDocuments.tsx
│   │   └── RoiSurvey.tsx
│   └── App.tsx
├── server/
│   ├── routes.ts         # API endpoints
│   ├── storage.ts        # Database operations
│   ├── replitAuth.ts     # Auth setup
│   └── db.ts             # Database connection
└── shared/
    └── schema.ts         # Database schema + types
```

## Database Models
- **users**: User accounts with Replit Auth
- **consultants**: Consultant profiles with experience, modules, availability
- **hospitals**: Healthcare facility information
- **hospitalUnits**: Departments within hospitals (ICU, ED, Med-Surg, etc.)
- **hospitalModules**: EMR modules assigned to units
- **hospitalStaff**: Staff linked to hospitals
- **projects**: Consulting projects linking hospitals to needs
- **projectRequirements**: Skills/modules required for projects
- **projectSchedules**: Shift schedules for projects
- **scheduleAssignments**: Consultant assignments to schedules
- **consultantDocuments**: Uploaded credentials and certifications
- **documentTypes**: Types of required documents
- **consultantAvailability**: When consultants are available
- **consultantRatings**: Performance ratings
- **budgetCalculations**: Cost/savings analysis
- **roiQuestions**: Survey questions for ROI measurement
- **roiSurveys**: Survey instances
- **roiResponses**: Survey responses

## User Roles
1. **Admin**: Full system access - manage hospitals, consultants, projects, settings
2. **Hospital Staff**: Manage their hospital's projects, schedules, and consultant assignments
3. **Consultant**: View their schedules, manage documents, complete surveys

## Key Features
- **Dashboard**: Role-based overview with stats and recent activity
- **Hospital Management**: CRUD for hospitals, units, and modules
- **Consultant Management**: Profiles, experience tracking, document management
- **Project Management**: Create projects, track status, assign consultants
- **Scheduling**: Create shifts, assign consultants, approval workflow
- **Budget Calculator**: Cost analysis comparing traditional staffing vs consulting
- **ROI Dashboard**: Survey-based ROI measurement with metrics visualization
- **Document Management**: Upload, status tracking, expiration alerts
- **Search**: Find consultants by location, availability, skills, modules

## Design System
- **Primary Color**: Teal (#0891b2 / hsl 187 94% 37%)
- **Theme**: Light/Dark mode support
- **Components**: shadcn/ui with healthcare-professional styling

## API Endpoints
All routes prefixed with `/api/`:

### Authentication
- `GET /api/auth/user` - Get current user
- `GET /api/login` - Initiate login
- `GET /api/callback` - Auth callback
- `GET /api/logout` - Logout

### Resources
- `/api/consultants` - Consultant CRUD + search
- `/api/hospitals` - Hospital CRUD
- `/api/hospitals/:id/units` - Hospital units
- `/api/hospitals/:id/staff` - Hospital staff
- `/api/projects` - Project CRUD
- `/api/projects/:id/schedules` - Project schedules
- `/api/schedules/:id/assignments` - Schedule assignments
- `/api/document-types` - Document type definitions
- `/api/documents` - Document management
- `/api/roi/questions` - ROI survey questions
- `/api/roi/surveys` - ROI surveys
- `/api/dashboard/stats` - Dashboard statistics

## Running the Project
The application runs via the "Start application" workflow which executes `npm run dev`:
- Frontend: Vite dev server
- Backend: Express server on port 5000
- Database: PostgreSQL (auto-configured via Replit)

## User Preferences
- Professional healthcare aesthetic with calming blue/teal colors
- Clean, minimal interface focused on usability
- Dark mode support for night shift workers
- Responsive design for desktop and tablet use
