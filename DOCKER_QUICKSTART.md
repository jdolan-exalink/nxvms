# NXvms Docker Quick Start Guide

Get NXvms running in Docker in 5 minutes or less.

## Prerequisites

- **Docker Desktop** (Windows/Mac) or **Docker Engine** (Linux)
- **Docker Compose** (included with Docker Desktop)
- **4GB RAM** minimum (8GB recommended)
- **20GB disk space** minimum

## Quick Start (5 Steps)

### Step 1: Clone the Repository

```bash
# Windows
git clone https://github.com/jdolan-exalink/nxvms.git
cd nxvms

# Or if already cloned, just navigate to it
cd C:\Users\juan\DEVs\NXvms
```

### Step 2: Validate Your System

**Windows PowerShell:**
```powershell
.\validate-deployment.ps1
```

**Linux/Mac Bash:**
```bash
bash ./validate-deployment.sh
```

> This validates Docker installation, ports, and system resources. Fix any "FAIL" issues before proceeding.

### Step 3: Configure Environment

```bash
# Copy the example configuration
cp .env.example .env

# Edit with your preferred editor
# Windows: notepad .env
# Linux: nano .env
# Mac: open -t .env

# At minimum, change these for security:
# - DB_PASSWORD: strong random password (min 16 chars)
# - JWT_SECRET: strong random secret (min 32 chars)
```

> Use this to generate secure passwords:
> 
> **Windows PowerShell:**
> ```powershell
> [System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((New-Guid).ToString()))
> ```
>
> **Linux/Mac:**
> ```bash
> openssl rand -base64 32
> ```

### Step 4: Start the Services

```bash
# Build and start all services
docker compose up -d

# This will:
# 1. Build Docker images (server and client)
# 2. Download postgres:15-alpine
# 3. Create network and volumes
# 4. Start all services in background
```

### Step 5: Verify Services Are Running

```bash
# Check service status
docker compose ps

# Expected output:
# NAME          STATUS              PORTS
# postgres      Up (healthy)        5432/tcp
# server        Up (healthy)        3000/tcp
# client        Up (healthy)        5173/tcp

# If any status is not "Up (healthy)", check logs:
docker compose logs server
docker compose logs client
docker compose logs postgres
```

## Access the Application

Once all services show as "Up (healthy)":

- **Frontend**: http://localhost:5173
- **API**: http://localhost:3000/api
- **Database**: localhost:5432 (internal, not exposed by default)

## Verify It's Working

```bash
# Test API endpoint
curl http://localhost:3000/api/v1/health

# Expected response:
# {"status":"ok","version":"0.1.0"}

# Check frontend loads
curl http://localhost:5173 | head -20
```

## Common Commands

```bash
# View real-time logs
docker compose logs -f

# View logs for specific service
docker compose logs -f server
docker compose logs -f client
docker compose logs -f postgres

# Stop all services
docker compose stop

# Start stopped services
docker compose start

# Restart all services
docker compose restart

# Remove all containers (keeps data)
docker compose down

# Remove everything including volumes (WARNING: deletes database data)
docker compose down -v

# Rebuild images (after code changes)
docker compose build --no-cache

# Scale a service (run multiple instances)
docker compose up -d --scale server=3
```

## Troubleshooting

### Services won't start

```bash
# Check logs for error messages
docker compose logs

# Verify ports are available
# Windows:
netstat -ano | findstr :5173
netstat -ano | findstr :3000
netstat -ano | findstr :5432

# Linux/Mac:
lsof -i :5173
lsof -i :3000
lsof -i :5432

# Restart everything
docker compose restart
```

### Port already in use

Edit `.env` and change the port:

```bash
# Original
CLIENT_PORT=5173
SERVER_PORT=3000
DB_PORT=5432

# Changed to different ports if already in use
CLIENT_PORT=5174
SERVER_PORT=3001
DB_PORT=5433

# Restart services
docker compose restart
```

### Database password issues

```bash
# If you changed DB_PASSWORD in .env after initial setup:
# 1. Remove the database volume (WARNING: deletes data)
docker compose down -v

# 2. Start services again (will recreate with new password)
docker compose up -d
```

### Slow performance

```bash
# Increase Docker resource limits
# Docker Desktop: Settings → Resources
# Minimum: 4GB RAM, 2 CPU cores
# Recommended: 8GB RAM, 4 CPU cores

# After changing resources:
docker compose restart
```

### API not responding

```bash
# Check if server container is healthy
docker compose ps server

# View server logs for errors
docker compose logs server

# Try restarting just the server
docker compose restart server

# If database connection fails:
docker compose logs postgres
```

## Next Steps

1. **Configure for your cameras**: Edit server configuration
2. **Set up reverse proxy for production**: Use nginx or traefik for HTTPS
3. **Set up backups**: See [LINUX_DOCKER_DEPLOYMENT.md](LINUX_DOCKER_DEPLOYMENT.md#backup-and-restore)
4. **Production deployment**: See [LINUX_DOCKER_DEPLOYMENT.md](LINUX_DOCKER_DEPLOYMENT.md#production-deployment)

## Deployment Checklists

### Development Environment ✓

- [x] Docker Desktop installed
- [x] Cloned repository
- [x] Ran validation script
- [x] Created .env with dev credentials
- [x] Services running and healthy
- [x] Can access http://localhost:5173

### Staging Environment

- [ ] Linux server with Docker and Docker Compose
- [ ] Ran validation script on Linux
- [ ] Created .env with staging credentials
- [ ] Volumes configured for data persistence
- [ ] Reverse proxy (nginx) configured
- [ ] SSL/TLS certificates installed
- [ ] Services running and healthy
- [ ] Health checks passing (http://yourdomain.com/api/v1/health)

### Production Environment

- [ ] Dedicated Linux server (Ubuntu 20.04+ or CentOS 8+)
- [ ] Ran validation script
- [ ] Configured strong passwords in .env
- [ ] Set up automated backups
- [ ] Configured reverse proxy with HTTPS
- [ ] Set up monitoring and alerting
- [ ] Set up log aggregation
- [ ] Tested database backup/restore
- [ ] Documented runbook for team

## Getting Help

- **View all logs**: `docker compose logs`
- **Read full guide**: [LINUX_DOCKER_DEPLOYMENT.md](LINUX_DOCKER_DEPLOYMENT.md)
- **Check configuration**: `docker compose config`
- **Validate system**: Run `validate-deployment.ps1` or `validate-deployment.sh`

## Success Indicators ✓

After following these steps, you should see:

```bash
$ docker compose ps
NAME      STATUS              PORTS
postgres  Up (healthy)        5432/tcp
server    Up (healthy)        0.0.0.0:3000->3000/tcp
client    Up (healthy)        0.0.0.0:5173->5173/tcp

$ curl http://localhost:3000/api/v1/health
{"status":"ok","version":"0.1.0"}

# Frontend loads successfully at http://localhost:5173
```

## Quick Reference

| Action | Command |
|--------|---------|
| Start | `docker compose up -d` |
| Stop | `docker compose down` |
| Logs | `docker compose logs -f` |
| Status | `docker compose ps` |
| Restart | `docker compose restart` |
| Rebuild | `docker compose build` |
| Validate | `validate-deployment.ps1` or `.sh` |

---

**Version**: 0.1.0  
**Last Updated**: 2024  
**Documentation**: [LINUX_DOCKER_DEPLOYMENT.md](LINUX_DOCKER_DEPLOYMENT.md)
