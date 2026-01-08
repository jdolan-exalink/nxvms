# 🪟 Windows: Docker Desktop Quick Start Guide

**For**: Juan's NXvms Project  
**OS**: Windows 10/11  
**Status**: Ready to deploy

---

## 🚀 3-Minute Quick Start

### Step 1: Start Docker Desktop (30 seconds)
```
1. Press Windows key
2. Type: "Docker Desktop"
3. Click on "Docker Desktop" app
4. Wait for icon to appear in taskbar (bottom right)
```

**How to verify Docker is running:**
```powershell
docker ps
# If you see a table header, Docker is ready ✅
```

### Step 2: Start Your Project (1 minute)
```powershell
# Open PowerShell and navigate to project
cd C:\Users\juan\DEVs\NXvms

# Start everything
docker-compose up -d
```

**You should see:**
```
[+] Running 3/3
 ✓ Container nxvms-postgres  Started  1.5s
 ✓ Container nxvms-server    Started  2.3s
 ✓ Container nxvms-client    Started  1.8s
```

### Step 3: Open in Browser (30 seconds)
```
http://localhost:5173
```

**Login:**
- Username: `admin`
- Password: `admin123`

---

## 🔴 Error: Docker not responding?

**Error message:**
```
error during connect: Get "http://%2F%2F.%2Fpipe%2FdockerDesktopLinuxEngine"
El sistema no puede encontrar el archivo especificado
```

**Quick Fix:**
1. Open Task Manager (Ctrl + Shift + Esc)
2. Look for "Docker Desktop" process
3. If you don't see it → Open Docker Desktop from Start Menu
4. If you see it → Right-click → Restart
5. Wait 30-60 seconds for Docker to fully start
6. Try `docker ps` again

---

## 📦 Installation Check

**Before starting, verify you have:**

```powershell
# 1. Check Docker is installed
docker --version
# Expected: Docker version 20.x or higher

# 2. Check Docker Compose is installed
docker-compose --version
# Expected: Docker Compose version 1.x or higher

# 3. Check project files
Test-Path "C:\Users\juan\DEVs\NXvms\docker-compose.yml"
Test-Path "C:\Users\juan\DEVs\NXvms\server\Dockerfile"
Test-Path "C:\Users\juan\DEVs\NXvms\client\Dockerfile"
# All should return: True
```

---

## ✅ Verify Everything Works

**Test 1: Services Running**
```powershell
docker-compose ps
```
Expected: 3 containers with "Up" status

**Test 2: Backend Responding**
```powershell
curl http://localhost:3000/api/v1/health
```
Expected: JSON response with status

**Test 3: Database Connected**
```powershell
docker exec nxvms-postgres psql -U nxvms -d nxvms_db -c "SELECT 1"
```
Expected: Returns `1`

**Test 4: Frontend Loading**
```
Open http://localhost:5173 in your browser
```
Expected: Login page visible

**Test 5: Login Works**
- Enter username: `admin`
- Enter password: `admin123`
- Expected: Dashboard appears

---

## 🛠️ Useful Commands

```powershell
# Start services
docker-compose up -d

# Stop services (keeps data)
docker-compose stop

# Start stopped services
docker-compose start

# Completely stop and remove containers
docker-compose down

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs server
docker-compose logs postgres
docker-compose logs client

# Restart a service
docker-compose restart server

# Restart everything
docker-compose restart

# Check service status
docker-compose ps

# Full reset (deletes data!)
docker-compose down -v
docker-compose up -d
```

---

## 📊 Access Points

Once running:

| Component | URL | Port |
|-----------|-----|------|
| Frontend | http://localhost:5173 | 5173 |
| Backend API | http://localhost:3000/api/v1 | 3000 |
| Database | localhost:5432 | 5432 |
| API Docs | http://localhost:3000/api/docs | 3000 |

**Credentials:**
- Username: `admin`
- Password: `admin123`
- Database User: `nxvms`
- Database Password: `nxvms_password`

---

## 🔍 If Something Goes Wrong

### Problem: "Port already in use"
```powershell
# Find what's using port 3000
netstat -ano | findstr :3000

# Stop the process (replace PID with actual number)
taskkill /PID <PID> /F

# Or use a different port in docker-compose.yml
```

### Problem: "Cannot connect to database"
```powershell
# Wait longer for database to initialize
Start-Sleep -Seconds 30

# Check database logs
docker-compose logs postgres

# Reset database
docker-compose down -v
docker-compose up -d
Start-Sleep -Seconds 30
```

### Problem: "Backend showing errors"
```powershell
# View server logs
docker-compose logs server

# Restart server
docker-compose restart server

# Check all logs
docker-compose logs
```

### Problem: "Frontend not loading"
```powershell
# Check client logs
docker-compose logs client

# Clear browser cache (Ctrl + Shift + Delete)
# Try incognito window
# Check http://localhost:5173 in browser
```

### Problem: "Docker Desktop won't start"
1. Check Windows Task Scheduler
2. Look for "Docker Desktop" startup task
3. Restart Windows
4. Reinstall Docker Desktop if needed

---

## 📝 Environment File

Copy this and save as `.env` in project root:

```powershell
# Database
DB_HOST=nxvms-postgres
DB_PORT=5432
DB_USER=nxvms
DB_PASSWORD=nxvms_password
DB_NAME=nxvms_db

# Server
NODE_ENV=production
PORT=3000
JWT_SECRET=your-secret-key-change-this
STORAGE_PATH=/app/storage

# Frontend
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

---

## 🎯 Typical Workflow

```
1. Open Docker Desktop (wait for icon in taskbar)
2. Open PowerShell
3. cd C:\Users\juan\DEVs\NXvms
4. docker-compose up -d
5. Wait 10 seconds
6. Open http://localhost:5173
7. Login with admin/admin123
8. Done! 🎉
```

---

## 📞 Getting Help

**Check logs:**
```powershell
docker-compose logs

# Or follow in real-time
docker-compose logs -f
```

**Check specific service:**
```powershell
docker-compose logs server
docker-compose logs postgres
docker-compose logs client
```

**Full diagnostics:**
```powershell
docker-compose ps
docker stats
docker network inspect nxvms_network
docker image ls
docker system df
```

---

## ⚡ Pro Tips

1. **Keep Docker Desktop always running**: Open it on startup for faster deployments
2. **Use `docker-compose logs -f`**: See what's happening in real-time
3. **Set up keyboard shortcut**: Windows key → type "Docker Desktop" → Pin to Start
4. **VS Code integration**: Install Docker extension for better debugging
5. **Database persistence**: Data stays in `postgres_data` volume even after `docker-compose down`

---

**Version**: 1.0  
**Last Updated**: January 8, 2026  
**Status**: ✅ Ready to use
