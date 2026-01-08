#!/bin/bash

# NXvms - Startup Script
# This script sets up and starts the entire NXvms system for testing

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║              🚀 NXvms System Startup Script                    ║"
echo "║      Video Management System - Full Stack Integration Test     ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo -e "${NC}\n"

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Change to the NXvms root directory (one level up from scripts location)
cd "$SCRIPT_DIR/.." || exit

echo -e "${GREEN}✅ Changed to: $(pwd)${NC}\n"

# ============================================
# PRE-TESTING CHECKS
# ============================================
echo -e "${BLUE}📊 Running pre-testing verification...${NC}"
echo ""

cd server
npm run script:pre-testing 2>/dev/null || {
  echo -e "${YELLOW}⚠️  Pre-testing script needs setup. Installing dependencies...${NC}"
  npm install >/dev/null 2>&1
}

cd ..

# ============================================
# INSTALLATION CHECK
# ============================================
echo -e "\n${BLUE}📦 Checking dependencies...${NC}"

if [ ! -d "server/node_modules" ]; then
  echo -e "${YELLOW}Installing server dependencies...${NC}"
  cd server
  npm install
  cd ..
fi

if [ ! -d "client/node_modules" ]; then
  echo -e "${YELLOW}Installing client dependencies...${NC}"
  cd client
  npm install
  cd ..
fi

echo -e "${GREEN}✅ Dependencies ready${NC}\n"

# ============================================
# START SERVICES
# ============================================
echo -e "${BLUE}🚀 Starting NXvms System...${NC}\n"

echo -e "${YELLOW}ℹ️  You need to open 3 terminals to run all services:${NC}\n"

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}TERMINAL 1: Backend Server${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "cd \"$SCRIPT_DIR/server\""
echo "docker-compose up -d"
echo "npm run db:migrate"
echo "npm run db:seed"
echo "npm run start:dev"
echo ""

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}TERMINAL 2: Frontend Application${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "cd \"$SCRIPT_DIR/client\""
echo "npm run dev"
echo ""

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}TERMINAL 3: System Verification (Optional)${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "cd \"$SCRIPT_DIR/server\""
echo "npm run script:verify-system"
echo ""

# ============================================
# ENDPOINTS & CREDENTIALS
# ============================================
echo -e "${BLUE}🌐 URLs & Credentials:${NC}\n"

echo "Frontend Dashboard:"
echo "  ${BLUE}http://localhost:5173${NC}"
echo ""

echo "Backend API Documentation:"
echo "  ${BLUE}http://localhost:3000/api/docs${NC}"
echo ""

echo "Database Management:"
echo "  ${BLUE}http://localhost:8080${NC}"
echo "  Server: postgres"
echo "  Username: nxvms"
echo "  Password: nxvms_dev_password"
echo "  Database: nxvms_db"
echo ""

echo "Test Credentials:"
echo "  Username: ${BLUE}admin${NC}"
echo "  Password: ${BLUE}admin123${NC}"
echo ""

# ============================================
# QUICK TESTING
# ============================================
echo -e "${BLUE}📝 Quick Testing Checklist:${NC}\n"

echo "After starting all services, verify:"
echo ""
echo "1. Backend Health"
echo "   curl http://localhost:3000/api/v1/health"
echo ""
echo "2. Login"
echo "   curl -X POST http://localhost:3000/api/v1/auth/login \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"username\":\"admin\",\"password\":\"admin123\"}'"
echo ""
echo "3. List Cameras"
echo "   curl http://localhost:3000/api/v1/cameras \\"
echo "     -H 'Authorization: Bearer <TOKEN>'"
echo ""
echo "4. Full System Verification"
echo "   npm run script:verify-system"
echo ""

# ============================================
# FINAL INSTRUCTIONS
# ============================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📖 Documentation:${NC}\n"

echo "For detailed testing instructions:"
echo "  ${BLUE}cat \"$SCRIPT_DIR/TESTING.md\"${NC}"
echo ""

echo "For architecture overview:"
echo "  ${BLUE}cat \"$SCRIPT_DIR/plans/01-architecture-overview.md\"${NC}"
echo ""

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✨ Ready to start? Open 3 terminals and follow the commands above!${NC}\n"
echo -e "${YELLOW}💡 Pro tip: Use tmux or screen to manage multiple terminals easily${NC}\n"
