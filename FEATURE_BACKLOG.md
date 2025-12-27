# NICEHR Feature Backlog

This document tracks features that have Cypress tests written but are not yet implemented in the UI. These tests are marked with `it.skip("TODO: ...")` and serve as specifications for future development.

---

## Priority Levels
- **P0**: Critical - Core functionality needed for MVP
- **P1**: High - Important features for full product
- **P2**: Medium - Nice-to-have features
- **P3**: Low - Future enhancements

---

## 1. Dashboard Enhancements (P1)

### Charts & Analytics
- [ ] Revenue trends chart (Recharts line chart)
- [ ] User growth chart (Recharts bar chart)
- [ ] Performance metrics gauges (utilization, success rate, satisfaction)
- [ ] Chart period filtering (7d, 30d, custom)
- [ ] Chart data export to CSV

### Real-time Features
- [ ] WebSocket integration for live stats updates
- [ ] Live activity feed updates
- [ ] Real-time notification badge

### Dashboard Customization
- [ ] Widget reordering (drag & drop)
- [ ] Show/hide widgets panel
- [ ] Save layout preferences
- [ ] Reset to default layout

### Search & Quick Actions
- [ ] Global dashboard search
- [ ] Search results dropdown (hospitals, projects, consultants)
- [ ] Quick action buttons (New Project, New Consultant, Reports)

### Notifications
- [ ] Notification bell icon with badge count
- [ ] Notifications dropdown panel
- [ ] Mark as read (individual and bulk)
- [ ] Notification filtering by type

**Test Files**: `03-dashboard.cy.js`, `05-dashboard-widgets.cy.js`, `06-dashboard-analytics.cy.js`

---

## 2. Financial Module (P0)

### Expenses Management
- [x] Expenses list with filters (status, date, category) - IMPLEMENTED
- [x] Search expenses by description/project/consultant - IMPLEMENTED
- [x] Date range filter for expenses - IMPLEMENTED
- [x] Create expense form with receipt upload - IMPLEMENTED (Phase 5)
- [x] Edit expense functionality - IMPLEMENTED (Phase 4)
- [x] Submit expense for approval - IMPLEMENTED (Phase 4)
- [x] Approve/reject expenses (manager) - IMPLEMENTED (Phase 4)
- [x] Bulk approval functionality - IMPLEMENTED (Phase 2)
- [x] Bulk reject functionality - IMPLEMENTED (Phase 2)
- [ ] Expense categories management
- [x] Export expenses to CSV - IMPLEMENTED

### Invoices
- [x] Invoice list with search and status filter - IMPLEMENTED
- [x] Create invoice with line items - IMPLEMENTED
- [x] Invoice details view - IMPLEMENTED
- [x] Payment history tracking - IMPLEMENTED
- [x] Download invoice as PDF - IMPLEMENTED (Phase 3)
- [x] Email invoice to client - IMPLEMENTED (Phase 3)
- [x] Record payment with method/reference - IMPLEMENTED
- [x] Mark invoice as paid - IMPLEMENTED
- [x] Void invoice functionality - IMPLEMENTED

### Payroll
- [x] Payroll batches list - IMPLEMENTED
- [x] Export payroll batches to CSV - IMPLEMENTED (Phase 2)
- [x] Create payroll batch (date range, auto-calculate) - IMPLEMENTED (Phase 4)
- [x] Batch details with consultant payments - IMPLEMENTED (Phase 4)
- [x] Edit consultant payment amounts - IMPLEMENTED (Phase 4)
- [x] Approve batch workflow - IMPLEMENTED (Phase 4)
- [x] Process batch workflow - IMPLEMENTED (Phase 4)
- [ ] Pay rates management

### Budget Modeling
- [x] Budget dashboard with charts - IMPLEMENTED (Phase 3)
- [x] Budget vs actual comparison - IMPLEMENTED (Phase 3)
- [x] Budget by category breakdown - IMPLEMENTED (Phase 3)
- [ ] Create budget with line items
- [ ] Variance analysis
- [ ] Over-budget alerts
- [ ] Budget forecasting

**Test Files**: `08-financial.cy.js`

---

## 3. Communication Module (P1)

### Real-time Chat
- [ ] Channels list with search
- [ ] Create channel (public/private)
- [ ] Join channel functionality
- [ ] Channel messaging
- [ ] Edit/delete messages
- [ ] Message reactions
- [ ] Message replies/threads
- [ ] Direct messages
- [ ] Online status indicators

### Message Search
- [ ] Search messages across channels
- [ ] Filter by date/user/channel
- [ ] Search result highlighting

