# ✅ Mejoras en Settings > Cameras

## 📋 Cambios Implementados

### 1️⃣ **Tabla de Cámaras Mejorada**

**Archivo**: `client/src/settings/settings-page.tsx`

#### Nueva Columna: "Modo Grabación"
Se agregó una nueva columna que muestra el modo de grabación con un badge visual:

- 🔴 **SIEMPRE** → Rojo
- 🟡 **MOVIMIENTO** → Amarillo  
- 🟠 **MOV. LOWRES** → Naranja
- 🟣 **OBJETOS** → Púrpura
- ⚫ **NO GRABAR** → Gris oscuro

**Visual**:
```tsx
<span className="px-2 py-1 rounded border">
  MOVIMIENTO
</span>
```

#### Color del Servidor Según Tipo
El icono y texto del servidor ahora usan colores consistentes:

- 🟡 **Amarillo** → Servidores Frigate
- 🔵 **Celeste (Primary)** → Servidores NX

**Código**:
```tsx
const isFrigate = server?.type === 'frigate';
const serverColor = isFrigate ? 'text-yellow-500' : 'text-primary-400';

<span className={`${serverColor}`}>
  <ServerIcon />
  {server?.name}
</span>
```

#### Estados Mejorados
El estado ahora incluye más variantes:

- 🟢 **ONLINE** → Verde
- 🔴 **RECORDING** → Rojo (pulsante en sidebar)
- ⚫ **OFFLINE** → Gris oscuro

---

### 2️⃣ **Sincronización con Sidebar**

**Estado Actual**: ✅ Ya implementado

El modal llama a `onSuccess()` que ejecuta `handleRefresh()`:

```tsx
const handleRefresh = async () => {
  // Refresh cameras
  const camerasRes = await apiClient.getCameras();
  setCameras(camerasRes || []);

  // Refresh servers
  const serversResponse = await apiClient.getServers();
  useServerDirectoryStore.getState().setServers(serversResponse || []);

  // Refresh resource tree (sidebar)
  const newSites = await apiClient.getResourceTree();
  setSites(newSites || []);
};
```

**Flujo completo**:
1. Usuario edita cámara en Settings
2. Click "Guardar Cambios"
3. Modal llama `onSuccess()` → `handleRefresh()`
4. Se actualiza:
   - Lista de cámaras (Settings)
   - Árbol de recursos (Sidebar)
   - Servidores
5. Modal se cierra (`onClose()`)

---

### 3️⃣ **Cierre Automático del Modal**

**Estado**: ✅ Ya implementado (líneas 79-80 de EditCameraModal.tsx)

```tsx
async handleSave() {
  // ... guardar datos ...
  await apiClient.updateCamera(camera.id, payload);
  on Success();  // Refresca la UI
  onClose();     // Cierra el modal ← YA IMPLEMENTADO
}
```

**También funciona para DELETE**:
```tsx
async handleDelete() {
  await apiClient.deleteCamera(camera.id);
  onSuccess();
  onClose();
}
```

---

## 📊 Comparación Before/After

### Before ❌
| Columna | Valor |
|---------|-------|
| Nombre | Portones |
| Estado | ONLINE (sin distinción visual) |
| Servidor | Gaia (gris, sin color) |
| URL RTSP | rtsp://... |
| Acciones | ROI, Edit, Delete |

### After ✅
| Columna | Valor |
|---------|-------|
| Nombre | Portones |
| Estado | 🟢 ONLINE |
| Servidor | 🟡 Gaia (amarillo si Frigate) |
| **Modo Grabación** | 🟡 **MOVIMIENTO** (nuevo) |
| URL RTSP | rtsp://... |
| Acciones | ROI, Edit, Delete |

---

## 🎨 Ejemplo Visual

```
┌─────────────────────────────────────────────────────────────────────┐
│ Nombre    │ Estado    │ Servidor       │ Modo Grabación │ RTSP      │
├─────────────────────────────────────────────────────────────────────┤
│ Portones  │ ● ONLINE  │ 🟡 Gaia        │ [MOVIMIENTO]   │ rtsp://.. │
│ Cochera   │ ● ONLINE  │ 🟡 Gaia        │ [SIEMPRE]      │ rtsp://.. │
│ Ingreso   │ ● OFFLINE │ 🔵 Local       │ [NO GRABAR]    │ N/A       │
└─────────────────────────────────────────────────────────────────────┘
```

**Leyenda de colores**:
- 🟡 = Amarillo (Frigate)
- 🔵 = Celeste (NX)
- 🟢 = Verde (Online)
- 🔴 = Rojo (Recording/Offline en algunos casos)

---

## 🔄 Flujo de UX

