# Government Services Aggregator Platform — Deployment Guide

A complete, production-ready deployment reference for the GovServices platform.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Prerequisites](#2-prerequisites)
3. [Local Development Setup](#3-local-development-setup)
4. [Environment Configuration](#4-environment-configuration)
5. [Docker Deployment (Production)](#5-docker-deployment-production)
6. [SSL Certificate Setup](#6-ssl-certificate-setup)
7. [AWS Deployment Architecture](#7-aws-deployment-architecture)
8. [Database Setup & Seeding](#8-database-setup--seeding)
9. [CI/CD Pipeline](#9-cicd-pipeline)
10. [PM2 Bare-Metal Deployment](#10-pm2-bare-metal-deployment)
11. [Monitoring & Observability](#11-monitoring--observability)
12. [Backup & Recovery](#12-backup--recovery)
13. [Scaling Guide](#13-scaling-guide)
14. [Security Hardening](#14-security-hardening)
15. [Troubleshooting](#15-troubleshooting)

---

## 1. Architecture Overview

```
                         ┌─────────────────────────────────────────┐
                         │           CloudFlare / CDN               │
                         └──────────────────┬──────────────────────┘
                                            │
                         ┌──────────────────▼──────────────────────┐
                         │         NGINX (Reverse Proxy)           │
                         │   - SSL Termination (TLS 1.2/1.3)       │
                         │   - Rate Limiting                        │
                         │   - Static Asset Caching                 │
                         │   - HTTP → HTTPS Redirect                │
                         └───────────┬──────────────┬──────────────┘
                                     │              │
              ┌──────────────────────▼──┐    ┌──────▼──────────────────────┐
              │   Frontend (React SPA)   │    │    Backend API (Node.js)    │
              │   nginx:1.25-alpine      │    │    Express + TypeScript     │
              │   Port: 80 (internal)    │    │    Port: 5000               │
              └─────────────────────────┘    └──────────────┬──────────────┘
                                                            │
                                             ┌──────────────▼──────────────┐
                                             │    MongoDB 7.0               │
                                             │    Port: 27017               │
                                             │    Auth: SCRAM-SHA-256       │
                                             └─────────────────────────────┘
```

### Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS | SPA UI |
| State | Zustand, TanStack Query v5 | Client state & server cache |
| Backend | Node.js 20, Express, TypeScript | REST API |
| Database | MongoDB 7.0, Mongoose | Data persistence |
| Auth | JWT (access 15m + refresh 7d), bcryptjs | Authentication |
| Proxy | NGINX 1.25 | Reverse proxy, SSL, static serving |
| Container | Docker, Docker Compose | Orchestration |
| CI/CD | GitHub Actions, GHCR | Automation |
| Process | PM2 (bare-metal) | Process management |

---

## 2. Prerequisites

### Local Development
- **Node.js** 20.x LTS → [nodejs.org](https://nodejs.org)
- **npm** 10.x (comes with Node.js 20)
- **Docker Desktop** 24+ → [docker.com](https://docker.com/get-started)
- **Git** 2.40+
- **MongoDB Compass** (optional GUI) → [mongodb.com/compass](https://mongodb.com/compass)

### Production Server (VPS/EC2)
- **OS**: Ubuntu 22.04 LTS (recommended)
- **CPU**: 2+ vCPUs
- **RAM**: 4 GB minimum, 8 GB recommended
- **Storage**: 40 GB SSD
- **Ports**: 80, 443 open inbound; 22 for SSH
- **Docker Engine** 24+ + **Docker Compose Plugin** v2
- A registered domain name with DNS A-record pointing to server IP

---

## 3. Local Development Setup

### 3.1 Clone & Install

```bash
git clone https://github.com/your-org/govservices.git
cd govservices
```

### 3.2 Configure Environment Files

```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env — set JWT secrets, etc.

# Frontend
cp frontend/.env.example frontend/.env
# Edit frontend/.env — set VITE_API_URL
```

### 3.3 Start with Docker Compose (recommended)

```bash
docker compose -f docker-compose.dev.yml up --build
```

Services available:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- MongoDB: localhost:27017

### 3.4 Start Manually (without Docker)

**Terminal 1 — MongoDB**
```bash
# Ensure MongoDB is running locally on port 27017
mongod --dbpath ./data
```

**Terminal 2 — Backend**
```bash
cd backend
npm install
npm run dev
# Starts tsx watch on port 5000
```

**Terminal 3 — Frontend**
```bash
cd frontend
npm install
npm run dev
# Starts Vite dev server on port 5173
```

### 3.5 Seed Initial Data

```bash
# Run the seeder (creates categories, settings, and super admin)
cd backend
npm run seed
# OR with tsx directly:
npx tsx src/utils/seeder.ts
```

Default super admin credentials (change immediately!):
- **Email**: `superadmin@govservices.com`
- **Password**: defined in `SUPER_ADMIN_PASSWORD` env var (default: `SuperAdmin123!`)

---

## 4. Environment Configuration

### 4.1 Backend `.env`

```dotenv
# ─── Server ───────────────────────────────────────────────────────────────────
NODE_ENV=production
PORT=5000

# ─── Database ─────────────────────────────────────────────────────────────────
MONGODB_URI=mongodb://govservices_user:STRONG_PASSWORD@localhost:27017/govservices

# ─── JWT ──────────────────────────────────────────────────────────────────────
# Generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_ACCESS_SECRET=your-64-char-hex-access-secret-here
JWT_REFRESH_SECRET=your-64-char-hex-refresh-secret-here
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# ─── CORS ─────────────────────────────────────────────────────────────────────
CORS_ORIGINS=https://govservices.com,https://www.govservices.com

# ─── Email (SMTP) ─────────────────────────────────────────────────────────────
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
EMAIL_FROM=noreply@govservices.com
EMAIL_FROM_NAME=GovServices

# ─── Rate Limiting ────────────────────────────────────────────────────────────
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# ─── Super Admin Seed ─────────────────────────────────────────────────────────
SUPER_ADMIN_EMAIL=superadmin@govservices.com
SUPER_ADMIN_PASSWORD=ChangeMe_Strong_Password_123!
SUPER_ADMIN_NAME=Super Admin
```

### 4.2 Frontend `.env`

```dotenv
VITE_API_URL=https://govservices.com/api/v1
VITE_APP_NAME=GovServices
VITE_APP_DESCRIPTION=Your centralized gateway to verified government services
VITE_ADSENSE_CLIENT_ID=ca-pub-your-adsense-id
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### 4.3 Root `.env` (Docker Compose secrets)

```dotenv
MONGO_ROOT_USER=admin
MONGO_ROOT_PASSWORD=VeryStrongMongoRootPassword123!
MONGO_APP_USER=govservices_user
MONGO_APP_PASSWORD=VeryStrongAppPassword123!
```

---

## 5. Docker Deployment (Production)

### 5.1 Build Images Locally

```bash
# Build backend
docker build -t govservices-backend:latest ./backend --target production

# Build frontend
docker build \
  --build-arg VITE_API_URL=https://govservices.com/api/v1 \
  --build-arg VITE_APP_NAME=GovServices \
  -t govservices-frontend:latest ./frontend --target production
```

### 5.2 Start Full Stack

```bash
# Copy and configure environment
cp .env.example .env
nano .env  # Fill in MongoDB credentials

# Start all services
docker compose up -d

# View logs
docker compose logs -f

# View specific service logs
docker compose logs -f backend
docker compose logs -f nginx
```

### 5.3 Check Service Health

```bash
# All services
docker compose ps

# Backend health
curl http://localhost:5000/api/v1/health

# NGINX status
docker compose exec nginx nginx -t
```

### 5.4 Zero-Downtime Updates

```bash
# Pull latest images from registry
docker compose pull

# Recreate containers one at a time
docker compose up -d --no-deps backend
sleep 10
docker compose up -d --no-deps frontend

# Reload NGINX without dropping connections
docker compose exec nginx nginx -s reload

# Prune old images
docker image prune -f
```

### 5.5 Useful Docker Commands

```bash
# Execute commands inside containers
docker compose exec backend sh
docker compose exec mongodb mongosh

# Scale backend (requires external load balancer)
docker compose up -d --scale backend=3

# View resource usage
docker stats

# Reset everything (DANGER: deletes volumes)
docker compose down -v
```

---

## 6. SSL Certificate Setup

### 6.1 Let's Encrypt with Certbot (Recommended)

Install Certbot on your server:
```bash
sudo apt update
sudo apt install certbot
```

Obtain certificate (standalone, before starting NGINX):
```bash
sudo certbot certonly --standalone \
  -d govservices.com \
  -d www.govservices.com \
  --email admin@govservices.com \
  --agree-tos \
  --no-eff-email
```

Copy certificates to NGINX volume:
```bash
sudo mkdir -p ./nginx/ssl
sudo cp /etc/letsencrypt/live/govservices.com/fullchain.pem ./nginx/ssl/
sudo cp /etc/letsencrypt/live/govservices.com/privkey.pem ./nginx/ssl/
sudo chmod 644 ./nginx/ssl/*.pem
```

### 6.2 Auto-Renewal

Create renewal script at `/etc/cron.d/govservices-certbot`:
```bash
0 2 * * * root certbot renew --quiet --deploy-hook "cp /etc/letsencrypt/live/govservices.com/fullchain.pem /var/www/govservices/nginx/ssl/ && cp /etc/letsencrypt/live/govservices.com/privkey.pem /var/www/govservices/nginx/ssl/ && docker compose -f /var/www/govservices/docker-compose.yml exec nginx nginx -s reload"
```

### 6.3 Self-Signed Certificate (Development/Testing Only)

```bash
mkdir -p nginx/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/privkey.pem \
  -out nginx/ssl/fullchain.pem \
  -subj "/C=US/ST=State/L=City/O=GovServices/CN=govservices.com"
```

---

## 7. AWS Deployment Architecture

### 7.1 Recommended AWS Architecture

```
Internet
    │
    ▼
Route 53 (DNS)
    │
    ▼
CloudFront (CDN + WAF)
    │
    ▼
Application Load Balancer (ALB)
    │
    ├── Target Group: ECS Backend Tasks (Port 5000)
    │       │
    │       └── ECS Fargate — Backend API (Auto-scaling 1-10 tasks)
    │
    └── Target Group: ECS Frontend Tasks (Port 80)
            │
            └── ECS Fargate — Frontend (1-3 tasks)

                    │
                    ▼
            DocumentDB (MongoDB compatible)
            OR
            MongoDB Atlas (M10+ cluster)
```

### 7.2 AWS Services Used

| Service | Purpose | Tier |
|---------|---------|------|
| ECS Fargate | Container orchestration (serverless) | Production |
| ECR | Docker image registry | Production |
| ALB | Load balancing + SSL termination | Production |
| CloudFront | CDN, WAF, DDoS protection | Production |
| Route 53 | DNS management | Production |
| DocumentDB | MongoDB-compatible managed DB | Production |
| ElastiCache | Redis for session/rate-limit cache | Optional |
| S3 | Static assets, backups, logs | Production |
| ACM | Free SSL/TLS certificates | Production |
| CloudWatch | Monitoring and alerts | Production |
| Secrets Manager | Secure secrets storage | Production |
| VPC | Network isolation | Production |

### 7.3 ECS Task Definition (Backend)

```json
{
  "family": "govservices-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "YOUR_ECR_URI/govservices-backend:latest",
      "portMappings": [{ "containerPort": 5000, "protocol": "tcp" }],
      "environment": [
        { "name": "NODE_ENV", "value": "production" },
        { "name": "PORT", "value": "5000" }
      ],
      "secrets": [
        { "name": "MONGODB_URI", "valueFrom": "arn:aws:secretsmanager:us-east-1:ACCOUNT:secret:govservices/mongodb-uri" },
        { "name": "JWT_ACCESS_SECRET", "valueFrom": "arn:aws:secretsmanager:us-east-1:ACCOUNT:secret:govservices/jwt-access-secret" },
        { "name": "JWT_REFRESH_SECRET", "valueFrom": "arn:aws:secretsmanager:us-east-1:ACCOUNT:secret:govservices/jwt-refresh-secret" }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/govservices-backend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "wget -qO- http://localhost:5000/api/v1/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3
      }
    }
  ]
}
```

### 7.4 MongoDB Atlas Setup (Recommended over DocumentDB)

1. Create Atlas account at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create M10+ cluster (minimum for production)
3. Enable VPC Peering with your AWS VPC
4. Create database user with `readWrite` role on `govservices` database
5. Enable Atlas Search for full-text search
6. Set connection string in Secrets Manager:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/govservices?retryWrites=true&w=majority
   ```

### 7.5 Quick Deploy Script (Ubuntu 22.04)

```bash
#!/bin/bash
set -e

# Run as: sudo bash deploy.sh

# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | bash
usermod -aG docker ubuntu

# Install Docker Compose plugin
apt install -y docker-compose-plugin

# Install Certbot
apt install -y certbot

# Create app directory
mkdir -p /var/www/govservices
cd /var/www/govservices

# Clone repository
git clone https://github.com/your-org/govservices.git .

# Configure environment
cp .env.example .env
# IMPORTANT: Edit .env with real values
nano .env

# Set up SSL
certbot certonly --standalone -d govservices.com -d www.govservices.com \
  --email admin@govservices.com --agree-tos --no-eff-email

mkdir -p nginx/ssl
cp /etc/letsencrypt/live/govservices.com/fullchain.pem nginx/ssl/
cp /etc/letsencrypt/live/govservices.com/privkey.pem nginx/ssl/

# Build and start
docker compose up -d --build

# Seed database
docker compose exec backend node dist/utils/seeder.js

echo "✅ Deployment complete!"
echo "   Visit: https://govservices.com"
```

---

## 8. Database Setup & Seeding

### 8.1 Manual Seed

```bash
# With Docker
docker compose exec backend node dist/utils/seeder.js

# Bare metal
cd backend && npx tsx src/utils/seeder.ts
```

The seeder creates:
- 12 default categories (Healthcare, Education, Tax Services, etc.)
- Default platform settings
- Super admin user (credentials from `.env`)

### 8.2 Database Backup

```bash
# Backup
docker compose exec mongodb mongodump \
  --uri="mongodb://admin:password@localhost:27017/govservices?authSource=admin" \
  --archive=/tmp/backup_$(date +%Y%m%d).gz \
  --gzip

# Copy backup out of container
docker compose cp mongodb:/tmp/backup_$(date +%Y%m%d).gz ./backups/

# Restore
docker compose exec -T mongodb mongorestore \
  --uri="mongodb://admin:password@localhost:27017/govservices?authSource=admin" \
  --archive --gzip < ./backups/backup_20240101.gz
```

### 8.3 Create Database Indexes (First Deploy)

The MongoDB init script (`scripts/mongo-init.js`) runs automatically on first Docker start and creates all required indexes. For subsequent runs or bare-metal setups, Mongoose handles index creation on application start via `autoIndex: true` (enabled in non-production) or explicitly via:

```bash
docker compose exec backend node -e "require('./dist/config/database').connectDB()"
```

---

## 9. CI/CD Pipeline

### 9.1 GitHub Secrets Required

Set these in your repository's **Settings → Secrets and variables → Actions**:

| Secret | Description |
|--------|-------------|
| `GITHUB_TOKEN` | Auto-provided by GitHub |
| `STAGING_HOST` | Staging server IP/hostname |
| `STAGING_USER` | SSH username (e.g., `ubuntu`) |
| `STAGING_SSH_KEY` | Private SSH key for staging |
| `STAGING_PORT` | SSH port (default: 22) |
| `PROD_HOST` | Production server IP/hostname |
| `PROD_USER` | SSH username |
| `PROD_SSH_KEY` | Private SSH key for production |
| `PROD_PORT` | SSH port (default: 22) |
| `SLACK_WEBHOOK_URL` | Slack notifications (optional) |

### 9.2 GitHub Variables Required

Set these in **Settings → Secrets and variables → Actions → Variables**:

| Variable | Example Value |
|----------|--------------|
| `STAGING_URL` | `https://staging.govservices.com` |
| `PRODUCTION_URL` | `https://govservices.com` |
| `VITE_API_URL` | `https://govservices.com/api/v1` |
| `VITE_APP_NAME` | `GovServices` |

### 9.3 Pipeline Stages

```
Push to develop → Lint → Tests → Security Audit → Build Images → Deploy Staging → Smoke Tests
Push to main    → Lint → Tests → Security Audit → Build Images → Deploy Production → Smoke Tests
Pull Request    → Lint → Tests → Security Audit (no deploy)
```

### 9.4 Enable GitHub Container Registry

```bash
# Authenticate Docker with GHCR
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# Images are published as:
# ghcr.io/your-org/govservices-backend:latest
# ghcr.io/your-org/govservices-frontend:latest
```

---

## 10. PM2 Bare-Metal Deployment

Use PM2 when deploying without Docker on a VPS.

### 10.1 Install Node.js & PM2

```bash
# Install Node.js 20 via NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20

# Install PM2 globally
npm install -g pm2

# Install PM2 log rotation module
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 50M
pm2 set pm2-logrotate:retain 7
```

### 10.2 Build & Start

```bash
cd /var/www/govservices/backend

# Install production dependencies
npm ci --omit=dev

# Build TypeScript
npm run build

# Start with PM2
pm2 start ecosystem.config.js --env production

# Save PM2 process list (survives reboots)
pm2 save

# Set PM2 to start on system boot
pm2 startup
# Follow the printed command, e.g.:
# sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu
```

### 10.3 PM2 Management Commands

```bash
pm2 status                          # List all processes
pm2 logs govservices-api            # Tail logs
pm2 logs govservices-api --lines 100  # Last 100 lines
pm2 reload govservices-api          # Zero-downtime reload
pm2 restart govservices-api         # Full restart
pm2 stop govservices-api            # Stop process
pm2 monit                           # Real-time monitoring dashboard
pm2 plus                            # PM2+ web monitoring (optional)
```

### 10.4 NGINX Setup (Bare-Metal)

```bash
# Install NGINX
sudo apt install -y nginx

# Copy config
sudo cp nginx/conf.d/govservices.conf /etc/nginx/sites-available/govservices
sudo ln -s /etc/nginx/sites-available/govservices /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
sudo systemctl enable nginx
```

---

## 11. Monitoring & Observability

### 11.1 Application Health

```bash
# Health endpoint
curl https://govservices.com/api/v1/health

# Expected response
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 12345,
  "environment": "production",
  "version": "1.0.0"
}
```

### 11.2 Container Monitoring

```bash
# Resource usage
docker stats

# Specific container stats
docker stats govservices-backend govservices-mongodb

# Container inspection
docker inspect govservices-backend
```

### 11.3 Log Aggregation

Logs are written to:
- `backend/logs/combined.log` — All levels
- `backend/logs/error.log` — Errors only
- `/var/log/nginx/access.log` — NGINX access
- `/var/log/nginx/error.log` — NGINX errors

For centralized logging, consider:
- **ELK Stack** (Elasticsearch, Logstash, Kibana)
- **Grafana Loki** (lighter weight)
- **AWS CloudWatch Logs** (AWS deployments)
- **Datadog** / **New Relic** (SaaS options)

### 11.4 Uptime Monitoring

Recommended tools (free tiers available):
- [UptimeRobot](https://uptimerobot.com) — Monitor `/api/v1/health` every 5 minutes
- [Better Uptime](https://betteruptime.com)
- AWS CloudWatch Alarms (for AWS deployments)

---

## 12. Backup & Recovery

### 12.1 Automated Backup Script

Create `/etc/cron.d/govservices-backup`:

```bash
# Daily MongoDB backup at 3 AM
0 3 * * * root /var/www/govservices/scripts/backup.sh >> /var/log/govservices-backup.log 2>&1
```

Create `scripts/backup.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/govservices"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

mkdir -p "$BACKUP_DIR"

# MongoDB dump
docker compose -f /var/www/govservices/docker-compose.yml exec -T mongodb \
  mongodump \
  --uri="mongodb://admin:${MONGO_ROOT_PASSWORD}@localhost:27017/govservices?authSource=admin" \
  --archive \
  --gzip > "$BACKUP_DIR/mongodb_$DATE.gz"

# Upload to S3 (optional)
# aws s3 cp "$BACKUP_DIR/mongodb_$DATE.gz" "s3://your-bucket/backups/mongodb_$DATE.gz"

# Cleanup old backups
find "$BACKUP_DIR" -name "*.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup completed: mongodb_$DATE.gz"
```

### 12.2 Restore Procedure

```bash
# 1. Stop backend to prevent writes
docker compose stop backend

# 2. Restore database
docker compose exec -T mongodb mongorestore \
  --uri="mongodb://admin:${MONGO_ROOT_PASSWORD}@localhost:27017/?authSource=admin" \
  --drop \
  --archive --gzip < /var/backups/govservices/mongodb_20240101_030000.gz

# 3. Restart backend
docker compose start backend

# 4. Verify
curl http://localhost:5000/api/v1/health
```

---

## 13. Scaling Guide

### 13.1 Vertical Scaling (Scale Up)

Simply upgrade your server's CPU/RAM — no configuration changes needed as the app uses all available cores via PM2 cluster or Docker Compose scaling.

### 13.2 Horizontal Scaling (Scale Out)

For horizontal scaling you need:

1. **External MongoDB** (MongoDB Atlas M30+ or AWS DocumentDB) — remove local MongoDB container
2. **External Session Store** — add Redis for shared session/rate-limit state
3. **Load Balancer** — AWS ALB, NGINX with multiple backends, or Traefik
4. **Shared Storage** — S3 for uploaded files

```bash
# Scale backend containers (with external DB and shared session store)
docker compose up -d --scale backend=3

# Or with Docker Swarm
docker stack deploy -c docker-compose.yml govservices
```

### 13.3 Performance Tuning

**MongoDB:**
```javascript
// Add compound indexes for frequent query patterns
db.services.createIndex({ country: 1, category: 1, status: 1, createdAt: -1 })
db.analytics.createIndex({ type: 1, service: 1, createdAt: -1 })
```

**NGINX:**
```nginx
# Increase worker connections in nginx.conf
worker_connections 4096;

# Enable sendfile for static assets
sendfile on;
tcp_nopush on;
```

**Node.js:**
- Increase `--max-old-space-size` in `ecosystem.config.js` for more RAM
- Use `instances: 'max'` in PM2 to use all CPU cores

---

## 14. Security Hardening

### 14.1 Server Hardening (Ubuntu)

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Configure UFW firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw enable

# Disable root SSH login
sudo sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sudo sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sudo systemctl restart sshd

# Install fail2ban
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
```

### 14.2 MongoDB Security

```bash
# Never expose MongoDB port publicly
# In docker-compose.yml, remove the ports mapping for mongodb in production:
# ports:
#   - "27017:27017"  ← REMOVE THIS IN PRODUCTION

# Always use authentication (MONGO_INITDB_ROOT_USERNAME/PASSWORD)
# Use least-privilege app user (readWrite only, not admin)
# Enable MongoDB audit logging for compliance
```

### 14.3 JWT Secret Generation

```bash
# Generate cryptographically secure secrets
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# Run twice — one for ACCESS secret, one for REFRESH secret
```

### 14.4 Security Headers Checklist

All security headers are configured in `nginx/nginx.conf`. Verify with:
```bash
curl -I https://govservices.com | grep -E "X-Frame|X-Content|Strict-Transport|X-XSS|Content-Security"
```

Expected headers:
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`

---

## 15. Troubleshooting

### Backend won't start

```bash
# Check logs
docker compose logs backend --tail 50

# Common issues:
# 1. MongoDB not ready — backend starts before MongoDB
docker compose restart backend

# 2. Port already in use
lsof -i :5000
kill -9 <PID>

# 3. Invalid env vars
docker compose exec backend node -e "require('./dist/config/env')"
```

### MongoDB connection failed

```bash
# Check if MongoDB is running
docker compose ps mongodb
docker compose logs mongodb --tail 20

# Test connection
docker compose exec mongodb mongosh \
  "mongodb://admin:password@localhost:27017/govservices?authSource=admin" \
  --eval "db.runCommand({ping:1})"

# Reset MongoDB data (DANGER: data loss!)
docker compose down
docker volume rm govservices_mongo_data
docker compose up -d
```

### NGINX 502 Bad Gateway

```bash
# Check upstream services are running
docker compose ps

# Test backend directly (bypass NGINX)
curl http://localhost:5000/api/v1/health

# Check NGINX config
docker compose exec nginx nginx -t

# Reload NGINX config
docker compose exec nginx nginx -s reload
```

### SSL Certificate Issues

```bash
# Check certificate expiry
echo | openssl s_client -servername govservices.com -connect govservices.com:443 2>/dev/null | openssl x509 -noout -dates

# Renew manually
certbot renew --force-renewal -d govservices.com -d www.govservices.com

# Copy renewed certs
cp /etc/letsencrypt/live/govservices.com/fullchain.pem ./nginx/ssl/
cp /etc/letsencrypt/live/govservices.com/privkey.pem ./nginx/ssl/
docker compose exec nginx nginx -s reload
```

### High Memory Usage

```bash
# Check container memory
docker stats --no-stream

# Check PM2 process memory
pm2 monit

# Trigger garbage collection (Node.js)
kill -USR1 $(pm2 id govservices-api)
```

### Frontend Blank Page (SPA Routing Issue)

The frontend uses `try_files $uri $uri/ /index.html` in `nginx.spa.conf`. If you see blank pages on route refresh:

```bash
# Verify the SPA fallback is configured
docker compose exec frontend cat /etc/nginx/conf.d/default.conf
# Should see: try_files $uri $uri/ /index.html;
```

---

## Quick Reference

```bash
# Start production
docker compose up -d

# Start development
docker compose -f docker-compose.dev.yml up

# View all logs
docker compose logs -f

# Rebuild and restart
docker compose up -d --build

# Stop all services
docker compose down

# Stop and remove volumes (DANGER)
docker compose down -v

# Run database seed
docker compose exec backend node dist/utils/seeder.js

# Open MongoDB shell
docker compose exec mongodb mongosh

# Check API health
curl http://localhost:5000/api/v1/health

# Zero-downtime reload NGINX
docker compose exec nginx nginx -s reload
```

---

*For questions, issues, or contributions — please open a GitHub issue or submit a pull request.*
