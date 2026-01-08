# 🐛 Docker Compose Debugging & Troubleshooting Guide

**Project**: NXvms  
**Last Updated**: January 8, 2026  
**Purpose**: Comprehensive guide for debugging Docker Compose issues

---

## 🎯 Diagnosis Flowchart

```
START: Docker Compose not working?
│
├─ Is Docker Desktop running?
│  ├─ NO → Open Docker Desktop, wait 60s → Test again
│  └─ YES → Continue
│
├─ Can you run `docker ps`?
│  ├─ Error: Docker daemon → Restart Docker Desktop
│  └─ Success → Continue
│
├─ Can you run `docker-compose version`?
│  ├─ Error → Reinstall Docker Compose
│  └─ Success → Continue
│
├─ Run `docker-compose up -d`
│  ├─ Build fails → Check BUILD ERRORS section
│  ├─ Services fail to start → Check SERVICE STARTUP section
│  └─ All start OK → Continue
│
├─ Run `docker-compose ps`
│  ├─ Any "Exited" → Check CONTAINER EXITED section
│  ├─ All "Up" → Continue
│  └─ Can't run → Docker daemon issue
│
├─ Can access http://localhost:5173?
│  ├─ Connection refused → Check PORT ISSUES section
│  ├─ 502 Bad Gateway → Check NETWORK section
│  ├─ Page loads but blank → Check FRONTEND section
│  └─ Login page visible → Continue
│
├─ Can access http://localhost:3000/api/v1/health?
│  ├─ Connection refused → Check PORT ISSUES section
│  ├─ 502 Bad Gateway → Check BACKEND section
│  └─ JSON response → Continue
│
└─ LOGIN TEST
   ├─ admin/admin123 succeeds → ✅ SYSTEM WORKS
   ├─ Connection errors → Check API ERRORS section
   └─ Login fails → Check AUTH section
```

---

## 🔴 Issue 1: Docker Daemon Not Running

### Symptom:
```
error during connect: Get "http://%2F%2F.%2Fpipe%2FdockerDesktopLinuxEngine/v1.51/...":
open //./pipe/dockerDesktopLinuxEngine: El sistema no puede encontrar el archivo especificado.
```

### Root Cause:
Docker Desktop application is not running or Docker daemon is not active.

### Solution A: Start Docker Desktop (Easiest)
```powershell
# Method 1: Start from Start Menu
1. Press Windows key
2. Type "Docker Desktop"
3. Click to open
4. Wait 30-60 seconds

# Verify it's running
docker ps
```

### Solution B: Start Docker Service
```powershell
# Open PowerShell as Administrator
# Run:
Start-Service -Name "Docker"
Start-Sleep -Seconds 30

# Verify
docker ps
```

### Solution C: Task Manager Restart
```powershell
# If Docker Desktop is running but not responding:
1. Press Ctrl + Shift + Esc (Task Manager)
2. Find "Docker Desktop" or "Docker" process
3. Right-click → End Task
4. Wait 10 seconds
5. Start Docker Desktop again
6. Wait 60 seconds
```

### Verification:
```powershell
# Should return version, not error
docker --version

# Should return table header, not error
docker ps

# Should return version, not error
docker-compose version
```

---

## 🔴 Issue 2: Build Failures

### Symptom:
```
docker-compose up -d
ERROR: failed to execute build command
Build failed: step 1/N ...
```

### Step 1: Check Docker Build Logs
```powershell
# Remove -d flag to see logs
docker-compose up

# Or check logs after build fails
docker-compose logs
docker-compose logs server
docker-compose logs client
```

### Step 2: Common Build Issues

#### A. Dockerfile not found
```
ERROR: dockerfile not found
```
**Fix:**
```powershell
# Check files exist
Test-Path "C:\Users\juan\DEVs\NXvms\server\Dockerfile"
Test-Path "C:\Users\juan\DEVs\NXvms\client\Dockerfile"

# Both should return True
# If False, copy them from backup or recreate
```

