# 🐧 NXvms Docker Deployment Guide for Linux

Complete guide to deploy NXvms (Server, Client, and Database) on Linux using Docker.

## 📋 Requirements

### System Requirements
- **OS**: Ubuntu 20.04+, Debian 11+, CentOS 8+, or other Linux distributions
- **CPU**: 2+ cores recommended
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 20GB minimum for volumes

### Software Requirements
- **Docker**: 20.10+
- **Docker Compose**: 2.0+
- **Git**: Latest version

### Verify Installation
```bash
# Check Docker version
docker --version
# Expected: Docker version 20.10.x or higher

# Check Docker Compose version
docker compose version
# Expected: Docker Compose version 2.x.x or higher

# Verify Docker daemon is running
docker ps
# Should not show "Cannot connect to Docker daemon" error
```

## 🚀 Quick Start (5 minutes)

### 1. Clone Repository
```bash
git clone https://github.com/jdolan-exalink/nxvms.git
cd nxvms
```

### 2. Create Environment File
```bash
# Copy example environment
cp .env.example .env

# Edit with your settings
nano .env
```

### 3. Start All Services
```bash
# Start in foreground (see logs)
docker compose up

# OR start in background
docker compose up -d

# View logs
docker compose logs -f
```

### 4. Access Services
- **Frontend**: http://localhost:5173
- **API**: http://localhost:3000/api/v1
- **Database**: localhost:5432

### 5. Stop Services
```bash
docker compose down
```

---

## 📝 Configuration

### Environment Variables (`.env`)

Create `.env` file in project root:

```bash
# Database Configuration
DB_USER=nxvms
DB_PASSWORD=secure_password_here
DB_NAME=nxvms_db
DB_PORT=5432

# Server Configuration
NODE_ENV=production
SERVER_PORT=3000
JWT_SECRET=your_jwt_secret_key_here_change_in_production
CORS_ORIGIN=http://localhost:5173,http://yourdomain.com

# Client Configuration
CLIENT_PORT=5173
VITE_API_BASE_URL=http://localhost:3000/api/v1

# Logging
LOG_LEVEL=info

# Storage
STORAGE_PATH=/mnt/nxvms/storage
```

### Important Security Notes
⚠️ **Production Checklist**:
1. ✅ Change all default passwords
2. ✅ Set strong JWT_SECRET
3. ✅ Update CORS_ORIGIN for your domain
4. ✅ Use HTTPS in production
5. ✅ Set NODE_ENV=production
6. ✅ Restrict database access

---

## 🔧 Service Details

### Service Architecture

```
┌─────────────────────────────────────────┐
│         NXvms Deployment                │
├─────────────────────────────────────────┤
│                                         │
│  Client (nginx)      Server (Node.js)   │
│  :5173               :3000              │
│    ↓                    ↓               │
│  [Nginx]          [NestJS API]          │
│    ↓                    ↓               │
│    └────────────────────┘               │
│           ↓                             │
│      [PostgreSQL]                       │
│      :5432                              │
│                                         │
└─────────────────────────────────────────┘
```

### PostgreSQL Database

**Service Name**: `postgres`  
**Port**: 5432  
**Data Location**: `postgres_data` volume

```bash
# Connect to database
docker compose exec postgres psql -U nxvms -d nxvms_db

# Backup database
docker compose exec postgres pg_dump -U nxvms nxvms_db > backup.sql

# Restore from backup
cat backup.sql | docker compose exec -T postgres psql -U nxvms -d nxvms_db
```

### NestJS Server

**Service Name**: `server`  
**Port**: 3000  
**Health Check**: GET `/api/v1/health`

```bash
# View server logs
docker compose logs -f server

# Restart server
docker compose restart server

# Access server shell
docker compose exec server sh

# Check API status
curl http://localhost:3000/api/v1/health
```

### React Client

**Service Name**: `client`  
**Port**: 5173  
**Health Check**: GET `/`

```bash
# View client logs
docker compose logs -f client

# Restart client
docker compose restart client

# Access client shell
docker compose exec client sh

# Check client status
curl http://localhost:5173/
```

---

## 📊 Common Tasks

### View Logs

```bash
# All services
docker compose logs

# Specific service
docker compose logs server
docker compose logs client
docker compose logs postgres

# Follow logs in real-time
docker compose logs -f

# Last 100 lines
docker compose logs --tail 100
```

### Manage Services

```bash
# Start services
docker compose start

# Stop services (keep volumes)
docker compose stop

# Restart services
docker compose restart

# Stop and remove containers (keep volumes)
docker compose down

# Stop and remove everything (data loss!)
docker compose down -v
```

### Scale Services

```bash
# Scale server to 3 instances (requires load balancer)
docker compose up -d --scale server=3
```

### Backup & Restore

```bash
# Backup database
docker compose exec postgres pg_dump -U nxvms nxvms_db | gzip > nxvms_backup.sql.gz

# Restore database
gunzip < nxvms_backup.sql.gz | docker compose exec -T postgres psql -U nxvms -d nxvms_db

# Backup volumes
docker run --rm -v nxvms_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_data.tar.gz /data

# Restore volumes
docker run --rm -v nxvms_postgres_data:/data -v $(pwd):/backup alpine tar xzf /backup/postgres_data.tar.gz -C /
```

---

## 🐛 Troubleshooting

### Container Won't Start

```bash
# Check service logs
docker compose logs [service_name]

# Check if ports are in use
sudo lsof -i :5173
sudo lsof -i :3000
sudo lsof -i :5432

# Kill process on port (if needed)
sudo kill -9 $(lsof -t -i :5173)
```

### Database Connection Error

```bash
# Verify database is running
docker compose ps postgres

# Test database connection
docker compose exec postgres psql -U nxvms -d nxvms_db -c "SELECT 1"

# Check database logs
docker compose logs postgres
```

