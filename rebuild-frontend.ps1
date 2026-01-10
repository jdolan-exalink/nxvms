#!/usr/bin/env pwsh
# Script para rebuild completo del frontend sin caché
# Uso: .\rebuild-frontend.ps1

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  NXVMS - Frontend Rebuild (Sin Caché)" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Detener servicios
Write-Host "1️⃣  Deteniendo servicios..." -ForegroundColor Yellow
docker-compose down
Write-Host "  ✅ Servicios detenidos" -ForegroundColor Green
Write-Host ""

# 2. Rebuild client sin caché
Write-Host "2️⃣  Reconstruyendo frontend (sin caché)..." -ForegroundColor Yellow
Write-Host "  ⏳ Esto puede tomar 1-2 minutos..." -ForegroundColor Gray
docker-compose build --no-cache client
Write-Host "  ✅ Frontend reconstruido" -ForegroundColor Green
Write-Host ""

# 3. Rebuild server (rápido, con caché)
Write-Host "3️⃣  Reconstruyendo backend..." -ForegroundColor Yellow
docker-compose build server
Write-Host "  ✅ Backend reconstruido" -ForegroundColor Green
Write-Host ""

# 4. Levantar servicios
Write-Host "4️⃣  Levantando servicios..." -ForegroundColor Yellow
docker-compose up -d
Write-Host "  ✅ Servicios iniciados" -ForegroundColor Green
Write-Host ""

# 5. Verificar
Write-Host "5️⃣  Verificando contenedor client..." -ForegroundColor Yellow
$timestamp = docker exec nxvms-client sh -c "ls -la /usr/share/nginx/html/assets/*.js | head -1 | awk '{print \`$6,\`$7,\`$8}'"
Write-Host "  📅 Timestamp de archivos: $timestamp" -ForegroundColor Cyan

$hasChanges = docker exec nxvms-client sh -c "cat /usr/share/nginx/html/assets/*.js | grep -c 'Siempre'"
if ($hasChanges -gt 0) {
    Write-Host "  ✅ Cambios detectados en el build!" -ForegroundColor Green
}
else {
    Write-Host "  ⚠️  No se detectaron cambios esperados" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  ✅ REBUILD COMPLETADO" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "🌐 Abrir en navegador (modo incógnito):" -ForegroundColor White
Write-Host "   http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚡ Hard refresh del navegador:" -ForegroundColor White
Write-Host "   Windows: Ctrl + Shift + R" -ForegroundColor Gray
Write-Host "   Mac: Cmd + Shift + R" -ForegroundColor Gray
Write-Host ""
