# Plan: Convertir SellMate a Multi-Tenant

## Resumen

Transformar SellMate de una app single-tenant a una plataforma SaaS multi-tenant donde cada negocio (tenant) tiene su propia conexion WhatsApp, productos, configuracion, agentes y conversaciones aisladas.

---

## Fase 1: Schema de Base de Datos + Migraciones

### Archivos a modificar:
- `server/db/schema.sql`
- `server/config/database.js`

### Cambios:

1. **Nueva tabla `tenants`**:
   - id, slug (URL-safe unique), name, owner_user_id, plan, active, created_at

2. **Agregar `tenant_id` a todas las tablas de datos**:
   - `users` → tenant_id + super_admin flag
   - `products` → tenant_id
   - `conversations` → tenant_id (reemplaza UNIQUE phone_number por UNIQUE(tenant_id, phone_number))
   - `whitelist` → tenant_id (reemplaza UNIQUE phone_number por UNIQUE(tenant_id, phone_number))
   - `mcp_servers` → tenant_id

3. **Convertir singletons a tenant-scoped**:
   - `business_info`: eliminar `CHECK (id = 1)`, agregar tenant_id con UNIQUE(tenant_id)
   - `settings`: eliminar `CHECK (id = 1)`, agregar tenant_id con UNIQUE(tenant_id)

4. **Migracion automatica** en database.js:
   - Detectar si ya migro (existe tabla tenants)
   - Si hay datos existentes: crear tenant "default", asignar tenant_id a todo
   - ALTER TABLE idempotentes con try/catch

---

## Fase 2: Sistema de Auth Multi-Tenant

### Archivos a modificar:
- `server/middleware/auth.js`
- `server/routes/auth.js`

### Cambios:

1. **JWT incluye tenant_id** y flag `superAdmin`
2. **Nuevo middleware `requireTenant`**: extrae tenant_id del JWT, lo pone en `req.tenantId`
3. **Nuevo middleware `superAdminOnly`**: solo super-admins
4. **Flujos de registro separados**:
   - `POST /api/auth/register` → primer super-admin (sin cambios, solo si 0 users)
   - `POST /api/auth/register-tenant` → crear nuevo tenant + usuario owner
   - Login retorna tenantId en la respuesta + token

---

## Fase 3: Rutas con Tenant Context

### Archivos a modificar:
- `server/index.js` (reestructurar rutas)
- `server/routes/products.js` (~4 queries)
- `server/routes/business.js` (~2 queries)
- `server/routes/settings.js` (~12 queries)
- `server/routes/conversations.js` (~5 queries)
- `server/routes/copilot.js` (~3 queries)

### Estrategia:
- **No cambiar URLs** del frontend. El tenant se resuelve desde el JWT via `req.tenantId`
- Agregar `requireTenant` middleware a todas las rutas protegidas
- Agregar `WHERE tenant_id = ?` a TODAS las queries
- Reemplazar `WHERE id = 1` por `WHERE tenant_id = ?` en settings y business_info
- Agregar `tenant_id` en todos los INSERT

### Nuevo archivo:
- `server/routes/admin.js` → CRUD de tenants para super-admin (listar, crear, desactivar, stats)

---

## Fase 4: WhatsApp Manager Per-Tenant

### Archivos a modificar:
- `server/services/whatsapp.js` → refactorizar completamente

### Cambios:

1. **Reemplazar singleton** `let sock = null` por clase `WhatsAppManager`:
   ```
   class WhatsAppManager {
     connections = new Map()  // tenantId → { sock, status, lastQr, reconnectAttempts }
   }
   ```

2. **Auth directories separados**: `auth_info_baileys_{tenantId}/`

3. **Todos los metodos reciben tenantId**:
   - `connectWhatsApp(tenantId)`
   - `disconnect(tenantId)`
   - `sendMessage(tenantId, phone, text)`
   - `sendPresence(tenantId, phone, presence)`
   - `sendReaction(tenantId, phone, key, emoji)`
   - `getStatus(tenantId)`
   - `getLastQr(tenantId)`

