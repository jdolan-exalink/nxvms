# ✅ Servidor Reconstruido - Listo para Probar

## 🔧 Cambios Aplicados

1. ✅ Actualizado `UpdateCameraDto` con campos faltantes
2. ✅ Servidor reconstruido completamente (`docker-compose build server`)
3. ✅ Todos los servicios levantados (`docker-compose up -d`)
4. ✅ Servidor iniciado correctamente

---

## 🧪 Instrucciones para Probar

### Paso 1: Refrescar Navegador
```
1. Ir a http://localhost:5173
2. Hacer HARD REFRESH:
   - Windows: Ctrl + Shift + R
   - O presionar Ctrl + F5
```

### Paso 2: Editar una Cámara
```
1. Login (admin/admin123)
2. Click en ⚙️ Settings (arriba derecha)
3. Click en tab "CAMERAS"
4. Click botón "Editar" (icono lápiz) en cualquier cámara
5. Cambiar:
   - Nombre (opcional)
   - Modo de Grabación (cambiar a otro)
6. Click "Guardar Cambios"
```

### Paso 3: Verificar Resultado
**Lo que DEBERÍA pasar** ✅:
- Modal se cierra automáticamente
- Tabla muestra el nuevo modo de grabación con badge
- NO hay error 500

**Si aún falla** ❌:
- Abrir DevTools (F12)
- Ir a tab "Network"
- Intentar guardar de nuevo
- Click en la petición PUT que falla
- Ir a "Response" o "Preview"
- Copiar el mensaje de error completo

---

## 🔍 Ver Logs del Servidor en Tiempo Real

Si quieres ver qué está pasando en el backend:

```powershell
docker logs -f nxvms-server
```

Luego intenta editar la cámara y verás los logs en tiempo real.

---

## 📊 Qué Cambió en el Backend

### UpdateCameraDto (Antes):
```typescript
{
  name?: string;
  description?: string;
  isRecording?: boolean;
  recordingMode?: RecordingMode;
  tags?: string[];
}
```

### UpdateCameraDto (Ahora):
```typescript
{
  name?: string;
  description?: string;
  rtspUrl?: string;        // ✅ NUEVO
  serverId?: string;       // ✅ NUEVO
  isRecording?: boolean;
  recordingMode?: RecordingMode;
  tags?: string[];
  zones?: any[];           // ✅ NUEVO
}
```

---

## 🐛 Debugging

### Si Aún Falla con Error 500

#### 1. Ver el Error Exacto
```powershell
# Abrir terminal y ejecutar:
docker logs nxvms-server --tail 50
```

#### 2. Buscar el Stack Trace
El error 500 debe tener un stack trace que indica:
- Qué validador falló
- Qué campo causó el problema
- El valor que se envió

#### 3. Verificar Payload
En DevTools → Network → PUT request:
- Click en la petición
- Tab "Payload" o "Request"
- Ver qué datos se están enviando

**Payload Esperado**:
```json
{
  "name": "Nombre Cámara",
  "description": "Descripción",
  "rtspUrl": "rtsp://...",
  "serverId": "uuid-del-servidor",
  "recordingMode": "motion_only"
}
```

---

## 💡 Posibles Causas si Aún Falla

### 1. Validación de `serverId`
Si `serverId` no es un UUID válido, puede fallar.

**Solución**: Cambiar en `camera.dto.ts`:
```typescript
@IsUUID()  // Si serverId debe ser UUID
serverId?: string;

// O si puede ser cualquier string:
@IsString()  // Ya está así
serverId?: string;
```

### 2. Validación de `rtspUrl`
Si `rtspUrl` vacío está causando problema.

**Solución**: Permitir strings vacíos:
```typescript
@IsOptional()
@IsString()
rtspUrl?: string;  // Ya está correcto (IsOptional permite undefined)
```

### 3. Tipos del Enum
`recordingMode` debe ser uno de los valores válidos del enum.

**Valores válidos**:
- `"always"`
- `"motion_only"`
- `"objects"`
- `"motion_low_res"`
- `"do_not_record"`

---

## 🚀 Si Todo Funciona

Una vez que edites exitosamente:

1. ✅ El modal se cierra
2. ✅ La tabla muestra el nuevo modo
3. ✅ El sidebar también actualiza
4. ✅ El backend guarda correctamente

**Verifica también**:
- Ir a Live View
- Ver el panel de Recursos (sidebar izquierdo)
- La cámara editada debe mostrar el nuevo modo de grabación

---

## 📝 Timestamp

- **Servidor reconstruido**: 2026-01-10 14:44
- **Cambios aplicados**: UpdateCameraDto con rtspUrl, serverId, zones
- **Estado**: ✅ Listo para probar

---

**¿Listo?** Abre http://localhost:5173, haz hard refresh (Ctrl+Shift+R) y prueba editar una cámara. 🚀

**Si aún falla**, por favor copia el error exacto de:
1. DevTools → Network → Response
2. O docker logs nxvms-server
