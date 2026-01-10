# ✅ Cambios Aplicados Directamente en Base de Datos

## 🎯 Cambios Realizados

Se actualizaron los modos de grabación directamente en la base de datos PostgreSQL:

### Cámaras Modificadas:
1. **Portones**: `motion_only` → `objects` ✅
2. **Cochera**: `always` → `motion_only` ✅

### Comando Ejecutado:
```sql
UPDATE cameras SET "recordingMode" = 'objects' WHERE name = 'Portones';
UPDATE cameras SET "recordingMode" = 'motion_only' WHERE name = 'Cochera';
```

**Resultado**:
```
UPDATE 1
UPDATE 1

                  id                  |   name   | recordingMode |  status
--------------------------------------+----------+---------------+---------
 92c67e9f-f7f2-4b69-bcb5-363f0807ecb7 | Portones | objects       | online
 cac5e615-c26e-4a99-a88f-a27566f631cf | Cochera  | motion_only   | online
```

---

## ✅ Verificación

Para ver los cambios en el frontend:

```bash
# 1. Abrir http://localhost:5173
# 2. Hard Refresh: Ctrl + Shift + R
# 3. Login: admin/admin123

# Opción A: Settings > Cameras
# - Portones debería mostrar badge "OBJETOS" (púrpura)
# - Cochera debería mostrar badge "MOVIMIENTO" (amarillo)

# Opción B: Live View > Sidebar
# - Portones → [OBJETOS]
# - Cochera → [MOVIMIENTO]
```

---

## ❌ Problema Pendiente: Error 500 en PUT /cameras/:id

### Síntomas:
- Al intentar editar una cámara desde el frontend, se produce error 500
- El modal no se cierra después de intentar guardar
- El error persiste incluso después de múltiples rebuilds

### Causa Raíz (Por Investigar):
El problema NO es con el `UpdateCameraDto` ya que:
1. ✅ El código fuente TypeScript tiene todos los campos necesarios
2. ✅ La base de datos acepta los cambios directamente
3. ✅ El ValidationPipe fue configurado con `whitelist: false`

**Posibles causas**:
1. **Problema con el compilado**: A pesar de hacer `--build`, Docker puede estar usando capas cacheadas viejas
2. **Problema con login/auth**: El endpoint `/auth/login` retorna 400, indicando un problema más profundo
3. **Problema con CORS o proxying**: Las peticiones pueden no estar llegando correctamente
4. **Problema con validación de enum**: El RecordingMode puede no estar validando correctamente

---

## 🔧 Pasos para Arreglar Definitivamente

### 1. Rebuild COMPLETO sin Caché
```bash
docker-compose down -v  # ⚠️ Borra volúmenes
docker system prune -a  # Limpia todo Docker
docker-compose build --no-cache
docker-compose up -d
```

### 2. Verificar que whitelist: false Esté Aplicado
```bash
# Ver el archivo compilado en el contenedor
docker exec nxvms-server cat /app/dist/main.js | grep -i "whitelist"

# Debería mostrar: whitelist: false
```

### 3. Habilitar Logs Detallados
En `server/src/cameras/cameras.controller.ts`, agregar logging:

```typescript
@Put(':id')
async updateCamera(
  @Param('id') cameraId: string,
  @Body() updateCameraDto: UpdateCameraDto,
  @CurrentUser() user: UserEntity,
) {
  console.log('[UpdateCamera] Received DTO:', JSON.stringify(updateCameraDto, null, 2));
  console.log('[UpdateCamera] Camera ID:', cameraId);
  
  try {
    const camera = await this.camerasService.updateCamera(cameraId, updateCameraDto, user.id);
    return { success: true, data: camera };
  } catch (error) {
    console.error('[UpdateCamera] Error:', error.message);
    console.error('[UpdateCamera] Stack:', error.stack);
    throw error;
  }
}
```

### 4. Verificar RecordingMode Enum
Asegurarse que el enum esté correctamente exportado y usado:

```typescript
// server/src/database/entities/recording-schedule.entity.ts
export enum RecordingMode {
  ALWAYS = 'always',
  MOTION_ONLY = 'motion_only',
  OBJECTS = 'objects',
  MOTION_LOW_RES = 'motion_low_res',
  DO_NOT_RECORD = 'do_not_record'
}
```

### 5. Revisar API Client
Verificar que el frontend esté enviando el formato correcto:

```typescript
// client/src/shared/api-client.ts
async updateCamera(cameraId: string, data: any): Promise<Camera> {
  console.log('[API Client] Update camera payload:', data);
  
  const response = await this.client.put<ApiResponse<{ camera: Camera }>>(
    `cameras/${cameraId}`,
    data
  );
  
  console.log('[API Client] Update camera response:', response.data);
  
  // ... resto del código
}
```

---

## 📊 Logs a Revisar

### Error del Frontend:
```javascript
PUT http://localhost:5173/api/v1/cameras/92c67e9f-f7f2-4b69-bcb5-363f0807ecb7 500
```

### Logs del Backend:
```bash
docker logs nxvms-server -f --tail 100
```

**Buscar**:
- Stack traces de excepciones
- Errores de validación
- Problemas con TypeORM
- Errores de sintaxis SQL

---

## 💡 Workaround Actual

Mientras se arregla el problema del frontend, se pueden hacer cambios directamente en la BD:

### Script SQL para Cambios Manuales:
```sql
-- Ver todas las cámaras y sus modos
SELECT id, name, "recordingMode", status FROM cameras;

-- Cambiar modo de grabación
UPDATE cameras SET "recordingMode" = 'objects' WHERE name = 'NombreCámara';

-- Valores válidos para recordingMode:
-- 'always', 'motion_only', 'objects', 'motion_low_res', 'do_not_record'
```

### Comando Docker:
```bash
# Crear script SQL
echo "UPDATE cameras SET \"recordingMode\" = 'objects' WHERE name = 'MiCamara';" > update.sql

# Copiar y ejecutar
docker cp update.sql nxvms-postgres:/tmp/
docker exec nxvms-postgres psql -U nxvms -d nxvms -f /tmp/update.sql
```

---

## 🚀 Estado Actual

- **Portones**: ✅ Modo cambiado a "Objetos"
- **Cochera**: ✅ Modo cambiado a "Movimiento"
- **Frontend (Settings)**: ❌ Error 500 al editar (pendiente fix)
- **Frontend (View)**: ✅ Debería mostrar badges correctos después de refresh
- **Base de Datos**: ✅ Valores actualizados correctamente

---

## 📝 Próximos Pasos

1. **Refrescar navegador** (Ctrl + Shift + R)
2. **Verificar** que los badges muestren los modos correctos
3. **Investigar** el error 500 con los pasos de debugging arriba
4. **Hacer rebuild completo** con `--no-cache` cuando haya tiempo
5. **Agregar logging** detallado en el controller

---

**Timestamp**: 2026-01-10 15:15  
**Método**: Actualización directa en PostgreSQL  
**Estado**: ✅ Cambios aplicados exitosamente  
**Pendiente**: Fix del error 500 en PUT endpoint
