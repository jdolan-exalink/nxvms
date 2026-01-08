#!/bin/bash

# NXvms Docker Deployment Validator Script for Linux
# This script validates Docker installation, configuration, and deployment readiness

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
CHECKS_PASSED=0
CHECKS_FAILED=0
WARNINGS=0

# Helper functions
print_header() {
    echo -e "\n${BLUE}======================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}======================================${NC}\n"
}

print_check() {
    echo -n "[$1/...] Checking $2... "
}

print_pass() {
    echo -e "${GREEN}✓ PASS${NC}"
    ((CHECKS_PASSED++))
}

print_fail() {
    echo -e "${RED}✗ FAIL${NC}: $1"
    ((CHECKS_FAILED++))
}

print_warn() {
    echo -e "${YELLOW}⚠ WARN${NC}: $1"
    ((WARNINGS++))
}

# System checks
print_header "System Requirements Check"

# OS Detection
print_check "1" "Operating System"
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        echo -e "${GREEN}✓ PASS${NC} ($NAME $VERSION_ID)"
        ((CHECKS_PASSED++))
    else
        print_fail "Could not determine Linux distribution"
    fi
else
    print_fail "This script is for Linux only. Current OS: $OSTYPE"
fi

# CPU Check
print_check "2" "CPU Cores"
CPU_CORES=$(nproc)
if [ "$CPU_CORES" -ge 2 ]; then
    echo -e "${GREEN}✓ PASS${NC} ($CPU_CORES cores)"
    ((CHECKS_PASSED++))
else
    print_warn "Only $CPU_CORES CPU cores detected (minimum 2 recommended)"
fi

# RAM Check
print_check "3" "Available Memory"
TOTAL_RAM=$(grep MemTotal /proc/meminfo | awk '{print int($2/1024/1024)}')
if [ "$TOTAL_RAM" -ge 4 ]; then
    echo -e "${GREEN}✓ PASS${NC} ($TOTAL_RAM GB)"
    ((CHECKS_PASSED++))
else
    print_warn "Only $TOTAL_RAM GB RAM available (minimum 4GB recommended)"
fi

# Disk Space Check
print_check "4" "Available Disk Space"
DISK_SPACE=$(df /var/lib/docker 2>/dev/null | awk 'NR==2 {print int($4/1024/1024)}' || df / | awk 'NR==2 {print int($4/1024/1024)}')
if [ "$DISK_SPACE" -ge 20 ]; then
    echo -e "${GREEN}✓ PASS${NC} ($DISK_SPACE GB)"
    ((CHECKS_PASSED++))
else
    print_fail "Only $DISK_SPACE GB disk space available (minimum 20GB recommended)"
fi

# Docker Installation Check
print_header "Docker Installation Check"

# Docker version
print_check "5" "Docker Installation"
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version | awk '{print $3}' | cut -d',' -f1)
    if [[ "$DOCKER_VERSION" > "20.10" ]] || [[ "$DOCKER_VERSION" == "20.10" ]]; then
        echo -e "${GREEN}✓ PASS${NC} (Version: $DOCKER_VERSION)"
        ((CHECKS_PASSED++))
    else
        print_fail "Docker version too old: $DOCKER_VERSION (minimum 20.10 required)"
    fi
else
    print_fail "Docker is not installed. Install with: curl https://get.docker.com | sh"
fi

# Docker daemon
print_check "6" "Docker Daemon Status"
if docker ps &> /dev/null; then
    echo -e "${GREEN}✓ PASS${NC}"
    ((CHECKS_PASSED++))
else
    print_fail "Docker daemon is not running. Start with: sudo systemctl start docker"
fi

# Docker Compose
print_header "Docker Compose Check"

print_check "7" "Docker Compose Installation"
if command -v docker &> /dev/null && docker compose version &> /dev/null; then
    COMPOSE_VERSION=$(docker compose version --short)
    if [[ "$COMPOSE_VERSION" > "2.0" ]] || [[ "$COMPOSE_VERSION" == "2.0" ]]; then
        echo -e "${GREEN}✓ PASS${NC} (Version: $COMPOSE_VERSION)"
        ((CHECKS_PASSED++))
    else
        print_fail "Docker Compose version too old: $COMPOSE_VERSION (minimum 2.0 required)"
    fi
else
    print_fail "Docker Compose is not installed. Install with: sudo apt-get install docker-compose or use Docker Desktop"
fi

# Port Availability Check
print_header "Port Availability Check"

check_port() {
    local port=$1
    local service=$2
    print_check "$((CHECKS_PASSED + CHECKS_FAILED + 1))" "Port $port ($service)"
    
    if ! netstat -tuln 2>/dev/null | grep -q ":$port "; then
        echo -e "${GREEN}✓ PASS${NC}"
        ((CHECKS_PASSED++))
    else
        PID=$(lsof -t -i :$port 2>/dev/null || echo "unknown")
        print_warn "Port $port is already in use (PID: $PID). Use different port in .env or stop conflicting service"
    fi
}

