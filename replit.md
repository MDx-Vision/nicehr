# NICEHR Healthcare Consultant Management Platform

## Overview
NICEHR is a comprehensive healthcare consultant management platform designed to streamline the process of matching healthcare consultants with hospital projects. The system supports multi-role authentication (Admin, Hospital Staff, Consultants) and provides tools for consultant onboarding, project scheduling, document management, and ROI analysis.

## Current State
- **Status**: MVP Complete + Phases 1-8 (Project Lifecycle & Onboarding)
- **Last Updated**: November 27, 2025
- **Authentication**: Replit Auth with role-based access control

## Recent Changes (Phase 8 - Project Lifecycle & Onboarding)
1. **Database Schema Additions**: 7 new enums and 7 new tables for project lifecycle tracking
   - **Enums**: projectPhaseStatusEnum, taskPriorityEnum, taskStatusEnum, riskProbabilityEnum, riskImpactEnum, riskStatusEnum, onboardingTaskStatusEnum, teamRoleCategoryEnum
   - **Tables**: projectPhases, projectTasks, projectMilestones, phaseDeliverables, projectRisks, teamRoleTemplates, projectTeamAssignments, onboardingTasks
2. **Project Phase Tracking**: 11-phase EHR implementation methodology
   - Assessment, Planning, Design, Build, Testing, Training, Data Migration, Go-Live Prep, Go-Live, Stabilization, Optimization
   - Visual progress tracker with phase status indicators
   - Phase-level tasks, milestones, and notes
3. **Project Phases Page** (/project-phases):
   - Phase progress visualization with completion percentages
   - Tab-based navigation: All Phases, Milestones, Risks
   - Create/edit phase details with status and dates
   - Initialize all 11 phases for a project
4. **Milestones Tab**: Track key deliverables and checkpoints
   - Title, description, due date, completion status
5. **Risk Register**: Identify and mitigate project risks
   - Probability, impact, mitigation strategy, status tracking
6. **Consultant Onboarding Page** (/onboarding):
   - Task categories: Documentation, Credentials, Compliance, Training, Orientation
   - Progress tracking with status breakdown
   - Submit for review workflow
   - Admin review with approve/reject actions
   - Rejection reasons for revision requests
7. **API Endpoints (30+ new routes)**:
   - `/api/projects/:id/phases` - Project phases CRUD
   - `/api/phases/:id` - Individual phase operations
   - `/api/phases/:id/tasks` - Phase tasks
   - `/api/projects/:id/milestones` - Project milestones
   - `/api/projects/:id/risks` - Risk register
   - `/api/consultants/:id/onboarding` - Onboarding tasks
   - `/api/onboarding-tasks/:id` - Individual task operations
   - `/api/admin/onboarding/pending` - Pending review tasks
8. **Sidebar Navigation**: Added Project Phases and Onboarding links for all roles

### Phase 7 Changes (Analytics Dashboard)
1. **Analytics Schema Types**: Added PlatformAnalytics, HospitalAnalytics, ConsultantAnalytics interfaces in shared/schema.ts
2. **Storage Methods**: getPlatformAnalytics, getHospitalAnalytics, getConsultantAnalytics for role-specific data aggregation
3. **API Routes**: 
   - GET /api/analytics/platform - Admin platform metrics (requires admin role)
   - GET /api/analytics/hospital/:hospitalId - Hospital-specific ROI analytics
   - GET /api/analytics/consultant/:consultantId - Individual consultant metrics
   - GET /api/analytics/me - Auto-detect role and return appropriate analytics
4. **Chart Components**: Created reusable chart component library in client/src/components/analytics/
   - KpiCard: Key performance indicator display cards
   - TrendChart: Time-series data visualization
   - BarChartCard: Bar chart with title and description
   - PieChartCard: Pie/donut chart visualization
   - StatusDistributionCard: Status breakdown display
5. **Analytics Dashboard Page**: Role-specific dashboards at /analytics
   - Admin: Platform overview with consultant counts, hospital metrics, project stats, total savings
   - Hospital Staff: Hospital ROI analytics with budget/savings, project performance, consultant ratings
   - Consultant: Personal performance metrics, completed/upcoming shifts, earnings, document compliance
