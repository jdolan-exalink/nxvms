# NXvms Backend Server

A production-ready NX-like Video Management System (VMS) backend built with NestJS, PostgreSQL, and FFmpeg. Supports RTSP/ONVIF camera integration, HLS streaming, clip export, and comprehensive audit logging.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- FFmpeg (included in Docker)
- PostgreSQL 15+ (or use docker-compose)

### Option 1: Docker Compose (Recommended)

```bash
# Start all services
docker-compose up -d

# Wait for postgres to be ready (~10 seconds)
docker-compose logs postgres

# Run migrations and seed database
npm run db:migrate
npm run db:seed

# API available at http://localhost:3000
# Swagger docs at http://localhost:3000/api/docs
# Database admin at http://localhost:8080
```

### Option 2: Local Development

```bash
# Install dependencies
npm install

# Create .env file (copy from .env.example)
cp .env.example .env

# Start PostgreSQL via docker-compose
docker-compose up -d postgres

# Wait for postgres
sleep 10

# Run migrations
npm run db:migrate

# Seed database with default roles/users
npm run db:seed

# Start development server
npm run start:dev

# API available at http://localhost:3000
```

## 📦 Project Structure

```
server/
├── src/
│   ├── app.module.ts              # Root module
│   ├── main.ts                    # Application entry point (Fastify)
│   ├── config/
│   │   └── configuration.ts       # Environment config schema
│   ├── database/
│   │   ├── orm.config.ts          # TypeORM configuration
│   │   ├── data-source.ts         # DataSource for migrations
│   │   └── entities/
│   │       ├── user.entity.ts     # User with roles/permissions
│   │       ├── role.entity.ts     # RBAC roles with JSON perms
│   │       ├── camera.entity.ts   # Camera with ONVIF fields
│   │       ├── stream.entity.ts   # Stream profiles
│   │       ├── recording-segment.entity.ts  # Chunked storage timeline
│   │       ├── audit-log.entity.ts          # Audit trail
│   │       ├── video-export.entity.ts       # Export jobs
│   │       └── index.ts
│   ├── shared/
│   │   └── services/
│   │       ├── ffmpeg.service.ts  # RTSP→HLS, transcoding, thumbnails
│   │       ├── onvif.service.ts   # Camera discovery, profiles
│   │       ├── storage.service.ts # Chunk/file management
│   │       ├── audit.service.ts   # Audit logging
│   │       └── index.ts
│   ├── auth/
│   │   ├── auth.service.ts        # Register, login, JWT
│   │   ├── auth.controller.ts     # /register, /login, /me
│   │   ├── dto/auth.dto.ts
│   │   ├── strategies/jwt.strategy.ts
│   │   ├── guards/jwt-auth.guard.ts
│   │   ├── decorators/current-user.decorator.ts
│   │   └── auth.module.ts
│   ├── cameras/
│   │   ├── cameras.service.ts     # CRUD, recording control
│   │   ├── cameras.controller.ts  # REST endpoints
│   │   ├── dto/camera.dto.ts
│   │   └── cameras.module.ts
│   ├── health/
│   │   ├── health.service.ts      # System metrics, DB/FFmpeg checks
│   │   ├── health.controller.ts   # Health endpoints
│   │   └── health.module.ts
│   ├── playback/
│   │   ├── playback.service.ts    # HLS generation, export orchestration
│   │   ├── playback.controller.ts # Stream, timeline, export endpoints
│   │   └── playback.module.ts
│   ├── scripts/
│   │   ├── add-camera.ts          # ONVIF discovery / manual setup
│   │   ├── health-check.ts        # System health verification
│   │   └── seed.ts                # Database seeding
│   └── database/
│       └── seeders/seed.ts
├── docker-compose.yml             # Dev environment (postgres, adminer)
├── Dockerfile                     # Container image
├── package.json                   # Dependencies & scripts
├── tsconfig.json                  # TypeScript config
├── .env.example                   # Config template
├── .env                          # Dev defaults
└── README.md                     # This file
```

## 🔐 Authentication & Authorization

### JWT Tokens
- **Access Token**: 1 hour expiration (configurable)
- **Refresh Token**: 7 days (optional, not yet implemented)
- **Secret**: Set `JWT_SECRET` in `.env`

### RBAC Permissions
Permissions are stored as JSON arrays in the `RoleEntity`:
```typescript
permissions: [
  'camera:create',    // Can create cameras
  'camera:read',      // Can view cameras
  'camera:update',    // Can modify cameras
  'recording:export', // Can export clips
  'user:manage',      // Can manage users
  ...
]
```

### Default Users
- **Username**: admin
- **Password**: admin123
- **Role**: Admin (full access)
- ⚠️ **Change on first login!**

## 🎥 Camera Integration

### ONVIF Discovery
```bash
# Discover cameras on network
npm run script:add-camera

# Select "auto" to scan for ONVIF devices
# Device info (IP, port, credentials) displayed for manual entry
```

