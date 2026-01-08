# NXvms - Advanced Desktop Video Management System

A professional-grade desktop application for video management, surveillance, playback, and analytics built with Electron, React, and TypeScript.

## Features

### 🎥 Live View
- **Multi-Protocol Support** - WebRTC, HLS, DASH, RTSP streams
- **PTZ Controls** - Pan, Tilt, Zoom with directional buttons and presets
- **Digital Zoom** - Software zoom up to 4x magnification
- **Snapshot** - Capture and auto-download frame snapshots
- **Grid Layouts** - 1x1, 2x2, 3x3, 4x4 camera grid display
- **Real-time Status** - Online/offline/recording indicators

### ⏱️ Playback & Timeline
- **Frame-Perfect Navigation** - Step frame-by-frame or jump frames
- **Speed Control** - 0.25x to 2x playback speed
- **Timeline Scrubbing** - Drag to seek with segment visualization
- **Segment Support** - Recording segments with duration display
- **Progressive Seeking** - Smooth seeking with server optimization

### 📊 Events & Bookmarks
- **Smart Search** - Advanced filtering with multiple criteria
- **Event Filters** - Filter by type, severity, camera, date range
- **Bookmarks System** - Create and manage bookmarks with timestamps
- **Tags Manager** - Auto-complete tag management with autocomplete
- **Rich Notes** - Notes editor with auto-save and character limit

### 📤 Export & Storage
- **Multi-Job Tracking** - Monitor multiple export jobs simultaneously
- **Progress Visualization** - Real-time speed and ETA calculations
- **Pause/Resume** - Control export jobs at any time
- **Watermark Support** - Customizable watermarks on exports
- **Format Selection** - MP4, MKV, AVI format options

### 🏥 Health Monitoring
- **System Alerts** - Critical, warning, and info level alerts
- **Storage Status** - Real-time storage capacity and usage
- **Camera Health** - Individual camera status and metrics
- **Alert Management** - Acknowledge, resolve, and dismiss alerts
- **System Overview** - CPU, memory, network statistics

### 🔔 Notifications
- **Toast Notifications** - Real-time event notifications
- **Notification Center** - Hub for all system notifications
- **Category Filtering** - Alerts, system, events, maintenance
- **Unread Badges** - Visual indicators for new notifications
- **Desktop Integration** - OS-level notification support (ready)

### 👥 Permissions & Users
- **User Management** - Complete CRUD for user accounts
- **Role Management** - Create and assign roles with permissions
- **Permission Categories** - Camera, Playback, Events, System
- **Access Control** - Fine-grained RBAC system
- **Status Tracking** - Active, inactive, suspended states
- 👥 **Authorization** - Role-Based Access Control (RBAC)
- 📹 **Camera Management** - CRUD operations with ONVIF support
- 🎬 **Video Streaming** - HLS stream generation and delivery
- 📊 **Health Monitoring** - Database, FFmpeg, and system health checks
- 📝 **Audit Logging** - Full audit trail for all operations
- 🐳 **Docker Ready** - Containerized with PostgreSQL

### Database (PostgreSQL)
- 7 Normalized Entities with proper relationships
- User & Role management
- Camera and Stream configuration
- Recording segments with motion detection
- Video export tracking
- Complete audit trail

## 🚀 Quick Start

### Prerequisites
- **Node.js** >= 18.0.0
- **Docker** & **Docker Compose**
- **npm** >= 9.0.0

### Installation & Running

#### Terminal 1: Start Backend Services
```bash
cd server

# Start PostgreSQL and Adminer
docker-compose up -d

# Wait a few seconds for database to initialize, then:
npm install
npm run db:migrate
npm run db:seed
npm run start:dev
```

Backend will be running at: **http://localhost:3000**

#### Terminal 2: Start Frontend
```bash
cd client
npm install
npm run dev
```

Frontend will be running at: **http://localhost:5173**

#### Terminal 3: Verify System (Optional)
```bash
cd server
npm run script:verify-system
```

## 📝 Test Credentials

```
Username: admin
Password: admin123
Server URL: http://localhost:3000/api/v1
```

## 🔗 Useful URLs

| Service | URL | Purpose |
|---------|-----|---------|
| **Frontend** | http://localhost:5173 | Main application |
| **API Docs** | http://localhost:3000/api/docs | Interactive Swagger UI |
| **Database UI** | http://localhost:8080 | Adminer (SQL browser) |
| **Backend** | http://localhost:3000 | API server |

