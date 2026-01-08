#!/bin/bash

# NXvms Docker Setup Script
# Automates Docker Compose setup and deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

check_prerequisites() {
    print_header "Checking Prerequisites"
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed"
        exit 1
    fi
    print_success "Docker found: $(docker --version)"
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed"
        exit 1
    fi
    print_success "Docker Compose found: $(docker-compose --version)"
    
    # Check Docker daemon
    if ! docker ps > /dev/null 2>&1; then
        print_error "Docker daemon is not running"
        exit 1
    fi
    print_success "Docker daemon is running"
}

create_env_file() {
    if [ ! -f .env ]; then
        print_info "Creating .env file from .env.example..."
        cp .env.example .env
        print_success ".env file created"
        print_warning "Please review .env file and update sensitive values (passwords, secrets)"
    else
        print_info ".env file already exists"
    fi
}

show_deployment_options() {
    print_header "NXvms Deployment Options"
    
    echo "Select deployment type:"
    echo "1) Full Stack (Frontend + Backend + Database)"
    echo "2) Server Only (Backend + Database)"
    echo "3) Client Only (Frontend)"
    echo "4) Exit"
    echo ""
    read -p "Enter choice (1-4): " choice
    
    case $choice in
        1)
            deploy_full_stack
            ;;
        2)
            deploy_server_only
            ;;
        3)
            deploy_client_only
            ;;
        4)
            print_info "Exiting..."
            exit 0
            ;;
        *)
            print_error "Invalid option"
            show_deployment_options
            ;;
    esac
}

deploy_full_stack() {
    print_header "Deploying Full Stack"
    
    print_info "Building and starting all services..."
    docker-compose up -d --build
    
    print_info "Waiting for services to be healthy..."
    sleep 10
    
    print_success "Full stack deployment complete!"
    print_info "Services available at:"
    echo "  Frontend: ${BLUE}http://localhost:5173${NC}"
    echo "  Backend:  ${BLUE}http://localhost:3000/api/v1${NC}"
    echo "  Swagger:  ${BLUE}http://localhost:3000/api/docs${NC}"
    echo ""
    echo "Login credentials:"
    echo "  Username: ${GREEN}admin${NC}"
    echo "  Password: ${GREEN}admin123${NC}"
    echo "  Server:   ${GREEN}http://localhost:3000/api/v1${NC}"
    echo ""
    
    show_next_steps
}

deploy_server_only() {
    print_header "Deploying Server Only"
    
    print_info "Building and starting server and database..."
    docker-compose -f docker-compose.server.yml up -d --build
    
    print_info "Waiting for services to be healthy..."
    sleep 10
    
    print_success "Server deployment complete!"
    print_info "Services available at:"
    echo "  Backend:  ${BLUE}http://localhost:3000/api/v1${NC}"
    echo "  Swagger:  ${BLUE}http://localhost:3000/api/docs${NC}"
    echo "  Database: ${BLUE}localhost:5432${NC}"
    echo ""
    
    show_next_steps_server
}

deploy_client_only() {
    print_header "Deploying Client Only"
    
    read -p "Enter backend API URL (default: http://localhost:3000/api/v1): " api_url
    api_url=${api_url:-http://localhost:3000/api/v1}
    
    print_info "Building and starting client..."
    VITE_API_BASE_URL=$api_url docker-compose -f docker-compose.client.yml up -d --build
    
    print_success "Client deployment complete!"
    print_info "Frontend available at:"
    echo "  URL: ${BLUE}http://localhost:5173${NC}"
    echo "  API: ${BLUE}$api_url${NC}"
    echo ""
    
    show_next_steps_client
}

show_next_steps() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}Next Steps:${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "1. View logs:"
    echo "   ${YELLOW}docker-compose logs -f${NC}"
    echo ""
    echo "2. Check service health:"
    echo "   ${YELLOW}docker-compose ps${NC}"
    echo ""
    echo "3. Access frontend:"
    echo "   Open ${BLUE}http://localhost:5173${NC} in your browser"
    echo ""
    echo "4. Stop services:"
    echo "   ${YELLOW}docker-compose down${NC}"
    echo ""
    echo "5. For more options, see DOCKER_GUIDE.md"
    echo ""
}

show_next_steps_server() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}Next Steps:${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "1. View server logs:"
    echo "   ${YELLOW}docker-compose -f docker-compose.server.yml logs -f server${NC}"
    echo ""
    echo "2. Access Swagger documentation:"
    echo "   Open ${BLUE}http://localhost:3000/api/docs${NC} in your browser"
    echo ""
    echo "3. Connect database client (psql):"
    echo "   ${YELLOW}psql -h localhost -U nxvms -d nxvms_db${NC}"
    echo "   Password: nxvms_password"
    echo ""
    echo "4. Test API:"
    echo "   ${YELLOW}curl http://localhost:3000/api/v1/health${NC}"
    echo ""
    echo "5. Stop services:"
    echo "   ${YELLOW}docker-compose -f docker-compose.server.yml down${NC}"
    echo ""
}

show_next_steps_client() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}Next Steps:${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "1. View client logs:"
    echo "   ${YELLOW}docker-compose -f docker-compose.client.yml logs -f${NC}"
    echo ""
    echo "2. Access frontend:"
    echo "   Open ${BLUE}http://localhost:5173${NC} in your browser"
    echo ""
    echo "3. Stop services:"
    echo "   ${YELLOW}docker-compose -f docker-compose.client.yml down${NC}"
    echo ""
}

# Main execution
main() {
    clear
    print_header "NXvms Docker Deployment Setup"
    
    check_prerequisites
    create_env_file
    show_deployment_options
}

main