### Create Camera via API
```bash
curl -X POST http://localhost:3000/api/v1/cameras \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Front Gate",
    "model": "Hikvision DS-2CD2147G2-L",
    "manufacturer": "Hikvision",
    "rtspUrl": "rtsp://admin:password@192.168.1.100:554/stream1",
    "onvifUrl": "http://192.168.1.100:8080",
    "username": "admin",
    "password": "password"
  }'
```

### Recording Control
```bash
# Start recording
POST /api/v1/cameras/{id}/recording/start
Authorization: Bearer <token>

# Stop recording
POST /api/v1/cameras/{id}/recording/stop
Authorization: Bearer <token>
```

## 📊 Playback & Export

### Get HLS Stream
```bash
GET /api/v1/playback/stream/{cameraId}
Authorization: Bearer <token>
```
Returns: HLS playlist path (e.g., `hls/camera-123/stream.m3u8`)

### Get Timeline
```bash
GET /api/v1/playback/timeline/{cameraId}
Authorization: Bearer <token>
```
Returns: Recording segments with start/end times and motion detection flags

### Export Clip
```bash
POST /api/v1/playback/export
Authorization: Bearer <token>
Content-Type: application/json

{
  "cameraId": "camera-123",
  "startTime": "2024-01-15T10:00:00Z",
  "endTime": "2024-01-15T10:30:00Z",
  "format": "mp4"  // or "avi", "mkv"
}
```
Returns: Export job ID with status

### Export Formats
- **MP4**: H.264 video, AAC audio (universal, smaller file)
- **AVI**: MPEG-2 video, PCM audio (legacy compatibility)
- **MKV**: H.265 video, AAC audio (high quality, flexible)

## 🏥 Health Monitoring

### System Health
```bash
GET /api/v1/health
```
Response:
```json
{
  "status": "healthy",
  "uptime": "2h 34m",
  "memory": {"rss": "128 MB", "heap": "64 MB", "system": "2 GB"},
  "cpu": 12.5,
  "database": true,
  "ffmpeg": true,
  "cameras": 4
}
```

### Database Health
```bash
GET /api/v1/health/db
```

### FFmpeg Health
```bash
GET /api/v1/health/ffmpeg
```

### Quick Health Check Script
```bash
npm run script:health-check
# Or with custom API token:
API_TOKEN=eyJhbGc... npm run script:health-check
```

## 📝 Audit Logging

All sensitive operations are logged with full context:
- **User actions**: login, logout, password change
- **Camera operations**: create, update, delete, start/stop recording
- **Recording operations**: start, stop, export
- **System actions**: configuration changes, role modifications

Query audit logs:
```bash
GET /api/v1/audit?action=CAMERA_CREATE&limit=10
Authorization: Bearer <token>
```

## 🗄️ Database

### Migrations
```bash
# Generate migration from entities
npm run typeorm migration:generate -- -n InitialSchema

# Run pending migrations
npm run db:migrate

# Revert last migration
npm run db:migrate:revert
```

### Seed Database
```bash
# Create default roles and admin user
npm run db:seed
```

### Database Schema

**Users Table**
```
id (UUID PK)
├── username (unique)
├── email (unique)
├── password (bcrypt hashed)
├── role_id (FK -> roles)
├── is_active (boolean)
├── created_at (timestamp)
└── updated_at (timestamp)
```

**Cameras Table**
```
id (UUID PK)
├── name
├── model
├── manufacturer
├── rtsp_url
├── onvif_url
├── onvif_id
├── status (enum: online|offline|error)
├── is_recording (boolean)
├── created_at (timestamp)
└── updated_at (timestamp)
```

**Recording Segments Table** (Chunked Storage)
```
id (UUID PK)
├── stream_id (FK -> streams)
├── start_time (timestamp)
├── end_time (timestamp)
├── duration (seconds)
├── file_path (s3_url or local_path)
├── type (enum: continuous|motion_detected|manual)
├── file_size (bytes)
└── created_at (timestamp)

Index: (stream_id, start_time) for efficient timeline queries
```

## 🚀 Deployment

### Production Checklist
- [ ] Change `JWT_SECRET` to strong random value
- [ ] Set `CORS_ORIGIN` to frontend domain
- [ ] Configure `STORAGE_PATH` to persistent volume
- [ ] Set `DATABASE_URL` to external PostgreSQL
- [ ] Enable HTTPS (reverse proxy via nginx)
- [ ] Set up log aggregation (ELK stack)
- [ ] Configure backups for PostgreSQL
- [ ] Set up monitoring (Prometheus + Grafana)
- [ ] Configure SSL certificates for ONVIF over HTTPS
- [ ] Rate limiting on auth endpoints

### Docker Production Deployment
```bash
# Build production image
docker build -t nxvms-server:1.0 .

# Run with environment variables
docker run -d \
  --name nxvms-server \
  -e NODE_ENV=production \
  -e DB_HOST=db.example.com \
  -e DB_PASSWORD=$(openssl rand -base64 32) \
  -e JWT_SECRET=$(openssl rand -base64 32) \
  -e STORAGE_PATH=/persistent/storage \
  -v nxvms_storage:/mnt/nxvms/storage \
  -p 3000:3000 \
  nxvms-server:1.0
```

