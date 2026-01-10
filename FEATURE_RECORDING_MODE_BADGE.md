# ✅ Implementación: Mostrar Tipo de Grabación en Listado de Cámaras

## 📋 Cambios Realizados

### 1. Frontend - `client/src/resources/resource-tree.tsx`

#### Import de RecordingMode
```tsx
import { Site, Server as ServerType, Camera, Group, RecordingMode } from '../shared/types';
```

#### Badge de Modo de Grabación
Se agregó un badge visual elegante que muestra el tipo de grabación seleccionada:

**Colores por Modo**:
- 🔴 **ALWAYS** (Siempre): Rojo
- 🟡 **MOTION_ONLY** (Movimiento): Amarillo
- 🟠 **MOTION_LOW_RES** (Mov. LowRes): Naranja
- 🟣 **OBJECTS** (Objetos): Púrpura
- ⚫ **DO_NOT_RECORD** (No grabar): Gris oscuro

**Características del Badge**:
- Texto pequeño con estilo uppercase
- Borde sutil con opacidad
- Fondo semitransparente
- Tracking amplio para mejor legibilidad
- Responsive y compacto

**Ubicación**:
- Debajo del nombre de la cámara
- Al lado del badge de FRIGATE o URL RTSP
- Parte del contenedor de información de la cámara

### 2. Backend - Ya Implementado

El backend ya tiene todo preparado:
- ✅ `CameraEntity` tiene el campo `recordingMode` (línea 97-102)
- ✅ El campo está definido como enum de RecordingMode
- ✅ Tiene valor por defecto: `MOTION_ONLY`
- ✅ El controller `/api/v1/cameras/tree` devuelve este campo automáticamente

### 3. Types - Ya Definidos

La interfaz `Camera` en `shared/types.ts` ya incluye:
```typescript
recordingMode?: RecordingMode;
```

## 📸 Vista Previa

```
📹 Cámara Frontal
   [MOVIMIENTO]  rtsp://192.168.1.100:554/stream1
   
📹 Cámara Trasera
   [SIEMPRE]  FRIGATE: Main Server
   
📹 Cámara Garage
   [NO GRABAR]  rtsp://192.168.1.102:554/stream1
```

## 🎨 Detalles de Diseño

### Badge Layout
```tsx
<span className="text-[9px] px-1.5 py-0.5 rounded border uppercase font-bold tracking-wider leading-none {colorClass}">
  {modeText}
</span>
```

### Clase de Colores
- **Siempre**: `bg-red-500/10 text-red-400 border-red-500/20`
- **Movimiento**: `bg-yellow-500/10 text-yellow-400border-yellow-500/20`
- **Mov. LowRes**: `bg-orange-500/10 text-orange-400 border-orange-500/20`
- **Objetos**: `bg-purple-500/10 text-purple-400 border-purple-500/20`
- **No grabar**: `bg-dark-600/50 text-dark-400 border-dark-600`

## 🔄 Flujo de Datos

```
Backend (PostgreSQL)
    ↓
CameraEntity.recordingMode
    ↓
GET /api/v1/cameras/tree
    ↓
Frontend Store (useResourcesStore)
    ↓
ResourceTree Component
    ↓
Badge Visual en UI
```

## ✅ Testing

### Verificar en UI
1. Abrir http://localhost:5173
2. Ver panel izquierdo de recursos
3. Expandir servidor
4. Ver badges de modo de grabación debajo de cada cámara

### Verificar en API
```bash
curl -X GET "http://localhost:3000/api/v1/cameras/tree" \
  -H "Authorization: Bearer {token}"
```

Buscar en la respuesta:
```json
{
  "cameras": [
    {
      "id": "...",
      "name": "...",
      "recordingMode": "motion_only"  // ← Este campo debe estar presente
    }
  ]
}
```

## 🎯 Próximos Pasos (Opcional)

### Mejoras Sugeridas:
1. **Tooltip**: Agregar tooltip con descripción detallada del modo
2. **Indicador de Schedule**: Mostrar si tiene schedule personalizado
3. **Click Handler**: Hacer el badge clickeable para editar modo
4. **Animación**: Agregar animación cuando cambia el modo
5. **Filtro**: Agregar filtro por modo de grabación en el search

### Código Ejemplo para Tooltip:
```tsx
<span 
  className={badgeClass}
  title={`Modo de grabación: ${text}\nClick para modificar`}
>
  {text}
</span>
```

## 📝 Notas

- El badge solo se muestra si `recordingMode` está definido
- Si no hay `record ingMode`, se mantiene el diseño anterior (solo FRIGATE/RTSP)
- Compatible con cámaras Frigate y RTSP
- El modo mostrado es el modo por defecto de la cámara (no el schedule actual)

## 🔧 Mantenimiento

### Agregar Nuevo Modo de Grabación:
1. Agregar al enum en `server/src/database/entities/recording-schedule.entity.ts`
2. Agregar al enum en `client/src/shared/types.ts`
3. Agregar caso en el switch del badge en `resource-tree.tsx`

---

**Estado**: ✅ Completado  
**Probado**: Pendiente (requiere datos de prueba)  
**Documentado**: ✅ Sí