6. **Sidebar Integration**: Analytics link added to all role menus

### Phase 6 Changes (Activity & Analytics)
1. **Database Schema**: user_activities and notifications tables for activity tracking and in-app alerts
2. **Activity Logging**: logActivity function and activityLoggerMiddleware for automatic action tracking
3. **Activity Types**: login, logout, create, update, delete, upload, download, approve, reject, assign, submit
4. **Notification Types**: info, success, warning, error with read/unread status
5. **API Routes**: 
   - GET/POST /api/activities - Activity CRUD
   - GET /api/activities/recent - Recent activities feed
   - GET/POST /api/notifications - Notification CRUD
   - GET /api/notifications/unread-count - Unread count
   - PATCH /api/notifications/:id/read - Mark as read
   - POST /api/notifications/mark-all-read - Mark all as read
6. **NotificationCenter Component**: Bell icon in header with unread badge, dropdown list, mark read/delete actions
7. **ActivityFeed Component**: Dashboard widget showing recent platform activity
8. **ActivityLog Page**: Admin page at /activity-log for viewing/filtering all user activities
9. **Auth Integration**: Login/logout activities automatically logged
10. **CRUD Integration**: Resource creation activities logged (hospitals, consultants)

### Activity Tracking Features
- **User Context**: Captures userId, IP address, user agent
- **Resource Tracking**: resourceType, resourceId, resourceName for CRUD operations
- **Metadata Support**: Additional data storage for complex activities
- **Filtering**: Filter by activity type, user, date range, search query
- **Pagination**: Server-side pagination for large activity logs

## Phase 5 Changes (Content Restriction)
1. **Database Schema**: content_access_rules and content_access_audit tables for role-based access control
2. **Access Rules API**: CRUD endpoints at /api/admin/access-rules for managing content restrictions
3. **Permissions API**: GET /api/permissions returns user's restricted pages/features based on role
4. **Frontend Guards**: ProtectedRoute with requiredRoles prop for role-based page access
5. **Permission Context**: PermissionsProvider and usePermissions hook for frontend permission checks
6. **Sidebar Filtering**: Menu items filtered based on page access permissions
7. **Access Control UI**: Admin page at /access-control for managing rules and viewing audit logs
8. **Audit Logging**: Access denials logged to content_access_audit table for security monitoring

### Content Access Rule Features
- **Resource Types**: page, api, feature
- **Allowed Roles**: Whitelist of roles that can access the resource
- **Denied Roles**: Blacklist of roles that cannot access the resource
- **Restriction Messages**: Custom messages shown when access is denied
- **Active/Inactive Toggle**: Enable/disable rules without deleting
- **Audit Trail**: Track all access denials with user, role, IP, and timestamp

## Phase 4 Changes (Email Notifications)
1. **Email Service**: Resend integration via Replit Connectors with template-based email sending
2. **Email Templates**: Welcome, schedule assigned/updated/cancelled, document approved/rejected/expiring, account deletion
3. **Email Logging**: Database-backed audit trail with email_notifications table tracking all sent/failed emails
4. **Workflow Integration**: Automatic emails on document status changes, schedule assignments, account deletion requests
5. **User Preferences**: Respects emailNotifications toggle before sending
6. **Admin Endpoints**: GET /api/admin/email-logs and GET /api/admin/email-stats for monitoring

### Email Notification Types
- **welcome**: Sent on first login
- **schedule_assigned**: When consultant assigned to a shift
- **schedule_updated**: When shift details change
- **schedule_cancelled**: When shift is cancelled
- **document_approved**: When admin approves a document
- **document_rejected**: When admin rejects a document
- **document_expiring**: Alert before document expires
- **account_deletion_requested**: Confirmation of deletion request
- **account_deletion_completed**: Final confirmation