#### B. Base image not found
```
ERROR: failed to resolve image: node:18-alpine
```
**Fix:**
```powershell
# Check internet connection
ping google.com

# Docker should auto-pull images
# Try again with verbose output
docker-compose --verbose up -d

# Or manually pull base images
docker pull node:18-alpine
docker pull postgres:15-alpine
docker pull nginx:latest
```

#### C. npm install fails
```
ERROR: failed to run npm install
```
**Fix:**
```powershell
# Check package.json exists
Test-Path "C:\Users\juan\DEVs\NXvms\server\package.json"
Test-Path "C:\Users\juan\DEVs\NXvms\client\package.json"

# Check Dockerfile npm commands
cat C:\Users\juan\DEVs\NXvms\server\Dockerfile | findstr npm

# Try building just server to see specific error
docker build -t nxvms-server:test C:\Users\juan\DEVs\NXvms\server
```

#### D. TypeScript compilation fails
```
ERROR: failed during build
npm ERR! npm ERR! code ELIFECYCLE
```
**Fix:**
```powershell
# Check if there are TypeScript errors
# View build logs
docker-compose logs server

# If errors about imports or types:
# Run local TypeScript check
cd C:\Users\juan\DEVs\NXvms\server
npx tsc --noEmit

# Fix any errors shown
# Then retry docker build
docker-compose up -d
```

---

## 🔴 Issue 3: Container Exited/Crashed

### Symptom:
```powershell
docker-compose ps
# Shows: "Exited (1)" or "Exited (137)"
```

### Diagnosis:
```powershell
# Check which service exited
docker-compose ps

# View exit logs
docker-compose logs nxvms-postgres
docker-compose logs nxvms-server
docker-compose logs nxvms-client

# Check detailed error
docker logs nxvms-server
docker logs nxvms-postgres
docker logs nxvms-client
```

### Solution by Service:

#### PostgreSQL Exited
```powershell
# Check logs
docker-compose logs postgres

# Common issue: Port 5432 already in use
netstat -ano | findstr :5432

# If port in use, stop the process
taskkill /PID <PID> /F

# Or change port in docker-compose.yml
# Change "5432:5432" to "5433:5432"

# Restart
docker-compose down
docker-compose up -d
```

#### Server (NestJS) Exited
```powershell
# Check logs
docker-compose logs server

# Common issues:
# 1. Database not ready
Start-Sleep -Seconds 30
docker-compose restart server

# 2. Port 3000 already in use
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# 3. Environment variables missing
# Ensure .env file exists in project root
Test-Path "C:\Users\juan\DEVs\NXvms\.env"
```

#### Client (Nginx) Exited
```powershell
# Check logs
docker-compose logs client

# Common issues:
# 1. Port 5173 already in use
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# 2. Nginx config error
# Check docker-compose.yml client section
# Ensure proper volume mounts
```

---

## 🔴 Issue 4: Port Already in Use

### Symptom:
```
ERROR: for nxvms-server  Cannot start service server: bind: address already in use
ERROR: Encountered errors starting the containers.
```

### Diagnosis:
```powershell
# Find what's using the port
netstat -ano | findstr :3000     # Server port
netstat -ano | findstr :5173     # Client port
netstat -ano | findstr :5432     # Database port

# Shows: TCP    0.0.0.0:3000    LISTENING    12345
#        ↑                             ↑
#        port                         PID
```

### Solution A: Kill the Process
```powershell
# Replace <PID> with actual PID from above
taskkill /PID <PID> /F

# Restart docker-compose
docker-compose down
docker-compose up -d
```

### Solution B: Change Port in docker-compose.yml
```yaml
# BEFORE:
services:
  server:
    ports:
      - "3000:3000"

# AFTER (use different host port):
services:
  server:
    ports:
      - "3001:3000"  # Access at localhost:3001 instead
```

### Solution C: Find and Close Application Using Port
```powershell
# Find PID
$pid = (netstat -ano | findstr :3000 | Select-String -Pattern '\s+(\d+)$' -List).Line -split '\s+' | tail -1

# Identify process
tasklist | findstr $pid

# If it's a development server or other app, close it normally first
# Then restart docker-compose
```

---

## 🔴 Issue 5: Cannot Connect to Database

