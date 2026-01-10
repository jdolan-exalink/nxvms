# 📹 Configuración del Sistema de Grabación NXVMS

## 🎯 Descripción General

El sistema de grabación de NXVMS ahora es completamente configurable mediante variables de entorno, lo que permite personalizar las rutas de almacenamiento según cada despliegue sin modificar el código.

## 🔧 Configuración Rápida

### 1. Variables de Entorno Principal

Edita el archivo `.env` en la raíz del proyecto (cópialo desde `.env.example` si no existe):

```bash
# Ruta en tu máquina HOST donde se guardarán las grabaciones
RECORDING_HOST_PATH=D:\cctv

# Ruta DENTRO del contenedor Docker
RECORDING_CONTAINER_PATH=/mnt/cctv

# Ruta para archivos temporales del sistema (HLS, chunks, etc)
STORAGE_PATH=/mnt/nxvms/storage
```

### 2. Configuración por Plataforma

#### Windows
```env
RECORDING_HOST_PATH=D:\cctv
RECORDING_CONTAINER_PATH=/mnt/cctv
```

#### Linux
```env
RECORDING_HOST_PATH=/mnt/storage/cctv
RECORDING_CONTAINER_PATH=/mnt/cctv
```

#### macOS
```env
RECORDING_HOST_PATH=/Users/tuusuario/cctv
RECORDING_CONTAINER_PATH=/mnt/cctv
```

## 🏗️ Arquitectura de Almacenamiento

### Jerarquía de Directorios

El sistema crea automáticamente una estructura organizada por fecha:

```
RECORDING_HOST_PATH/
├── {cameraId}/
│   ├── 2026/
│   │   ├── 01/
│   │   │   ├── 10/
│   │   │   │   ├── 00/  # Hora 00:00
│   │   │   │   │   ├── recording_001.mp4
│   │   │   │   │   ├── recording_002.mp4
│   │   │   │   ├── 01/  # Hora 01:00
│   │   │   │   ├── 02/  # Hora 02:00
```

### Ubicaciones de Almacenamiento

El sistema admite múltiples ubicaciones de almacenamiento configurables desde la interfaz web:

1. **Almacenamiento Predeterminado**: Definido por `STORAGE_PATH`
2. **Almacenamiento Adicional**: Configurables desde la UI (Ajustes → Almacenamiento)
3. **Selección Automática**: El sistema elige automáticamente la ubicación con más espacio libre

## 📊 Sistema de Gestión de Espacio

### Configuración de Reserva de Espacio

Cada ubicación de almacenamiento puede configurar:

- **Reserva por Porcentaje**: Por ejemplo, 10% del espacio total
- **Reserva por Bytes**: Por ejemplo, 50GB fijos
- **Reciclaje Automático**: Cuando se alcanza el límite, elimina grabaciones antiguas

### Watchdog de Disco

El sistema ejecuta un chequeo cada 60 segundos que:
- ✅ Verifica el espacio disponible
- ✅ Actualiza el estado de las ubicaciones
- ✅ Inicia reciclaje automático si es necesario
- ✅ Marca ubicaciones offline si hay errores

## 🚀 Despliegue

### Opción 1: Docker Compose (Recomendado)

```bash
# 1. Copia el archivo de ejemplo
cp .env.example .env

# 2. Edita las variables según tu entorno
nano .env  # o notepad .env en Windows

# 3. Crea el directorio de grabaciones en tu HOST
mkdir -p D:\cctv  # Windows
# o
mkdir -p /mnt/storage/cctv  # Linux

# 4. Levanta los servicios
docker-compose up -d

# 5. Verifica que el volumen esté montado
docker exec -it nxvms-server ls -la /mnt/cctv
```

### Opción 2: Múltiples Despliegues

Para diferentes entornos, puedes tener archivos `.env` separados:

```bash
# Desarrollo
.env.development

# Producción
.env.production

# Testing
.env.test
```

Y especificar cuál usar:

