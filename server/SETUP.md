# NXvms Server - Quick Setup Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites Check
```bash
# Verify Node.js (need 18+)
node --version

# Verify Docker (optional but recommended)
docker --version
docker-compose --version
```

---

## 📋 Option A: Docker (Recommended for Development)

### Step 1: Start Services
```bash
# From server/ directory
docker-compose up -d

# Wait ~10 seconds for PostgreSQL to be ready
sleep 10
```

### Step 2: Install Dependencies & Initialize DB
```bash
npm install
npm run db:migrate
npm run db:seed
```

### Step 3: Access the System
- **API**: http://localhost:3000
- **Swagger Docs**: http://localhost:3000/api/docs
- **Database UI**: http://localhost:8080
  - Server: postgres
  - User: nxvms
  - Password: nxvms_dev_password
  - Database: nxvms_db

### Step 4: Test Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Response: { "access_token": "eyJhbGc..." }
```

### Step 5: Add a Camera (Optional)
```bash
# Interactive ONVIF discovery
npm run script:add-camera

# Check system health
npm run script:health-check
```

---

## 📋 Option B: Local Development (Manual)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Start PostgreSQL
```bash
# Using docker-compose (postgres only)
docker-compose up postgres -d

# Wait for it to be ready
docker-compose logs postgres | grep "database system is ready"
```

### Step 3: Configure Environment
```bash
# Copy template (or edit existing .env)
cp .env.example .env

# Verify these settings in .env:
# DB_HOST=localhost
# DB_PORT=5432
# DB_USER=nxvms
# DB_PASSWORD=nxvms_dev_password
# DB_NAME=nxvms_db
```

### Step 4: Initialize Database
```bash
# Run migrations
npm run db:migrate

# Seed default roles/users
npm run db:seed
```

### Step 5: Start Server
```bash
# Development mode (watches for changes)
npm run start:dev

# Or production mode
npm run start
```

### Step 6: Verify It's Running
```bash
# In new terminal:
curl http://localhost:3000/api/v1/health

# Should return:
# {
#   "status": "healthy",
#   "uptime": "0h 0m",
#   ...
# }
```

---

## 🎯 Common Tasks

### View API Documentation
```
http://localhost:3000/api/docs
```
Interactive Swagger interface with all endpoints and request/response examples.

### Create New User
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "operator",
    "email": "operator@example.com",
    "password": "SecurePass123!"
  }'
```

### Discover Cameras on Network
```bash
npm run script:add-camera

# Select "auto" to scan for ONVIF devices
# Or enter IP manually for known cameras
```

### Check System Health
```bash
npm run script:health-check

# Shows: uptime, memory, CPU, database status, FFmpeg availability
```

### View Database with Adminer
```
http://localhost:8080
Server: postgres
Login: nxvms / nxvms_dev_password
```

### Stop All Services
```bash
# Docker only
docker-compose down

# Keep data
docker-compose down --volumes  # Clean everything
```

---

## 🐛 Troubleshooting

### Error: "connect ECONNREFUSED 127.0.0.1:5432"
```bash
# PostgreSQL not running
docker-compose up postgres -d
sleep 5
npm run db:migrate
```

### Error: "listen EADDRINUSE :::3000"
```bash
# Port 3000 already in use
PORT=3001 npm run start:dev

# Or kill the process:
lsof -i :3000
kill -9 <PID>
```

### Error: "FFmpeg not found"
```bash
# Install FFmpeg
# macOS:
brew install ffmpeg

# Ubuntu/Debian:
sudo apt-get install ffmpeg

# Or use Docker (comes with FFmpeg in image)
```

### Error: "no such file or directory, open '/mnt/nxvms/storage'"
```bash
# Create storage directory
mkdir -p /mnt/nxvms/storage/{chunks,hls,exports}

# Or change in .env:
STORAGE_PATH=./storage
```

### Migration Fails with "relation does not exist"
```bash
# Revert and regenerate migrations
npm run db:revert

# Or drop database and start fresh:
docker-compose down postgres
docker volume rm nxvms_postgres_data
docker-compose up postgres -d
npm run db:migrate
npm run db:seed
```

---

## 📊 Project Structure

```
server/
├── src/
│   ├── main.ts                    # Entry point
│   ├── app.module.ts              # Root module
│   ├── database/entities/          # Data models (7 tables)
│   ├── shared/services/            # Core services (FFmpeg, ONVIF, Audit)
│   ├── auth/                       # Authentication & RBAC
│   ├── cameras/                    # Camera CRUD
│   ├── health/                     # System monitoring
│   ├── playback/                   # Video streaming & export
│   └── scripts/                    # Operational tools
├── docker-compose.yml             # Dev environment
├── Dockerfile                     # Container image
├── package.json                   # Dependencies
├── .env.example                   # Config template
└── README.md                      # Full documentation
```

---

## 🔐 Default Credentials

| Item | Value |
|------|-------|
| **Admin Username** | admin |
| **Admin Password** | admin123 |
| **Database User** | nxvms |
| **Database Password** | nxvms_dev_password |
| **JWT Secret** | dev-secret-key-change-in-production |

⚠️ **Change these in production!**

---

## 📚 Useful Commands

```bash
# Development
npm run start:dev              # Server with auto-reload
npm run build                 # Compile TypeScript

# Database
npm run db:migrate            # Apply migrations
npm run db:revert             # Undo last migration
npm run db:seed              # Create default data

# Tools
npm run script:add-camera     # Discover & configure cameras
npm run script:health-check   # System health status

# Testing (when implemented)
npm run test                  # Unit tests
npm run test:e2e             # Integration tests
npm run test:cov             # Coverage report
```

---

## 🌐 Integration with Frontend

The client expects the server at:
```
http://localhost:3000/api/v1
```

Update [client/.env](../client/.env) if server runs on different host/port:
```env
VITE_API_BASE_URL=http://localhost:3000
```

---

## 📖 Next Steps

1. **Add Cameras**
   ```bash
   npm run script:add-camera
   ```

2. **Monitor System**
   ```bash
   npm run script:health-check
   ```

3. **Check API Docs**
   ```
   http://localhost:3000/api/docs
   ```

4. **Review Database Schema**
   ```
   http://localhost:8080
   ```

5. **Start Recording**
   Use Swagger to POST `/api/v1/cameras/{id}/recording/start`

---

## 💬 Need Help?

- **API Documentation**: http://localhost:3000/api/docs
- **Database Schema**: See [README.md](README.md#-database)
- **Environment Variables**: See [README.md](README.md#-environment-variables)
- **Deployment Guide**: See [README.md](README.md#-deployment)

---

**Status**: Production-ready scaffolding ✅
**Last Updated**: January 2024
