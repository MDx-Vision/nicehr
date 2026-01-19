# Security Policy

## Overview

NiceHR takes security seriously, especially given our focus on healthcare IT where HIPAA compliance is critical. This document outlines our security practices, vulnerability reporting process, and compliance measures.

---

## Table of Contents

1. [Supported Versions](#supported-versions)
2. [Reporting a Vulnerability](#reporting-a-vulnerability)
3. [Security Measures](#security-measures)
4. [HIPAA Compliance](#hipaa-compliance)
5. [Data Protection](#data-protection)
6. [Access Control](#access-control)
7. [Incident Response](#incident-response)

---

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.x.x   | Yes       |
| < 1.0   | No        |

Only the latest major version receives security updates. We strongly recommend keeping your installation up to date.

---

## Reporting a Vulnerability

### How to Report

If you discover a security vulnerability, please report it responsibly:

**Email:** security@nicehr.com

**Please include:**
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Any suggested fixes (optional)

### What to Expect

| Timeline | Action |
|----------|--------|
| 24 hours | Acknowledgment of report |
| 72 hours | Initial assessment |
| 7 days | Status update |
| 30-90 days | Fix and disclosure (depending on severity) |

### Responsible Disclosure

- Please do not publicly disclose the vulnerability until we've had a chance to address it
- Do not access or modify data belonging to other users
- Do not perform actions that could harm the service or its users
- We will credit researchers who report valid vulnerabilities (unless anonymity is requested)

### Bug Bounty

We currently do not have a formal bug bounty program, but we appreciate and acknowledge security researchers who help improve our platform.

---

## Security Measures

### Authentication

| Measure | Implementation |
|---------|----------------|
| Password Hashing | bcrypt with cost factor 12 |
| Session Management | Secure, HTTP-only cookies |
| Session Timeout | 15 minutes of inactivity (HIPAA requirement) |
| Multi-Factor Auth | Available for all accounts |
| Password Requirements | Min 12 characters, complexity rules |

### Transport Security

| Measure | Implementation |
|---------|----------------|
| TLS | TLS 1.3 required in production |
| HSTS | Strict-Transport-Security header |
| Certificate | Valid SSL/TLS certificate required |

### Application Security

| Measure | Implementation |
|---------|----------------|
| SQL Injection | Drizzle ORM parameterized queries |
| XSS Prevention | React auto-escaping, CSP headers |
| CSRF Protection | Same-site cookies, CSRF tokens |
| Input Validation | Server-side validation on all inputs |
| Rate Limiting | 100 req/min standard, 10 req/min sensitive |

### Infrastructure Security

| Measure | Implementation |
|---------|----------------|
| Firewall | Restricted inbound access |
| Network Isolation | Private subnets for databases |
| Encryption at Rest | Database and file storage encrypted |
| Backup Encryption | All backups encrypted |
| Audit Logging | Comprehensive access logs |

---

## HIPAA Compliance

NiceHR is designed to support HIPAA compliance for healthcare organizations.

### Technical Safeguards

| Requirement | Implementation |
|-------------|----------------|
| Access Control | Role-based access control (RBAC) |
| Audit Controls | Comprehensive audit logging |
| Integrity Controls | SHA-256 document hashing |
| Transmission Security | TLS 1.3 encryption |
| Authentication | Unique user identification |

### Administrative Safeguards

| Requirement | Support |
|-------------|---------|
| Security Officer | Designate in your organization |
| Workforce Training | Training tracking module |
| Access Management | User provisioning/deprovisioning |
| Incident Response | Audit trail for investigations |

### Physical Safeguards

Physical safeguards depend on your hosting environment. For cloud deployments:

| Provider | Compliance |
|----------|------------|
| AWS | HIPAA BAA available |
| Google Cloud | HIPAA BAA available |
| Azure | HIPAA BAA available |

### Business Associate Agreements

NiceHR requires BAAs with:
- Cloud hosting provider
- Email service (SendGrid)
- Database provider (if managed)
- Any third-party integrations handling PHI

---

## Data Protection

### Data Classification

| Level | Description | Examples |
|-------|-------------|----------|
| PHI | Protected Health Information | Patient data, medical records |
| Sensitive | Business-sensitive data | Financial records, contracts |
| Internal | Internal use only | Project details, schedules |
| Public | Publicly available | Marketing materials |

### Data Handling

| Data Type | Encryption at Rest | Encryption in Transit | Retention |
|-----------|-------------------|----------------------|-----------|
| PHI | Required (AES-256) | Required (TLS 1.3) | Per HIPAA |
| Credentials | Required (bcrypt) | Required (TLS 1.3) | N/A |
| Audit Logs | Required | Required | 6 years |
| Backups | Required | Required | 30 days |

### Data Retention

- PHI: Retained per HIPAA requirements (typically 6 years)
- Audit logs: 6 years minimum
- Backups: 30 days, then securely destroyed
- User data: Retained until account deletion + 30 days

### Data Deletion

Upon account deletion request:
1. Immediate: Access revoked
2. 30 days: Data permanently deleted
3. Backups: Excluded from future backups, aged out naturally

---

## Access Control

### Role-Based Access Control (RBAC)

| Role | Description | Permissions |
|------|-------------|-------------|
| Admin | Full system access | All operations |
| Manager | Team/project management | Team data, reports |
| Consultant | Individual contributor | Own data, assigned projects |
| Client | External client access | Limited project view |
| Viewer | Read-only access | View only |

### Permission Model

```
resource:action

Examples:
- projects:view
- projects:edit
- consultants:manage
- admin:access
```

### Principle of Least Privilege

- Users receive minimum permissions required
- Permissions reviewed quarterly
- Elevated access requires approval
- Temporary access expires automatically

### Access Reviews

| Frequency | Review Type |
|-----------|-------------|
| Monthly | User access certification |
| Quarterly | Permission audit |
| Annually | Complete access review |
| On-demand | Post-incident review |

---

## Incident Response

### Severity Levels

| Level | Description | Response Time |
|-------|-------------|---------------|
| Critical | Active breach, PHI exposed | Immediate |
| High | Vulnerability exploited | 4 hours |
| Medium | Potential vulnerability | 24 hours |
| Low | Minor security issue | 72 hours |

### Response Process

1. **Identification**
   - Detect and confirm incident
   - Assess scope and severity
   - Notify security team

2. **Containment**
   - Isolate affected systems
   - Preserve evidence
   - Prevent further damage

3. **Eradication**
   - Remove threat
   - Patch vulnerabilities
   - Update security measures

4. **Recovery**
   - Restore systems
   - Verify integrity
   - Monitor for recurrence

5. **Post-Incident**
   - Document incident
   - Conduct root cause analysis
   - Update procedures
   - Notify affected parties (if required)

### Breach Notification

Per HIPAA requirements:
- **Affected individuals:** Within 60 days
- **HHS:** Within 60 days (if >500 affected)
- **Media:** If >500 in a state

---

## Security Contacts

| Contact | Purpose |
|---------|---------|
| security@nicehr.com | Vulnerability reports |
| privacy@nicehr.com | Privacy inquiries |
| compliance@nicehr.com | Compliance questions |

---

## Security Updates

Security updates are released as needed:
- Critical: Within 24 hours
- High: Within 7 days
- Medium: Next scheduled release
- Low: As resources permit

Subscribe to security announcements: security-announce@nicehr.com

---

## Compliance Certifications

| Certification | Status |
|---------------|--------|
| HIPAA | Compliant (self-attested) |
| SOC 2 Type II | Planned |
| HITRUST | Planned |

---

## Security Checklist for Deployment

- [ ] Configure TLS 1.3
- [ ] Set strong SESSION_SECRET
- [ ] Enable database encryption
- [ ] Configure firewall rules
- [ ] Set up audit logging
- [ ] Configure backup encryption
- [ ] Sign BAAs with vendors
- [ ] Implement rate limiting
- [ ] Enable MFA for admin accounts
- [ ] Review access permissions
- [ ] Configure session timeout (15 min)
- [ ] Set up monitoring and alerting

---

*Last Updated: January 19, 2026*
