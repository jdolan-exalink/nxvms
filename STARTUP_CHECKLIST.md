# ✅ DOCKER STARTUP CHECKLIST

**Project**: NXvms  
**Date**: January 8, 2026  
**Goal**: Get system running in Docker in under 5 minutes

---

## ⏱️ Pre-Flight Check (2 minutes)

### System Requirements
- [ ] Windows 10 or 11 installed
- [ ] Docker Desktop available (or Docker installed)
- [ ] At least 4GB RAM available
- [ ] At least 5GB free disk space
- [ ] Internet connection (for pulling images)

### Files Verified
- [ ] Project folder exists: `C:\Users\juan\DEVs\NXvms`
- [ ] docker-compose.yml exists
- [ ] server/Dockerfile exists
- [ ] client/Dockerfile exists
- [ ] .env.example exists

**Check files:**
```powershell
cd C:\Users\juan\DEVs\NXvms
Test-Path "docker-compose.yml"
Test-Path "server/Dockerfile"
Test-Path "client/Dockerfile"
Test-Path ".env.example"
# All should return: True
```

---

## 🐳 Step 1: Start Docker (1 minute)

### ☐ Open Docker Desktop
```
1. Press Windows key
2. Type: Docker Desktop
3. Press Enter
4. Wait for Docker icon to appear in taskbar (bottom right)
```

### ☐ Verify Docker is Running
```powershell
# Open PowerShell and run:
docker ps

# Expected output: Should show column headers (CONTAINER ID, IMAGE, etc.)
# Should NOT show an error about docker daemon
```

**Status:**
- [ ] Docker Desktop is open
- [ ] Docker icon visible in taskbar
- [ ] `docker ps` command works

---

## 📋 Step 2: Prepare Configuration (1 minute)

### ☐ Copy Environment File
```powershell
cd C:\Users\juan\DEVs\NXvms
copy .env.example .env

# Verify .env was created
Test-Path ".env"
# Should return: True
```

**Status:**
- [ ] .env file exists in project root

---

## 🚀 Step 3: Start Services (1 minute)

### ☐ Start Docker Compose
```powershell
cd C:\Users\juan\DEVs\NXvms
docker-compose up -d

# Expected output:
# [+] Running 3/3
#  ✓ Container nxvms-postgres  Started  1.5s
#  ✓ Container nxvms-server    Started  2.3s
#  ✓ Container nxvms-client    Started  1.8s
```

**Status:**
- [ ] docker-compose up -d completed without errors
- [ ] No containers showed "Exited" status

### ☐ Wait for Services to Fully Start
```powershell
# Wait 15 seconds
Start-Sleep -Seconds 15

# Check all services are running
docker-compose ps

# Expected: All containers should show "Up X seconds"
```

**Status:**
- [ ] All 3 services show "Up" status
- [ ] No "Exited" containers

---

## 🌐 Step 4: Access System (30 seconds)

### ☐ Open Frontend in Browser
```
1. Open your web browser
2. Go to: http://localhost:5173
3. Should see NXvms login form
```

**Status:**
- [ ] Login page visible in browser
- [ ] No connection error (cannot reach server)

### ☐ Verify Backend is Responding
```powershell
curl http://localhost:3000/api/v1/health

# Expected: JSON response with status:ok
```

**Status:**
- [ ] curl command returns JSON (not error)
- [ ] Status shows "ok"

---

## 🔐 Step 5: Login & Test (1 minute)

### ☐ Enter Credentials
```
At login page:
Username: admin
Password: admin123
Server:   http://localhost:3000/api/v1

Click: Login
```

**Status:**
- [ ] Login button clickable
- [ ] No error messages

### ☐ Verify Dashboard Appears
```
After login, should see:
- Dashboard with camera grid
- Navigation menu
- No red error boxes
```

**Status:**
- [ ] Dashboard loaded
- [ ] Can see main interface
- [ ] No console errors (F12 → Console tab)

---

## ✅ Verification Checklist

