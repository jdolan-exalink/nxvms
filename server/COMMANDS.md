#!/bin/bash
# NXvms Server - Quick Command Reference
# Save this as reference for common operations

echo "
╔════════════════════════════════════════════════════════════════════════════╗
║                    NXvms SERVER - QUICK REFERENCE                          ║
╚════════════════════════════════════════════════════════════════════════════╝
"

cat << 'EOF'

📊 DOCKER MANAGEMENT
─────────────────────────────────────────────────────────────────────────────

  # Start all services (postgres, server, adminer)
  docker-compose up -d

  # View logs
  docker-compose logs -f                  # All services
  docker-compose logs -f postgres          # PostgreSQL only
  docker-compose logs -f server            # NestJS server only

  # Stop all services
  docker-compose down

  # Stop and remove volumes (reset database)
  docker-compose down -v

  # Rebuild container (after code changes)
  docker-compose up -d --build


🚀 APPLICATION STARTUP
─────────────────────────────────────────────────────────────────────────────

  # Development (watches for file changes)
  npm run start:dev

  # Production build
  npm run build

  # Production start
  npm run start:prod

  # Debug mode
  npm run start:debug


🗄️ DATABASE OPERATIONS
─────────────────────────────────────────────────────────────────────────────

  # Apply pending migrations
  npm run db:migrate

  # Revert last migration
  npm run db:revert

  # Seed default roles and users
  npm run db:seed

  # Access database UI (Adminer)
  http://localhost:8080
  # Server: postgres
  # User: nxvms
  # Password: nxvms_dev_password


🎥 CAMERA OPERATIONS
─────────────────────────────────────────────────────────────────────────────

  # Interactive camera discovery and setup
  npm run script:add-camera

  # System health check
  npm run script:health-check

  # Test API directly
  curl http://localhost:3000/api/v1/health


📚 API DOCUMENTATION
─────────────────────────────────────────────────────────────────────────────

  # Interactive Swagger UI
  http://localhost:3000/api/docs

  # API base URL
  http://localhost:3000/api/v1


🔐 AUTHENTICATION
─────────────────────────────────────────────────────────────────────────────

  # Login and get token
  curl -X POST http://localhost:3000/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"admin123"}'

  # Response: { "access_token": "eyJhbGc..." }

  # Use token for protected endpoints
  curl http://localhost:3000/api/v1/cameras \
    -H "Authorization: Bearer <your_token_here>"


💾 STORAGE & FILES
─────────────────────────────────────────────────────────────────────────────

  # View storage directory
  ls -la ./storage

  # Check disk space
  df -h ./storage

  # Clean up old recordings
  rm -rf ./storage/chunks/*


🧪 TESTING
─────────────────────────────────────────────────────────────────────────────

  # Run all tests
  npm test

  # Watch mode
  npm run test:watch

  # Coverage report
  npm run test:cov

  # E2E tests
  npm run test:e2e


🔧 DEVELOPMENT
─────────────────────────────────────────────────────────────────────────────

  # Install dependencies
  npm install

  # Build TypeScript
  npm run build

  # Lint code
  npm run lint

  # Format code
  npm run format


🐛 TROUBLESHOOTING
─────────────────────────────────────────────────────────────────────────────

  # Port 3000 already in use
  PORT=3001 npm run start:dev

  # Kill process on port 3000 (Linux/Mac)
  lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9

  # Kill process on port 3000 (Windows)
  netstat -ano | findstr :3000
  taskkill /PID <PID> /F

  # Check if PostgreSQL is running
  docker-compose ps postgres

  # PostgreSQL connection error?
  docker-compose logs postgres | grep "ready"

  # FFmpeg not found?
  which ffmpeg
  # or
  docker-compose exec server which ffmpeg


📋 USEFUL CURL COMMANDS
─────────────────────────────────────────────────────────────────────────────

  # Get health status
  curl http://localhost:3000/api/v1/health

  # List all cameras
  curl http://localhost:3000/api/v1/cameras \
    -H "Authorization: Bearer <token>"

  # Create camera
  curl -X POST http://localhost:3000/api/v1/cameras \
    -H "Authorization: Bearer <token>" \
    -H "Content-Type: application/json" \
    -d '{
      "name": "Front Gate",
      "rtspUrl": "rtsp://admin:pass@192.168.1.100:554/stream1",
      "onvifUrl": "http://192.168.1.100:8080",
      "username": "admin",
      "password": "pass"
    }'

  # Start recording
  curl -X POST http://localhost:3000/api/v1/cameras/{id}/recording/start \
    -H "Authorization: Bearer <token>"

  # Stop recording
  curl -X POST http://localhost:3000/api/v1/cameras/{id}/recording/stop \
    -H "Authorization: Bearer <token>"

  # Get timeline
  curl http://localhost:3000/api/v1/playback/timeline/{cameraId} \
    -H "Authorization: Bearer <token>"


🔄 INTEGRATION WITH FRONTEND
─────────────────────────────────────────────────────────────────────────────

  # Make sure both are running:
  # Terminal 1 (Server):
  cd server && npm run start:dev

  # Terminal 2 (Frontend):
  cd client && npm run dev

  # Frontend: http://localhost:5173
  # Server:  http://localhost:3000
  # API Docs: http://localhost:3000/api/docs


📖 DOCUMENTATION FILES
─────────────────────────────────────────────────────────────────────────────

  README.md           - Full documentation and API reference
  SETUP.md            - Quick setup guide (5 minutes)
  DELIVERABLES.md     - Complete list of delivered files
  package.json        - All available npm scripts


⚡ QUICK START (Copy-Paste)
─────────────────────────────────────────────────────────────────────────────

  cd server
  docker-compose up -d
  npm install
  npm run db:migrate
  npm run db:seed
  npm run start:dev

  # Open in browser:
  http://localhost:3000/api/docs


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Need more help?
  1. Open http://localhost:3000/api/docs (Swagger UI)
  2. Read README.md for full documentation
  3. Check docker-compose logs for error messages
  4. Review .env file for configuration

EOF