### Symptom:
```
PostgreSQL error: could not translate host name "nxvms-postgres" to address
Error: connect ECONNREFUSED 127.0.0.1:5432
```

### Diagnosis:
```powershell
# Check if database is running
docker-compose ps postgres

# Check database logs
docker-compose logs postgres

# Test connection
docker exec nxvms-postgres psql -U nxvms -d nxvms_db -c "SELECT 1"
```

### Solutions:

#### Database Not Started
```powershell
# Start database
docker-compose up -d postgres

# Wait for it to initialize
Start-Sleep -Seconds 20

# Verify it's running
docker-compose ps postgres

# Check logs
docker-compose logs postgres
```

#### Database Taking Too Long to Initialize
```powershell
# PostgreSQL can take 30+ seconds to initialize
# Try waiting longer
Start-Sleep -Seconds 45

# Then start other services
docker-compose up -d server client
```

#### Wrong Connection String
```powershell
# Check environment variables
# In .env file:
DB_HOST=nxvms-postgres    # NOT localhost or 127.0.0.1
DB_PORT=5432
DB_USER=nxvms
DB_PASSWORD=nxvms_password
DB_NAME=nxvms_db

# Verify .env exists
Test-Path "C:\Users\juan\DEVs\NXvms\.env"

# If missing, create it:
copy .env.example .env

# Then restart services
docker-compose restart server
```

#### Database Connection from Backend Failing
```powershell
# Execute database command directly to verify it works
docker exec nxvms-postgres psql -U nxvms -d nxvms_db -c "SELECT 1"

# Check server logs for specific error
docker-compose logs server

# Check if server environment variables are loaded
docker exec nxvms-server env | grep DB_

# Restart server with fresh environment
docker-compose restart server
Start-Sleep -Seconds 10
docker-compose logs server
```

---

## 🔴 Issue 6: Cannot Access Frontend

### Symptom:
```
http://localhost:5173
Connection refused or Connection timed out
```

### Diagnosis:
```powershell
# Check if client container is running
docker-compose ps client

# Check client logs
docker-compose logs client

# Test port is open
netstat -ano | findstr :5173

# Test from Docker
docker exec nxvms-client curl http://localhost:5173
```

### Solutions:

#### Container Not Running
```powershell
# Start client
docker-compose up -d client

# Wait for startup
Start-Sleep -Seconds 10

# Verify running
docker-compose ps client

# Check logs
docker-compose logs client
```

#### Port Blocked
```powershell
# Check what's using port 5173
netstat -ano | findstr :5173

# Kill the process
taskkill /PID <PID> /F

# Restart
docker-compose restart client
```

#### Nginx Configuration Issue
```powershell
# Check client logs
docker-compose logs client

# Look for "nginx" errors
# Check docker-compose.yml client section
# Ensure volumes are mounted correctly

# Test nginx inside container
docker exec nxvms-client nginx -t

# View nginx config
docker exec nxvms-client cat /etc/nginx/conf.d/default.conf
```

#### Try Different Browser
```powershell
# Try in incognito/private mode
# Try different browser (Chrome, Firefox, Edge)
# Clear browser cache (Ctrl + Shift + Delete)

# Try from command line
curl http://localhost:5173

# Check HTTP response
curl -v http://localhost:5173
```

---

## 🔴 Issue 7: Cannot Access Backend API

### Symptom:
```
http://localhost:3000/api/v1/health
Connection refused or Connection timed out
```

### Diagnosis:
```powershell
# Check if server is running
docker-compose ps server

# Check server logs
docker-compose logs server

# Test port
netstat -ano | findstr :3000

# Test from Docker
docker exec nxvms-server curl http://localhost:3000/api/v1/health
```

### Solutions:

#### Container Not Running
```powershell
# Start server
docker-compose up -d server

# Wait for startup (can take 10+ seconds)
Start-Sleep -Seconds 15

# Verify
docker-compose ps server

# Check logs
docker-compose logs server
```