### Editar Cámara
```
1. User: Click botón "Editar" (icono lápiz)
   ↓
2. Sistema: Abre modal EditCameraModal
   ↓
3. User: Cambia "Modo Grabación" a "Siempre"
   ↓
4. User: Click "Guardar Cambios"
   ↓
5. Sistema:
   - Llama apiClient.updateCamera()
   - Ejecuta onSuccess() → handleRefresh()
   - Refresca tabla de Settings
   - Refresca Sidebar (resource tree)
   - Cierra modal automáticamente
   ↓
6. User: Ve cambios inmediatamente en:
   - Tabla de Settings (badge "SIEMPRE")
   - Sidebar (badge "Siempre")
```

### Agregar Cámara
```
1. User: Click "Agregar Cámara"
   ↓
2. Sistema: Abre modal vacío
   ↓
3. User: Completa formulario + modo grabación
   ↓
4. User: Click "Agregar Cámara"
   ↓
5. Sistema:
   - Llama apiClient.createCamera()
   - Ejecuta onSuccess() → handleRefresh()
   - Refresca todo
   - Cierra modal
   ↓
6. User: Ve nueva cámara en tabla + sidebar
```

---

## 🧪 Testing

### Verificar Modo de Grabación
```bash
# 1. Ir a Settings > Cameras
# 2. Deberías ver columna "Modo Grabación"
# 3. Cada cámara tiene un badge de color
# 4. Click "Editar" en una cámara
# 5. Cambiar modo de grabación
# 6. Click "Guardar Cambios"
# 7. Modal se cierra automáticamente
# 8. Tabla muestra nuevo modo con badge correcto
# 9. Ir a Live View
# 10. Sidebar muestra mismo modo y color
```

### Verificar Color del Servidor
```bash
# 1. Tener al menos 1 servidor Frigate
# 2. Ir a Settings > Cameras
# 3. Columna "Servidor" debe mostrar:
#    - Servidores Frigate: Icono y texto amarillo
#    - Servidores NX/Local: Icono y texto celeste
# 4. Ir a Live View sidebar
# 5. Servidores deben mostrar mismos colores
```

### Verificar Sincronización
```bash
# 1. Abrir Live View (ver sidebar)
# 2. Ir a Settings > Cameras
# 3. Editar una cám ara
# 4. Cambiar nombre y modo
# 5. Guardar
# 6. Volver a Live View
# 7. Sidebar debe mostrar cambios inmediatamente
```

---

## 🐛 Troubleshooting

### El modal no se cierra
**Causa**: Error en handleSave  
**Solución**: Ver console para errores. El `onClose()` solo se ejecuta si no hay error.

### Los cambios no se ven en sidebar
**Causa**: `handleRefresh()` no se ejecutó  
**Solución**: 
1. Verificar que `onSuccess` está pasado al modal
2. Ver logs de red para confirmar que `/cameras/tree` se llamó

### Color del servidor no cambia
**Causa**: Servidor no tiene `type` definido  
**Solución**: Verificar que el servidor en BD tiene `type='frigate'` o `type='nx_vm'`

---

## 📝 Archivos Modificados

| Archivo | Cambios |
|---------|---------|
| `client/src/settings/settings-page.tsx` | ✅ Agregado import RecordingMode |
| | ✅ Nueva columna "Modo Grabación" |
| | ✅ Color dinámico para servidor |
| | ✅ Estados mejorados |
| `client/src/resources/EditCameraModal.tsx` | ✅ Ya cierra automáticamente (sin cambios) |

---

## ✨ Beneficios

1. **Consistencia Visual**: Settings y Sidebar usan mismos colores y badges
2. **UX Mejorada**: Modal se cierra automáticamente al guardar
3. **Sincronización Automática**: Cambios se ven en todas partes inmediatamente
4. **Información Clara**: Usuario ve modo de grabación sin entrar a editar
5. **Identificación Rápida**: Colores ayudan a distinguir tipos de servidores

---

## 🚀 Siguiente Paso

Para ver los cambios:

```powershell
# Si aún no están visibles, hacer rebuild sin caché
.\rebuild-frontend.ps1

# O manualmente:
docker-compose down
docker-compose build --no-cache client
docker-compose up -d
```

Luego:
1. Abrir http://localhost:5173
2. Login
3. Click en ⚙️ Settings (arriba derecha)
4. Click en tab "CAMERAS"
5. Ver la nueva columna "Modo Grabación"
6. Ver colores de servidores
7. Editar una cámara y verificar que se cierra el modal

---

**Estado**: ✅ Completado  
**Requiere Rebuild**: ✅ Sí (frontend)  
**Compatible con**: Sidebar resource-tree
