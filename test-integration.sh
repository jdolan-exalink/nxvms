#!/bin/bash

# NXvms - Client-Server Integration Test
# Quick test to verify the frontend can connect to the backend

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║   NXvms Client-Server Integration Test                    ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Check if backend is running
echo -e "${BLUE}📡 Checking Backend...${NC}"
if curl -s http://localhost:3000/api/v1/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is running on http://localhost:3000${NC}"
else
    echo -e "${RED}❌ Backend is not running!${NC}"
    echo -e "${YELLOW}Please start the backend:${NC}"
    echo -e "${CYAN}  cd server && npm run start:dev${NC}"
    exit 1
fi

# Check if database is running
echo -e "${BLUE}📊 Checking Database...${NC}"
if curl -s http://localhost:3000/api/v1/health/db | grep -q "connected"; then
    echo -e "${GREEN}✅ Database is connected${NC}"
else
    echo -e "${RED}❌ Database is not connected!${NC}"
    echo -e "${YELLOW}Please ensure PostgreSQL is running:${NC}"
    echo -e "${CYAN}  cd server && docker-compose up -d${NC}"
    exit 1
fi

# Test login
echo -e "${BLUE}🔐 Testing Authentication...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}')

if echo "$LOGIN_RESPONSE" | grep -q "access_token"; then
    TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
    echo -e "${GREEN}✅ Login successful${NC}"
    echo -e "${GREEN}✅ Token: ${TOKEN:0:20}...${NC}"
else
    echo -e "${RED}❌ Login failed!${NC}"
    echo -e "${YELLOW}Response: $LOGIN_RESPONSE${NC}"
    exit 1
fi

# Test authenticated endpoint
echo -e "${BLUE}👤 Testing User Profile...${NC}"
PROFILE_RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/v1/auth/me)

if echo "$PROFILE_RESPONSE" | grep -q "username"; then
    echo -e "${GREEN}✅ User profile retrieved${NC}"
    echo -e "${GREEN}✅ User: $(echo $PROFILE_RESPONSE | grep -o '"username":"[^"]*' | cut -d'"' -f4)${NC}"
else
    echo -e "${RED}❌ Failed to get user profile!${NC}"
    exit 1
fi

# Test cameras endpoint
echo -e "${BLUE}📹 Testing Cameras Endpoint...${NC}"
CAMERAS_RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/v1/cameras)

if [ "$CAMERAS_RESPONSE" = "[]" ] || echo "$CAMERAS_RESPONSE" | grep -q "id"; then
    CAMERA_COUNT=$(echo "$CAMERAS_RESPONSE" | grep -o '"id"' | wc -l)
    echo -e "${GREEN}✅ Cameras endpoint working${NC}"
    echo -e "${GREEN}✅ Found $CAMERA_COUNT cameras${NC}"
else
    echo -e "${RED}❌ Cameras endpoint failed!${NC}"
    exit 1
fi

# All tests passed
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                            ║${NC}"
echo -e "${GREEN}║  🎉 All integration tests passed!                         ║${NC}"
echo -e "${GREEN}║                                                            ║${NC}"
echo -e "${GREEN}║  Client-Server communication is working correctly          ║${NC}"
echo -e "${GREEN}║                                                            ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${BLUE}Next Steps:${NC}"
echo -e "${CYAN}1. Start Frontend:${NC}"
echo -e "   cd client && npm run dev:server"
echo ""
echo -e "${CYAN}2. Open in Browser:${NC}"
echo -e "   http://localhost:5173"
echo ""
echo -e "${CYAN}3. Login with credentials:${NC}"
echo -e "   Username: admin"
echo -e "   Password: admin123"
echo -e "   Server:   http://localhost:3000/api/v1"
echo ""
echo -e "${YELLOW}For manual testing reference:${NC}"
echo -e "   Read: CLIENT-SERVER-INTEGRATION.md"
echo ""