#### Server Startup Issues
```powershell
# Check detailed logs
docker-compose logs server

# Look for errors like:
# - "Cannot find module"
# - "Database connection failed"
# - "Port already in use"

# Restart with clean environment
docker-compose down server
docker-compose up -d server
Start-Sleep -Seconds 15
docker-compose logs server
```

#### Port Conflict
```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill it
taskkill /PID <PID> /F

# Restart server
docker-compose restart server
```

#### Database Connection Issue
```powershell
# Verify database is running
docker-compose ps postgres

# Wait for database to be ready
Start-Sleep -Seconds 30

# Restart server
docker-compose restart server
Start-Sleep -Seconds 10

# Check server logs
docker-compose logs server
```

#### Test Health Check
```powershell
# From host
curl http://localhost:3000/api/v1/health

# From inside container
docker exec nxvms-server curl http://localhost:3000/api/v1/health

# From client container
docker exec nxvms-client curl http://nxvms-server:3000/api/v1/health
```

---

## 🔴 Issue 8: Frontend Cannot Connect to Backend

### Symptom:
```
Frontend loads at http://localhost:5173
But cannot access API at http://localhost:3000
Browser console shows CORS or network errors
```

### Diagnosis:
```powershell
# Check if backend is accessible
curl http://localhost:3000/api/v1/health

# Check browser console for specific error
# Open http://localhost:5173 in browser
# Press F12 (Developer Tools)
# Look for error messages in Console tab

# Check if CORS is configured
docker exec nxvms-server curl http://localhost:3000/api/v1/health
```

### Solutions:

#### Backend Not Running
```powershell
# Ensure backend is started
docker-compose up -d server

# Wait for startup
Start-Sleep -Seconds 15

# Test backend directly
curl http://localhost:3000/api/v1/health
```

#### CORS Configuration
```powershell
# Check server logs for CORS errors
docker-compose logs server

# Verify CORS is enabled in main.ts
# Check for: app.enableCors()

# Check .env for CORS settings
Test-Path "C:\Users\juan\DEVs\NXvms\.env"
Get-Content ".env" | findstr CORS
```

#### Frontend API URL Configuration
```powershell
# Check .env for frontend
Test-Path "C:\Users\juan\DEVs\NXvms\.env"
Get-Content ".env" | findstr VITE_API

# Expected: VITE_API_BASE_URL=http://localhost:3000/api/v1

# Check if frontend was built with correct URL
# Might need to rebuild client
docker-compose down client
docker-compose up -d client
Start-Sleep -Seconds 15
```

#### Browser Cache Issue
```powershell
# Clear browser cache
# Ctrl + Shift + Delete in browser

# Try incognito/private mode
# Try different browser
```

---

## 🟡 Issue 9: Performance/Memory Issues

### Symptom:
```
Containers running but very slow
Services timing out
Computer getting slow
```

### Diagnosis:
```powershell
# Check resource usage
docker stats

# Check available memory
Get-ComputerInfo | Select-Object CsPhysicalMemory, TotalPhysicalMemory

# Check Docker disk usage
docker system df

# Check running containers
docker ps
```

### Solutions:

#### Limit Docker Resources
```
Edit Docker Desktop settings:
1. Open Docker Desktop
2. Settings → Resources
3. Set CPUs and Memory limits appropriately
4. Restart Docker
```

#### Clean Up Docker
```powershell
# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Remove unused networks
docker network prune

# Full cleanup (requires containers stopped)
docker system prune -a
```

#### Increase System Resources
```
If Docker has insufficient resources:
1. Close other applications
2. Increase Docker's memory allocation
3. Increase virtual memory in Windows
```

---

## 🟡 Issue 10: Database Data Lost

### Symptom:
```
Data was there, then disappeared
docker-compose down -v removed everything
```

### Prevention:
```powershell
# Never use -v flag unless you want to delete data
docker-compose down      # Keeps data

# Not this:
docker-compose down -v   # DELETES data volume!
```

### Recovery:

#### If Volume Still Exists
```powershell
# List volumes
docker volume ls

# Find postgres volume
docker volume ls | findstr postgres

# Inspect volume
docker volume inspect nxvms_postgres_data

# If volume exists, you can restart and recover data
docker-compose up -d postgres
```

