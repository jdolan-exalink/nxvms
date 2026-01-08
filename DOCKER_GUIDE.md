# NXvms - Docker Deployment Guide

Complete deployment and running instructions for the NXvms system using Docker and Docker Compose.

## Prerequisites

- Docker >= 20.10
- Docker Compose >= 2.0
- 4GB RAM minimum
- 2GB disk space

## Quick Start - Full Stack (Recommended)

Deploy the complete system (Database + Server + Client) with a single command:

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Services will be available at:
# - Frontend: http://localhost:5173
# - Backend API: http://localhost:3000/api/v1
# - API Docs: http://localhost:3000/api/docs
```

### Full Stack Login Credentials

```
Server URL: http://localhost:3000/api/v1
Username: admin
Password: admin123
```

### Full Stack Management

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v

# View logs for specific service
docker-compose logs server
docker-compose logs postgres
docker-compose logs client

# Rebuild after code changes
docker-compose up -d --build

# Scale services (advanced)
docker-compose up -d --scale server=2
```

## Server Only Deployment

Deploy only the backend server and database (useful for headless deployments or development):

```bash
# Start server and database
docker-compose -f docker-compose.server.yml up -d

# View logs
docker-compose -f docker-compose.server.yml logs -f

# Server will be available at:
# - API: http://localhost:3000/api/v1
# - Swagger Docs: http://localhost:3000/api/docs
# - Database: localhost:5432
```

### Server Only Management

```bash
# Stop server
docker-compose -f docker-compose.server.yml down

# Rebuild server
docker-compose -f docker-compose.server.yml up -d --build

# View server logs
docker-compose -f docker-compose.server.yml logs -f server

# Access database directly
psql -h localhost -U nxvms -d nxvms_db -W
# Password: nxvms_password
```

### Server Health Check

```bash
# Check server health
curl http://localhost:3000/api/v1/health

# Check database connection
curl http://localhost:3000/api/v1/health/db

# View Swagger documentation
curl http://localhost:3000/api/docs
```

## Client Only Deployment

Deploy only the frontend client (requires external backend server):

```bash
# Set the backend server URL
export VITE_API_BASE_URL=http://your-backend-server:3000/api/v1

# Start client
docker-compose -f docker-compose.client.yml up -d

# Client will be available at:
# - http://localhost:5173
```

### Client Only Management

```bash
# Stop client
docker-compose -f docker-compose.client.yml down

# Rebuild client
docker-compose -f docker-compose.client.yml up -d --build

# View client logs
docker-compose -f docker-compose.client.yml logs -f

# Connect to different backend
VITE_API_BASE_URL=http://192.168.1.100:3000/api/v1 \
docker-compose -f docker-compose.client.yml up -d
```

## Environment Variables

### Server Environment Variables

Create a `.env` file in the project root:

```env
# Database
DB_HOST=postgres
DB_PORT=5432
DB_USER=nxvms
DB_PASSWORD=nxvms_password
DB_NAME=nxvms_db

# Server
NODE_ENV=production
PORT=3000
JWT_SECRET=your-secure-secret-key-here

# Storage
STORAGE_PATH=/mnt/nxvms/storage

# CORS
CORS_ORIGIN=http://localhost:5173,http://localhost

# FFmpeg
FFMPEG_PATH=ffmpeg
```

### Client Environment Variables

```env
# Backend API endpoint
VITE_API_BASE_URL=http://localhost:3000/api/v1

# Development mode
VITE_DEBUG=false
```

## Network Configuration

All services communicate through an internal Docker network (`nxvms_network`):

```
┌─────────────────────────────────────────────┐
│         Docker Network (nxvms_network)      │
├─────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ Client   │  │  Server  │  │ Database │  │
│  │ :5173    │──│  :3000   │──│ :5432    │  │
│  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────┘
```

## Data Persistence

### Database Data

PostgreSQL data is stored in the `postgres_data` volume:

```bash
# View volumes
docker volume ls | grep nxvms

# Backup database
docker exec nxvms-postgres pg_dump -U nxvms nxvms_db > backup.sql

# Restore database
docker exec -i nxvms-postgres psql -U nxvms nxvms_db < backup.sql
```

### Storage Data

Camera recordings and exports are stored in `./server/storage`:

```bash
# View storage
du -sh ./server/storage/

# Backup storage
tar -czf storage-backup.tar.gz ./server/storage/

# Restore storage
tar -xzf storage-backup.tar.gz
```

## Troubleshooting

### Service Won't Start

