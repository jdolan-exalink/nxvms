# 🎯 PLAN DE IMPLEMENTACIÓN - Completar 8 Features Incompletas

**Fecha**: Enero 8, 2026  
**Objetivo**: Completar todos los módulos parcialmente implementados  
**Total de Features**: 8

---

## 📋 DESGLOSE DE TAREAS

### 1. ✅ PTZ Controls (ONVIF), Digital Zoom, Snapshot
**Estado**: Parcialmente implementado  
**Archivos a crear/modificar**:
- [ ] `src/live-view/ptz-controls.tsx` (nuevo)
- [ ] `src/live-view/digital-zoom.tsx` (nuevo)
- [ ] Actualizar `src/live-view/video-player.tsx` (agregar funcionalidad)
- [ ] Actualizar `src/shared/api-client.ts` (completar métodos PTZ)
- [ ] Actualizar `src/shared/types.ts` (tipos PTZ)

**Componentes a implementar**:
- Botones de control direccional (Up, Down, Left, Right)
- Zoom in/out controls
- Preset buttons
- Digital zoom slider
- Snapshot button con descarga

---

### 2. ✅ Playback Timeline, Scrubbing, Speed Control, Frame Step
**Estado**: Parcialmente implementado  
**Archivos a crear/modificar**:
- [ ] `src/playback/timeline-component.tsx` (nuevo - visual timeline)
- [ ] `src/playback/playback-controls.tsx` (nuevo - completar)
- [ ] `src/playback/frame-step-control.tsx` (nuevo)
- [ ] Actualizar `src/playback/playback-view.tsx`
- [ ] Actualizar `src/shared/api-client.ts` (completar playback)

**Funcionalidad**:
- Timeline visual con segmentos de grabación
- Scrubber interactivo
- Control de velocidad (0.25x - 16x)
- Botones frame step (siguiente/anterior frame)
- Indicador de tiempo actual

---

### 3. ✅ Smart Search Placeholder, Events Panel
**Estado**: Parcialmente implementado  
**Archivos a crear/modificar**:
- [ ] `src/events/smart-search.tsx` (nuevo)
- [ ] `src/events/event-filter.tsx` (nuevo/actualizar)
- [ ] Actualizar `src/events/events-panel.tsx`
- [ ] Actualizar `src/shared/types.ts` (tipos de búsqueda)

**Funcionalidad**:
- Search box con placeholders inteligentes
- Filtros por tipo de evento
- Filtros por fecha/hora
- Filtros por cámara
- Búsqueda por contenido

---

### 4. ✅ Bookmarks con Tags/Notes
**Estado**: Parcialmente implementado  
**Archivos a crear/modificar**:
- [ ] `src/bookmarks/bookmark-card.tsx` (nuevo)
- [ ] `src/bookmarks/tags-manager.tsx` (nuevo)
- [ ] `src/bookmarks/notes-editor.tsx` (nuevo)
- [ ] Actualizar `src/bookmarks/bookmarks-manager.tsx`
- [ ] Actualizar `src/shared/types.ts` (tipos bookmark)

**Funcionalidad**:
- CRUD de bookmarks
- Sistema de tags
- Editor de notas
- Búsqueda y filtrado
- Exportar bookmarks

---

### 5. ✅ Clip Export
**Estado**: Parcialmente implementado  
**Archivos a crear/modificar**:
- [ ] `src/export/export-dialog.tsx` (actualizar)
- [ ] `src/export/export-progress.tsx` (nuevo)
- [ ] `src/export/watermark-editor.tsx` (nuevo)
- [ ] Actualizar `src/export/export-manager.tsx`
- [ ] Actualizar `src/shared/api-client.ts`

**Funcionalidad**:
- Selector de rango de tiempo
- Opciones de watermark
- Barra de progreso
- Notificación de finalización
- Descarga automática o manual

---

### 6. ✅ Health Status Panel
**Estado**: Parcialmente implementado  
**Archivos a crear/modificar**:
- [ ] `src/health/alerts-panel.tsx` (nuevo)
- [ ] `src/health/metrics-display.tsx` (nuevo)
- [ ] Actualizar `src/health/health-dashboard.tsx`
- [ ] Actualizar `src/health/camera-status.tsx`
- [ ] Actualizar `src/health/storage-status.tsx`

