# 🔧 Guía Rápida: Cómo Ver los Cambios

## ❗ Problema
Los cambios no se ven después de `docker-compose up -d --build`

## ✅ Solución

### 1️⃣ **Limpiar Caché del Navegador**

**Opción A - Hard Refresh (Recomendado)**:
```
Windows: Ctrl + Shift + R
        o Ctrl + F5

Mac: Cmd + Shift + R
```

**Opción B - Abrir en Incógnito**:
```
Windows: Ctrl + Shift + N
Mac: Cmd + Shift + N
```

**Opción C - Limpiar Caché Manualmente**:
1. Abrir DevTools (F12)
2. Click derecho en el botón de refrescar
3. Seleccionar "Empty Cache and Hard Reload"

---

### 2️⃣ **Verificar que el Build se Hizo**

```powershell
# Ver timestamp del build del cliente
docker exec nxvms-client ls -la /usr/share/nginx/html/assets/

# Debería mostrar archivos recientes (hace pocos minutos)
```

---

### 3️⃣ **Forzar Detección de Cámaras Obsoletas**

El backend necesita cargar el resource tree para ejecutar el cleanup:

```powershell
# Opción 1: Abrir el navegador y navegar a
http://localhost:5173

# Opción 2: Llamar al API directamente (necesitas token)
# Esto fuerza la sincronización
curl http://localhost:3000/api/v1/cameras/tree
```

**O desde el navegador**:
1. Abrir http://localhost:5173
2. Login (admin/admin123)
3. El panel de recursos se carga automáticamente
4. Esto ejecuta `syncAllStatuses()` que limpia las cámaras obsoletas

---

### 4️⃣ **Ver Logs en Tiempo Real**

```powershell
# Ver logs del backend
docker logs -f nxvms-server

# Buscar específicamente los mensajes de cleanup
docker logs nxvms-server | Select-String -Pattern "FRIGATE"
```

**Qué buscar en los logs**:
```
[FRIGATE IMPORT] Processing X cameras from config...
[FRIGATE CLEANUP] Found 1 cameras in DB that no longer exist in Frigate config
[FRIGATE CLEANUP] Marking camera "Front Door" (...) as OFFLINE - not found in Frigate
```

---

## 🎨 Cambios que Deberías Ver

### En el Panel de Recursos (Izquierda):

1. **Colores de Servidor**:
   - Servidor Frigate: Icono **amarillo** 🟡
   - Servidor NX: Icono **celeste** 🔵

2. **Badge de Modo de Grabación** (debajo del nombre de cámara):
   ```
   📹 Cámara Principal
      [MOVIMIENTO]  rtsp://...
   ```

3. **Cámara "Front Door"**:
   - Estado: **Offline** (X roja) ❌
   - Antes estaba Online incorrectamente

---

## 🔍 Debugging Paso a Paso

### Paso 1: Verificar Archivos Source
```powershell
cd c:\Users\juan\DEVs\NXvms

# Verificar cambio de colores
Get-Content .\client\src\resources\resource-tree.tsx | Select-String -Pattern "text-yellow-500"

# Verificar cambio de cleanup
Get-Content .\server\src\cameras\cameras.service.ts | Select-String -Pattern "FRIGATE CLEANUP"
```

**Salida esperada**: Deberías ver las líneas que modificamos

### Paso 2: Verificar Build del Frontend
```powershell
# Ver cuando se construyó
docker exec nxvms-client ls -ltr /usr/share/nginx/html/assets/ | Select-Object -Last 5

# Debería mostrar archivos con timestamp reciente
```

### Paso 3: Ver Logs de Construcción
```powershell
# Ver los últimos logs del build
docker logs nxvms-client --tail 50
```

### Paso 4: Forzar Rebuild Completo
```powershell
# Si aún no se ven cambios, hacer rebuild sin caché
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

---

## 🚀 Acciones Rápidas

**Para ver cambios INMEDIATAMENTE**:

```powershell
# 1. Detener servicios
docker-compose down

# 2. Rebuild sin caché
docker-compose build --no-cache client server

# 3. Levantar servicios
docker-compose up -d

# 4. Abrir navegador en incógnito
# Windows: Ctrl + Shift + N
# Navegar a: http://localhost:5173

# 5. Login y verificar cambios
```

---

## 📋 Checklist de Verificación

- [ ] Hard refresh del navegador (Ctrl + Shift + R)
- [ ] Abrir en modo incógnito
- [ ] Ver logs del servidor (`docker logs nxvms-server`)
- [ ] Verificar que el build del cliente es reciente
- [ ] Login en la aplicación
- [ ] Ver panel de recursos
- [ ] Buscar servidor Frigate con icono amarillo
- [ ] Buscar badge de modo de grabación en cámaras
- [ ] Verificar que "Front Door" está offline
- [ ] Ver logs de FRIGATE CLEANUP

---

## 🔄 Si Aún No Funciona

```powershell
# Limpieza completa
docker-compose down -v  # ⚠️ Esto borra la BD
docker system prune -a --volumes  # ⚠️ Limpia todo Docker
docker-compose up -d --build

# Luego:
# 1. Abrir http://localhost:5173 en incógnito
# 2. Crear usuario admin nuevamente
# 3. Agregar servidor Frigate
# 4. Importar cámaras
# 5. Verificar cambios
```

---

## 💡 Tip Pro

**Para desarrollo futuro**, considera ejecutar el frontend en modo dev (sin Docker):

```powershell
cd client
npm install
npm run dev
```

Esto da hot reload instantáneo sin necesidad de rebuilds de Docker.

---

**¿Problema resuelto?** Si aún no ves los cambios después de hard refresh, avísame y debugueamos juntos! 🔧
