# 🔧 NXvms Docker Compose - Testing & Troubleshooting Report

**Date**: January 8, 2026  
**Status**: ⚠️ Docker daemon not running  
**Environment**: Windows (PowerShell)

---

## 🆘 Issues Found

### Issue 1: Docker Daemon Not Running
**Error:**
```
error during connect: Get "http://%2F%2F.%2Fpipe%2FdockerDesktopLinuxEngine/v1.51/...": 
open //./pipe/dockerDesktopLinuxEngine: El sistema no puede encontrar el archivo especificado.
```

**Cause**: Docker Desktop is not running or Docker daemon is not active.

**Solution**:
```powershell
# Option 1: Start Docker Desktop
# - Open Docker Desktop application manually from Start Menu
# - Wait 30-60 seconds for it to fully initialize

# Option 2: Check if Docker is installed
docker --version

# Option 3: Restart Docker service (if installed)
Restart-Service -Name "Docker" -Force
```

---

### Issue 2: docker-compose Version Warning
**Warning:**
```
level=warning msg="C:\\Users\\juan\\DEVs\\NXvms\\docker-compose.yml: 
the attribute `version` is obsolete, it will be ignored, please remove it to avoid potential confusion"
```

**Cause**: Using deprecated `version: '3.8'` in docker-compose.yml

**Solution**: Update docker-compose.yml to remove version or use newer syntax.

---

## ✅ Pre-Flight Checklist

Before running docker-compose, verify:

```powershell
# 1. Check Docker is installed
docker --version
# Expected: Docker version X.X.X

# 2. Check Docker is running
docker ps
# Expected: Should list containers (may be empty list)

# 3. Check Docker Compose is installed
docker-compose --version
# Expected: Docker Compose version X.X.X

# 4. Verify Docker can build images
docker image ls
# Expected: Should list available images

# 5. Check disk space
Get-Volume
# Expected: Sufficient free space (at least 5GB)
```

---

## 🐳 How to Start Docker on Windows

### Method 1: Docker Desktop Application (Easiest)
1. Click **Start Menu**
2. Search for **"Docker Desktop"**
3. Click to open Docker Desktop
4. Wait for status icon to show (bottom right corner)
5. Wait 30-60 seconds for Docker daemon to fully initialize

### Method 2: PowerShell as Administrator
```powershell
# Start Docker service
Start-Service -Name "Docker"

# Wait for Docker to be ready
Start-Sleep -Seconds 30

# Verify it's running
docker ps
```

### Method 3: Windows Services
1. Press `Win + R`
2. Type: `services.msc`
3. Find "Docker Desktop Service"
4. Right-click → **Start**
5. Wait for it to fully start

---

## 🚀 Deployment Steps

Once Docker is running:

### Step 1: Verify Docker is Ready
```powershell
cd C:\Users\juan\DEVs\NXvms

# Test Docker connectivity
docker ps
# Should return: CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES
# (empty list is OK if no containers running)

# Test Docker Compose
docker-compose version
# Should return version info
```

### Step 2: Remove Version Warning (Optional but Recommended)
Edit `docker-compose.yml` and remove or update the version line:

**Before:**
```yaml
version: '3.8'
```

**After (Option A - Remove it):**
```yaml
# (delete the version line completely)
services:
```

**After (Option B - Use newer syntax):**
```yaml
version: '3.9'
services:
```

### Step 3: Start Full Stack
```powershell
# Navigate to project root
cd C:\Users\juan\DEVs\NXvms

# Copy environment file
copy .env.example .env

# Start all services (build + run)
docker-compose up -d

# Wait 10-15 seconds for services to initialize
Start-Sleep -Seconds 15

# Check status
docker-compose ps
```

### Step 4: Verify Services Are Running
```powershell
# Should show:
# NAME                STATUS              PORTS
# nxvms-client        Up 2 seconds        0.0.0.0:5173->5173/tcp
# nxvms-server        Up 2 seconds        0.0.0.0:3000->3000/tcp
# nxvms-postgres      Up 3 seconds        0.0.0.0:5432->5432/tcp

# If any show "Exited", check logs
docker-compose logs [service-name]
```