check_port 5173 "Client (Frontend)"
check_port 3000 "Server (API)"
check_port 5432 "Database (PostgreSQL)"

# Configuration File Check
print_header "Configuration File Check"

print_check "$((CHECKS_PASSED + CHECKS_FAILED + 1))" "docker-compose.yml"
if [ -f "docker-compose.yml" ]; then
    echo -e "${GREEN}✓ PASS${NC}"
    ((CHECKS_PASSED++))
else
    print_fail "docker-compose.yml not found in current directory"
fi

print_check "$((CHECKS_PASSED + CHECKS_FAILED + 1))" ".env File"
if [ -f ".env" ]; then
    echo -e "${GREEN}✓ PASS${NC}"
    ((CHECKS_PASSED++))
    
    # Check for critical variables
    print_check "$((CHECKS_PASSED + CHECKS_FAILED + 1))" ".env - Contains DB_PASSWORD"
    if grep -q "DB_PASSWORD=" .env; then
        echo -e "${GREEN}✓ PASS${NC}"
        ((CHECKS_PASSED++))
    else
        print_fail ".env missing DB_PASSWORD configuration"
    fi
else
    print_warn ".env file not found. Copy from .env.example: cp .env.example .env"
fi

# Dockerfile Check
print_header "Dockerfile Check"

print_check "$((CHECKS_PASSED + CHECKS_FAILED + 1))" "server/Dockerfile"
if [ -f "server/Dockerfile" ]; then
    echo -e "${GREEN}✓ PASS${NC}"
    ((CHECKS_PASSED++))
else
    print_fail "server/Dockerfile not found"
fi

print_check "$((CHECKS_PASSED + CHECKS_FAILED + 1))" "client/Dockerfile"
if [ -f "client/Dockerfile" ]; then
    echo -e "${GREEN}✓ PASS${NC}"
    ((CHECKS_PASSED++))
else
    print_fail "client/Dockerfile not found"
fi

# Git Configuration Check
print_header "Repository Check"

print_check "$((CHECKS_PASSED + CHECKS_FAILED + 1))" "Git Repository"
if [ -d ".git" ]; then
    REPO_URL=$(git config --get remote.origin.url)
    echo -e "${GREEN}✓ PASS${NC} ($REPO_URL)"
    ((CHECKS_PASSED++))
else
    print_warn "Not in a git repository. Clone with: git clone https://github.com/jdolan-exalink/nxvms.git"
fi

# Network Check
print_header "Network Configuration Check"

print_check "$((CHECKS_PASSED + CHECKS_FAILED + 1))" "Internet Connectivity"
if timeout 3 ping -c 1 8.8.8.8 &> /dev/null || timeout 3 ping -c 1 1.1.1.1 &> /dev/null; then
    echo -e "${GREEN}✓ PASS${NC}"
    ((CHECKS_PASSED++))
else
    print_warn "No internet connectivity detected. Required for Docker image downloads."
fi

# Permission Check
print_header "Permissions Check"

print_check "$((CHECKS_PASSED + CHECKS_FAILED + 1))" "Docker Permissions"
if docker ps &> /dev/null; then
    echo -e "${GREEN}✓ PASS${NC}"
    ((CHECKS_PASSED++))
else
    print_warn "Cannot run Docker without sudo. Add user to docker group: sudo usermod -aG docker \$USER"
fi

# Deployment Readiness Check
print_header "Deployment Readiness Summary"

TOTAL_CHECKS=$((CHECKS_PASSED + CHECKS_FAILED))
PASS_PERCENTAGE=$((CHECKS_PASSED * 100 / TOTAL_CHECKS))

echo -e "${BLUE}Test Results:${NC}"
echo -e "  ${GREEN}Passed: $CHECKS_PASSED${NC}"
echo -e "  ${RED}Failed: $CHECKS_FAILED${NC}"
echo -e "  ${YELLOW}Warnings: $WARNINGS${NC}"
echo -e "  ${BLUE}Total: $TOTAL_CHECKS${NC}"
echo ""
echo -e "Pass Rate: ${BLUE}$PASS_PERCENTAGE%${NC}"

# Final recommendation
if [ $CHECKS_FAILED -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✓ YOUR SYSTEM IS READY FOR DEPLOYMENT!${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Review .env configuration: nano .env"
    echo "  2. Start deployment: docker compose up -d"
    echo "  3. Check status: docker compose ps"
    echo "  4. View logs: docker compose logs -f"
    exit 0
else
    echo ""
    echo -e "${RED}✗ DEPLOYMENT NOT READY${NC}"
    echo ""
    echo "Issues to resolve:"
    echo "  - Fix $CHECKS_FAILED critical issue(s) above"
    echo "  - Address $WARNINGS warning(s) if applicable"
    echo ""
    echo "After fixing issues, run this script again:"
    echo "  bash validate-deployment.sh"
    exit 1
fi