```bash
# Check logs
docker-compose logs [service-name]

# Check service health
docker-compose ps

# Restart service
docker-compose restart [service-name]

# Rebuild and restart
docker-compose up -d --build [service-name]
```

### Database Connection Issues

```bash
# Check database is running
docker-compose ps postgres

# Check database logs
docker-compose logs postgres

# Test database connection
docker exec nxvms-postgres psql -U nxvms -c "SELECT version();"

# Reset database
docker-compose down -v
docker-compose up -d
```

### Client Can't Connect to Server

```bash
# Check server is running
docker-compose ps server

# Test API connectivity
curl http://localhost:3000/api/v1/health

# Check CORS configuration
# Edit docker-compose.yml and verify CORS_ORIGIN includes client URL

# Check network connectivity
docker exec nxvms-client curl http://server:3000/api/v1/health
```

### Storage Permission Issues

```bash
# Fix storage directory permissions
sudo chown -R 1000:1000 ./server/storage

# Or run with appropriate permissions
docker exec nxvms-server chmod -R 755 /mnt/nxvms/storage
```

## Performance Tuning

### Database Performance

```bash
# Increase shared buffers in docker-compose.yml
postgres:
  environment:
    POSTGRES_INIT_ARGS: "-c shared_buffers=256MB"
```

### Memory Limits

```yaml
# docker-compose.yml
services:
  postgres:
    deploy:
      resources:
        limits:
          memory: 512M
  server:
    deploy:
      resources:
        limits:
          memory: 1G
  client:
    deploy:
      resources:
        limits:
          memory: 256M
```

## Security Considerations

### Production Deployment

1. **Change default passwords:**
   ```bash
   export DB_PASSWORD=your-secure-password
   export JWT_SECRET=your-secure-jwt-secret
   ```

2. **Use environment files:**
   ```bash
   cp .env.example .env
   # Edit .env with production values
   docker-compose --env-file .env up -d
   ```

3. **Enable HTTPS:**
   - Use reverse proxy (nginx/traefik)
   - Obtain SSL certificate (Let's Encrypt)
   - Configure CORS for HTTPS URLs

4. **Restrict database access:**
   ```yaml
   postgres:
     ports: []  # Remove port exposure
   ```

5. **Use secrets management:**
   ```bash
   docker secret create db_password -
   docker secret create jwt_secret -
   ```

## Monitoring

### Health Checks

All services include health checks:

```bash
# View health status
docker-compose ps

# Manual health check
curl -X GET http://localhost:3000/api/v1/health
curl -X GET http://localhost:3000/api/v1/health/db
```

### Logs and Metrics

```bash
# View real-time logs
docker-compose logs -f

# View logs for specific time
docker-compose logs --since 30m

# Export logs
docker-compose logs > logs.txt

# Monitor resource usage
docker stats

# View container details
docker inspect nxvms-server
```

## Development Workflow

### Local Development with Hot Reload

For development, use the native development servers:

```bash
# Terminal 1: Database
docker-compose -f docker-compose.server.yml up postgres

# Terminal 2: Backend (with hot reload)
cd server && npm run start:dev

# Terminal 3: Frontend (with hot reload)
cd client && npm run dev
```

### Testing

```bash
# Run integration tests
docker-compose -f docker-compose.server.yml up -d
cd client && npm run test:integration

# Run unit tests
docker-compose exec server npm test

# Run e2e tests
docker-compose exec server npm run test:e2e
```

## Advanced Usage

### Custom Database Initialization

Edit `./server/scripts/init-db.sql` to customize database setup:

```sql
-- Example: Create custom schema
CREATE SCHEMA IF NOT EXISTS nxvms;

-- Example: Create role
CREATE ROLE nxvms_app WITH LOGIN PASSWORD 'password';
```

### Multi-Server Deployment

```bash
# Deploy multiple instances with different ports
docker-compose up -d \
  -p nxvms-prod server \
  -p nxvms-staging server

# Or use labels and constraints
labels:
  environment: production
deploy:
  placement:
    constraints: [node.labels.role == frontend]
```

### Docker Swarm Deployment

```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml nxvms

# View services
docker service ls

# Scale service
docker service scale nxvms_server=3
```

## Cleanup

```bash
# Remove all containers and networks
docker-compose down

# Remove all data (clean slate)
docker-compose down -v

# Remove images
docker-compose down --rmi all

# Remove dangling images
docker image prune -a
```

## Support

For issues or questions:
1. Check logs: `docker-compose logs [service]`
2. Review Docker Compose documentation: https://docs.docker.com/compose/
3. Check NXvms documentation: See ../plans/

## License

NXvms © 2026