4. **Mensajes entrantes**: `messages.upsert` pasa `tenantId` a `handleIncomingMessage`

5. **Reconexion auto-start**: al iniciar servidor, conectar todos los tenants que tenian `whatsapp_connected = 1`

---

## Fase 5: Socket.IO con Tenant Rooms

### Archivos a modificar:
- `server/services/socket.js`

### Cambios:

1. **Al conectar**: cliente se une a room `tenant:{tenantId}` (extraido del JWT)
2. **Todos los emits** cambian de `io.emit(...)` a `io.to('tenant:' + tenantId).emit(...)`
3. **WhatsApp status/QR**: solo al room del tenant correspondiente
4. **message:send**: validar que conversation pertenece al tenant del socket

---

## Fase 6: Bot Handler Tenant-Aware

### Archivos a modificar:
- `server/services/bot.js` (~14 queries)

### Cambios:

1. **Nuevo parametro**: `handleIncomingMessage(tenantId, phoneNumber, ...)`
2. **Todas las queries** filtradas por tenant_id:
   - Settings: `WHERE tenant_id = ?`
   - Whitelist: `WHERE tenant_id = ? AND phone_number = ?`
   - Conversations: `WHERE tenant_id = ? AND phone_number = ?`
   - Products: `WHERE tenant_id = ? AND active = 1`
   - Business: `WHERE tenant_id = ?`
3. **INSERT conversation** incluye tenant_id
4. **Socket.IO emits** al room del tenant: `io.to('tenant:' + tenantId).emit(...)`

---

## Fase 7: MCP Manager Per-Tenant

### Archivos a modificar:
- `server/services/mcp.js`

### Cambios:

1. **Estructura anidada**: `Map<tenantId, Map<serverId, connection>>`
2. `initAll()` → `initAllForTenant(tenantId)` o iterar todos los tenants al startup
3. `getAllTools()` → `getAllToolsForTenant(tenantId)`
4. `executeTool()` → `executeTool(tenantId, name, args)`
5. `connectServer(server)` → `connectServer(tenantId, server)`

---

## Fase 8: Frontend Multi-Tenant

### Archivos a modificar:
- `client/src/stores/auth.js` → guardar tenantId
- `client/src/lib/api.js` → NO necesita cambios (tenant se resuelve por JWT en backend)
- `client/src/views/Login.vue` → agregar opcion de registro de tenant
- `client/src/router/index.js` → agregar ruta admin si super-admin
- `client/src/components/Sidebar.vue` → mostrar nombre del tenant

### Nuevos archivos:
- `client/src/views/RegisterTenant.vue` → formulario de registro para nuevos negocios
- `client/src/views/AdminTenants.vue` → panel super-admin para gestionar tenants (opcional)

---

## Orden de implementacion

Se implementara en este orden para poder probar incrementalmente:

1. **Fase 1** - Schema + migraciones (fundacion)
2. **Fase 2** - Auth multi-tenant (puede probar login/register)
3. **Fase 3** - Rutas tenant-scoped (toda la data aislada)
4. **Fase 6** - Bot handler (mensajes del bot aislados)
5. **Fase 4** - WhatsApp manager (multiples conexiones)
6. **Fase 5** - Socket.IO rooms (eventos aislados)
7. **Fase 7** - MCP per-tenant
8. **Fase 8** - Frontend (registro, sidebar, admin)

---

## Notas importantes

- **SQLite se mantiene** - no migramos a PostgreSQL
- **Baileys se mantiene** - el usuario conoce los riesgos
- **URLs del frontend no cambian** - el tenant se resuelve del JWT, no de la URL
- **Migracion retrocompatible** - datos existentes se asignan a un tenant "default"
- **~40+ queries SQL** necesitan actualizarse con tenant_id