### API Not Responding

```bash
# Check server status
curl http://localhost:3000/api/v1/health

# Check server logs
docker compose logs server

# Verify database connection
docker compose exec server curl http://postgres:5432
```

### Client Not Loading

```bash
# Check client status
curl http://localhost:5173/

# Check client logs
docker compose logs client

# Check nginx config
docker compose exec client nginx -t
```

### Permission Denied Errors

```bash
# Run docker commands with sudo
sudo docker compose up

# Or add current user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Verify docker works without sudo
docker ps
```

---

## 🔒 Security Best Practices

### 1. Use Strong Passwords
```bash
# Generate secure password
openssl rand -base64 32
```

### 2. Limit Port Exposure
```bash
# In docker-compose.yml, use internal networking instead of exposing to 0.0.0.0
# ✅ GOOD: "127.0.0.1:5173:5173"  (localhost only)
# ❌ BAD:  "5173:5173"             (all interfaces)
```

### 3. Disable Root User
✅ Already implemented in Dockerfiles

### 4. Set Read-Only Filesystems
✅ Already configured for client container

### 5. Resource Limits
```bash
# Add to docker-compose.yml
services:
  server:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

### 6. Network Isolation
✅ Services communicate via internal network

### 7. Regular Backups
```bash
# Daily backup script
#!/bin/bash
BACKUP_DIR="/backups/nxvms"
mkdir -p $BACKUP_DIR
docker compose exec postgres pg_dump -U nxvms nxvms_db | gzip > $BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S).sql.gz
```

---

## 📈 Monitoring & Maintenance

### Monitor Container Health
```bash
# Real-time stats
docker stats

# Check container health status
docker compose ps

# Example output:
# NAME              STATUS
# nxvms-client      Up 2 minutes (healthy)
# nxvms-server      Up 2 minutes (healthy)
# nxvms-postgres    Up 2 minutes (healthy)
```

### Regular Maintenance

```bash
# Clean up unused Docker resources
docker system prune -a

# Update base images
docker pull postgres:15-alpine
docker pull node:18-alpine
docker pull nginx:alpine

# Rebuild containers
docker compose build --no-cache
```

### Performance Optimization

```bash
# Increase shared memory for PostgreSQL (if needed)
docker run --shm-size=2gb ...

# Monitor database performance
docker compose exec postgres psql -U nxvms -d nxvms_db -c "SELECT * FROM pg_stat_statements;"
```

---

## 🔄 Updating Components

### Update Server Code

```bash
# Pull latest changes
git pull origin main

# Rebuild server image
docker compose build server

# Restart server
docker compose up -d server
```

### Update Client Code

```bash
# Pull latest changes
git pull origin main

# Rebuild client image
docker compose build client

# Restart client
docker compose up -d client
```

### Update Database Schema

```bash
# Run migrations (if supported by your app)
docker compose exec server npm run migration:run

# Or restore from SQL file
cat schema.sql | docker compose exec -T postgres psql -U nxvms -d nxvms_db
```

---

## 🌐 Production Deployment

### Using Reverse Proxy (Nginx)

```nginx
# /etc/nginx/sites-available/nxvms.conf
upstream api_backend {
    server localhost:3000;
}

upstream frontend {
    server localhost:5173;
}

server {
    listen 80;
    server_name nxvms.example.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name nxvms.example.com;

    ssl_certificate /etc/letsencrypt/live/nxvms.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/nxvms.example.com/privkey.pem;

    location /api/v1 {
        proxy_pass http://api_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        proxy_pass http://frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Using Docker in Swarm Mode

```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml nxvms

# Check status
docker service ls

# Scale service
docker service scale nxvms_server=3
```

### Using Kubernetes (Optional)

See [KUBERNETES_DEPLOYMENT.md](./KUBERNETES_DEPLOYMENT.md) for K8s setup.

---

## 📊 Useful Commands Reference

```bash
# Start all services in background
docker compose up -d

# View running services
docker compose ps

# View logs
docker compose logs -f [service]

# Execute command in container
docker compose exec [service] [command]

# Restart service
docker compose restart [service]

# Stop services
docker compose stop

# Remove services and volumes
docker compose down -v

# Rebuild images
docker compose build

# Remove unused resources
docker system prune -a

# Check resource usage
docker stats

# View network
docker network ls
docker network inspect nxvms_nxvms_network
```

---

## 📞 Support & Issues

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Port already in use | Change port in docker-compose.yml or .env |
| Database won't start | Check .env credentials, check logs |
| API connection refused | Ensure server is healthy, check firewall |
| Client shows blank page | Check browser console, check API URL |
| Out of disk space | `docker system prune -a` to clean up |
| Memory issues | Increase system RAM or set resource limits |

### Getting Help

1. Check [GitHub Issues](https://github.com/jdolan-exalink/nxvms/issues)
2. Review logs: `docker compose logs`
3. Check service status: `docker compose ps`
4. Verify configuration: `cat .env`

---

## 🎯 Success Checklist

- [ ] Docker and Docker Compose installed
- [ ] Repository cloned locally
- [ ] `.env` file created with secure passwords
- [ ] `docker compose up` runs without errors
- [ ] All services show "Up" status
- [ ] Frontend loads at http://localhost:5173
- [ ] API responds at http://localhost:3000/api/v1/health
- [ ] Database connection working
- [ ] Can login with test credentials
- [ ] Data persists after container restart
- [ ] Backups scheduled (production)
- [ ] Monitoring configured (production)

---

**Version**: v0.1.0  
**Last Updated**: January 8, 2026  
**Status**: Production Ready ✨

For more information, see [README.md](./README.md)
