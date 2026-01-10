# 🔍 Diagnóstico: Error 500 al Actualizar Cámara

## ❌ Problema Confirmado

Al intentar actualizar una cámara (cambiar modo de grabación), se produce error 500.

---

## 🔍 Diagnóstico Realizado

### 1. Verificación del Código Fuente ✅
- `UpdateCameraDto` en `server/src/cameras/dto/camera.dto.ts` **SÍ** tiene los campos:
  - `rtspUrl`
  - `serverId`
  - `zones`

### 2. Verificación del Build ❌ **PROBLEMA ENCONTRADO**
El archivo compilado en el contenedor (`/app/dist/cameras/dto/camera.dto.js`) **NO contiene** los campos agregados.

**Evidencia**:
```bash
docker exec nxvms-server cat /app/dist/cameras/dto/camera.dto.js | grep -i "rtspUrl\|serverId"
# Resultado: No encontrado
```

El build solo muestra:
- `recordingMode` ✅
- `tags` ✅
- `zones` ✅
- `name` ✅
- `rtspUrl` en `UpdateCameraDto` ❌ **FALTA**
- `serverId` en `UpdateCameraDto` ❌ **FALTA**

---

## 🎯 Causa Raíz

El servidor se reconstruyó anteriormente con `docker-compose build server`, pero **usó caché de capas anteriores** que no incluían los cambios en `UpdateCameraDto`.

**Por qué pasó**:
1. TypeScript compiló el código viejo (de caché)
2. El contenedor se creó con el `.js` compilado viejo
3. Los cambios en `.ts` no se reflejaron en el `.js`

---

## ✅ Solución en Progreso

Estoy reconstruyendo el servidor **SIN CACHÉ**:

```bash
docker-compose build --no-cache server
```

Esto forzará a:
1. Descargar todas las dependencias de nuevo
2. Compilar TODO el código TypeScript desde cero
3. Incluir los cambios en `UpdateCameraDto`

**Tiempo estimado**: 2-3 minutos

---

## 📊 Cambios que Se Aplicarán

### UpdateCameraDto (Antes del build correcto):
```typescript
// Compilado en /app/dist/cameras/dto/camera.dto.js
{
  name?: string;
  description?: string;  // Falta en compilado
  recordingMode?: RecordingMode;
  tags?: string[];
  zones?: any[];
}
```

### UpdateCameraDto (Después del build correcto)

:
```typescript
{
  name?: string;
  description?: string;
  rtspUrl?: string;        // ← Se agregará
  serverId?: string;       // ← Se agregará
  isRecording?: boolean;
  recordingMode?: RecordingMode;
  tags?: string[];
  zones?: any[];
}
```

---

## 🧪 Verificación Post-Build

Después del build, verificaré:

```bash
# 1. Que rtspUrl y serverId estén en el .js compilado
docker exec nxvms-server cat /app/dist/cameras/dto/camera.dto.js | grep -i "rtspUrl\|serverId"

# 2. Reiniciar el servidor
docker-compose up -d

# 3. Ver logs
docker logs nxvms-server --tail 20
```

---

## 🚀 Pasos Siguientes

1. ✅ Esperar a que termine el build (en progreso)
2. ⏳ Verificar que el `.js` compilado tiene los campos
3. ⏳ Reiniciar servicios: `docker-compose up -d`
4. ⏳ Probar edición de cámara
5. ⏳ Confirmar que funciona sin error 500

---

## 💡 Lección Aprendida

**Problema**: `docker-compose build` puede usar caché de layers anteriores.

**Solución**: Usar `--no-cache` cuando se modifican DTOs o cualquier código que afecte validación.

**Para el futuro**:
```bash
# Siempre que cambies ValidationPipe, DTOs, o Decorators:
docker-compose build --no-cache server

# Para cambios normales de lógica:
docker-compose build server  # Caché OK
```

---

## 📝 Estado Actual

- **Build sin caché**: ⏳ En progreso (2-3 min)
- **Código fuente**: ✅ Correcto
- **Compilado actual**: ❌ Viejo (sin rtspUrl/serverId)
- **Compilado nuevo**: ⏳ Esperando build

---

**Timestamp**: 2026-01-10 14:54  
**Acción**: Rebuild sin caché en progreso  
**ETA**: ~2 minutos
