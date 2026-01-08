# NXvms Docker Deployment Validator Script for Windows PowerShell
# This script validates Docker installation, configuration, and deployment readiness

param(
    [switch]$Verbose = $false
)

# Initialize counters
$ChecksPassed = 0
$ChecksFailed = 0
$Warnings = 0
$CheckNum = 1

# Helper functions
function Write-Header {
    Write-Host "`n========================================" -ForegroundColor Blue
    Write-Host $args[0] -ForegroundColor Blue
    Write-Host "========================================`n" -ForegroundColor Blue
}

function Write-Check {
    Write-Host "[$CheckNum/...] Checking $($args[0])... " -NoNewline
    $script:CheckNum++
}

function Write-Pass {
    Write-Host "✓ PASS" -ForegroundColor Green
    $script:ChecksPassed++
}

function Write-Fail {
    Write-Host "✗ FAIL: $($args[0])" -ForegroundColor Red
    $script:ChecksFailed++
}

function Write-Warn {
    Write-Host "⚠ WARN: $($args[0])" -ForegroundColor Yellow
    $script:Warnings++
}

# Clear screen
Clear-Host

# System checks
Write-Header "System Requirements Check"

# Windows Version Check
Write-Check "Windows Version"
$OSVersion = [System.Environment]::OSVersion.VersionString
if ($OSVersion -match "Windows (10|11|Server 2019|Server 2022)") {
    Write-Host "$OSVersion " -NoNewline -ForegroundColor Green
    Write-Pass
}
else {
    Write-Fail "Windows version not compatible: $OSVersion (Windows 10/11 or Server 2019+ required)"
}

# CPU Check
Write-Check "CPU Cores"
$CPUCores = (Get-WmiObject Win32_ComputerSystem).NumberOfLogicalProcessors
if ($CPUCores -ge 2) {
    Write-Host "$CPUCores cores " -NoNewline -ForegroundColor Green
    Write-Pass
}
else {
    Write-Warn "Only $CPUCores CPU cores detected (minimum 2 recommended)"
}

# RAM Check
Write-Check "Available Memory"
$TotalRAM = [math]::Round((Get-WmiObject Win32_ComputerSystem).TotalPhysicalMemory / 1GB)
if ($TotalRAM -ge 4) {
    Write-Host "$TotalRAM GB " -NoNewline -ForegroundColor Green
    Write-Pass
}
else {
    Write-Warn "Only $TotalRAM GB RAM available (minimum 4GB recommended)"
}

# Disk Space Check
Write-Check "Available Disk Space"
$DiskSpace = [math]::Round((Get-PSDrive C).Free / 1GB)
if ($DiskSpace -ge 20) {
    Write-Host "$DiskSpace GB " -NoNewline -ForegroundColor Green
    Write-Pass
}
else {
    Write-Fail "Only $DiskSpace GB disk space available (minimum 20GB recommended)"
}

# Docker Installation Check
Write-Header "Docker Installation Check"

# Docker Desktop version
Write-Check "Docker Installation"
try {
    $DockerVersion = docker --version 2>$null | ForEach-Object { $_.Split() | Select-Object -Index 2 }
    Write-Host "Version: $DockerVersion " -NoNewline -ForegroundColor Green
    Write-Pass
}
catch {
    Write-Fail "Docker is not installed. Install Docker Desktop from https://www.docker.com/products/docker-desktop"
}

# Docker daemon
Write-Check "Docker Daemon Status"
try {
    $null = docker ps 2>$null
    Write-Host "Running " -NoNewline -ForegroundColor Green
    Write-Pass
}
catch {
    Write-Fail "Docker daemon is not running. Start Docker Desktop application."
}

# Docker Compose
Write-Header "Docker Compose Check"

Write-Check "Docker Compose"
try {
    $ComposeVersion = docker compose version --short 2>$null
    if ($ComposeVersion) {
        Write-Host "Version: $ComposeVersion " -NoNewline -ForegroundColor Green
        Write-Pass
    }
    else {
        Write-Fail "Docker Compose not found. Install with Docker Desktop."
    }
}
catch {
    Write-Fail "Docker Compose is not installed. Include with Docker Desktop installation."
}

# Port Availability Check
Write-Header "Port Availability Check"

function Test-Port {
    param([int]$Port, [string]$Service)
    
    Write-Check "Port $Port ($Service)"
    
    $PortInUse = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    
    if ($null -eq $PortInUse) {
        Write-Host "Available " -NoNewline -ForegroundColor Green
        Write-Pass
    }
    else {
        Write-Warn "Port $Port is already in use. Use different port in .env or stop conflicting service"
    }
}

