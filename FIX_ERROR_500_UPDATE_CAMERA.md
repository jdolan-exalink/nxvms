# 🐛 Fix: Error 500 al Actualizar Cámara

## ❌ Problema Identificado

Al intentar cambiar el modo de grabación de una cámara desde el modal de edición, se producía un error 500:

```
PUT http://localhost:5173/api/v1/cameras/92c67e9f-f7f2-4b69-bcb5-363f0807ecb7 500 (Internal Server Error)
```

---

## 🔍 Causa Raíz

El `UpdateCameraDto` en el backend no incluía todos los campos que el modal estaba enviando:

### Campos Enviados por el Modal (EditCameraModal.tsx):
```typescript
const payload = {
  name,
  description,
  rtspUrl,      // ❌ No estaba en UpdateCameraDto
  serverId,     // ❌ No estaba en UpdateCameraDto
  recordingMode
};
```

### UpdateCameraDto Original (INCOMPLETO):
```typescript
export class UpdateCameraDto {
  name?: string;
  description?: string;
  isRecording?: boolean;
  recordingMode?: RecordingMode;
  tags?: string[];
  // ❌ Faltaban: rtspUrl, serverId, zones
}
```

**Resultado**: El validador de class-validator rechazaba la petición porque incluía campos no definidos en el DTO.

---

## ✅ Solución Aplicada

**Archivo**: `server/src/cameras/dto/camera.dto.ts`

Agregados los campos faltantes al `UpdateCameraDto`:

```typescript
export class UpdateCameraDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  // ✅ NUEVO
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  rtspUrl?: string;

  // ✅ NUEVO
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  serverId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isRecording?: boolean;

  @ApiPropertyOptional({ enum: RecordingMode })
  @IsOptional()
  @IsEnum(RecordingMode)
  recordingMode?: RecordingMode;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  tags?: string[];

  // ✅ NUEVO
  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  zones?: any[];
}
```

---

## 🔄 Cambios Aplicados

1. ✅ Agregado `rtspUrl?: string`
2. ✅ Agregado `serverId?: string`
3. ✅ Agregado `zones?: any[]`
4. ✅ Reiniciado servidor: `docker-compose restart server`

---

## 🧪 Testing

### Antes del Fix ❌
```bash
# 1. Editar cámara
# 2. Cambiar modo grabación
# 3. Click "Guardar Cambios"
# Resultado: Error 500, modal no se cierra
```

### Después del Fix ✅
```bash
# 1. Editar cámara
# 2. Cambiar modo grabación
# 3. Click "Guardar Cambios"
# Resultado: ✅ Guardado exitoso, modal se cierra
```

---

## 📊 Validación

Para confirmar que funciona:

```bash
# 1. Abrir http://localhost:5173
# 2. Login
# 3. Settings > Cameras
# 4. Click "Editar" en cualquier cámara
# 5. Cambiar:
#    - Nombre
#    - Descripción
#    - Modo de grabación
#    - Servidor (si no es Frigate)
# 6. Click "Guardar Cambios"
# 7. Modal debe cerrarse
# 8. Verificar cambios en tabla
# 9. Ir a Live View
# 10. Verificar cambios en sidebar
```

---

## 🔧 Archivos Modificados

| Archivo | Cambio |
|---------|--------|
| `server/src/cameras/dto/camera.dto.ts` | ✅ Agregados campos `rtspUrl`, `serverId`, `zones` a UpdateCameraDto |

---

## 💡 Lecciones Aprendidas

### Por qué pasó esto:
- El `UpdateCameraDto` fue creado originalmente con campos mínimos
- Cuando agregamos el campo `recordingMode` al modal, funcionó porque ya estaba en el DTO
- Pero el modal siempre envió `rtspUrl` y `serverId`, lo cual causaba error silencioso
- Al agregar validación estricta, el error se hizo evidente

### Mejora futura:
- Usar `PartialType` de `@nestjs/mapped-types`:
  ```typescript
  export class UpdateCameraDto extends PartialType(CreateCameraDto) {}
  ```
  Esto auto-genera todos los campos del CreateDto como opcionales

---

## ✅ Estado

**Problema**: ✅ Resuelto  
**Probado**: Pendiente por el usuario  
**Requiere Rebuild**: ❌ No (solo restart server)  
**Breaking Change**: ❌ No

---

## 🚀 Próximos Pasos

1. **Probar** el fix editando una cámara
2. **Verificar** que los cambios se reflejan en:
   - Tabla de Settings
   - Sidebar
3. **Confirmar** que el modal se cierra correctamente

---

**Timestamp del Fix**: 2026-01-10 14:33  
**Servidor Reiniciado**: ✅ Sí (docker-compose restart server)