### Step 5: Access the System
```
Frontend: http://localhost:5173
Backend:  http://localhost:3000/api/v1
Database: localhost:5432
```

**Login Credentials:**
- Username: `admin`
- Password: `admin123`
- Server: `http://localhost:3000/api/v1`

---

## 📊 Full Deployment Testing Workflow

### Test 1: Verify Environment
```powershell
# Check Docker
docker --version
docker ps

# Check Docker Compose
docker-compose --version

# Check files exist
Test-Path "C:\Users\juan\DEVs\NXvms\docker-compose.yml"
Test-Path "C:\Users\juan\DEVs\NXvms\server\Dockerfile"
Test-Path "C:\Users\juan\DEVs\NXvms\client\Dockerfile"
Test-Path "C:\Users\juan\DEVs\NXvms\.env.example"
```

**Expected Output:**
- All version commands return version numbers
- All file paths return `True`

### Test 2: Start Services
```powershell
cd C:\Users\juan\DEVs\NXvms

# Build and start
docker-compose up -d

# Wait for startup
Start-Sleep -Seconds 15

# Check status
docker-compose ps
```

**Expected Output:**
```
NAME                COMMAND             STATUS              PORTS
nxvms-postgres      docker-entrypoint   Up 10 seconds       0.0.0.0:5432->5432/tcp
nxvms-server        dumb-init -- node   Up 8 seconds        0.0.0.0:3000->3000/tcp
nxvms-client        nginx -g daemon     Up 5 seconds        0.0.0.0:5173->5173/tcp
```

### Test 3: Health Checks
```powershell
# Backend health check
curl http://localhost:3000/api/v1/health

# Database check
docker exec nxvms-postgres psql -U nxvms -d nxvms_db -c "SELECT 1"

# Frontend check
curl http://localhost:5173
```

**Expected Output:**
- `/health` returns JSON with status
- Database returns `1`
- Frontend returns HTML

### Test 4: Browser Access
```
1. Open http://localhost:5173 in browser
2. Should see login page
3. Login with admin/admin123
4. Should see dashboard
5. Check for errors in browser console (F12)
```

### Test 5: Log Verification
```powershell
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs server
docker-compose logs postgres
docker-compose logs client

# Follow logs in real-time
docker-compose logs -f
```

**Expected:**
- No critical errors
- Server logs should show "Listening on port 3000"
- Database logs should show "ready to accept connections"

---

## 🔴 Common Errors & Solutions

### Error: "Docker daemon is not running"
```
error during connect: Get "http://%2F%2F.%2Fpipe%2FdockerDesktopLinuxEngine/v1.51/...":
```
**Solution**: Start Docker Desktop or Docker service (see above)

---

### Error: "unable to find image"
```
unable to get image 'nxvms-server': error during connect
```
**Solution**: Docker daemon not running. Start Docker first.

---

### Error: "Cannot find postgresql"
```
error: database "nxvms_db" does not exist
```
**Solution**: 
```powershell
# Wait longer for DB to initialize
Start-Sleep -Seconds 30

# Or check DB logs
docker-compose logs postgres

# Or reset everything
docker-compose down -v
docker-compose up -d
```

---

### Error: "Port already in use"
```
bind: address already in use
```
**Solution**:
```powershell
# Find process using port
netstat -ano | findstr :5173  # For port 5173
netstat -ano | findstr :3000  # For port 3000
netstat -ano | findstr :5432  # For port 5432

# Kill the process (replace PID with actual PID)
taskkill /PID <PID> /F

# Or use different ports in docker-compose.yml
# Change "5173:5173" to "5174:5173"
```

---

### Error: "Cannot connect to server"
```
GET http://localhost:3000/api/v1/health 
Connection refused
```
**Solution**:
```powershell
# Check if server container is running
docker-compose ps server

# Check server logs
docker-compose logs server

# Check if port is correct
netstat -ano | findstr :3000

# Restart server
docker-compose restart server
```

---

## 📋 Expected Output at Each Stage