#### If Volume Deleted
```powershell
# Data is permanently lost
# Only option is to restore from backup or reinitialize
# Setup database again from scratch
docker-compose down
docker-compose up -d
```

---

## ✅ Health Checks

### Complete System Test
```powershell
Write-Host "=== DOCKER HEALTH CHECK ===" -ForegroundColor Green

Write-Host "`n1. Docker is running?"
docker ps | Out-Null
if ($?) { Write-Host "✅ Docker OK" } else { Write-Host "❌ Docker FAILED" }

Write-Host "`n2. Services running?"
docker-compose ps

Write-Host "`n3. Database healthy?"
docker exec nxvms-postgres psql -U nxvms -d nxvms_db -c "SELECT 1" | Out-Null
if ($?) { Write-Host "✅ Database OK" } else { Write-Host "❌ Database FAILED" }

Write-Host "`n4. Backend healthy?"
$response = curl -s http://localhost:3000/api/v1/health | ConvertFrom-Json
if ($response.status -eq "ok") { Write-Host "✅ Backend OK" } else { Write-Host "❌ Backend FAILED" }

Write-Host "`n5. Frontend healthy?"
curl -s http://localhost:5173 | Out-Null
if ($?) { Write-Host "✅ Frontend OK" } else { Write-Host "❌ Frontend FAILED" }

Write-Host "`n=== HEALTH CHECK COMPLETE ===" -ForegroundColor Green
```

### Save as Script
```powershell
# Save as: health-check.ps1
# Run: .\health-check.ps1
```

---

## 📋 Logging Commands Reference

```powershell
# View all logs
docker-compose logs

# Follow all logs (real-time)
docker-compose logs -f

# View specific service logs
docker-compose logs server
docker-compose logs postgres
docker-compose logs client

# Follow specific service
docker-compose logs -f server

# Last 50 lines
docker-compose logs --tail 50

# Since specific time
docker-compose logs --since 10m     # Last 10 minutes
docker-compose logs --since 1h      # Last hour

# Until specific time
docker-compose logs --until 5m      # Until 5 minutes ago

# Combine options
docker-compose logs -f --tail 100 --since 5m server
```

---

## 🚨 Nuclear Option (Last Resort)

### Complete Reset
```powershell
Write-Host "WARNING: This deletes all Docker data for this project!" -ForegroundColor Red
Write-Host "Waiting 5 seconds..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Stop and remove everything
docker-compose down -v

# Clean up images
docker image rm nxvms-server nxvms-client -f

# Remove dangling images
docker image prune -f -a

# Clean all Docker
docker system prune -f -a

Write-Host "All Docker data removed. Ready for fresh start." -ForegroundColor Green

# Start fresh
docker-compose up -d
Start-Sleep -Seconds 30
docker-compose ps
```

### Important
```
⚠️  This will DELETE:
- All containers
- All volumes (including database data)
- All custom images
- All unused networks

Only do this if you:
1. Have backed up your data
2. Want to completely start fresh
3. Are debugging a corrupted Docker state
```

---

## 📞 Support Information

### Collect Debug Info
```powershell
# Create debug report
$report = @"
=== SYSTEM INFO ===
OS: $(Get-ComputerInfo -Property OsName).OsName
PowerShell: $($PSVersionTable.PSVersion)
Docker: $(docker --version)
Docker Compose: $(docker-compose --version)

=== DOCKER STATUS ===
$(docker ps)

=== SERVICE STATUS ===
$(docker-compose ps)

=== DOCKER STATS ===
$(docker stats --no-stream)

=== LOGS (LAST 50 LINES) ===
$(docker-compose logs --tail 50)
"@

# Save to file
$report | Out-File "debug-report.txt"
Write-Host "Debug report saved to debug-report.txt"
```

### Share Logs
```powershell
# Save specific logs
docker-compose logs server > server-logs.txt
docker-compose logs postgres > postgres-logs.txt
docker-compose logs client > client-logs.txt

# Share these files when reporting issues
```

---

**Version**: 1.0  
**Last Updated**: January 8, 2026  
**Maintained By**: Docker Setup Script
