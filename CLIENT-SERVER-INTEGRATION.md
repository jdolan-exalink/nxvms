# 🔗 NXvms Client-Server Integration Testing

**Status**: Ready for End-to-End Testing  
**Last Updated**: January 2026

---

## 🎯 Goal

Test the connection between the React Frontend Client and the NestJS Backend Server to ensure all endpoints work correctly and data flows properly between them.

---

## 📋 Prerequisites

Before starting, ensure you have:

1. **Backend Running**
   ```bash
   cd server
   npm run start:dev
   ```
   Should see: `Fastify server listening on http://0.0.0.0:3000`

2. **PostgreSQL Running**
   ```bash
   docker-compose ps
   ```
   Should see both `postgres` and `adminer` containers running

3. **Database Seeded**
   ```bash
   npm run db:seed
   ```
   Should create admin user (admin/admin123)

4. **Swagger UI Accessible**
   - Open http://localhost:3000/api/docs
   - Should see all API endpoints documented

---

## 🚀 Quick Start - Run Integration Tests

### Step 1: Install Dependencies (if needed)
```bash
cd client
npm install
```

### Step 2: Run Integration Test Suite
```bash
npm run test:integration
```

This will automatically test:
- ✅ Backend health check
- ✅ Database connectivity
- ✅ User login
- ✅ Get user profile
- ✅ List cameras
- ✅ Swagger API documentation

**Expected Output**:
```
✅ Backend Health Check
✅ Database Connection
✅ User Login
✅ Get User Profile
✅ List Cameras
✅ Swagger API Documentation

🎉 All tests passed! Client-Server integration is working correctly.
```

---

## 🧪 Manual Testing Steps

If the integration tests pass, you can proceed with manual testing:

### Test 1: Start Frontend
```bash
# Terminal 1 (Frontend)
cd client
npm run dev:server
```

Should see:
```
VITE v4.5.0  ready in 450 ms
➜  Local:   http://localhost:5173/
```

### Test 2: Login with Real Backend
1. Open http://localhost:5173
2. On Login Screen, enter:
   - **Server**: `http://localhost:3000/api/v1`
   - **Username**: `admin`
   - **Password**: `admin123`
3. Click "Sign In"

**Expected Result**:
- ✅ Should redirect to dashboard
- ✅ No CORS errors in browser console
- ✅ Token should be stored in localStorage
- ✅ User profile should display correctly

### Test 3: Navigate Pages
Click through all pages:

| Page | Expected Behavior |
|------|-------------------|
| **Live View** | Grid layout loads, camera placeholders appear |
| **Playback** | Timeline component renders |
| **Events** | Events panel loads |
| **Bookmarks** | Bookmarks manager opens |
| **Export** | Export dialog accessible |
| **Health** | System metrics display |
| **Settings** | User settings show |

**Expected Result**:
- ✅ All pages load without errors
- ✅ No 404 errors
- ✅ Console is clean (no error messages)

### Test 4: API Endpoint Testing

Open http://localhost:3000/api/docs and test endpoints:

#### Authentication
```
POST /api/v1/auth/login
```
- Body: `{"username": "admin", "password": "admin123"}`
- Expected: 200 with `access_token`

#### Get Profile
```
GET /api/v1/auth/me
```
- Header: `Authorization: Bearer <token_from_login>`
- Expected: 200 with user info

#### List Cameras
```
GET /api/v1/cameras
```
- Header: `Authorization: Bearer <token_from_login>`
- Expected: 200 with empty array (no cameras yet)

#### Create Camera (Optional)
```
POST /api/v1/cameras
```
- Header: `Authorization: Bearer <token_from_login>`
- Body:
  ```json
  {
    "name": "Test Camera",
    "model": "Test",
    "manufacturer": "Test",
    "rtspUrl": "rtsp://test:test@192.168.1.1:554/stream1",
    "onvifUrl": "http://192.168.1.1:8080",
    "username": "admin",
    "password": "password"
  }
  ```
- Expected: 201 with created camera

---

## 🔍 Debugging Connection Issues

### Issue: Cannot Connect to Backend

**Symptoms**:
- CORS error in browser console
- "Network Error" message in frontend
- Cannot login

**Solutions**:
```bash
# 1. Check backend is running
curl http://localhost:3000/api/v1/health

# 2. Check CORS is configured
curl -i http://localhost:3000/api/v1/health

# 3. View backend logs
docker-compose logs -f

# 4. Restart backend
cd server && npm run start:dev
```

### Issue: Login Fails with "Invalid Credentials"

**Symptoms**:
- Login button doesn't work
- Error: "Invalid credentials"

**Solutions**:
```bash
# 1. Check admin user exists
curl http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# 2. Check database has users
docker exec -it nxvms_postgres_1 psql -U nxvms -d nxvms_db -c "SELECT * FROM users;"

# 3. Reseed database
npm run db:seed
```

### Issue: Frontend Shows Blank Page

