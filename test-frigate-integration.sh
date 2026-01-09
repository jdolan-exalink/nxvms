#!/bin/bash

# NXvms - Frigate Integration Test

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}Testing Frigate Integration...${NC}"

# Check Frigate REST
echo -e "${BLUE}📡 Checking Frigate API...${NC}"
if curl -s http://localhost:5000/api/version > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frigate is reachable on http://localhost:5000${NC}"
else
    echo -e "${YELLOW}⚠️ Frigate is not reachable. (Make sure docker-compose is up)${NC}"
fi

# Check MQTT
echo -e "${BLUE}📡 Checking MQTT Broker...${NC}"
if timeout 2 bash -c "</dev/tcp/localhost/1883" 2>/dev/null; then
    echo -e "${GREEN}✅ MQTT Broker is reachable on localhost:1883${NC}"
else
    echo -e "${YELLOW}⚠️ MQTT Broker is not reachable.${NC}"
fi

# Login to get token
echo -e "${BLUE}🔐 Logging in to NXvms...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}')
TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo -e "${RED}❌ Failed to log in to NXvms${NC}"
    exit 1
fi

# Check Events Endpoint
echo -e "${BLUE}📅 Checking Events Endpoint...${NC}"
EVENTS_RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/v1/events)

if echo "$EVENTS_RESPONSE" | grep -q "items"; then
    echo -e "${GREEN}✅ Events endpoint is working${NC}"
else
    echo -e "${RED}❌ Events endpoint failed or returned invalid format${NC}"
    echo "$EVENTS_RESPONSE"
fi

# Check Rules
echo -e "${BLUE}📋 Checking Rules Endpoint...${NC}"
RULES_RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/v1/rules)
if [[ "$RULES_RESPONSE" == *"[]"* ]] || [[ "$RULES_RESPONSE" == *"id"* ]]; then
    echo -e "${GREEN}✅ Rules endpoint is working${NC}"
else
    echo -e "${RED}❌ Rules endpoint failed${NC}"
fi

echo -e "${CYAN}Integration test complete.${NC}"