### Stage 1: After `docker-compose up -d`
```
[+] Running 3/3
 ✓ Container nxvms-postgres  Started                    1.5s
 ✓ Container nxvms-server    Started                    2.3s
 ✓ Container nxvms-client    Started                    1.8s
```

### Stage 2: After `docker-compose ps`
```
NAME                COMMAND                  STATUS         PORTS
nxvms-client        nginx -g daemon off      Up 5 seconds   0.0.0.0:5173->5173/tcp
nxvms-postgres      docker-entrypoint.sh     Up 6 seconds   0.0.0.0:5432->5432/tcp
nxvms-server        dumb-init -- node d...   Up 4 seconds   0.0.0.0:3000->3000/tcp
```

### Stage 3: After Health Check
```
# curl http://localhost:3000/api/v1/health
{
  "status": "ok",
  "timestamp": "2026-01-08T13:51:55.000Z",
  "database": {
    "status": "connected",
    "database": "nxvms_db"
  }
}
```

### Stage 4: Browser at http://localhost:5173
- Login form visible
- No JavaScript errors in console
- Can enter credentials

### Stage 5: After Login
- Dashboard visible
- No CORS errors
- Can navigate pages

---

## 🔍 Monitoring & Debugging

### Real-time Logs
```powershell
# All services
docker-compose logs -f --all

# Follow specific service
docker-compose logs -f server

# Show last 100 lines
docker-compose logs --tail 100

# Show logs from last 10 minutes
docker-compose logs --since 10m
```

### Resource Usage
```powershell
# Monitor Docker resources
docker stats

# Check disk usage
docker system df

# Check network
docker network ls
docker network inspect nxvms_network
```

### Container Inspection
```powershell
# Inspect container
docker inspect nxvms-server

# Execute command in container
docker exec nxvms-server curl http://localhost:3000/api/v1/health

# Shell access
docker exec -it nxvms-server /bin/sh
docker exec -it nxvms-postgres psql -U nxvms -d nxvms_db
```

---

## 🔄 Troubleshooting Workflow

```
1. Is Docker running?
   ↓ No → Start Docker Desktop
   ↓ Yes → Continue
   
2. Are containers running?
   docker-compose ps
   ↓ No → docker-compose up -d
   ↓ Yes → Continue
   
3. Are health checks passing?
   curl http://localhost:3000/api/v1/health
   ↓ No → Check docker-compose logs
   ↓ Yes → Continue
   
4. Can access frontend?
   http://localhost:5173
   ↓ No → Check docker-compose logs client
   ↓ Yes → Continue
   
5. Can login?
   admin / admin123
   ↓ No → Check browser console, check API logs
   ↓ Yes → ✅ SUCCESS!
```

---

## 📝 Documentation Files

See also:
- **[DOCKER_GUIDE.md](./DOCKER_GUIDE.md)** - Complete Docker guide
- **[DEPLOYMENT_READY.md](./DEPLOYMENT_READY.md)** - Deployment status
- **[README.md](./README.md)** - Project overview
- **[.env.example](./.env.example)** - Configuration template

---

## ✅ Success Criteria

✅ All services running: `docker-compose ps` shows 3 containers with "Up" status
✅ Health check passing: `/api/v1/health` returns JSON
✅ Frontend accessible: http://localhost:5173 shows login form
✅ Can login: admin/admin123 credentials work
✅ Dashboard visible: Can see main interface after login
✅ No errors: Browser console is clean (F12)
✅ API responding: Swagger docs at http://localhost:3000/api/docs

---

## 🎯 Quick Reference

```powershell
# Start everything
docker-compose up -d

# Stop everything
docker-compose down

# View logs
docker-compose logs -f

# Check status
docker-compose ps

# Restart a service
docker-compose restart server

# Clean restart
docker-compose down -v && docker-compose up -d

# View specific logs
docker-compose logs server
docker-compose logs postgres
docker-compose logs client

# Execute command in container
docker exec nxvms-server npm test
docker exec nxvms-postgres psql -U nxvms -d nxvms_db
```

---

**Last Updated**: January 8, 2026
**Status**: Ready for testing once Docker is running