**Funcionalidad**:
- Dashboard de salud general
- Panel de alertas con severidad
- Métricas del sistema en tiempo real
- Estado por cámara
- Información de almacenamiento

---

### 7. ✅ Notifications (In-App + Desktop)
**Estado**: Parcialmente implementado  
**Archivos a crear/modificar**:
- [ ] `src/notifications/notification-center.tsx` (nuevo)
- [ ] `src/notifications/notification-toast.tsx` (nuevo)
- [ ] `src/notifications/notification-service.ts` (nuevo)
- [ ] Actualizar `src/notifications/desktop-notifications.ts`
- [ ] Actualizar `src/core/store.ts` (notification store)

**Funcionalidad**:
- Centro de notificaciones
- Toast notifications (in-app)
- Notificaciones de escritorio
- Persistencia de notificaciones
- Marca como leída
- Preferencias de notificaciones

---

### 8. ✅ Permissions UI
**Estado**: No implementado  
**Archivos a crear/modificar**:
- [ ] `src/permissions/user-management.tsx` (nuevo)
- [ ] `src/permissions/role-management.tsx` (nuevo)
- [ ] `src/permissions/acl-editor.tsx` (nuevo)
- [ ] `src/permissions/permissions-view.tsx` (nuevo)
- [ ] Actualizar `src/shared/types.ts` (tipos de permisos)
- [ ] Actualizar `src/shared/api-client.ts` (API de permisos)

**Funcionalidad**:
- Gestión de usuarios (CRUD)
- Gestión de roles (CRUD)
- Editor de permisos por rol
- Asignación de roles a usuarios
- Auditoría de cambios de permisos

---

## 🔄 ORDEN DE IMPLEMENTACIÓN RECOMENDADO

1. **PTZ Controls** (relativamente independiente)
2. **Digital Zoom** (continúa con video-player)
3. **Snapshot** (completar video-player)
4. **Playback Timeline** (core para reproducción)
5. **Frame Step** (complemento playback)
6. **Smart Search** (events enhancement)
7. **Bookmarks+Tags** (feature completa)
8. **Export Progress** (mejorar experiencia)
9. **Watermark Editor** (completar export)
10. **Health Alerts** (dashboard completo)
11. **Notification Center** (in-app + desktop)
12. **Permissions UI** (feature completa nueva)

---

## ⏱️ ESTIMACIÓN DE TIEMPO

| Feature | Complejidad | Tiempo Est. |
|---------|-------------|------------|
| PTZ Controls | Media | 1-2h |
| Digital Zoom | Baja | 30-45m |
| Snapshot | Baja | 30m |
| Timeline | Alta | 2-3h |
| Frame Step | Media | 1h |
| Smart Search | Media | 1-2h |
| Bookmarks+Tags | Media | 1.5-2h |
| Export Progress | Media | 1.5h |
| Watermark | Baja | 1h |
| Health Alerts | Media | 1-1.5h |
| Notifications | Alta | 2-3h |
| Permissions | Alta | 3-4h |
| **TOTAL** | - | **18-26 horas** |

---

## 📝 NOTAS IMPORTANTES

1. **API Client**: Varios métodos ya existen pero necesitan ser completados
2. **Types**: Sistema de tipos ya existe, necesita extensiones
3. **Store (Zustand)**: Tiendas de estado necesitan nuevas slices
4. **Mock Server**: Necesita endpoints para nuevas funcionalidades
5. **Integración Backend**: Requiere endpoints del servidor NestJS

---

## 🚀 EMPEZAMOS CON:

**Fase 1**: Video Player Enhancement (PTZ, Zoom, Snapshot) - 2-3h
**Fase 2**: Playback Improvements (Timeline, Frame Step) - 3-4h
**Fase 3**: Events & Bookmarks (Search, Tags) - 3-4h
**Fase 4**: Export & Health (Progress, Alerts) - 2-3h
**Fase 5**: Notifications & Permissions (Complete modules) - 5-7h

---

**¿Empezamos?**
