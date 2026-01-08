# NXvms Docker Setup Script for Windows PowerShell
# Automates Docker Compose setup and deployment

param(
    [ValidateSet('full', 'server', 'client', 'help')]
    [string]$Mode = 'help'
)

# Colors
$Colors = @{
    Red     = [ConsoleColor]::Red
    Green   = [ConsoleColor]::Green
    Yellow  = [ConsoleColor]::Yellow
    Blue    = [ConsoleColor]::Blue
    Cyan    = [ConsoleColor]::Cyan
}

function Write-Header {
    param([string]$Text)
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor $Colors.Blue
    Write-Host $Text -ForegroundColor $Colors.Blue
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor $Colors.Blue
}

function Write-Success {
    param([string]$Text)
    Write-Host "✓ $Text" -ForegroundColor $Colors.Green
}

function Write-Error {
    param([string]$Text)
    Write-Host "✗ $Text" -ForegroundColor $Colors.Red
}

function Write-Warning {
    param([string]$Text)
    Write-Host "⚠ $Text" -ForegroundColor $Colors.Yellow
}

function Write-Info {
    param([string]$Text)
    Write-Host "ℹ $Text" -ForegroundColor $Colors.Blue
}

function Check-Prerequisites {
    Write-Header "Checking Prerequisites"
    
    # Check Docker
    try {
        $docker = docker --version 2>$null
        Write-Success "Docker found: $docker"
    }
    catch {
        Write-Error "Docker is not installed or not in PATH"
        exit 1
    }
    
    # Check Docker Compose
    try {
        $compose = docker-compose --version 2>$null
        Write-Success "Docker Compose found: $compose"
    }
    catch {
        Write-Error "Docker Compose is not installed or not in PATH"
        exit 1
    }
    
    # Check Docker daemon
    try {
        docker ps > $null 2>&1
        Write-Success "Docker daemon is running"
    }
    catch {
        Write-Error "Docker daemon is not running"
        Write-Warning "Please start Docker Desktop and try again"
        exit 1
    }
}

function Create-EnvFile {
    if (-not (Test-Path ".env")) {
        Write-Info "Creating .env file from .env.example..."
        Copy-Item ".env.example" ".env"
        Write-Success ".env file created"
        Write-Warning "Please review .env file and update sensitive values (passwords, secrets)"
    }
    else {
        Write-Info ".env file already exists"
    }
}

function Show-Menu {
    Write-Header "NXvms Deployment Options"
    Write-Host ""
    Write-Host "1) Full Stack (Frontend + Backend + Database)" -ForegroundColor $Colors.Cyan
    Write-Host "2) Server Only (Backend + Database)" -ForegroundColor $Colors.Cyan
    Write-Host "3) Client Only (Frontend)" -ForegroundColor $Colors.Cyan
    Write-Host "4) Show Help" -ForegroundColor $Colors.Cyan
    Write-Host "5) Exit" -ForegroundColor $Colors.Cyan
    Write-Host ""
    
    $choice = Read-Host "Enter choice (1-5)"
    
    switch ($choice) {
        '1' { Deploy-FullStack }
        '2' { Deploy-ServerOnly }
        '3' { Deploy-ClientOnly }
        '4' { Show-Help }
        '5' { Write-Info "Exiting..."; exit 0 }
        default { Write-Error "Invalid option"; Show-Menu }
    }
}

function Deploy-FullStack {
    Write-Header "Deploying Full Stack"
    
    Write-Info "Building and starting all services..."
    docker-compose up -d --build
    
    Write-Info "Waiting for services to be healthy..."
    Start-Sleep -Seconds 10
    
    Write-Success "Full stack deployment complete!"
    Write-Info "Services available at:"
    Write-Host "  Frontend: http://localhost:5173" -ForegroundColor $Colors.Blue
    Write-Host "  Backend:  http://localhost:3000/api/v1" -ForegroundColor $Colors.Blue
    Write-Host "  Swagger:  http://localhost:3000/api/docs" -ForegroundColor $Colors.Blue
    Write-Host ""
    Write-Host "Login credentials:" -ForegroundColor $Colors.Cyan
    Write-Host "  Username: admin" -ForegroundColor $Colors.Green
    Write-Host "  Password: admin123" -ForegroundColor $Colors.Green
    Write-Host "  Server:   http://localhost:3000/api/v1" -ForegroundColor $Colors.Green
    Write-Host ""
    
    Show-NextSteps -Type "full"
}

function Deploy-ServerOnly {
    Write-Header "Deploying Server Only"
    
    Write-Info "Building and starting server and database..."
    docker-compose -f docker-compose.server.yml up -d --build
    
    Write-Info "Waiting for services to be healthy..."
    Start-Sleep -Seconds 10
    
    Write-Success "Server deployment complete!"
    Write-Info "Services available at:"
    Write-Host "  Backend:  http://localhost:3000/api/v1" -ForegroundColor $Colors.Blue
    Write-Host "  Swagger:  http://localhost:3000/api/docs" -ForegroundColor $Colors.Blue
    Write-Host "  Database: localhost:5432" -ForegroundColor $Colors.Blue
    Write-Host ""
    
    Show-NextSteps -Type "server"
}