## 📊 Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `development` | Environment (dev/prod) |
| `PORT` | `3000` | Server port |
| `DB_HOST` | `localhost` | PostgreSQL host |
| `DB_PORT` | `5432` | PostgreSQL port |
| `DB_USER` | `nxvms` | PostgreSQL user |
| `DB_PASSWORD` | `nxvms_dev` | PostgreSQL password |
| `DB_NAME` | `nxvms_db` | Database name |
| `JWT_SECRET` | `dev-key` | JWT signing secret |
| `STORAGE_PATH` | `/mnt/nxvms/storage` | Video storage directory |
| `FFMPEG_PATH` | `ffmpeg` | FFmpeg binary path |
| `HLS_SEGMENT_TIME` | `4` | HLS segment duration (seconds) |
| `HLS_LIST_SIZE` | `10` | HLS playlist size (segments) |
| `CORS_ORIGIN` | `http://localhost:5173` | CORS allowed origin |
| `ONVIF_DISCOVERY_TIMEOUT` | `5000` | ONVIF discovery timeout (ms) |

## 📚 API Documentation

Full OpenAPI (Swagger) documentation available at:
```
http://localhost:3000/api/docs
```

Key endpoints:
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/me` - Get current user
- `GET /api/v1/cameras` - List cameras
- `POST /api/v1/cameras` - Create camera
- `GET /api/v1/cameras/{id}` - Get camera details
- `PUT /api/v1/cameras/{id}` - Update camera
- `DELETE /api/v1/cameras/{id}` - Delete camera
- `POST /api/v1/cameras/{id}/recording/start` - Start recording
- `POST /api/v1/cameras/{id}/recording/stop` - Stop recording
- `GET /api/v1/playback/stream/{cameraId}` - Get HLS stream
- `GET /api/v1/playback/timeline/{cameraId}` - Get timeline
- `POST /api/v1/playback/export` - Create export job
- `GET /api/v1/health` - System health
- `GET /api/v1/health/db` - Database health
- `GET /api/v1/health/ffmpeg` - FFmpeg health

## 🛠️ Development

### NPM Scripts
```bash
# Development
npm run start:dev        # Watch mode with reload
npm run start           # Production mode
npm start              # Alias for start

# Building
npm run build          # Build TypeScript → JavaScript

# Database
npm run db:migrate     # Run pending migrations
npm run db:migrate:revert  # Revert last migration
npm run db:seed        # Seed default data

# Scripts
npm run script:add-camera    # ONVIF discovery tool
npm run script:health-check  # Health check script

# Testing (not yet implemented)
npm run test           # Run unit tests
npm run test:e2e       # End-to-end tests
npm run test:cov       # Coverage report

# Code quality
npm run lint           # Run ESLint
npm run format         # Format with Prettier
```

### Local Development Setup
```bash
# Terminal 1: Start database
docker-compose up postgres

# Terminal 2: Run migrations and start server
npm run db:migrate && npm run start:dev

# Terminal 3: Run scripts or tests
npm run script:health-check
```

## 🐛 Troubleshooting

### PostgreSQL Connection Error
```bash
# Check postgres is running
docker-compose logs postgres

# Check credentials in .env match docker-compose.yml

# Check port 5432 is accessible
nc -zv localhost 5432
```

### FFmpeg Not Found
```bash
# On Mac:
brew install ffmpeg

# On Linux (Ubuntu/Debian):
sudo apt-get install ffmpeg

# Verify installation:
ffmpeg -version
```

### Port 3000 Already in Use
```bash
# Find and kill process
lsof -i :3000
kill -9 <PID>

# Or use different port:
PORT=3001 npm run start:dev
```

### ONVIF Discovery Returns Nothing
- Ensure cameras on same network subnet
- Check firewall allows mDNS (port 5353)
- Some cameras require admin panel to enable ONVIF
- Try manual IP entry instead of auto-discovery

### HLS Playlist Returns 404
- Check `STORAGE_PATH` is writable
- Verify camera RTSP stream is reachable
- Check FFmpeg logs: `docker-compose logs server | grep ffmpeg`
- Ensure recording is started before requesting stream

## 📖 API Client Integration

### Example: Login and Get Cameras
```typescript
// Login
const loginRes = await fetch('http://localhost:3000/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'admin', password: 'admin123' }),
});
const { access_token } = await loginRes.json();

// Get cameras
const camerasRes = await fetch('http://localhost:3000/api/v1/cameras', {
  headers: { 'Authorization': `Bearer ${access_token}` },
});
const cameras = await camerasRes.json();
console.log(cameras);
```

## 🔗 Related Projects

- **Frontend**: NXvms Client (React + Vite) - See `/client` directory
- **Mock Server**: Development API mock - See `/client/mock-server`

## 📄 License

MIT - See LICENSE file

---

**Last Updated**: January 2024
**Maintainer**: NXvms Team
