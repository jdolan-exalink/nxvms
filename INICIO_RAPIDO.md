# Guía Rápida de Inicio - NXvms Docker

¡Despliega NXvms con Docker en 5 minutos o menos!

## Requisitos Previos

- **Docker Desktop** (Windows/Mac) o **Docker Engine** (Linux)
- **Docker Compose** (incluido en Docker Desktop)
- **Mínimo 4GB de RAM** (8GB recomendado)
- **Mínimo 20GB de espacio en disco**

## Inicio Rápido (5 Pasos)

### Paso 1: Clonar el Repositorio

```bash
# Windows
git clone https://github.com/jdolan-exalink/nxvms.git
cd nxvms

# Si ya lo clonaste
cd C:\Users\juan\DEVs\NXvms
```

### Paso 2: Validar el Sistema

**Windows PowerShell:**
```powershell
.\validate-deployment.ps1
```

**Linux/Mac Bash:**
```bash
bash ./validate-deployment.sh
```

> Esto valida la instalación de Docker, puertos disponibles y recursos del sistema.

### Paso 3: Configurar Ambiente

```bash
# Copiar configuración de ejemplo
cp .env.example .env

# Editar con tu editor favorito
# Windows: notepad .env
# Linux: nano .env
# Mac: open -t .env

# Cambiar como mínimo estas configuraciones:
# - DB_PASSWORD: contraseña fuerte aleatoria (mín 16 caracteres)
# - JWT_SECRET: secreto fuerte aleatorio (mín 32 caracteres)
```

### Paso 4: Iniciar los Servicios

```bash
# Construir e iniciar todos los servicios
docker compose up -d

# Esto va a:
# 1. Construir las imágenes Docker (servidor y cliente)
# 2. Descargar postgres:15-alpine
# 3. Crear red y volúmenes
# 4. Iniciar todos los servicios en segundo plano
```

### Paso 5: Verificar que Están Ejecutándose

```bash
# Ver estado de servicios
docker compose ps

# Resultado esperado:
# NAME          STATUS              PORTS
# postgres      Up (healthy)        5432/tcp
# server        Up (healthy)        3000/tcp
# client        Up (healthy)        5173/tcp

# Si alguno no está "Up (healthy)", ver logs:
docker compose logs server
docker compose logs client
docker compose logs postgres
```

## Acceder a la Aplicación

Una vez todos los servicios muestren "Up (healthy)":

- **Frontend**: http://localhost:5173
- **API**: http://localhost:3000/api
- **Base de datos**: localhost:5432 (interno, no expuesto)

## Verificar que Funciona

```bash
# Probar endpoint de API
curl http://localhost:3000/api/v1/health

# Respuesta esperada:
# {"status":"ok","version":"0.1.0"}

# Verificar que el frontend carga
curl http://localhost:5173 | head -20
```

## Comandos Comunes

```bash
# Ver logs en tiempo real
docker compose logs -f

# Ver logs de un servicio específico
docker compose logs -f server
docker compose logs -f client
docker compose logs -f postgres

# Detener todos los servicios
docker compose stop

# Iniciar servicios detenidos
docker compose start

# Reiniciar todos los servicios
docker compose restart

# Remover todos los contenedores (mantiene datos)
docker compose down

# Remover todo incluyendo volúmenes (ADVERTENCIA: borra la BD)
docker compose down -v

# Reconstruir imágenes (después de cambios de código)
docker compose build --no-cache

# Escalar un servicio (ejecutar múltiples instancias)
docker compose up -d --scale server=3
```

## Solución de Problemas

### Los servicios no inician

```bash
# Ver mensajes de error en logs
docker compose logs

# Verificar puertos disponibles
# Windows:
netstat -ano | findstr :5173
netstat -ano | findstr :3000
netstat -ano | findstr :5432

# Linux/Mac:
lsof -i :5173
lsof -i :3000
lsof -i :5432

# Reiniciar todo
docker compose restart
```

### Puerto ya está en uso

Editar `.env` y cambiar el puerto:

```bash
# Original
CLIENT_PORT=5173
SERVER_PORT=3000
DB_PORT=5432

# Cambiar a otros puertos si están en uso
CLIENT_PORT=5174
SERVER_PORT=3001
DB_PORT=5433

# Reiniciar
docker compose restart
```

### Problemas con contraseña de BD

```bash
# Si cambiaste DB_PASSWORD en .env después del inicio:
# 1. Remover volumen de BD (ADVERTENCIA: borra datos)
docker compose down -v

# 2. Iniciar servicios de nuevo (recrea con nueva contraseña)
docker compose up -d
```

### Rendimiento lento

```bash
# Aumentar recursos de Docker
# Docker Desktop: Settings → Resources
# Mínimo: 4GB RAM, 2 cores de CPU
# Recomendado: 8GB RAM, 4 cores de CPU

# Después de cambiar recursos:
docker compose restart
```

## Checklist de Despliegue

### Ambiente de Desarrollo ✓

- [x] Docker Desktop instalado
- [x] Repositorio clonado
- [x] Script de validación ejecutado
- [x] .env creado con credenciales de desarrollo
- [x] Servicios ejecutándose y saludables
- [x] Acceso a http://localhost:5173

### Ambiente de Staging

- [ ] Servidor Linux con Docker y Docker Compose
- [ ] Script de validación ejecutado en Linux
- [ ] .env creado con credenciales de staging
- [ ] Volúmenes configurados para persistencia
- [ ] Reverse proxy (nginx) configurado
- [ ] Certificados SSL/TLS instalados
- [ ] Servicios ejecutándose y saludables
- [ ] Health checks pasando

### Ambiente de Producción

- [ ] Servidor Linux dedicado (Ubuntu 20.04+ o CentOS 8+)
- [ ] Script de validación ejecutado
- [ ] Contraseñas fuertes configuradas en .env
- [ ] Backups automáticos configurados
- [ ] Reverse proxy con HTTPS
- [ ] Monitoreo y alertas configurados
- [ ] Agregación de logs
- [ ] Backup/restore de BD probado
- [ ] Runbook documentado para el equipo

## Indicadores de Éxito ✓

Después de seguir estos pasos deberías ver:

```bash
$ docker compose ps
NAME      STATUS              PORTS
postgres  Up (healthy)        5432/tcp
server    Up (healthy)        0.0.0.0:3000->3000/tcp
client    Up (healthy)        0.0.0.0:5173->5173/tcp

$ curl http://localhost:3000/api/v1/health
{"status":"ok","version":"0.1.0"}

# Frontend carga correctamente en http://localhost:5173
```

## Referencia Rápida

| Acción | Comando |
|--------|---------|
| Iniciar | `docker compose up -d` |
| Detener | `docker compose down` |
| Logs | `docker compose logs -f` |
| Estado | `docker compose ps` |
| Reiniciar | `docker compose restart` |
| Reconstruir | `docker compose build` |
| Validar | `validate-deployment.ps1` o `.sh` |

## Documentación Completa

- **Guía completa (inglés)**: [LINUX_DOCKER_DEPLOYMENT.md](LINUX_DOCKER_DEPLOYMENT.md)
- **Quick start (inglés)**: [DOCKER_QUICKSTART.md](DOCKER_QUICKSTART.md)
- **Validación en GitHub**: [Commits recientes](https://github.com/jdolan-exalink/nxvms)

---

**Versión**: 0.1.0  
**Última actualización**: 2024  
**Traducción**: Guía en Español