function Deploy-ClientOnly {
    Write-Header "Deploying Client Only"
    
    $apiUrl = Read-Host "Enter backend API URL (default: http://localhost:3000/api/v1)"
    if ([string]::IsNullOrWhiteSpace($apiUrl)) {
        $apiUrl = "http://localhost:3000/api/v1"
    }
    
    Write-Info "Building and starting client..."
    $env:VITE_API_BASE_URL = $apiUrl
    docker-compose -f docker-compose.client.yml up -d --build
    
    Write-Success "Client deployment complete!"
    Write-Info "Frontend available at:"
    Write-Host "  URL: http://localhost:5173" -ForegroundColor $Colors.Blue
    Write-Host "  API: $apiUrl" -ForegroundColor $Colors.Blue
    Write-Host ""
    
    Show-NextSteps -Type "client"
}

function Show-Help {
    Write-Header "NXvms Docker Setup - Help"
    Write-Host ""
    Write-Host "Usage: .\docker-setup.ps1 [-Mode <full|server|client|help>]" -ForegroundColor $Colors.Cyan
    Write-Host ""
    Write-Host "Modes:" -ForegroundColor $Colors.Cyan
    Write-Host "  full     - Deploy full stack (frontend + backend + database)" -ForegroundColor $Colors.Cyan
    Write-Host "  server   - Deploy server only (backend + database)" -ForegroundColor $Colors.Cyan
    Write-Host "  client   - Deploy client only (frontend)" -ForegroundColor $Colors.Cyan
    Write-Host "  help     - Show this help message" -ForegroundColor $Colors.Cyan
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor $Colors.Cyan
    Write-Host "  .\docker-setup.ps1 -Mode full" -ForegroundColor $Colors.Yellow
    Write-Host "  .\docker-setup.ps1 -Mode server" -ForegroundColor $Colors.Yellow
    Write-Host "  .\docker-setup.ps1 -Mode client" -ForegroundColor $Colors.Yellow
    Write-Host ""
    Write-Host "Common Commands:" -ForegroundColor $Colors.Cyan
    Write-Host "  View logs:       docker-compose logs -f" -ForegroundColor $Colors.Yellow
    Write-Host "  Stop services:   docker-compose down" -ForegroundColor $Colors.Yellow
    Write-Host "  Service status:  docker-compose ps" -ForegroundColor $Colors.Yellow
    Write-Host "  Clean slate:     docker-compose down -v" -ForegroundColor $Colors.Yellow
    Write-Host ""
}

function Show-NextSteps {
    param([string]$Type)
    
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor $Colors.Blue
    Write-Host "Next Steps:" -ForegroundColor $Colors.Blue
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor $Colors.Blue
    Write-Host ""
    
    switch ($Type) {
        'full' {
            Write-Host "1. View logs:" -ForegroundColor $Colors.Cyan
            Write-Host "   docker-compose logs -f" -ForegroundColor $Colors.Yellow
            Write-Host ""
            Write-Host "2. Check service health:" -ForegroundColor $Colors.Cyan
            Write-Host "   docker-compose ps" -ForegroundColor $Colors.Yellow
            Write-Host ""
            Write-Host "3. Open frontend in browser:" -ForegroundColor $Colors.Cyan
            Write-Host "   http://localhost:5173" -ForegroundColor $Colors.Yellow
            Write-Host ""
        }
        'server' {
            Write-Host "1. View server logs:" -ForegroundColor $Colors.Cyan
            Write-Host "   docker-compose -f docker-compose.server.yml logs -f server" -ForegroundColor $Colors.Yellow
            Write-Host ""
            Write-Host "2. View Swagger documentation:" -ForegroundColor $Colors.Cyan
            Write-Host "   http://localhost:3000/api/docs" -ForegroundColor $Colors.Yellow
            Write-Host ""
            Write-Host "3. Test API health:" -ForegroundColor $Colors.Cyan
            Write-Host "   curl http://localhost:3000/api/v1/health" -ForegroundColor $Colors.Yellow
            Write-Host ""
        }
        'client' {
            Write-Host "1. View client logs:" -ForegroundColor $Colors.Cyan
            Write-Host "   docker-compose -f docker-compose.client.yml logs -f" -ForegroundColor $Colors.Yellow
            Write-Host ""
            Write-Host "2. Open frontend in browser:" -ForegroundColor $Colors.Cyan
            Write-Host "   http://localhost:5173" -ForegroundColor $Colors.Yellow
            Write-Host ""
        }
    }
    
    Write-Host "4. Stop services:" -ForegroundColor $Colors.Cyan
    if ($Type -eq 'full') {
        Write-Host "   docker-compose down" -ForegroundColor $Colors.Yellow
    }
    elseif ($Type -eq 'server') {
        Write-Host "   docker-compose -f docker-compose.server.yml down" -ForegroundColor $Colors.Yellow
    }
    else {
        Write-Host "   docker-compose -f docker-compose.client.yml down" -ForegroundColor $Colors.Yellow
    }
    Write-Host ""
    Write-Host "5. For more information, see DOCKER_GUIDE.md" -ForegroundColor $Colors.Cyan
    Write-Host ""
}

# Main execution
function Main {
    Clear-Host
    Write-Header "NXvms Docker Deployment Setup"
    
    Check-Prerequisites
    Create-EnvFile
    
    if ($Mode -eq 'help') {
        Show-Help
    }
    elseif ($Mode -eq 'full') {
        Deploy-FullStack
    }
    elseif ($Mode -eq 'server') {
        Deploy-ServerOnly
    }
    elseif ($Mode -eq 'client') {
        Deploy-ClientOnly
    }
    else {
        Show-Menu
    }
}

# Run main
Main