## Phase 3 Changes (Account Management)
1. **User Preferences Schema**: Added profileVisibility (public/members_only/private), emailNotifications, showEmail, showPhone, deletionRequestedAt fields to users table
2. **Account Settings API**: GET/PATCH /api/account/settings for privacy and notification preferences
3. **Deletion Request API**: POST/DELETE /api/account/delete-request for account deletion workflow
4. **Privacy Enforcement**: Directory search filters private profiles, profile endpoint hides email/phone based on settings
5. **AccountSettings Page**: Full settings UI with privacy controls, notification preferences, and deletion request flow
6. **Sidebar Navigation**: Added Account Settings link accessible to all user roles

## Phase 2 Changes (Member Directories)
1. **Enhanced Directory API** (`/api/directory/consultants`): Advanced filtering, sorting, and pagination
2. **Consultant Profile API** (`/api/consultants/:id/profile`): Full profile with documents and ratings
3. **Enhanced Consultant Cards**: Profile photos, EMR badges, ratings, grid/list views
4. **Advanced Filter Panel**: EMR systems, availability, experience range, modules, shift preference
5. **Sorting Options**: Sort by name, experience, location, rating (asc/desc)
6. **View Toggle**: Grid and list view modes
7. **Pagination**: Server-side pagination for large result sets
8. **Consultant Detail Modal**: Full profile view with stats, documents summary, ratings breakdown

## Phase 1 Changes (Ultimate Member Profiles)
1. **Auto-create consultant profiles**: New users automatically get a consultant profile on first login (no more 404 errors)
2. **Enhanced user schema**: Added coverPhotoUrl, linkedinUrl, websiteUrl fields to users table
3. **Object Storage integration**: File upload API with presigned URLs, ACL policies (public for profile photos, private for documents)
4. **Enhanced Profile page**: Cover photo upload, profile photo upload, social links (LinkedIn, Website), bio editing
5. **Document upload with ObjectUploader**: Replaced URL input with proper file upload using Uppy modal
6. **13 document types seeded**: Resume/CV, Nursing License, BLS/ACLS/PALS Certifications, and more

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
│   │   ├── ui/                       # shadcn components
│   │   ├── AppSidebar.tsx
│   │   ├── ThemeToggle.tsx
│   │   ├── ObjectUploader.tsx        # File upload component (Uppy)
│   │   ├── ConsultantCard.tsx        # Consultant card (grid/list views)
│   │   ├── ConsultantDetailModal.tsx # Full profile modal
│   │   ├── NotificationCenter.tsx    # Bell icon notification dropdown
│   │   └── ActivityFeed.tsx          # Recent activity widget
│   ├── hooks/
│   │   ├── useAuth.ts                # Authentication hook
│   │   ├── use-toast.ts
│   │   └── use-permissions.tsx       # Permissions context and hook
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
│   │   ├── Search.tsx                # Enhanced with filters, sorting, pagination
│   │   ├── Settings.tsx
│   │   ├── Profile.tsx               # Enhanced with cover photo, social links
│   │   ├── MySchedule.tsx
│   │   ├── MyDocuments.tsx           # Uses ObjectUploader for file uploads
│   │   ├── RoiSurvey.tsx
│   │   ├── AccessControl.tsx         # Admin access control management
│   │   └── ActivityLog.tsx           # Admin activity log viewer
│   └── App.tsx
├── server/
│   ├── routes.ts                     # API endpoints
│   ├── storage.ts                    # Database operations
│   ├── replitAuth.ts                 # Auth setup (includes optionalAuth)
│   ├── objectStorage.ts              # Object Storage service
│   ├── activityLogger.ts             # Activity logging functions and middleware
│   ├── objectAcl.ts                  # ACL policies for files
│   ├── emailService.ts               # Resend email integration with templates
│   ├── accessControl.ts              # Content access control middleware
│   └── db.ts                         # Database connection
└── shared/
    └── schema.ts                     # Database schema + types
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
- **emailNotifications**: Audit log for all sent/failed email notifications
- **contentAccessRules**: Role-based content restriction rules
- **contentAccessAudit**: Audit log for access denials

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
