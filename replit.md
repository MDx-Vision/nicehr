# NICEHR Healthcare Consultant Management Platform

## Overview
NICEHR is a comprehensive healthcare consultant management platform designed to streamline the process of matching healthcare consultants with hospital projects. It supports multi-role authentication (Admin, Hospital Staff, Consultants) and provides tools for consultant onboarding, project scheduling, document management, ROI analysis, and advanced analytics. The platform aims to offer a professional and efficient solution for healthcare staffing and project oversight, enhancing efficiency and improving outcomes in healthcare project management.

## User Preferences
- Professional healthcare aesthetic with calming blue/teal colors
- Clean, minimal interface focused on usability
- Dark mode support for night shift workers
- Responsive design for desktop and tablet use

## System Architecture

### UI/UX Decisions
The platform features a clean, minimal interface with a professional healthcare aesthetic, utilizing calming blue/teal colors. It supports both light and dark modes and is designed to be responsive across desktop and tablet devices. UI components are built with shadcn/ui and styled with Tailwind CSS, ensuring a consistent and modern look. Key UI elements include role-based dashboards, advanced filtering for consultant directories, and visual progress trackers for project phases and onboarding.

### Technical Implementations
The application is built with a React, Vite, and TypeScript frontend, an Express.js backend, and a PostgreSQL database managed via Drizzle ORM. State management is handled by TanStack Query v5, and routing with Wouter. Authentication is provided by Replit Auth (OpenID Connect). Document storage leverages Replit Object Storage, with fine-grained access control using ACL policies. The system incorporates robust activity logging, real-time notifications, and a comprehensive role-based access control (RBAC) system for managing content restrictions. Real-time chat is implemented using a WebSocket server with secure session-based authentication. Digital signature capture is integrated for contract management.

### Feature Specifications
- **Multi-Role Authentication**: Admin, Hospital Staff, and Consultant roles with distinct access levels.
- **Consultant Management**: Profiles, experience tracking, EMR badges, ratings, document uploads, and advanced search/filtering.
- **Project Lifecycle Management**: An 11-phase EHR implementation methodology with visual progress tracking, tasks, milestones, and risk registers.
- **Onboarding Workflow**: Streamlined consultant onboarding with task categories and progress tracking.
- **Document Management**: Secure upload, status tracking, expiration alerts, and type-specific handling using Replit Object Storage.
- **Analytics & Reporting**: Role-specific dashboards, hospital ROI analysis, and consultant performance insights, including AI-powered analytics for insights and forecasting.
- **Activity Tracking & Notifications**: Comprehensive logging of user actions and in-app/email notifications for key events.
- **Content Restriction System**: Role-based access control for pages, APIs, and features.
- **Go-Live Operations**: Real-time command center, digital sign-in/out, support ticket dispatch, and shift handoff notes.
- **Scheduling & Time Management**: Timesheets with approval, consultant availability calendar, and shift swap requests.
- **Training & Competency**: Training portal, competency assessments, login labs for EMR training, and a knowledge base.
- **Support Ticketing & Escalation**: Full CRUD for tickets, EOD reports, configurable escalation rules, and data retention policies.
- **Financial Management**: Expense submission with approval, invoice generation, payroll processing, and budget modeling.
- **Travel Management**: Consultant travel preferences, booking management (flights, hotels, rentals), and transportation coordination.
- **Quality Assurance & Gamification**: Consultant scorecards, pulse surveys, NPS tracking, incident reporting, gamification (points, badges, leaderboards), and a compliance center (HIPAA dashboard, checks, audits).
- **Integrations**: Digital signatures for contracts, real-time chat with channels and direct messages, and identity verification workflow.

### System Design Choices
The architecture emphasizes modularity and scalability, with clear separation between frontend, backend, and shared components. The database schema includes dedicated tables for project phases, tasks, risks, onboarding, activities, notifications, email logs, and content access rules to support complex workflows. API endpoints are logically structured for CRUD operations and specialized functions. Middleware is used for activity logging, authentication, and access control.

## External Dependencies
- **Replit Auth**: User authentication and role-based access control.
- **PostgreSQL**: Relational database.
- **Replit Object Storage**: Document and media storage.
- **Resend**: Email notification service.
- **Uppy**: Frontend file uploader.
- **shadcn/ui**: UI component library.
- **Tailwind CSS**: Utility-first CSS framework.
- **TanStack Query**: Data fetching and state management.
- **Wouter**: React routing library.
- **WebSocket (ws)**: Real-time communication for chat.
- **react-signature-canvas**: Digital signature capture.
- **cookie-signature**: Secure session cookie validation for WebSocket authentication.