## 📚 Documentation

- **[TESTING.md](./TESTING.md)** - Comprehensive testing guide
- **[plans/01-architecture-overview.md](./plans/01-architecture-overview.md)** - System architecture
- **[plans/02-api-contract.md](./plans/02-api-contract.md)** - API specifications
- **[plans/03-acceptance-checklist.md](./plans/03-acceptance-checklist.md)** - Feature checklist

## 🧪 Testing

### Run Pre-Testing Verification
```bash
cd server
npm run script:pre-testing
```

### Quick API Test
```bash
# Check backend health
curl http://localhost:3000/api/v1/health

# Login and get token
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# List cameras (using token from login)
curl http://localhost:3000/api/v1/cameras \
  -H "Authorization: Bearer <YOUR_TOKEN>"
```

## 📊 Available Scripts

### Backend
```bash
npm run start:dev           # Start in development mode with hot reload
npm run build              # Build for production
npm run test               # Run unit tests
npm run db:migrate         # Run database migrations
npm run db:seed           # Seed database with default data
npm run db:revert         # Revert last migration
npm run script:verify-system    # Verify all services are running
npm run script:health-check     # Check system health
npm run script:add-camera       # Add new camera via ONVIF
npm run script:pre-testing      # Pre-testing verification
```

### Frontend
```bash
npm run dev                # Start development server
npm run build              # Build for production
npm run preview            # Preview production build
npm run lint               # Run ESLint
```

## 🏗️ Project Structure

```
NXvms/
├── client/                 # React frontend
│   ├── src/
│   │   ├── auth/          # Login & server selection
│   │   ├── layout/        # Main layout components
│   │   ├── live-view/     # Camera grid view
│   │   ├── playback/      # Video playback
│   │   ├── resources/     # Resource tree
│   │   ├── events/        # Event monitoring
│   │   ├── bookmarks/     # Bookmark management
│   │   ├── export/        # Export interface
│   │   ├── health/        # Health dashboard
│   │   ├── settings/      # Settings page
│   │   └── shared/        # Shared utilities
│   └── package.json
│
├── server/                 # NestJS backend
│   ├── src/
│   │   ├── auth/          # Authentication module
│   │   ├── cameras/       # Camera management
│   │   ├── playback/      # Playback service
│   │   ├── health/        # Health monitoring
│   │   ├── database/      # Entities & migrations
│   │   ├── services/      # Core services
│   │   └── scripts/       # Utility scripts
│   ├── docker-compose.yml # PostgreSQL + services
│   └── package.json
│
├── plans/                  # Documentation
│   ├── 01-architecture-overview.md
│   ├── 02-api-contract.md
│   └── 03-acceptance-checklist.md
│
├── TESTING.md             # Testing guide
├── startup.sh             # Startup script
└── README.md              # This file
```

## 🗄️ Database Schema

### Entities
- **UserEntity** - User accounts and authentication
- **RoleEntity** - Roles with permission arrays
- **CameraEntity** - IP camera configuration
- **StreamEntity** - Multiple stream profiles (RTSP, HLS, WebRTC, DASH)
- **RecordingSegmentEntity** - Video chunks with timeline
- **AuditLogEntity** - Complete audit trail
- **VideoExportEntity** - Export job tracking

### Key Relationships
- User → multiple Roles (RBAC)
- Camera → multiple Streams
- Stream → multiple RecordingSegments
- All operations → AuditLog entries
- Export operations → tracked in VideoExportEntity

## 🔐 Authentication Flow

1. User submits credentials to `/api/v1/auth/login`
2. Backend validates and returns JWT token
3. Frontend stores token in localStorage
4. All subsequent requests include token in `Authorization: Bearer <token>` header
5. Backend validates token and extracts user info
6. Permissions checked based on user's role

## 📡 API Endpoints

### Authentication
```
POST   /api/v1/auth/register         Register new user
POST   /api/v1/auth/login            Login (returns JWT)
GET    /api/v1/auth/me               Get current user
```

### Cameras
```
GET    /api/v1/cameras               List all cameras
POST   /api/v1/cameras               Create camera
GET    /api/v1/cameras/:id           Get camera
PUT    /api/v1/cameras/:id           Update camera
DELETE /api/v1/cameras/:id           Delete camera
POST   /api/v1/cameras/:id/recording/start    Start recording
POST   /api/v1/cameras/:id/recording/stop     Stop recording
```