### Channel Management
- [ ] Channel settings panel
- [ ] Add/remove members
- [ ] Leave channel
- [ ] Archive channel

### Digital Signatures
- [ ] Signature requests list
- [ ] Create signature request (multiple signers)
- [ ] Sign document view
- [ ] Canvas signature drawing
- [ ] Typed signature option
- [ ] Upload signature image
- [ ] Signature history with audit trail
- [ ] Decline to sign workflow

**Test Files**: `11-communication.cy.js`

---

## 4. Analytics & Reporting (P1)

### Executive Dashboard
- [ ] Key metrics summary cards
- [ ] Active projects overview
- [ ] Consultant utilization summary
- [ ] Revenue metrics

### Go-Live Readiness Dashboard
- [ ] Readiness score display
- [ ] Category breakdown (staffing, training, compliance)
- [ ] Readiness trends chart
- [ ] Blockers list

### Utilization Analytics
- [ ] Consultant utilization rates
- [ ] Utilization trends over time
- [ ] Billable vs non-billable breakdown
- [ ] Utilization by project

### Timeline & Forecasting
- [ ] Project timeline view
- [ ] Milestone tracking
- [ ] At-risk highlighting
- [ ] Forecast completion dates

### Cost Variance Analytics
- [ ] Budget vs actual chart
- [ ] Earned value analysis
- [ ] Variance breakdown by category
- [ ] Trend analysis

### Hospital ROI Analysis
- [ ] Cost savings calculations
- [ ] Efficiency gains metrics
- [ ] ROI by project
- [ ] Comparison charts

### Consultant Performance
- [ ] Performance rankings
- [ ] Performance trends
- [ ] Individual performance cards
- [ ] Comparison analytics

### Report Builder
- [ ] Saved reports list
- [ ] Report templates
- [ ] Custom report builder
- [ ] Data source selection
- [ ] Column selection/reordering
- [ ] Filtering options
- [ ] Grouping and sorting
- [ ] Report preview
- [ ] Save report functionality
- [ ] Export to CSV/Excel/PDF
- [ ] Schedule reports
- [ ] Email reports to recipients

**Test Files**: `12-analytics-reporting.cy.js`

---

## 5. Admin & RBAC (P1)

### User Management (Admin)
- [ ] Admin users list with search
- [ ] Filter by role and status
- [ ] Create user form with validation
- [ ] User details view
- [ ] Edit user information
- [ ] Assign/change user roles
- [ ] Deactivate user
- [ ] Reset user password
- [ ] User activity history

### Role Management
- [ ] Roles list (base, implementation, custom)
- [ ] Create custom role
- [ ] Permission selection matrix
- [ ] Role details with assigned permissions
- [ ] Edit role permissions
- [ ] View users assigned to role
- [ ] Delete custom role
- [ ] Permission domains (15 categories)

### Role Assignment
- [ ] Assign global roles
- [ ] Assign project-specific roles
- [ ] Role hierarchy visualization

### Integration Hub
- [ ] Available integrations list
- [ ] Calendar integration (Google Calendar)
- [ ] Payroll integration (ADP, Workday)
- [ ] EHR integration (Epic, Cerner)
- [ ] Configure integration settings
- [ ] Test connection functionality
- [ ] Sync jobs management
- [ ] Sync scheduling
- [ ] Event tracking with filters

### System Settings
- [ ] General settings (company info, timezone, date format)
- [ ] Notification settings with templates
- [ ] Security settings (password policy, session timeout)
- [ ] Audit logs viewer
- [ ] Backup & restore functionality
- [ ] Backup scheduling

### Gamification
- [ ] Leaderboard display
- [ ] Achievements list
- [ ] Points system
- [ ] Badges display
- [ ] Progress tracking

### Identity Verification
- [ ] Verification wizard
- [ ] Document upload
- [ ] Verification status tracking

### System Health
- [ ] API response times
- [ ] Error rates
- [ ] Uptime monitoring
- [ ] Health dashboard

**Test Files**: `13-admin-rbac-integrations.cy.js`

---

## 6. User Profile & Settings (P2)

### Profile Management
- [ ] Edit profile name
- [ ] Change email with verification
- [ ] Profile photo upload
- [ ] Photo cropping tool
- [ ] Remove photo

### User Preferences
- [ ] Theme selection (light/dark)
- [ ] Language selection
- [ ] Notification preferences
- [ ] Email digest settings

### Privacy Settings
- [ ] Profile visibility options
- [ ] Activity tracking preferences
- [ ] Data export functionality

