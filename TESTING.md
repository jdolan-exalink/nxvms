# 🧪 NXvms - TESTING GUIDE

## ⚡ Quick Start (5 minutos)

### Terminal 1: Start Backend

```bash
cd server

# Start PostgreSQL & Adminer
docker-compose up -d

# Wait ~10 seconds, then:
npm install
npm run db:migrate
npm run db:seed
npm run start:dev

# Backend running at: http://localhost:3000
```

### Terminal 2: Start Frontend

```bash
cd client
npm install
npm run dev

# Frontend running at: http://localhost:5173
```

### Terminal 3: Verify System (Optional)

```bash
cd server
npm run script:verify-system

# Shows what's running and what's ready to test
```

---

## ✅ Testing Checklist

### 1. **Backend Health**
```bash
curl http://localhost:3000/api/v1/health
```
Expected: `{"status":"healthy",...}`

### 2. **API Documentation**
```
http://localhost:3000/api/docs
```
Open in browser - Interactive Swagger UI with all endpoints

### 3. **Authentication**

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

Expected: `{"access_token":"eyJhbGc..."}`

Save the token for next tests (replace `<TOKEN>`):

### 4. **List Cameras**
```bash
curl http://localhost:3000/api/v1/cameras \
  -H "Authorization: Bearer <TOKEN>"
```

Expected: `[]` (empty array, no cameras yet)

### 5. **Create Camera**
```bash
curl -X POST http://localhost:3000/api/v1/cameras \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Camera",
    "model": "Test",
    "manufacturer": "Test",
    "rtspUrl": "rtsp://test:test@192.168.1.1:554/stream1",
    "onvifUrl": "http://192.168.1.1:8080",
    "username": "admin",
    "password": "password"
  }'
```

Expected: Camera created with ID

### 6. **Database UI**
```
http://localhost:8080
```

Login:
- Server: `postgres`
- Username: `nxvms`
- Password: `nxvms_dev_password`
- Database: `nxvms_db`

---

## 🎨 Frontend Testing

### Login
1. Open http://localhost:5173
2. Enter credentials:
   - **Username**: admin
   - **Password**: admin123
   - **Server**: http://localhost:3000/api/v1

### Navigate
- Click tabs: Live View, Playback, Events, Bookmarks, etc.
- See mock data appear

### Live View
- Select grid layout (1x1, 2x2, etc.)
- See camera placeholders
- Try fullscreen on a cell

---

## 📊 API Endpoints to Test

### Auth
```
POST   /api/v1/auth/register      Register new user
POST   /api/v1/auth/login          Login (get JWT token)
GET    /api/v1/auth/me             Get current user (requires token)
```

### Cameras
```
GET    /api/v1/cameras             List all cameras
POST   /api/v1/cameras             Create camera
GET    /api/v1/cameras/:id         Get camera details
PUT    /api/v1/cameras/:id         Update camera
DELETE /api/v1/cameras/:id         Delete camera
POST   /api/v1/cameras/:id/recording/start    Start recording
POST   /api/v1/cameras/:id/recording/stop     Stop recording
```

### Playback
```
GET    /api/v1/playback/stream/:cameraId       Get HLS stream
GET    /api/v1/playback/timeline/:cameraId     Get timeline segments
POST   /api/v1/playback/export                 Create export job
GET    /api/v1/playback/export/:exportId       Get export status
GET    /api/v1/playback/exports/:cameraId      List exports
DELETE /api/v1/playback/export/:exportId       Delete export
```

### Health
```
GET    /api/v1/health             System health
GET    /api/v1/health/db          Database health
GET    /api/v1/health/ffmpeg      FFmpeg availability
```

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check if port 3000 is in use
lsof -i :3000

# Or Docker issue:
docker-compose logs postgres
docker-compose logs adminer
```

### Cannot connect to database
```bash
# Reset database
docker-compose down postgres
docker volume rm nxvms_postgres_data
docker-compose up postgres -d
npm run db:migrate
npm run db:seed
```

### Frontend shows errors
```bash
# Clear cache and reinstall
cd client
rm -rf node_modules
npm install
npm run dev
```

### Cannot login from frontend
```bash
# Check backend is running:
curl http://localhost:3000/api/v1/health

# Check CORS is enabled:
# Should see response with correct headers
```

---

## 📝 Test Scenarios

### Scenario 1: Complete Authentication Flow
1. ✅ Register new user
2. ✅ Login with new credentials
3. ✅ Verify token in response
4. ✅ Use token to access protected endpoints
5. ✅ Logout (clear token)

### Scenario 2: Camera Management
1. ✅ List cameras (empty)
2. ✅ Create camera (manual or ONVIF discovery)
3. ✅ Get camera details
4. ✅ Update camera
5. ✅ Delete camera

### Scenario 3: Recording & Playback
1. ✅ Start recording on camera
2. ✅ Get timeline (should show segments)
3. ✅ Get HLS stream URL
4. ✅ Create export job
5. ✅ Check export status

### Scenario 4: System Health
1. ✅ Check overall health
2. ✅ Check database connectivity
3. ✅ Check FFmpeg availability

---

## 📊 Useful Commands

### Backend
```bash
npm run start:dev              # Development mode
npm run db:migrate             # Apply migrations
npm run db:seed               # Reset with default data
npm run script:health-check    # Check system health
npm run script:add-camera      # ONVIF discovery
npm run script:verify-system   # Verify setup
docker-compose logs -f         # View all logs
docker-compose down            # Stop services
```

### Frontend
```bash
npm run dev                    # Development server
npm run build                  # Production build
npm run preview               # Preview production
```

---

## 🎯 What to Look For

### Working Correctly ✅
- [ ] Backend starts without errors
- [ ] Database initializes with seed data
- [ ] Swagger docs load at /api/docs
- [ ] Login endpoint returns valid JWT
- [ ] Protected endpoints reject requests without token
- [ ] Frontend loads without CORS errors
- [ ] Can login in frontend
- [ ] Can see cameras (after creating one)
- [ ] Health check shows all services healthy
- [ ] Database has data (check Adminer)

### Common Issues 🚨
- [ ] CORS errors in browser console → Check CORS_ORIGIN in .env
- [ ] Cannot connect to database → Check PostgreSQL is running
- [ ] JWT errors → Token may be expired
- [ ] 404 endpoints → Check server is running on correct port
- [ ] Module not found → Run npm install again

---

## 💡 Tips

1. **Keep Swagger UI open** - http://localhost:3000/api/docs
   - Try out endpoints directly
   - See request/response format
   - Check authentication headers

2. **Use Adminer for database** - http://localhost:8080
   - See actual data being created
   - Verify audit logs
   - Check migrations ran correctly

3. **Monitor logs** - `docker-compose logs -f`
   - See real-time activity
   - Catch errors early
   - Verify requests being processed

4. **Test with curl** - Easiest way to verify APIs work
   - No UI complexity
   - See raw responses
   - Easy to script

---

## 🎉 Success!

When you can:
- ✅ Login on frontend
- ✅ Create cameras
- ✅ See data in database
- ✅ Get response from all endpoints
- ✅ See no errors in logs

**You're ready to start building features!** 🚀

---

## 📞 Next Steps

1. **Add Real Cameras**
   ```bash
   npm run script:add-camera
   ```

2. **Test Recording**
   - Create camera
   - Start recording via API
   - Check health

3. **Test Frontend**
   - Login
   - Navigate modules
   - Try different grid layouts

4. **Explore API**
   - Go through Swagger docs
   - Try every endpoint
   - Check error handling

---

**Happy Testing! 🧪**

---

*Last updated: January 2026*