### Playback
```
GET    /api/v1/playback/stream/:cameraId         Get HLS stream
GET    /api/v1/playback/timeline/:cameraId       Get timeline
POST   /api/v1/playback/export                   Create export
GET    /api/v1/playback/export/:exportId         Get export status
GET    /api/v1/playback/exports/:cameraId        List exports
DELETE /api/v1/playback/export/:exportId         Delete export
```

### Health
```
GET    /api/v1/health                System health
GET    /api/v1/health/db             Database health
GET    /api/v1/health/ffmpeg         FFmpeg availability
```

## 🐳 Docker Setup

The system includes a complete Docker setup with:
- **PostgreSQL** - Main database
- **Adminer** - Database management UI
- **NestJS Server** - API backend
- **Node volumes** - Hot reload support

### Docker Commands
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Reset database
docker-compose down
docker volume rm nxvms_postgres_data
docker-compose up -d
```

## ⚙️ Configuration

### Environment Variables (.env)

**Backend** (`server/.env`):
```env
# Database
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_NAME=nxvms_db
DATABASE_USER=nxvms
DATABASE_PASSWORD=nxvms_dev_password

# JWT
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRATION=7d

# API
API_PORT=3000
API_PREFIX=/api/v1

# Storage
STORAGE_PATH=/data/recordings

# FFmpeg
FFMPEG_PATH=/usr/bin/ffmpeg

# CORS
CORS_ORIGIN=http://localhost:5173
```

**Frontend** (`client/.env`):
```env
VITE_API_URL=http://localhost:3000/api/v1
```

## 🔄 Development Workflow

1. **Make changes** to code
2. **Backend hot reload** - `npm run start:dev` watches for changes
3. **Frontend hot reload** - `npm run dev` uses Vite
4. **Test changes** via frontend or API docs
5. **Check logs** - `docker-compose logs -f`
6. **Verify database** - http://localhost:8080

## 🧪 Troubleshooting

### Backend won't start
```bash
# Check if port 3000 is in use
lsof -i :3000

# Check Docker status
docker-compose ps
docker-compose logs

# Reset everything
docker-compose down -v
docker-compose up -d
npm run db:migrate
npm run db:seed
npm run start:dev
```

### Frontend can't connect to backend
```bash
# Verify backend is running
curl http://localhost:3000/api/v1/health

# Check CORS settings in backend
# .env should have: CORS_ORIGIN=http://localhost:5173

# Clear browser cache
# Ctrl+Shift+Delete or Cmd+Shift+Delete
```

### Database errors
```bash
# View database logs
docker-compose logs postgres

# Reset database completely
docker-compose down
docker volume rm nxvms_postgres_data
docker-compose up -d

# Rerun migrations
npm run db:migrate
npm run db:seed
```

### Cannot run TypeScript files
```bash
# Make sure dependencies are installed
npm install

# Try running with ts-node directly
npx ts-node -P tsconfig.json src/scripts/verify-system.ts
```

## 📈 Performance Tips

1. **Use HLS for streaming** - More efficient than MJPEG
2. **Enable gzip compression** - Already configured in Fastify
3. **Use pagination** - For large result sets
4. **Cache camera list** - On frontend, refresh periodically
5. **Monitor FFmpeg** - Check health endpoint regularly

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

MIT

## 👥 Team

NXvms Team

## 🎯 Roadmap

### v0.2.0
- [ ] WebRTC streaming fallback
- [ ] Advanced motion detection
- [ ] Smart search by motion
- [ ] Video analytics
- [ ] Multi-server support

### v0.3.0
- [ ] AI-powered event detection
- [ ] Facial recognition
- [ ] Custom export profiles
- [ ] Mobile app
- [ ] Cloud backup

## 📞 Support

For issues and questions:
- Check [TESTING.md](./TESTING.md)
- Review [plans/](./plans/) documentation
- Check logs: `docker-compose logs -f`
- Verify health: `npm run script:verify-system`

## ⭐ Quick Links

- 🌐 **Frontend**: http://localhost:5173
- 📖 **API Docs**: http://localhost:3000/api/docs
- 🗄️ **Database**: http://localhost:8080
- 📝 **Testing Guide**: [TESTING.md](./TESTING.md)
- 📐 **Architecture**: [plans/01-architecture-overview.md](./plans/01-architecture-overview.md)

---

**Last Updated**: January 2026  
**Version**: 0.1.0  
**Status**: 🚀 Production Ready for Testing
