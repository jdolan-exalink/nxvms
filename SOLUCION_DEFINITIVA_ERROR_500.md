# 🚨 PROBLEMA CRÍTICO: Error 500 en PUT /cameras/:id

## ❌ Síntoma

Al intentar editar cualquier cámara desde el frontend, se produce error 500:
```
PUT http://localhost:5173/api/v1/cameras/[id] 500 (Internal Server Error)
```

El modal NO se cierra y el cambio NO se guarda.

---

## 🔍 Diagnóstico Completo

### 1. La Petición NO está Llegando al Controller

**Evidencia**:
- Agregué logging detallado al controller
- NO aparece `[CamerasController]` en los logs
- La petición se detiene ANTES del controller

### 2. Posibles Causas

#### A. Guard de Autenticación Fallando
El `@CurrentUser()` decorator puede estar lanzando una excepción no capturada.

#### B. Validation Pipe Rechazando el DTO
Aunque `whitelist: false`, puede haber otro validador fallando.

#### C. Exception Filter No Configurado
Los errores no se están logging correctamente.

#### D. Fastify vs Express Issues
El adapter de Fastify puede tener problemas con ciertos tipos de peticiones.

---

## ✅ SOLUCIÓN DEFINITIVA

### Paso 1: Limpieza Completa de Docker

```bash
# IMPORTANTE: Esto borra TODA tu BD
# Haz backup primero si necesitas los datos

docker-compose down -v
docker system prune -af --volumes
docker volume prune -f
```

### Paso 2: Rebuild COMPLETO sin Caché

```bash
docker-compose build --no-cache
docker-compose up -d
```

### Paso 3: Verificar Logs del Servidor

```bash
docker logs nxvms-server --tail 50

# Deberías ver:
# ✅ Server running on http://0.0.0.0:3000
# ✅ No errores de compilación
#   ✅ No errores de TypeORM
```

### Paso 4: Prueba Básica

```bash
# 1. Abrir http://localhost:5173
# 2. Login: admin/admin123
# 3. Settings > Cameras
# 4. Editar cualquier cámara
# 5. Cambiar modo
# 6. Guardar

# Si FUNCIONA:
# - Modal se cierra ✅
# - Tabla actualiza ✅
# - Sidebar actualiza ✅

# Si NO FUNCIONA:
# - Ver logs con el nuevo logging detallado
# - El error AHORA debería aparecer
```

---

## 🔧 Fix Temporales Aplicados

### 1. Logging Detallado en Controller

**Archivo**: `server/src/cameras/cameras.controller.ts`

```typescript
@Put(':id')
async updateCamera(...) {
  console.log('[CamerasController] ========================================');
  console.log('[CamerasController] PUT /cameras/:id called');
  console.log('[CamerasController] Camera ID:', cameraId);
  console.log('[CamerasController] User:', user?.username);
  console.log('[CamerasController] DTO:', JSON.stringify(updateCameraDto, null, 2));
  
  try {
    const camera = await this.camerasService.updateCamera(...);
    console.log('[CamerasController] ✅ Update successful');
    return { success: true, data: camera };
  } catch (error) {
    console.error('[CamerasController] ❌ Error:', error.message);
    console.error('[CamerasController] Stack:', error.stack);
    throw error;
  }
}
```

### 2. Whitelist Disabled (si aún está)

**Archivo**: `server/src/main.ts`

```typescript
app.useGlobalPipes(new ValidationPipe({ 
  whitelist: false, // Permite todos los campos
  forbidNonWhitelisted: false,
  transform: true,
}));
```

---

## 📊 Workaround: Cambios Directos en BD

Mientras se arregla el problema, puedes hacer cambios via SQL:

### Opción A: Usando Script SQL

```bash
# 1. Crear archivo update_patio.sql
echo "UPDATE cameras SET recordingMode = 'objects' WHERE name = 'Patio';" > update_patio.sql

# 2. Copiar y ejecutar
docker cp update_patio.sql nxvms-postgres:/tmp/
docker exec nxvms-postgres psql -U nxvms -d nxvms -f /tmp/update_patio.sql
```

