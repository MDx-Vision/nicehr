# NiceHR Deployment Guide

## Prerequisites

- Docker and Docker Compose installed
- PostgreSQL database (Neon recommended for production)
- Node.js 20+ (for local development)

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host/db` |
| `SESSION_SECRET` | Session encryption key (min 32 chars) | `openssl rand -base64 32` |
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port | `5000` |

### Optional Variables

| Variable | Description |
|----------|-------------|
| `RESEND_API_KEY` | Email service API key |
| `ANTHROPIC_API_KEY` | Claude AI features |
| `GCS_BUCKET_NAME` | Google Cloud Storage bucket |
| `GCS_PROJECT_ID` | Google Cloud project ID |

## Deployment Options

### Option 1: Docker (Recommended)

```bash
# Build and run
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### Option 2: Manual Build

```bash
# Install dependencies
npm ci

# Build for production
npm run build

# Start production server
NODE_ENV=production npm start
```

### Option 3: Platform Deployment

#### Railway
1. Connect your GitHub repository
2. Add environment variables in Railway dashboard
3. Deploy automatically on push to main

#### Vercel
1. Import project from GitHub
2. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. Add environment variables

#### AWS / GCP / Azure
1. Build Docker image: `docker build -t nicehr .`
2. Push to container registry
3. Deploy to container service (ECS, Cloud Run, ACI)

## Database Setup

### Using Neon (Recommended)

1. Create account at [neon.tech](https://neon.tech)
2. Create new project
3. Copy connection string to `DATABASE_URL`
4. Run migrations:

```bash
npm run db:push
```

### Using Local PostgreSQL

1. Uncomment PostgreSQL service in `docker-compose.yml`
2. Set `DATABASE_URL=postgresql://nicehr:nicehr_password@postgres:5432/nicehr`
3. Run: `docker-compose up -d`

## CI/CD Pipeline

GitHub Actions workflow runs automatically on:
- Push to `main` branch
- Pull requests to `main`

Pipeline stages:
1. **Type Check** - TypeScript validation
2. **E2E Tests** - Cypress test suite (836 tests)
3. **Build** - Docker image build

### Required GitHub Secrets

| Secret | Description |
|--------|-------------|
| `DATABASE_URL` | Test database connection |
| `SESSION_SECRET` | Test session secret |

Optional (for Docker push):
| Secret | Description |
|--------|-------------|
| `DOCKERHUB_USERNAME` | Docker Hub username |
| `DOCKERHUB_TOKEN` | Docker Hub access token |

## Health Check

The application exposes a health endpoint:

```bash
curl http://localhost:5000/api/health
```

Returns:
```json
{
  "status": "healthy",
  "timestamp": "2025-12-29T00:00:00.000Z"
}
```

## Monitoring

### Logs

```bash
# Docker
docker-compose logs -f app

# Manual
tail -f logs/app.log
```

### Metrics

The health endpoint can be used with:
- Uptime monitoring (UptimeRobot, Pingdom)
- Container orchestration health checks
- Load balancer health probes

## Security Checklist

- [ ] Set strong `SESSION_SECRET` (min 32 characters)
- [ ] Use HTTPS in production (via reverse proxy or platform)
- [ ] Configure `ALLOWED_ORIGINS` for CORS
- [ ] Keep dependencies updated
- [ ] Enable database SSL (`?sslmode=require`)
- [ ] Set up backup for database
- [ ] Configure rate limiting (if not using platform)

## Troubleshooting

### Container won't start

```bash
# Check logs
docker-compose logs app

# Rebuild
docker-compose build --no-cache
docker-compose up -d
```

### Database connection issues

```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1"

# Check SSL mode
# Ensure ?sslmode=require in connection string
```

### Port already in use

```bash
# Find process using port
lsof -i :5000

# Kill process
kill -9 <PID>
```

## Support

For issues, open a GitHub issue or contact the development team.