| Check | Status | Command |
|-------|--------|---------|
| Docker running | ☐ | `docker ps` |
| Containers exist | ☐ | `docker-compose ps` |
| Database alive | ☐ | `docker exec nxvms-postgres psql -U nxvms -d nxvms_db -c "SELECT 1"` |
| Backend responding | ☐ | `curl http://localhost:3000/api/v1/health` |
| Frontend accessible | ☐ | `curl http://localhost:5173` |
| Can login | ☐ | Browser: admin/admin123 |
| Dashboard visible | ☐ | http://localhost:5173 |

---

## 🎉 Success!

If all checks passed:

```
✅ Docker Compose is running
✅ PostgreSQL database is running
✅ NestJS backend is running
✅ React frontend is running
✅ All services are connected
✅ Login works with admin/admin123
```

**You're ready to use NXvms!**

---

## 🔴 If Something Failed

### Error: "Docker not running"
```
Error: error during connect: Get "...dockerDesktopLinuxEngine"
```
**Solution**: Open Docker Desktop, wait 60 seconds, try again.

### Error: "Port already in use"
```
Error: bind: address already in use
```
**Solution**: See [DOCKER_DEBUG_GUIDE.md](./DOCKER_DEBUG_GUIDE.md) - Issue 4

### Error: "Cannot connect to database"
```
Error: ECONNREFUSED 127.0.0.1:5432
```
**Solution**: Wait 30 seconds for DB to start, then restart server:
```powershell
docker-compose restart server
```

### Error: "Login fails"
```
Wrong credentials or connection error
```
**Solution**: 
1. Check browser console (F12)
2. Check logs: `docker-compose logs server`
3. Verify backend: `curl http://localhost:3000/api/v1/health`

### Error: "Frontend won't load"
```
Cannot reach http://localhost:5173
```
**Solution**: Check client logs:
```powershell
docker-compose logs client
```

---

## 📚 Need Help?

| Issue | Guide |
|-------|-------|
| General problems | [DOCKER_TESTING_REPORT.md](./DOCKER_TESTING_REPORT.md) |
| Detailed troubleshooting | [DOCKER_DEBUG_GUIDE.md](./DOCKER_DEBUG_GUIDE.md) |
| Windows specific | [WINDOWS_QUICK_START.md](./WINDOWS_QUICK_START.md) |
| Full reference | [DOCKER_GUIDE.md](./DOCKER_GUIDE.md) |
| Overview | [DOCKER_DEPLOYMENT_SUMMARY.md](./DOCKER_DEPLOYMENT_SUMMARY.md) |

---

## 🛠️ Useful Commands

```powershell
# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Restart services
docker-compose restart

# Stop services
docker-compose stop

# Start services again
docker-compose start

# Full restart
docker-compose down
docker-compose up -d
```

---

## 🎯 Access Points

```
Frontend:  http://localhost:5173
Backend:   http://localhost:3000/api/v1
Database:  localhost:5432
Docs:      http://localhost:3000/api/docs
```

---

## ⏱️ Total Time

| Step | Time |
|------|------|
| Pre-flight check | 2 min |
| Start Docker | 1 min |
| Prepare config | 1 min |
| Start services | 1 min |
| Access system | 30 sec |
| Login & test | 1 min |
| **TOTAL** | **~6 min** |

---

## 🔄 Daily Workflow

```powershell
# Morning: Start system
docker-compose up -d

# During work: Check status if needed
docker-compose ps

# Monitor logs if needed
docker-compose logs -f

# Evening: Stop (optional, you can leave running)
docker-compose stop

# Next morning: Start again
docker-compose start
```

---

## 📝 Notes

- Docker must be running before docker-compose commands
- Database takes ~10-15 seconds to initialize
- First backend startup may take ~10 seconds
- Frontend loads in ~5 seconds
- Login should work immediately after dashboard loads

---

**Printed**: January 8, 2026  
**Version**: 1.0  
**Status**: Ready to Deploy