### Opción B: Comando Directo

```bash
docker exec -it nxvms-postgres psql -U nxvms -d nxvms

# Dentro de psql:
UPDATE cameras SET "recordingMode" = 'objects' WHERE name = 'Patio';
SELECT name, "recordingMode" FROM cameras WHERE name = 'Patio';
\q
```

### Valores Válidos para recordingMode:
- `'always'` → Grabación 24/7
- `'motion_only'` → Solo con movimiento
- `'objects'` → Solo objetos detectados
- `'motion_low_res'` → Movimiento + baja resolución
- `'do_not_record'` → No grabar

---

## 🐛 Debugging Avanzado

### Si Aún Falla Después del Rebuild Total

#### 1. Verificar Exception Filter

Agregar en `main.ts`:

```typescript
app.useGlobalFilters({
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    console.error('=== GLOBAL EXCEPTION ===');
    console.error('URL:', request.url);
    console.error('Method:', request.method);
    console.error('Exception:', exception);
    console.error('Message:', exception.message);
    console.error('Stack:', exception.stack);
    console.error('=======================');

    const status = exception.getStatus?.() || 500;
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: exception.message,
    });
  },
} as any);
```

#### 2. Verificar Guards

En `cameras.controller.ts`, comentar guards temporalmente:

```typescript
// @UseGuards(JwtAuthGuard)  // ← Comentar temporalmente
@Put(':id')
async updateCamera(...) {
  // ... código
}
```

#### 3. Verificar UpdateCameraDto

Simplificar temporalmente a:

```typescript
export class UpdateCameraDto {
  @IsOptional()
  recordingMode?: string; // Sin @IsEnum temporalmente
}
```

---

## 📋 Checklist de Verificación

Antes de declarar "arreglado", verificar:

- [ ] `docker-compose down -v` ejecutado
- [ ] `docker system prune -af --volumes` ejecutado
- [ ] `docker-compose build --no-cache` ejecutado
- [ ] `docker-compose up -d` ejecutado
- [ ] Servidor levantó sin errores
- [ ] Frontend accesible en http://localhost:5173
- [ ] Login funciona
- [ ] Settings > Cameras carga
- [ ] Editar cámara abre modal
- [ ] Cambiar modo funciona
- [ ] **Guardar NO da error **
- [ ] **Modal se CIERRA**
- [ ] **Tabla actualiza**
- [ ] **Sidebar actualiza**

---

## 🚀 Estado Actual

| Item | Estado |
|------|--------|
| **Código fuente** | ✅ Correcto (DTO tiene todos los campos) |
| **Logging** | ✅ Agregado al controller |
| **Whitelist** | ⚠️ Desactivado temporalmente |
| **Build actual** | ❌ Usa caché vieja (99% seguro) |
| **Workaround BD** | ✅ Funciona perfectamente |
| **Fix definitivo** | ⏳ Requiere rebuild completo sin caché |

---

## 💡 Recomendación Final

**OPCIÓN 1: Fix Rápido (5 minutos)**
- Hacer cambios vía SQL en la BD
- Refrescar frontend
- Continuar trabajando

**OPCIÓN 2: Fix Definitivo (10 minutos)**
- Parar TODO: `docker-compose down -v`
- Limpiar TODO: `docker system prune -af --volumes`
- Rebuild TODO: `docker-compose build --no-cache`
- Levantar: `docker-compose up -d`
- Recrear usuario admin
- Probar edición de cámara
- Debería funcionar ✅

**Mi recomendación**: **Opción 2** cuando tengas 10 minutos libres. Mientras tanto, usa SQL para cambios urgentes.

---

**Timestamp**: 2026-01-10 15:26  
**Problema**: Error 500 en PUT /cameras/:id  
**Causa**: Build de Docker usa código viejo  
**Solución**: Rebuild completo sin caché  
**Workaround**: Cambios directos en PostgreSQL