Test-Port 5173 "Client (Frontend)"
Test-Port 3000 "Server (API)"
Test-Port 5432 "Database (PostgreSQL)"

# Configuration File Check
Write-Header "Configuration File Check"

Write-Check "docker-compose.yml"
if (Test-Path "docker-compose.yml") {
    Write-Host "Found " -NoNewline -ForegroundColor Green
    Write-Pass
}
else {
    Write-Fail "docker-compose.yml not found in current directory"
}

Write-Check ".env File"
if (Test-Path ".env") {
    Write-Host "Found " -NoNewline -ForegroundColor Green
    Write-Pass
    
    # Check for critical variables
    Write-Check ".env - Contains DB_PASSWORD"
    $EnvContent = Get-Content ".env"
    if ($EnvContent -match "DB_PASSWORD=") {
        Write-Host "Present " -NoNewline -ForegroundColor Green
        Write-Pass
    }
    else {
        Write-Fail ".env missing DB_PASSWORD configuration"
    }
}
else {
    Write-Warn ".env file not found. Copy from .env.example: Copy-Item .env.example .env"
}

# Dockerfile Check
Write-Header "Dockerfile Check"

Write-Check "server/Dockerfile"
if (Test-Path "server/Dockerfile") {
    Write-Host "Found " -NoNewline -ForegroundColor Green
    Write-Pass
}
else {
    Write-Fail "server/Dockerfile not found"
}

Write-Check "client/Dockerfile"
if (Test-Path "client/Dockerfile") {
    Write-Host "Found " -NoNewline -ForegroundColor Green
    Write-Pass
}
else {
    Write-Fail "client/Dockerfile not found"
}

# Git Configuration Check
Write-Header "Repository Check"

Write-Check "Git Repository"
if (Test-Path ".git") {
    try {
        $RepoUrl = git config --get remote.origin.url 2>$null
        Write-Host "$RepoUrl " -NoNewline -ForegroundColor Green
        Write-Pass
    }
    catch {
        Write-Warn "Git repository found but could not retrieve URL"
    }
}
else {
    Write-Warn "Not in a git repository. Clone with: git clone https://github.com/jdolan-exalink/nxvms.git"
}

# Network Check
Write-Header "Network Configuration Check"

Write-Check "Internet Connectivity"
try {
    $null = [System.Net.Http.HttpClient]::new().GetAsync("http://www.google.com").Wait(3000)
    Write-Host "Connected " -NoNewline -ForegroundColor Green
    Write-Pass
}
catch {
    Write-Warn "No internet connectivity detected. Required for Docker image downloads."
}

# Deployment Readiness Summary
Write-Header "Deployment Readiness Summary"

$TotalChecks = $ChecksPassed + $ChecksFailed
if ($TotalChecks -gt 0) {
    $PassPercentage = [math]::Round(($ChecksPassed / $TotalChecks) * 100)
}
else {
    $PassPercentage = 0
}

Write-Host "Test Results:" -ForegroundColor Blue
Write-Host "  Passed:  " -NoNewline; Write-Host "$ChecksPassed" -ForegroundColor Green
Write-Host "  Failed:  " -NoNewline; Write-Host "$ChecksFailed" -ForegroundColor Red
Write-Host "  Warnings: " -NoNewline; Write-Host "$Warnings" -ForegroundColor Yellow
Write-Host "  Total:   " -NoNewline; Write-Host "$TotalChecks" -ForegroundColor Blue
Write-Host ""
Write-Host "Pass Rate: " -NoNewline; Write-Host "$PassPercentage%" -ForegroundColor Blue

# Final recommendation
if ($ChecksFailed -eq 0) {
    Write-Host ""
    Write-Host "✓ YOUR SYSTEM IS READY FOR DEPLOYMENT!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:"
    Write-Host "  1. Review .env configuration: notepad .env"
    Write-Host "  2. Start deployment: docker compose up -d"
    Write-Host "  3. Check status: docker compose ps"
    Write-Host "  4. View logs: docker compose logs -f"
    exit 0
}
else {
    Write-Host ""
    Write-Host "✗ DEPLOYMENT NOT READY" -ForegroundColor Red
    Write-Host ""
    Write-Host "Issues to resolve:"
    Write-Host "  - Fix $ChecksFailed critical issue(s) above"
    Write-Host "  - Address $Warnings warning(s) if applicable"
    Write-Host ""
    Write-Host "After fixing issues, run this script again:"
    Write-Host "  .\validate-deployment.ps1"
    exit 1
}
