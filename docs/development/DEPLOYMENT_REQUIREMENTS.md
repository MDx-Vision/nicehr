# DEPLOYMENT_REQUIREMENTS.md - What You Need for Production Deployment

**NiceHR Healthcare Consultant Management Platform**
**Last Updated**: January 5, 2026

---

## Overview

This document lists everything you need to provide for deploying NiceHR to production with HIPAA compliance.

---

## Quick Checklist

| # | Item | Required | Status |
|---|------|----------|--------|
| 1 | HIPAA-compliant hosting provider | ✅ Yes | ⬜ |
| 2 | PostgreSQL database | ✅ Yes | ⬜ |
| 3 | SendGrid API key (Pro plan) | ✅ Yes | ⬜ |
| 4 | Daily.co API credentials | ✅ Yes | ⬜ |
| 5 | Google Cloud Storage bucket | ✅ Yes | ⬜ |
| 6 | Domain name with SSL | ✅ Yes | ⬜ |
| 7 | Sign all BAAs | ✅ Yes | ⬜ |

---

## 1. HIPAA-Compliant Hosting Provider

### Requirements
- Dedicated server (not shared/serverless)
- Business Associate Agreement (BAA) available
- Data encryption at rest and in transit
- Located in appropriate jurisdiction

### Recommended Providers

| Provider | BAA | Starting Price | Notes |
|----------|-----|----------------|-------|
| **AWS** | ✅ | ~$50/mo | EC2 + RDS + S3 |
| **Google Cloud** | ✅ | ~$50/mo | Compute Engine + Cloud SQL |
| **Azure** | ✅ | ~$50/mo | Strong healthcare vertical |
| **DigitalOcean** | ✅ | ~$24/mo | Simpler, sign BAA on request |

### What to Provide
```
Hosting Provider: _________________________
Server Location: _________________________
BAA Signed: ⬜ Yes  ⬜ No
```

---

## 2. PostgreSQL Database

### Requirements
- PostgreSQL 14+ recommended
- SSL/TLS connections enabled (required for HIPAA)
- Regular backups configured
- Encryption at rest enabled

### Recommended Providers

| Provider | BAA | Starting Price |
|----------|-----|----------------|
| **Neon** | ✅ | Free tier available |
| **AWS RDS** | ✅ | ~$15/mo |
| **Google Cloud SQL** | ✅ | ~$10/mo |
| **DigitalOcean Managed** | ✅ | ~$15/mo |

### What to Provide
```
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require
```

**Example:**
```
DATABASE_URL=postgresql://nicehr_user:MySecureP@ss@db.example.com:5432/nicehr?sslmode=require
```

---

## 3. SendGrid Email Service (HIPAA Compliant)

### Requirements
- **Pro plan or higher** (required for BAA)
- Dedicated IP (recommended)
- TLS encryption enabled