```bash
docker-compose --env-file .env.production up -d
```

## 🔍 Diagnóstico y Resolución de Problemas

### Verificar Variables de Entorno

```bash
# Ver variables cargadas en el contenedor
docker exec nxvms-server env | grep RECORDING

# Debería mostrar:
# RECORDING_HOST_PATH=D:\cctv
# RECORDING_CONTAINER_PATH=/mnt/cctv
```

### Verificar Montaje de Volúmenes

```bash
# Inspeccionar montajes del contenedor
docker inspect nxvms-server | grep -A 10 "Mounts"

# Crear archivo de prueba desde el contenedor
docker exec nxvms-server touch /mnt/cctv/test.txt

# Verificar que aparezca en el HOST
ls D:\cctv\test.txt  # Windows
# o
ls /mnt/storage/cctv/test.txt  # Linux
```

### Verificar Permisos

```bash
# Asegurar que el usuario del contenedor tenga permisos
docker exec nxvms-server ls -la /mnt/cctv

# Si hay problemas de permisos en Linux:
sudo chown -R 1001:1001 /mnt/storage/cctv
```

### Ver Logs del Sistema de Grabación

```bash
# Ver logs del servidor
docker logs -f nxvms-server

# Buscar mensajes específicos de grabación
docker logs nxvms-server 2>&1 | grep -i "recording"
docker logs nxvms-server 2>&1 | grep -i "storage"
```

## 📝 Ejemplos de Configuración

### Ejemplo 1: Servidor de Producción con NAS

```env
# .env.production
RECORDING_HOST_PATH=/mnt/nas/cctv-recordings
RECORDING_CONTAINER_PATH=/mnt/cctv
STORAGE_PATH=/mnt/cctv  # Usar el NAS también para archivos temporales
```

### Ejemplo 2: Desarrollo Local Windows

```env
# .env.development
RECORDING_HOST_PATH=C:\dev\nxvms-recordings
RECORDING_CONTAINER_PATH=/mnt/cctv
STORAGE_PATH=/mnt/cctv
```

### Ejemplo 3: Servidor Linux con Múltiples Discos

```env
# .env.production
RECORDING_HOST_PATH=/media/disk1/cctv
RECORDING_CONTAINER_PATH=/mnt/cctv
STORAGE_PATH=/mnt/cctv

# Nota: Discos adicionales pueden agregarse desde la UI
# Ejemplo: /media/disk2, /media/disk3, etc.
```

## 🔐 Mejores Prácticas

### Seguridad

1. ✅ **No commitees el archivo `.env`** (ya está en `.gitignore`)
2. ✅ **Usa rutas absolutas** para evitar confusiones
3. ✅ **Verifica permisos** antes de iniciar grabaciones
4. ✅ **Haz backups regulares** de las grabaciones importantes

### Rendimiento

1. ✅ **Usa SSD para archivos temporales** (HLS, chunks)
2. ✅ **Usa HDD para almacenamiento largo plazo** (grabaciones)
3. ✅ **Configura múltiples ubicaciones** para balancear carga
4. ✅ **Monitorea el espacio** regularmente

### Mantenimiento

1. ✅ **Revisa los logs** del watchdog de disco
2. ✅ **Configura alertas** cuando el espacio sea bajo
3. ✅ **Prueba el reciclaje** antes de confiar en él
4. ✅ **Documenta cambios** en la configuración

## 🆘 Soporte

Si encuentras problemas:

1. Verifica las variables de entorno
2. Revisa los logs del contenedor
3. Confirma que el directorio existe en el HOST
4. Verifica permisos de lectura/escritura
5. Consulta la [documentación completa](./README.md)

## 📚 Referencias

- [Docker Compose Environment Variables](https://docs.docker.com/compose/environment-variables/)
- [Docker Volumes](https://docs.docker.com/storage/volumes/)
- [FFmpeg Recording Options](https://ffmpeg.org/ffmpeg-formats.html)
