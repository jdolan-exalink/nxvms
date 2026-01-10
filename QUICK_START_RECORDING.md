# 🚀 Guía Rápida: Configuración de Rutas de Grabación

## ⚡ Inicio Rápido (5 minutos)

### 1️⃣ Copiar Configuración
```bash
# Windows PowerShell
Copy-Item .env.example .env

# Linux/macOS
cp .env.example .env
```

### 2️⃣ Editar Rutas
Abre `.env` y configura tu ruta de grabación:

**Windows**:
```env
RECORDING_HOST_PATH=D:\cctv
RECORDING_CONTAINER_PATH=/mnt/cctv
```

**Linux**:
```env
RECORDING_HOST_PATH=/mnt/storage/cctv
RECORDING_CONTAINER_PATH=/mnt/cctv
```

### 3️⃣ Crear Directorio
```bash
# Windows
mkdir D:\cctv

# Linux/macOS
mkdir -p /mnt/storage/cctv
```

### 4️⃣ Iniciar Sistema
```bash
docker-compose up -d
```

### 5️⃣ Verificar
```bash
# Verificar que el volumen está montado
docker exec nxvms-server ls -la /mnt/cctv

# Validar configuración
powershell -ExecutionPolicy Bypass -File .\validate-recording-config.ps1
```

---

## 📍 Variables Clave

| Variable | Descripción | Ejemplo Windows | Ejemplo Linux |
|----------|-------------|-----------------|---------------|
| `RECORDING_HOST_PATH` | Ruta física donde se guardan grabaciones | `D:\cctv` | `/mnt/storage/cctv` |
| `RECORDING_CONTAINER_PATH` | Ruta dentro del contenedor Docker | `/mnt/cctv` | `/mnt/cctv` |
| `STORAGE_PATH` | Almacenamiento temporal (HLS, chunks) | `/mnt/nxvms/storage` | `/mnt/nxvms/storage` |

---

## ✅ Verificación

### ¿Cómo sé que está funcionando?

1. **Verificar variables**:
   ```bash
   docker exec nxvms-server env | grep RECORDING
   ```
   Deberías ver:
   ```
   RECORDING_CONTAINER_PATH=/mnt/cctv
   STORAGE_PATH=/mnt/cctv
   ```

2. **Verificar montaje**:
   ```bash
   docker exec nxvms-server touch /mnt/cctv/test.txt
   ```
   Luego verifica que el archivo existe en tu host:
   ```bash
   # Windows
   dir D:\cctv\test.txt
   
   # Linux
   ls /mnt/storage/cctv/test.txt
   ```

3. **Verificar grabaciones**:
   - Inicia grabación desde la UI
   - Espera 1-2 minutos
   - Verifica que se crearon archivos en `RECORDING_HOST_PATH/{cameraId}/YYYY/MM/DD/HH/`

---

## 🔧 Resolución de Problemas

### El directorio aparece vacío

**Problema**: Las grabaciones no se están guardando.

**Solución**:
1. Verifica permisos del directorio:
   ```bash
   # Linux
   sudo chown -R 1001:1001 /mnt/storage/cctv
   ```

2. Verifica que la variable está configurada:
   ```bash
   docker exec nxvms-server env | grep STORAGE_PATH
   ```

3. Revisa logs del servidor:
   ```bash
   docker logs nxvms-server | grep -i storage
   docker logs nxvms-server | grep -i recording
   ```

### No puedo montar el volumen

**Problema**: Error al levantar docker-compose.

**Solución**:
1. Verifica que el directorio existe en tu host
2. Verifica la sintaxis de la ruta en `.env`:
   - Windows: Usa `\` o `/` en la ruta
   - Linux: Usa rutas absolutas empezando con `/`

3. Si usas WSL en Windows, asegúrate de usar rutas de Windows:
   ```env
   RECORDING_HOST_PATH=D:\cctv
   ```

---

## 📚 Documentación Completa

Para configuración avanzada, múltiples discos, y mejores prácticas, consulta:
- **[RECORDING_CONFIGURATION.md](./RECORDING_CONFIGURATION.md)** - Guía completa
- **[CAMBIOS_GRABACION.md](./CAMBIOS_GRABACION.md)** - Detalles de implementación
- **[README.md](./README.md#-recording-configuration)** - Sección de grabación

---

## 🆘 Ayuda Rápida

```bash
# Validar configuración completa
powershell -ExecutionPolicy Bypass -File .\validate-recording-config.ps1

# Ver logs en tiempo real
docker logs -f nxvms-server

# Reiniciar servicios
docker-compose restart server

# Recrear contenedores (si cambias .env)
docker-compose down
docker-compose up -d
```

---

**¿Listo?** → [Volver al README principal](./README.md)