### Setup Steps
1. Create account at [sendgrid.com](https://sendgrid.com)
2. Upgrade to Pro plan ($89.95/mo)
3. Contact SendGrid support to sign BAA
4. Create API key with "Mail Send" permissions
5. Verify your sending domain

### What to Provide
```
SENDGRID_API_KEY=SG.____________________________________
SENDGRID_FROM_EMAIL=NICEHR <noreply@your-domain.com>
```

### SendGrid Console Links
- API Keys: https://app.sendgrid.com/settings/api_keys
- Domain Auth: https://app.sendgrid.com/settings/sender_auth

---

## 4. Daily.co Video Service

### Requirements
- **Scale plan** for HIPAA compliance with BAA
- Organization-level domain

### Setup Steps
1. Create account at [daily.co](https://daily.co)
2. Upgrade to Scale plan (contact sales for HIPAA)
3. Sign BAA with Daily.co
4. Create API key in dashboard
5. Note your domain (e.g., `yourorg.daily.co`)

### What to Provide
```
DAILY_API_KEY=____________________________________
DAILY_DOMAIN=your-organization.daily.co
```

### Daily.co Console Links
- Dashboard: https://dashboard.daily.co
- API Keys: https://dashboard.daily.co/developers

---

## 5. Google Cloud Storage

### Requirements
- Google Cloud project with billing enabled
- BAA signed with Google Cloud
- Service account with appropriate permissions

### Setup Steps

#### Step 1: Create GCP Project
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project: "nicehr-production"
3. Enable billing

#### Step 2: Sign BAA
1. Go to Cloud Console > Compliance
2. Sign Google Cloud BAA for HIPAA

#### Step 3: Create Storage Bucket
1. Go to Cloud Storage > Create Bucket
2. Name: `nicehr-files` (or your preferred name)
3. Location: Choose region closest to your servers
4. Storage class: Standard
5. Access control: Fine-grained (required)
6. Encryption: Google-managed (or customer-managed for extra security)

#### Step 4: Create Folder Structure
Inside your bucket, create:
- `/public` - For public assets
- `/private` - For user uploads
- `/private/uploads` - Upload destination

#### Step 5: Create Service Account
1. Go to IAM & Admin > Service Accounts
2. Create service account: `nicehr-storage`
3. Grant role: "Storage Object Admin"
4. Create and download JSON key

### What to Provide
```
GCS_PROJECT_ID=your-gcp-project-id
GCS_BUCKET_NAME=nicehr-files

# Option A: Path to JSON key file
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json

# Option B: Inline credentials (for containers)
GCS_CLIENT_EMAIL=nicehr-storage@your-project.iam.gserviceaccount.com
GCS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Storage paths
PUBLIC_OBJECT_SEARCH_PATHS=/nicehr-files/public
PRIVATE_OBJECT_DIR=/nicehr-files/private
```

---

## 6. Domain & SSL Certificate

### Requirements
- Custom domain name
- SSL/TLS certificate (required for HIPAA)
- DNS configured to point to your server

### What to Provide
```
APP_URL=https://your-domain.com
```

### SSL Options
- **Let's Encrypt** (Free) - Auto-renewing via Certbot
- **Cloudflare** (Free tier) - Proxy with SSL
- **AWS Certificate Manager** (Free with AWS)

---

## 7. Session Secret

Generate a secure random string for session encryption:

```bash
# Generate on Linux/Mac:
openssl rand -hex 32
```

### What to Provide
```
SESSION_SECRET=your-64-character-random-hex-string-here
```

---

## Complete Environment Variables Template

Copy to your `.env` file and fill in values:

```bash
# Application
NODE_ENV=production
PORT=3000
APP_URL=https://___________________

# Security
SESSION_SECRET=___________________

# Database
DATABASE_URL=postgresql://___________________

# Email (SendGrid)
SENDGRID_API_KEY=SG.___________________
SENDGRID_FROM_EMAIL=NICEHR <noreply@___________________>

# Video (Daily.co)
DAILY_API_KEY=___________________
DAILY_DOMAIN=___________________.daily.co

# Storage (Google Cloud)
GCS_PROJECT_ID=___________________
GCS_BUCKET_NAME=___________________
GOOGLE_APPLICATION_CREDENTIALS=/path/to/credentials.json
PUBLIC_OBJECT_SEARCH_PATHS=/___________________/public
PRIVATE_OBJECT_DIR=/___________________/private
```

---

## BAA Signing Checklist

For HIPAA compliance, sign Business Associate Agreements with all service providers:

| Provider | Where to Sign | Status |
|----------|---------------|--------|
| Hosting (AWS/GCP/Azure) | Account settings or support | ⬜ |
| Database (Neon/RDS/Cloud SQL) | Via hosting provider or separately | ⬜ |
| SendGrid | Contact support@sendgrid.com | ⬜ |
| Daily.co | Contact sales for Scale plan | ⬜ |
| Google Cloud Storage | Cloud Console > Compliance | ⬜ |

---

## Deployment Steps (After Gathering Requirements)

1. **Set up hosting environment**
   - Provision server
   - Install Node.js 18+ and npm

2. **Set up database**
   - Create PostgreSQL database
   - Run migrations: `npm run db:push`

3. **Configure environment**
   - Create `.env` file with all variables
   - Set proper file permissions: `chmod 600 .env`

4. **Deploy application**
   ```bash
   git clone https://github.com/your-repo/nicehr.git
   cd nicehr
   npm install
   npm run build
   npm start
   ```

5. **Configure reverse proxy** (nginx/Apache)
   - Set up SSL termination
   - Proxy to Node.js application

6. **Seed demo data** (optional)
   ```bash
   curl -X POST https://your-domain.com/api/admin/seed-demo-data
   ```

7. **Run verification**
   - Test login flow
   - Test file uploads
   - Test email sending
   - Test video calls

---

## Support Contacts

| Service | Support |
|---------|---------|
| SendGrid | support@sendgrid.com |
| Daily.co | hello@daily.co |
| Google Cloud | cloud.google.com/support |
| AWS | aws.amazon.com/contact-us |
| Azure | azure.microsoft.com/support |

---

## Questions?

If you need help with any of these steps, please gather the required credentials and reach out. The more information you can provide upfront, the faster we can deploy.

**Minimum Information Needed:**
1. ✅ Database connection string
2. ✅ SendGrid API key
3. ✅ Daily.co API key and domain
4. ✅ Google Cloud service account JSON
5. ✅ Target domain name
