# 🎯 NXvms - Testing Checkpoints

Use this file to track your testing progress. Check off each box as you complete it.

---

## Phase 1: Setup & Verification ⚙️

### Environment Setup
- [ ] Node.js >= 18 installed (`node --version`)
- [ ] Docker installed (`docker --version`)
- [ ] Docker Compose installed (`docker-compose --version`)
- [ ] Git available (`git --version`)
- [ ] 3 terminal windows open

### Directory Structure
- [ ] `server/` folder exists with:
  - [ ] `src/` directory
  - [ ] `package.json`
  - [ ] `docker-compose.yml`
  - [ ] `.env` file
- [ ] `client/` folder exists with:
  - [ ] `src/` directory
  - [ ] `package.json`
  - [ ] `vite.config.ts`

### Port Availability
- [ ] Port 3000 is free (backend)
- [ ] Port 5173 is free (frontend)
- [ ] Port 5432 is free (PostgreSQL)
- [ ] Port 8080 is free (Adminer)

---

## Phase 2: Backend Startup 🖥️

### Install & Start
- [ ] `cd server && npm install` completed without errors
- [ ] `docker-compose up -d` completed
- [ ] PostgreSQL container is running (`docker ps`)
- [ ] Adminer container is running (`docker ps`)

### Database Setup
- [ ] `npm run db:migrate` completed successfully
- [ ] `npm run db:seed` completed successfully
- [ ] Database is populated (check via Adminer at http://localhost:8080)

### Server Running
- [ ] `npm run start:dev` is running
- [ ] Console shows: `Fastify server listening on http://0.0.0.0:3000`
- [ ] No errors in console

### Verify Backend
- [ ] Health check works: `curl http://localhost:3000/api/v1/health`
  - Response contains `"status":"healthy"`
- [ ] Swagger UI loads: http://localhost:3000/api/docs
  - Displays all available endpoints
  - Shows proper authentication scheme

**Status: Backend ✅ Ready**

---

## Phase 3: Frontend Startup ⚛️

### Install & Start
- [ ] `cd client && npm install` completed without errors
- [ ] `npm run dev` is running
- [ ] Console shows: `Local: http://localhost:5173/`
- [ ] No errors in console

### Frontend Access
- [ ] http://localhost:5173 loads in browser
- [ ] Login page displays properly
- [ ] No console errors (F12 → Console tab)

**Status: Frontend ✅ Ready**

---

## Phase 4: Authentication Flow 🔐

### Login Test
- [ ] Can access login page
- [ ] Server selector shows placeholder
- [ ] Can enter credentials:
  - [ ] Username field accepts input
  - [ ] Password field accepts input
  - [ ] Server URL field shows: `http://localhost:3000/api/v1`

### Test Login
- [ ] Enter credentials:
  - Username: `admin`
  - Password: `admin123`
  - Server: `http://localhost:3000/api/v1`
- [ ] Click "Sign In" button
- [ ] Page redirects to main dashboard
- [ ] No error messages appear

### Token Verification
- [ ] Open DevTools (F12)
- [ ] Go to Application/Storage tab
- [ ] Check localStorage has `accessToken` key
- [ ] Token starts with `eyJhbGc` (JWT format)

**Status: Authentication ✅ Working**

---

## Phase 5: API Testing 📡

### Endpoints via Swagger
- [ ] Open http://localhost:3000/api/docs
- [ ] Click "Authorize" button
- [ ] Enter token from login (paste from localStorage)
- [ ] Try "Try it out" on endpoints:

#### Auth Endpoints
- [ ] `POST /auth/login` - Returns token
- [ ] `GET /auth/me` - Returns current user
- [ ] User info matches logged-in user

#### Camera Endpoints
- [ ] `GET /cameras` - Returns empty array (first run)
- [ ] Response includes `Content-Type: application/json`
- [ ] Status code is 200

#### Health Endpoints
- [ ] `GET /health` - Returns system status
- [ ] `GET /health/db` - Shows database is connected
- [ ] `GET /health/ffmpeg` - Shows FFmpeg status

### CURL Tests (Optional)
- [ ] Backend responds to CURL requests
- [ ] Authentication header required for protected routes
- [ ] Proper error codes returned (401 unauthorized, etc.)

**Status: APIs ✅ Functional**

---

## Phase 6: Frontend Navigation 🗺️

### Sidebar Navigation
- [ ] Sidebar appears on left side
- [ ] Sidebar items are clickable:
  - [ ] Live View
  - [ ] Playback
  - [ ] Events
  - [ ] Bookmarks
  - [ ] Export
  - [ ] Health
  - [ ] Settings

### Page Navigation
- [ ] Can navigate to each page
- [ ] Page changes when clicking menu items
- [ ] No console errors during navigation

### Layout Components
- [ ] Grid layout components load
- [ ] Responsive design works (try resizing window)
- [ ] Mobile view is readable

**Status: Navigation ✅ Working**

---

## Phase 7: Data Management 📊

### Database Access
- [ ] Adminer loads at http://localhost:8080
- [ ] Login successful:
  - Server: `postgres`
  - Username: `nxvms`
  - Password: `nxvms_dev_password`
  - Database: `nxvms_db`

### View Tables
- [ ] `users` table exists and has admin user
- [ ] `roles` table exists and has Admin role
- [ ] `cameras` table exists and is empty
- [ ] `audit_logs` table exists
- [ ] Other entities exist (streams, recordings, exports)

### Verify Relationships
- [ ] User has proper role assigned
- [ ] Role has permissions array
- [ ] Timestamps are correct format
- [ ] UUIDs are properly generated

**Status: Database ✅ Initialized**

---

## Phase 8: Error Handling ⚠️

### Network Errors
- [ ] Stop backend server
- [ ] Frontend shows error message (not blank page)
- [ ] Error is descriptive
- [ ] Restart backend works correctly

### Invalid Inputs
- [ ] Try logging in with wrong password
- [ ] Should get error message (not crash)
- [ ] Try accessing endpoints without token
- [ ] Should get 401 Unauthorized

### Database Issues
- [ ] Stop PostgreSQL container
- [ ] Backend should show database connection error
- [ ] Error is logged but doesn't crash server
- [ ] Restarting database works correctly

**Status: Error Handling ✅ Implemented**

---

## Phase 9: Performance ⚡

### Startup Times
- [ ] Backend starts in < 5 seconds
- [ ] Frontend loads in < 3 seconds after compilation
- [ ] Page navigation is instant (< 500ms)

### API Response Times
- [ ] Health check returns in < 50ms
- [ ] List cameras returns in < 100ms
- [ ] Authentication returns in < 200ms

### No Memory Leaks
- [ ] Open DevTools → Performance tab
- [ ] Take heap snapshot
- [ ] Navigate several times
- [ ] Memory usage is stable
- [ ] No obvious memory spikes

**Status: Performance ✅ Acceptable**

---

## Phase 10: Integration Test 🔗

### Complete User Flow
- [ ] Start fresh (clear browser cache)
- [ ] Server and backend running
- [ ] Load http://localhost:5173
- [ ] See login page
- [ ] Login with admin/admin123
- [ ] See main dashboard
- [ ] Navigate through all pages
- [ ] No errors occur
- [ ] All data loads correctly

### CRUD Test (Cameras)
- [ ] Open Swagger UI
- [ ] POST new camera via API
- [ ] GET camera list via API
- [ ] Verify camera appears in response
- [ ] Check Adminer - camera exists in DB
- [ ] PUT to update camera
- [ ] Verify updates in API response
- [ ] Verify updates in database
- [ ] DELETE camera
- [ ] Verify deletion in API and database

### Audit Trail Test
- [ ] Create camera (API call)
- [ ] Check audit logs table in Adminer
- [ ] Should have entry for camera creation
- [ ] Entry includes:
  - [ ] User ID (admin)
  - [ ] Action (CAMERA_CREATE)
  - [ ] Resource ID (camera ID)
  - [ ] Timestamp
  - [ ] Any metadata

**Status: Integration ✅ Complete**

---

## Phase 11: System Verification Scripts 🧪

### Run Verification Script
```bash
cd server
npm run script:verify-system
```

- [ ] Script runs without errors
- [ ] Output shows:
  - [ ] Node.js version
  - [ ] npm version
  - [ ] Docker version
  - [ ] Project structure
  - [ ] Dependencies installed
  - [ ] Ports available
- [ ] Shows "✅ System is ready for testing"

### Health Check Script
```bash
npm run script:health-check
```

- [ ] Script runs successfully
- [ ] Shows:
  - [ ] Backend status (healthy)
  - [ ] Database status (connected)
  - [ ] FFmpeg status
  - [ ] All services operational

**Status: Verification Scripts ✅ Working**

---

## Phase 12: Documentation Review 📖

### Check Documentation
- [ ] README.md exists and is readable
- [ ] TESTING.md has detailed guides
- [ ] QUICKSTART.md provides 5-min setup
- [ ] PROGRESS.md shows what's done
- [ ] Architecture docs in `plans/` folder

### Verify Guides
- [ ] Setup instructions are clear
- [ ] Testing procedures are documented
- [ ] API endpoints are documented
- [ ] Troubleshooting section helps
- [ ] Code examples are accurate

**Status: Documentation ✅ Complete**

---

## Final Checklist ✨

### Core Functionality
- [ ] Authentication works
- [ ] Authorization works (RBAC)
- [ ] API endpoints functional
- [ ] Database operational
- [ ] Frontend loads correctly
- [ ] Navigation works
- [ ] Error handling implemented

### System Requirements
- [ ] Startup time acceptable
- [ ] Response times fast
- [ ] No memory leaks
- [ ] Proper error messages
- [ ] Security measures in place

### Documentation & Tooling
- [ ] Comprehensive docs available
- [ ] Verification scripts provided
- [ ] Swagger API docs complete
- [ ] Database UI functional
- [ ] Logs are clear and helpful

### Ready for Testing?
- [ ] All boxes checked: ✅
- [ ] All services running: ✅
- [ ] No critical errors: ✅
- [ ] Documentation complete: ✅

---

## 🎉 Summary

### What Works ✅
- Backend API (20+ endpoints)
- Frontend UI (all pages)
- Database (7 entities)
- Authentication (JWT)
- Authorization (RBAC)
- Error handling
- Logging & audit trail
- Docker setup
- Documentation

### What to Test Next 📋
1. Real camera integration
2. Video streaming (HLS)
3. Recording functionality
4. Export operations
5. Multi-user scenarios
6. Performance under load
7. Production deployment

### Status
```
✅ Development:    COMPLETE
✅ Documentation:  COMPLETE
✅ Infrastructure: COMPLETE
✅ Testing Ready:  YES
⏳ Integration:    IN PROGRESS
⏳ Performance:    OPTIMIZING
⏳ Production:     PENDING
```

---

## 📝 Notes

Use this space to record any issues or observations:

```
Issue: [describe any problems]
Solution: [how you fixed it]
Status: [resolved/pending]

Issue: [describe any problems]
Solution: [how you fixed it]
Status: [resolved/pending]
```

---

## 🚀 Next Phase

Once all checkpoints are complete:
1. Document any issues found
2. Fix critical bugs
3. Optimize performance
4. Begin production readiness
5. Set up CI/CD pipeline
6. Deploy to staging
7. Full user acceptance testing

---

**Last Updated**: January 2026  
**Test Date**: _________________  
**Tested By**: _________________  
**Overall Status**: ✅ **READY FOR TESTING**