**Symptoms**:
- No login form appears
- White/blank screen

**Solutions**:
```bash
# 1. Check console for errors
# F12 → Console tab

# 2. Clear cache and reload
# Ctrl+Shift+Delete

# 3. Rebuild frontend
npm run build:renderer
npm run dev:server
```

### Issue: Cannot See Data in Frontend

**Symptoms**:
- Login works
- Pages load but no data
- Empty lists/grids

**Solutions**:
```bash
# 1. Check API returns data
curl http://localhost:3000/api/v1/cameras \
  -H "Authorization: Bearer <your_token>"

# 2. Check database has data
docker exec -it nxvms_postgres_1 psql -U nxvms -d nxvms_db -c "SELECT * FROM cameras;"

# 3. Create test camera
npm run script:add-camera (in server directory)
```

---

## 📊 Testing Checklist

Use this to track your testing progress:

### Setup
- [ ] Backend running (`npm run start:dev`)
- [ ] PostgreSQL running (`docker ps`)
- [ ] Database seeded (`npm run db:seed`)
- [ ] Swagger accessible (http://localhost:3000/api/docs)

### Integration Tests
- [ ] Run `npm run test:integration` 
- [ ] All tests pass ✅
- [ ] No connection errors

### Manual Testing
- [ ] Frontend loads (http://localhost:5173)
- [ ] Login screen displays
- [ ] Can enter credentials
- [ ] Can click "Sign In"

### Authentication
- [ ] Successfully login with admin/admin123
- [ ] Redirected to dashboard
- [ ] No CORS errors
- [ ] Token in localStorage
- [ ] User profile displays

### Page Navigation
- [ ] Live View page loads
- [ ] Playback page loads
- [ ] Events page loads
- [ ] Bookmarks page loads
- [ ] Export page loads
- [ ] Health page loads
- [ ] Settings page loads

### API Testing (via Swagger)
- [ ] GET /health works
- [ ] POST /auth/login works
- [ ] GET /auth/me works
- [ ] GET /cameras works
- [ ] POST /cameras works (create camera)
- [ ] All endpoints return correct status codes

### Error Handling
- [ ] Invalid login shows error
- [ ] Network errors handled gracefully
- [ ] 404 errors show appropriate messages
- [ ] Token refresh works on expiration

---

## 📈 Performance Baseline

Record these numbers for reference:

| Operation | Time | Status |
|-----------|------|--------|
| Backend startup | ___ ms | ☐ |
| Frontend load | ___ ms | ☐ |
| Login request | ___ ms | ☐ |
| Get cameras | ___ ms | ☐ |
| Get user profile | ___ ms | ☐ |

**Target**: All < 500ms

---

## 🎉 Success Criteria

You have successfully completed integration testing when:

✅ Backend is running and healthy  
✅ Frontend connects and authenticates  
✅ All pages load without errors  
✅ All API endpoints respond correctly  
✅ Data flows properly from backend to frontend  
✅ CORS is properly configured  
✅ Token management works (login, refresh, logout)  
✅ Error handling works for all scenarios  
✅ No console errors or warnings  
✅ All status codes are correct (200, 201, 400, 401, 404, etc.)  

---

## 📝 Test Report Template

```
Date: ________
Tester: ________
Backend URL: http://localhost:3000/api/v1
Frontend URL: http://localhost:5173

Integration Tests:
  ☐ Backend Health: ________
  ☐ Database Connection: ________
  ☐ Login: ________
  ☐ Profile: ________
  ☐ Cameras: ________
  ☐ Swagger: ________

Manual Tests:
  ☐ Frontend Loads: ________
  ☐ Login Works: ________
  ☐ Pages Load: ________
  ☐ Navigation Works: ________

Issues Found:
  1. ________
  2. ________
  3. ________

Overall Status: ☐ PASS ☐ FAIL

Notes:
________
```

---

## 🔗 Useful Links

- **Backend**: http://localhost:3000
- **Frontend**: http://localhost:5173
- **Swagger API Docs**: http://localhost:3000/api/docs
- **Database UI**: http://localhost:8080
- **Backend Logs**: `docker-compose logs -f` (in server directory)
- **Browser DevTools**: F12

---

## 📞 Support

If you encounter issues:

1. **Check logs**: `docker-compose logs -f`
2. **Verify health**: `npm run script:verify-system` (in server)
3. **Test connectivity**: `npm run test:integration` (in client)
4. **Restart services**: 
   ```bash
   docker-compose down && docker-compose up -d
   npm run db:migrate && npm run db:seed
   npm run start:dev
   ```

---

## ✅ Next Steps

After completing integration testing:

1. ✅ Document any bugs found
2. ✅ Fix critical issues
3. ✅ Run tests again
4. ✅ Create real cameras in the system
5. ✅ Test advanced features (playback, export, etc.)
6. ✅ Performance optimization
7. ✅ Production readiness review

---

**Status**: 🟢 Ready for Integration Testing

Version 0.1.0 | January 2026
