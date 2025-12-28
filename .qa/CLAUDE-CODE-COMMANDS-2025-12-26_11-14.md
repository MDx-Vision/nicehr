# Claude Code Commands

# Technical Implementation Plan

## CRITICAL (Do First - Security & Compliance Blockers)

### Security Vulnerabilities
```
Create .env.example file with all required environment variables including JWT_SECRET, DATABASE_URL, ANTHROPIC_API_KEY, GOOGLE_CLOUD_STORAGE_BUCKET, and PHI_ENCRYPTION_KEY with secure placeholder values
```

```
Install and configure helmet.js security middleware in server/index.ts with CSP headers, HSTS, X-Frame-Options, and rate limiting using express-rate-limit
```

```
Create server/middleware/auth.ts with JWT authentication middleware using jsonwebtoken, including token verification and user context injection
```

```
Add input validation middleware to server/routes using express-validator for all endpoints, specifically validating PHI data like SSN, email, phone, and date of birth
```

```
Create server/utils/encryption.ts with AES-256-GCM encryption functions for PHI data including encryptPHI() and decryptPHI() functions using Node.js crypto module
```

### HIPAA Compliance Documentation
```
Create legal/hipaa/notice-of-privacy-practices.md with complete HIPAA Notice of Privacy Practices including PHI usage, disclosure practices, patient rights, and contact information
```

```
Create legal/policies/privacy-policy.md with comprehensive privacy policy covering PHI collection, third-party services (Anthropic, Google Cloud), data retention, and user rights
```

```
Create legal/policies/terms-of-service.md with HIPAA compliance obligations, liability limitations, user responsibilities, and termination procedures
```

```
Create legal/agreements/ folder with BAA templates for anthropic-baa.md, google-cloud-baa.md, and neon-database-baa.md
```

### Production Infrastructure
```
Create Dockerfile with multi-stage build, Node.js 18 Alpine base, non-root user, health checks, and security best practices
```

```
Create docker-compose.yml with app, postgres, and nginx services including health checks, restart policies, and volume mounts for data persistence
```

```
Create .github/workflows/ci-cd.yml with security scanning, automated testing, Docker builds, and deployment pipeline
```

## HIGH (Do This Week - Important Security & Functionality)

### Authentication & Authorization
```
Create server/middleware/auditLogger.ts using winston with HIPAA-compliant audit logging including userId, action, resource, timestamp, and IP address
```

```
Add authentication routes in server/routes/auth.ts with login, logout, token refresh, and password reset endpoints using bcryptjs
```

```
Create server/middleware/rbac.ts for role-based access control with healthcare-specific roles (admin, provider, patient, staff)
```

### Database Security
```
Update server/db/schema.ts to add audit logging tables, user roles, and encrypted PHI fields with proper indexes
```

```
Create server/db/migrations/ folder with initial migration files for users, patients, audit_logs, and roles tables
```

### Testing Framework
```
Install and configure Vitest in vitest.config.ts with React Testing Library, jsdom environment, and coverage reporting
```

```
Create server/__tests__/auth.test.ts with comprehensive authentication endpoint testing using supertest
```

```
Create server/__tests__/security.test.ts with rate limiting, input validation, and PHI protection tests
```

### Error Handling & Monitoring
```
Create server/middleware/errorHandler.ts with comprehensive error handling, sanitized error responses, and audit logging
```

```
Add health check endpoint in server/routes/health.ts with database connectivity, external service status, and system metrics
```

### Basic UI/UX Foundation
```
Create client/src/lib/design-tokens.ts with HIPAA-compliant color palette, typography scales, and spacing system
```

```
Create client/src/components/ui/button.tsx using class-variance-authority with accessibility features and loading states
```

```
Create client/src/components/ui/loading.tsx with spinner component and skeleton screens for data loading states
```

## MEDIUM (Do This Sprint - Improvements & Features)

### Enhanced Testing
```
Create client/src/components/__tests__/PatientForm.test.tsx with React Testing Library tests for PHI input masking and validation
```

```
Add cypress/integration/security.spec.js with E2E security tests for authentication flows and data protection
```

```
Create tests/performance/patient-api.yml using Artillery for load testing PHI processing endpoints
```

### Accessibility Implementation
```
Install @axe-core/react and cypress-axe, then configure automatic accessibility testing in development mode
```

```
Create client/src/components/ui/accessible-form.tsx with proper ARIA labels, error announcements, and screen reader support
```

```
Create client/src/hooks/useAnnouncement.ts for ARIA live regions and dynamic content announcements
```

### Advanced UI Components
```
Create client/src/components/ui/alert.tsx with variants for success, error, warning, and info states with proper ARIA roles
```

```
Create client/src/components/ui/card.tsx with consistent styling and accessibility features for patient data display
```

```
Create client/src/components/ui/error-boundary.tsx for graceful error handling with user-friendly messages and recovery options
```

### Monitoring & Backup
```
Create scripts/backup.sh with encrypted database backups using GPG and automated S3 upload for HIPAA compliance
```

```
Create monitoring/docker-compose.monitoring.yml with Prometheus, Grafana, and Loki for application monitoring
```

### Enhanced Security
```
Create server/middleware/sanitization.ts with DOMPurify integration for XSS protection and input sanitization
```

```
Add server/utils/validator.ts with comprehensive PHI validation rules and error messaging
```

## LOW (Backlog - Nice to Have)

### Advanced Features
```
Create client/src/hooks/useDarkMode.ts with system preference detection and localStorage persistence
```

```
Create client/src/components/ui/data-table.tsx with sorting, filtering, and pagination for patient data views
```

```
Add client/src/components/ui/file-upload.tsx with drag-and-drop, validation, and progress tracking using Uppy
```

### Infrastructure Enhancements
```
Create terraform/main.tf with AWS ECS deployment configuration for production infrastructure as code
```

```
Add nginx/nginx.conf with SSL termination, compression, and security headers for production deployment
```

### Documentation
```
Create docs/api.md with complete API documentation including authentication, endpoints, and response formats
```

```
Create docs/deployment.md with step-by-step production deployment instructions and troubleshooting guide
```

### Advanced Testing
```
Create shared/test-utils/factories.ts with faker.js integration for generating safe test data that doesn't resemble real PHI
```

```
Add tests/integration/hipaa-compliance.test.ts with automated HIPAA compliance verification tests
```

---

**Implementation Notes:**
- Start with CRITICAL items - they're blockers for any production deployment
- Each command assumes the current project structure from the package.json analysis
- All security implementations should be tested immediately after implementation
- Legal documents require review by actual legal counsel before production use
- Database migrations should be tested in staging environment first

**Dependencies to install across priorities:**
- Security: `helmet express-rate-limit jsonwebtoken express-validator bcryptjs winston`
- Testing: `vitest @testing-library/react supertest @axe-core/react cypress-axe`
- UI: `class-variance-authority @radix-ui/react-* lucide-react`
- Infrastructure: `docker nginx prometheus grafana`