### Account Management
- [ ] Change password
- [ ] Two-factor authentication setup
- [ ] Account deletion request
- [ ] Delete confirmation workflow

**Test Files**: `04-users-profile-management.cy.js`

---

## 7. Time & Attendance (P2)

- [ ] Time entries list
- [ ] Clock in/out functionality
- [ ] Manual time entry
- [ ] Edit time entries
- [ ] Time entry approval workflow
- [ ] Timesheet summary
- [ ] Export timesheets

**Test Files**: `05-time-attendance.cy.js`

---

## 8. Training & Competency (P2)

- [ ] Training modules list
- [ ] Assign training to consultants
- [ ] Training completion tracking
- [ ] Competency assessments
- [ ] Certification tracking
- [ ] Training reports

**Test Files**: `06-training-competency.cy.js`

---

## 9. Travel Management (P2)

- [ ] Travel requests list
- [ ] Create travel request
- [ ] Travel approval workflow
- [ ] Travel booking integration
- [ ] Travel expense tracking
- [ ] Travel calendar view

**Test Files**: `09-travel.cy.js`

---

## 10. Quality & Compliance (P2)

- [ ] Compliance checklist
- [ ] Document expiration tracking
- [ ] Compliance reports
- [ ] Audit trail
- [ ] Quality metrics dashboard

**Test Files**: `10-quality-compliance.cy.js`

---

## 11. Support Tickets (P3)

- [ ] Support tickets list
- [ ] Create support ticket
- [ ] Ticket status tracking
- [ ] Ticket assignment
- [ ] Ticket comments/updates
- [ ] Ticket priority levels
- [ ] Ticket categories

**Test Files**: `07-support-tickets.cy.js`

---

## Implementation Progress

| Module | Tests Written | Implemented | Coverage |
|--------|--------------|-------------|----------|
| Projects CRUD | 14 | 14 | 100% |
| Consultants CRUD | 35 | 35 | 100% |
| Hospitals CRUD | 12 | 12 | 100% |
| Authentication | 20 | 16 | 80% |
| Dashboard | 78 | 10 | 12% |
| Financial - Expenses | 22 | 22 | 100% |
| Financial - Invoices | 20 | 20 | 100% |
| Financial - Payroll | 14 | 13 | 93% |
| Financial - Budget | 12 | 9 | 75% |
| Communication | 150+ | 0 | 0% |
| Analytics | 250+ | 5 | 2% |
| Admin/RBAC | 200+ | 12 | 6% |
| User Profile | 50+ | 10 | 20% |

---

## Recent Updates

### December 27, 2024 - P0 Financial Module Phase 5
- Added receipt file upload using Uppy/S3 integration
- ObjectUploader component integrated into expense create/edit dialogs
- Receipt display in expense detail view with view link
- Added 4 Cypress tests for receipt upload functionality
- Financial - Expenses module now at 100% coverage

### December 26, 2024 - P0 Financial Module Phase 4
- Added edit expense functionality for draft expenses
- Added expense approval workflow (submit, approve, reject)
- Added payroll batch detail view with consultant entries
- Added edit/delete payroll entries for draft batches
- Added payroll batch workflow (submit, approve, process)
- Added 20+ Cypress tests for Phase 4 features

### December 26, 2024 - P0 Financial Module Phase 3
- Added PDF download for invoices (print dialog approach)
- Added email invoice to client functionality with SendGrid/Resend integration
- Added Budget vs Actual comparison chart (Recharts bar chart)
- Added Budget by Scenario Type pie chart (Recharts)
- Added 15+ Cypress tests for Phase 3 features

### December 26, 2024 - P0 Financial Module Phase 2
- Added bulk approval/reject for expenses (select multiple, approve/reject all)
- Added CSV export for payroll batches
- Added 15+ Cypress tests for bulk operations and payroll

### December 26, 2024 - P0 Financial Module Phase 1
- Added date range filter to Expenses
- Added search functionality to Expenses (by description, project, consultant)
- Added CSV export for Expenses
- Added void invoice functionality with confirmation dialog
- Added payment recording with method/reference tracking
- Added payment history display for invoices
- Implemented 25+ Cypress tests for financial features

---

## How to Use This Document

1. **For Development**: Pick a feature from a priority group and implement it
2. **For Testing**: Once implemented, remove `it.skip` from corresponding tests
3. **For Planning**: Use this as a roadmap for sprint planning
4. **For Tracking**: Update checkboxes as features are completed

---

*Last Updated: December 27, 2024*
*Phase 5 P0 Financial Module completed - Expenses at 100% coverage*
