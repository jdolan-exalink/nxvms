# Script de Validación del Sistema de Grabación Configurable
# Verifica que las configuraciones estén correctas

Write-Host "Validando Configuracion del Sistema de Grabacion..." -ForegroundColor Cyan
Write-Host ""

$errors = 0
$warnings = 0

# 1. Verificar que existe .env.example
Write-Host "Verificando archivos de configuracion..." -ForegroundColor Yellow
if (Test-Path ".env.example") {
    Write-Host "  OK: .env.example existe" -ForegroundColor Green
} else {
    Write-Host "  ERROR: .env.example NO existe" -ForegroundColor Red
    $errors++
}

# 2. Verificar variables en .env.example
Write-Host ""
Write-Host "Verificando variables en .env.example..." -ForegroundColor Yellow
$requiredVars = @("RECORDING_HOST_PATH", "RECORDING_CONTAINER_PATH", "STORAGE_PATH")
$envContent = Get-Content ".env.example" -ErrorAction SilentlyContinue

foreach ($var in $requiredVars) {
    $found = $envContent | Select-String -Pattern "^$var="
    if ($found) {
        Write-Host "  OK: $var esta definida" -ForegroundColor Green
    } else {
        Write-Host "  ERROR: $var NO esta definida" -ForegroundColor Red
        $errors++
    }
}

# 3. Verificar docker-compose.yml
Write-Host ""
Write-Host "Verificando docker-compose.yml..." -ForegroundColor Yellow
$dockerCompose = Get-Content "docker-compose.yml" -ErrorAction SilentlyContinue

$recordingPathUsed = $dockerCompose | Select-String -Pattern "RECORDING_HOST_PATH"
$containerPathUsed = $dockerCompose | Select-String -Pattern "RECORDING_CONTAINER_PATH"

if ($recordingPathUsed) {
    Write-Host "  OK: RECORDING_HOST_PATH esta siendo usado" -ForegroundColor Green
} else {
    Write-Host "  ERROR: RECORDING_HOST_PATH NO se esta usando en docker-compose.yml" -ForegroundColor Red
    $errors++
}

if ($containerPathUsed) {
    Write-Host "  OK: RECORDING_CONTAINER_PATH esta siendo usado" -ForegroundColor Green
} else {
    Write-Host "  ERROR: RECORDING_CONTAINER_PATH NO se esta usando en docker-compose.yml" -ForegroundColor Red
    $errors++
}

# 4. Verificar documentación
Write-Host ""
Write-Host "Verificando documentacion..." -ForegroundColor Yellow

$docs = @{
    "RECORDING_CONFIGURATION.md" = "Guia de configuracion de grabacion"
    "README.md" = "README principal"
    "CAMBIOS_GRABACION.md" = "Documento de cambios"
}

foreach ($doc in $docs.GetEnumerator()) {
    if (Test-Path $doc.Key) {
        Write-Host "  OK: $($doc.Key) existe ($($doc.Value))" -ForegroundColor Green
    } else {
        Write-Host "  ERROR: $($doc.Key) NO existe" -ForegroundColor Red
        $errors++
    }
}

# 5. Verificar que .env está en .gitignore
Write-Host ""
Write-Host "Verificando .gitignore..." -ForegroundColor Yellow
if (Test-Path ".gitignore") {
    $gitignore = Get-Content ".gitignore"
    $envIgnored = $gitignore | Select-String -Pattern "^\.env$"
    
    if ($envIgnored) {
        Write-Host "  OK: .env esta en .gitignore" -ForegroundColor Green
    } else {
        Write-Host "  WARNING: .env NO esta explicitamente en .gitignore" -ForegroundColor Yellow
        $warnings++
    }
} else {
    Write-Host "  ERROR: .gitignore NO existe" -ForegroundColor Red
    $errors++
}

# Resumen
Write-Host ""
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host "RESUMEN DE VALIDACION" -ForegroundColor Cyan
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host ""

if ($errors -eq 0 -and $warnings -eq 0) {
    Write-Host "  TODO CORRECTO!" -ForegroundColor Green
    Write-Host "  La configuracion del sistema de grabacion esta completa." -ForegroundColor Green
} elseif ($errors -eq 0) {
    Write-Host "  Configuracion basica correcta" -ForegroundColor Green
    Write-Host "  $warnings advertencia(s) encontrada(s)" -ForegroundColor Yellow
} else {
    Write-Host "  $errors error(es) encontrado(s)" -ForegroundColor Red
    Write-Host "  $warnings advertencia(s) encontrada(s)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host ""

# Próximos pasos
if ($errors -gt 0 -or $warnings -gt 0) {
    Write-Host "PROXIMOS PASOS RECOMENDADOS:" -ForegroundColor Yellow
    Write-Host ""
    
    if (-not (Test-Path ".env")) {
        Write-Host "  1. Copiar archivo de configuracion:" -ForegroundColor White
        Write-Host "     Copy-Item .env.example .env" -ForegroundColor Gray
        Write-Host ""
    }
    
    Write-Host "  2. Editar .env con tus rutas de grabacion" -ForegroundColor White
    Write-Host "  3. Crear el directorio de grabacion en tu host" -ForegroundColor White
    Write-Host "  4. Ejecutar: docker-compose up -d" -ForegroundColor White
    Write-Host ""
}

Write-Host "Documentacion completa: RECORDING_CONFIGURATION.md" -ForegroundColor Cyan
Write-Host ""

if ($errors -gt 0) {
    exit 1
} else {
    exit 0
}
