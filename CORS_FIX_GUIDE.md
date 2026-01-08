# Guía de Solución: CORS y Acceso Remoto

## El Problema

Cuando intentas acceder desde una IP diferente (como `10.1.1.174:5173`), el navegador bloquea las solicitudes con este error:

```
Access-Control-Allow-Origin header contains multiple values 
'http://localhost:5173,http://localhost:3000,http://localhost', 
but only one is allowed.
```

## ¿Por qué sucede?

1. **Mismatch de IP**: El cliente intenta conectar a `localhost:3000` desde la IP `10.1.1.174`, que no es localhost
2. **CORS Incorrecto**: La configuración anterior tenía un string de valores separados por comas que no se parseaba correctamente

## La Solución (3 pasos)

### Paso 1: Descargar los cambios en el servidor Linux

```bash
cd /root/nxvms
git pull origin main
```

### Paso 2: Reconstruir y reiniciar

```bash
docker compose down
docker compose build
docker compose up -d
```

### Paso 3: Acceder correctamente

**Opción A - Auto-detección (Recomendado)** ✅

El cliente ahora detecta automáticamente tu IP y se conecta al servidor en la misma IP:
- Accede desde: `http://10.1.1.174:5173`
- Se conecta automáticamente a: `http://10.1.1.174:3000/api/v1`

**Opción B - Configuración Manual**

Si necesitas cambiar el servidor manualmente:
1. Abre las DevTools (F12) en el navegador
2. Ve a la Console
3. Ejecuta:
   ```javascript
   // Establecer servidor personalizado
   localStorage.setItem('nxvms_server_url', 'http://10.1.1.174:3000/api/v1');
   
   // Recargar página
   location.reload();
   
   // Para limpiar y volver a auto-detección:
   localStorage.removeItem('nxvms_server_url');
   ```

## Cambios Técnicos

### En el servidor (server/src/main.ts):
```typescript
// Ahora soporta:
// - Wildcard: CORS_ORIGIN=*
// - Array: CORS_ORIGIN=http://localhost:5173,http://10.1.1.174:5173
// - Single: CORS_ORIGIN=http://localhost:5173
```

### En el cliente (client/src/shared/server-config.ts):
```typescript
// Auto-detecta la IP del cliente y usa la misma para el servidor
// Si accedes desde 10.1.1.174:5173
// → Conecta automáticamente a http://10.1.1.174:3000/api/v1
```

## Verificar que funciona

### Test 1: Desde la consola del navegador

```javascript
fetch('http://10.1.1.174:3000/api/v1/health')
  .then(r => r.json())
  .then(d => console.log(d))
```

Deberías ver:
```json
{
  "status": "UP",
  "uptime": "...",
  "memory": {...},
  "camera": {...}
}
```

### Test 2: Ver logs del servidor

```bash
docker compose logs -f server | grep -i cors
```

Deberías ver:
```
5. CORS enabled for: *
```

### Test 3: Intentar login

1. Abre `http://10.1.1.174:5173` en el navegador
2. Intenta hacer login
3. Abre DevTools → Network tab
4. Busca la request a `/auth/login`
5. En la sección "Response Headers" deberías ver:
   ```
   access-control-allow-origin: http://10.1.1.174:5173
   ```

## Si aún no funciona

### A. Verificar que el servidor está corriendo

```bash
docker compose ps
# Deberías ver 3 servicios HEALTHY
```

### B. Verificar CORS configuration

```bash
docker compose config | grep CORS_ORIGIN
# Deberías ver: CORS_ORIGIN: '*'
```

### C. Ver logs completos

```bash
docker compose logs server | tail -20
```

### D. Test manual con curl

```bash
curl -i -X OPTIONS http://10.1.1.174:3000/api/v1/auth/login \
  -H "Origin: http://10.1.1.174:5173" \
  -H "Access-Control-Request-Method: POST"
```

Deberías ver el header: `access-control-allow-origin: http://10.1.1.174:5173`

## Resumen de cambios en este fix

| Archivo | Cambio |
|---------|--------|
| `server/src/main.ts` | Manejo mejorado de CORS (wildcard, array, single) |
| `docker-compose.yml` | `CORS_ORIGIN` por defecto es `*` (permite todos) |
| `client/src/shared/server-config.ts` | Auto-detección de IP del cliente |
| `client/src/settings/server-settings.tsx` | UI para cambiar servidor manualmente (nuevo) |
| `.env.example` | Documentación mejorada del CORS |

## Próximos pasos

1. Descargar cambios: `git pull`
2. Reconstruir: `docker compose build`
3. Reiniciar: `docker compose up -d`
4. Acceder desde: `http://10.1.1.174:5173`
5. El cliente se conectará automáticamente a `http://10.1.1.174:3000/api/v1`

¡Listo! 🚀
