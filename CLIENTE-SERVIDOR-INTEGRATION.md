# 🚀 Cliente-Servidor Integration - EMPEZAR AQUÍ

**Objetivo**: Conectar el Cliente React con el Servidor NestJS Real y verificar que todo funciona.

**Tiempo estimado**: 15 minutos

---

## ✅ Paso 1: Verificar que el Servidor está Corriendo

Abre una terminal y verifica que el backend está funcionando:

```bash
curl http://localhost:3000/api/v1/health
```

**Deberías ver**: `{"status":"healthy",...}`

Si NO ves esto, inicia el servidor primero:
```bash
cd server
npm run start:dev
```

---

## ✅ Paso 2: Ejecutar las Pruebas de Integración

Abre otra terminal en el directorio `client` y ejecuta:

```bash
cd client
npm run test:integration
```

**Qué hace este comando**:
- ✅ Verifica que el backend responde
- ✅ Verifica que la base de datos está conectada
- ✅ Intenta login con admin/admin123
- ✅ Obtiene el perfil del usuario
- ✅ Obtiene la lista de cámaras
- ✅ Verifica la documentación Swagger

**Resultado esperado**:
```
✅ Backend Health Check
✅ Database Connection
✅ User Login
✅ Get User Profile
✅ List Cameras
✅ Swagger API Documentation

🎉 All tests passed! Client-Server integration is working correctly.
```

Si todas las pruebas pasan, ¡felicidades! El cliente y servidor se están comunicando correctamente.

---

## ✅ Paso 3: Iniciar el Frontend

En una tercera terminal, inicia el cliente frontend:

```bash
cd client
npm run dev:server
```

**Deberías ver**:
```
VITE v4.5.0  ready in XXX ms
➜  Local:   http://localhost:5173/
```

---

## ✅ Paso 4: Acceder a la Aplicación

Abre tu navegador y ve a:

```
http://localhost:5173
```

Deberías ver la pantalla de login.

---

## ✅ Paso 5: Login con el Servidor Real

En la pantalla de login, ingresa:

| Campo | Valor |
|-------|-------|
| **Server** | `http://localhost:3000/api/v1` |
| **Username** | `admin` |
| **Password** | `admin123` |

Haz clic en "Sign In".

**Resultado esperado**:
- ✅ Serás redirigido al dashboard
- ✅ Sin errores de CORS en la consola
- ✅ Verás el nombre de usuario en la interfaz
- ✅ El token se guardará en localStorage

---

## ✅ Paso 6: Navegar por la Aplicación

Prueba hacer clic en cada pestaña:

- **Live View** - Grid de cámaras (vacío por ahora)
- **Playback** - Timeline para reproducción
- **Events** - Panel de eventos
- **Bookmarks** - Gestor de marcadores
- **Export** - Interfaz de exportación
- **Health** - Dashboard de salud del sistema
- **Settings** - Configuración de usuario

**Resultado esperado**:
- ✅ Todas las páginas cargan sin errores
- ✅ No hay errores 404
- ✅ La consola está limpia (F12)

---

## 🧪 Paso 7: Pruebas Manuales de API (Opcional)

Puedes probar los endpoints directamente usando Swagger:

1. Abre: **http://localhost:3000/api/docs**

2. Prueba los endpoints:
   - `POST /auth/login` - Login
   - `GET /auth/me` - Obtener perfil
   - `GET /cameras` - Listar cámaras
   - etc.

---

## 🆘 Si Algo Falla

### Error: "Backend is not accessible"

```bash
# Verifica que el backend esté corriendo
curl http://localhost:3000/api/v1/health

# Si falla, reinicia el backend
cd server && npm run start:dev
```

### Error: "Cannot login"

```bash
# Verifica la URL del servidor en la pantalla de login
# Debe ser: http://localhost:3000/api/v1

# Si sigue fallando, verifica el usuario admin existe:
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### Error: "Network Error" / "CORS Error"

Verifica que el frontend está en `http://localhost:5173` y el servidor está configurado para CORS.

```bash
# Verifica que ambos están corriendo:
# Frontend: http://localhost:5173
# Backend: http://localhost:3000
```

### Errores en la Consola (F12)

```bash
# Limpia caché del navegador
# Ctrl+Shift+Delete en Windows/Linux
# Cmd+Shift+Delete en Mac

# Luego recarga la página
```

---

## 📊 Guía de Testing Completa

Para una guía completa de testing con más detalles:

→ [CLIENT-SERVER-INTEGRATION.md](./CLIENT-SERVER-INTEGRATION.md)

---

## 🎉 ¡Listo!

Si completaste todos estos pasos sin errores, ¡tu cliente está correctamente conectado al servidor! 🎊

### Lo que conseguiste:
✅ Frontend React corriendo  
✅ Backend NestJS respondiendo  
✅ Autenticación funcionando  
✅ Comunicación cliente-servidor establecida  
✅ Todas las páginas navegables  

### Ahora puedes:
1. Crear nuevas cámaras vía API
2. Probar las funcionalidades avanzadas
3. Integrar características más complejas
4. Preparar para producción

---

## 📝 Resumen Rápido

| Componente | URL | Status |
|-----------|-----|--------|
| Frontend | http://localhost:5173 | ✅ Running |
| Backend | http://localhost:3000 | ✅ Running |
| API Docs | http://localhost:3000/api/docs | ✅ Available |
| Database | http://localhost:8080 | ✅ Running |

---

**Versión**: 0.1.0 | **Fecha**: Enero 2026 | **Status**: ✅ Listo para Testing
