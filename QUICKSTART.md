# ⚡ NXvms - QUICK START (5 Minutes)

## 🎯 Goal
Get the entire NXvms system running locally for testing.

---

## 📋 Requirements
- Node.js >= 18
- Docker & Docker Compose
- 3 terminal windows

---

## 🚀 Start Services (Open 3 Terminals)

### **Terminal 1: Backend Server**
```bash
cd server
docker-compose up -d
npm install
npm run db:migrate
npm run db:seed
npm run start:dev
```
✅ Backend running at: **http://localhost:3000**

### **Terminal 2: Frontend Application**
```bash
cd client
npm install
npm run dev
```
✅ Frontend running at: **http://localhost:5173**

### **Terminal 3: System Verification** (Optional)
```bash
cd server
npm run script:verify-system
```
✅ Shows what's running and ready to test

---

## 🔑 Test Credentials
```
Username: admin
Password: admin123
```

---

## 🌐 Access Points

| Service | URL |
|---------|-----|
| **Frontend** | http://localhost:5173 |
| **API Documentation** | http://localhost:3000/api/docs |
| **Database UI** | http://localhost:8080 |

---

## ✅ Quick Verification

### 1. Check Backend Health
```bash
curl http://localhost:3000/api/v1/health
```
Expected: `{"status":"healthy"}`

### 2. Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```
Expected: JWT token in response

### 3. Open Frontend
```
http://localhost:5173
```
- Enter credentials: **admin** / **admin123**
- Server URL: **http://localhost:3000/api/v1**

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Kill process on port 3000
lsof -i :3000
kill -9 <PID>

# Or reset Docker
docker-compose down
docker-compose up -d
npm run db:migrate
npm run db:seed
npm run start:dev
```

### Cannot connect to database
```bash
# Check Docker is running
docker ps

# View logs
docker-compose logs postgres

# Reset completely
docker-compose down -v
docker-compose up -d
```

### Frontend shows errors
```bash
# Clear cache
rm -rf node_modules
npm install
npm run dev
```

---

## 📚 Full Documentation

For detailed guides, see:
- **[README.md](../README.md)** - Complete project overview
- **[TESTING.md](../TESTING.md)** - Comprehensive testing guide
- **[PROGRESS.md](../PROGRESS.md)** - Development status

---

## 🎉 You're Ready!

✅ Backend is running  
✅ Frontend is running  
✅ Database is initialized  
✅ Test accounts are ready  

**Next Step**: Open http://localhost:5173 and log in! 🚀

---

## 📊 Expected Output

### Backend Console
```
[Nest] 15164   - 01/15/2026, 2:30:15 PM     LOG [NestFactory] Starting Nest application...
[Nest] 15164   - 01/15/2026, 2:30:16 PM     LOG [InstanceLoader] TypeOrmModule dependencies initialized
[Nest] 15164   - 01/15/2026, 2:30:17 PM     LOG [RoutesResolver] AppController {/api/v1}: 
[Nest] 15164   - 01/15/2026, 2:30:17 PM     LOG [NestApplication] Fastify server listening on http://0.0.0.0:3000 🚀
```

### Frontend Console
```
  VITE v4.5.0  ready in 450 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

### Verification Script
```
✅ Backend health check: OK
✅ Authentication endpoint: OK
✅ Frontend available: OK
✅ Swagger documentation: OK

System is ready for testing! 🚀
```

---

## 💡 Pro Tips

1. **Keep Swagger UI open** while testing
   - http://localhost:3000/api/docs
   - Try endpoints directly

2. **Monitor logs** in real-time
   - Terminal 1: Backend logs
   - Check database: http://localhost:8080

3. **Use cURL** for quick API tests
   - No UI complexity
   - Easy to script

4. **Clear browser cache** if login doesn't work
   - Ctrl+Shift+Delete (Windows)
   - Cmd+Shift+Delete (Mac)

---

## 🆘 Need Help?

### Service Status
```bash
# Is backend running?
curl http://localhost:3000/api/v1/health

# Is database running?
docker ps | grep postgres

# Check logs
docker-compose logs
```

### Common Issues
| Issue | Solution |
|-------|----------|
| Port 3000 in use | Kill process: `lsof -i :3000` |
| Database error | Reset: `docker-compose down -v` |
| Cannot login | Clear cookies, check credentials |
| Frontend errors | `npm install && npm run dev` |

---

**Happy Testing!** 🧪

Get more details: [README.md](../README.md) • [TESTING.md](../TESTING.md) • [PROGRESS.md](../PROGRESS.md)
