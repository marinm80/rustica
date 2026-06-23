# Tasks: Dashboard de Administración Operacional de Rústica
**Slug**: admin-dashboard-frontend
**Fecha**: 2026-06-09
**Total tareas**: 16
**Proyecto nuevo**: `/home/marin/projects/rustica/admin-dashboard/`
**Comando de tests (unit/integration)**: `cd /home/marin/projects/rustica/admin-dashboard && npm test`
**Comando E2E**: `cd /home/marin/projects/rustica/admin-dashboard && npm run test:e2e`

> Todas las rutas de archivos son relativas a `/home/marin/projects/rustica/admin-dashboard/` salvo las del plugin (`../wp-content/...`).
> Las tareas T-02 a T-06 tocan autenticación/autorización → **requieren revisión de @security-auditor** antes de cerrar el ciclo.

---

## T-01: Scaffolding del proyecto (Vite + React + Tailwind + tooling de tests)
**Specialist**: react-specialist
**Estimación**: M
**Modo AI-TDD**: test-after (infraestructura; el "test" es que `npm test` arranque y `npm run dev` levante)
**Dependencias**: ninguna
**Escenarios BDD cubiertos**: ninguno directo (habilita todos)

### Contexto
Crear el proyecto base independiente del sitio público. Incluye config de Vite con alias a las apps del plugin, proxy dev a `:8080`, dedupe de React, Tailwind v3 con `content` extendido a las apps, y el arranque de Vitest. Sin esta tarea ninguna otra puede ejecutarse.

### Archivos a crear/modificar
- `package.json` — scripts (`dev`/`build`/`preview`/`test`/`test:watch`/`test:e2e`) y dependencias del tech-spec.
- `index.html` — `#root` + `<script type="module" src="/src/main.jsx">`.
- `vite.config.js` — alias `@rustica-apps`, `server.fs.allow: ['..']`, `proxy['/wp-json']` → `http://localhost:8080`, `resolve.dedupe: ['react','react-dom']`, sección `test` de Vitest (`environment: 'jsdom'`, `setupFiles`, alias de stubs).
- `tailwind.config.js` — `content` con `./index.html`, `./src/**/*.{js,jsx}` y `../wp-content/plugins/rustica-system/frontend/src/**/*.{js,jsx}` (DT-07).
- `postcss.config.js` — tailwindcss + autoprefixer.
- `.env.example` — `VITE_API_BASE=/wp-json` (commiteado).
- `.gitignore` — `node_modules`, `dist`, `.env`.
- `src/main.jsx` — `createRoot` + `<BrowserRouter>` + `<AuthProvider>` + `<App/>` (placeholder de App por ahora).
- `src/index.css` — `@tailwind base/components/utilities`.
- `src/config/env.js` — lee `import.meta.env.VITE_API_BASE`; expone `API_BASE`.

### Criterio de Done
- [ ] `npm install` completa sin errores.
- [ ] `npm test` arranca Vitest (aunque sin tests aún) sin error de config.
- [ ] `npm run dev` levanta el dev server en `:5173`.
- [ ] `npm run build` genera `dist/`.

### Sub-pasos AI-TDD (test-after)
1. Crear `package.json` con dependencias exactas del tech-spec (React 18.2, Vite 5.1, react-router-dom 6.22, tailwind 3.4.1, vitest 1.4, testing-library, msw 2.x, playwright 1.42).
2. Crear configs (`vite.config.js`, `tailwind.config.js`, `postcss.config.js`, `.env.example`, `.gitignore`, `index.html`, `src/index.css`, `src/main.jsx` placeholder, `src/config/env.js`).
3. Verificar: ejecuta `cd /home/marin/projects/rustica/admin-dashboard && npm install && npm test && npm run build` → todo verde.

---

## T-02: `session.js` — puerto de persistencia localStorage (contrato apps)
**Specialist**: react-specialist
**Estimación**: S
**Modo AI-TDD**: **strict** (RED→GREEN→REFACTOR)
**Dependencias**: T-01
**Escenarios BDD cubiertos**: base de "Recarga con sesión vigente", "Cierre de sesión voluverntario", "Las herramientas operan con la sesión del workspace"
**Requiere revisión de @security-auditor** (maneja token en localStorage)

### Contexto
Aislar el acceso a `localStorage` en un puerto único (read/write/clear) sobre las 6+1 claves del contrato vinculante (`rustica_token`, `rustica_api_url`, `rustica_user_display_name`, `rustica_user_role`, `rustica_es_gerente`, `rustica_is_staff`, `rustica_last_tool`). Las claves NO se pueden renombrar (las leen las apps importadas).

### Archivos a crear/modificar
- `src/auth/session.js` — funciones `readSession()`, `writeSession(partial)`, `clearSession()`, y helpers de claves individuales.
- `src/auth/session.test.js` — tests del puerto.

### Criterio de Done
- [ ] Tests pasan (`cd /home/marin/projects/rustica/admin-dashboard && npm test`).
- [ ] Cobertura >= 80% en `src/auth/session.js`.
- [ ] Los nombres de las 7 claves coinciden EXACTAMENTE con el contrato del tech-spec.

### Sub-pasos AI-TDD
1. RED: `src/auth/session.test.js`
   - Test: `writeSession` escribe las 6 claves de sesión + opcional `rustica_last_tool`; `readSession` devuelve el objeto rehidratado; `clearSession` borra TODAS las claves del contrato.
   - Ejecuta: `cd /home/marin/projects/rustica/admin-dashboard && npm test` → falla (módulo no existe).
2. GREEN: `src/auth/session.js`
   - Implementación mínima con `localStorage.setItem/getItem/removeItem` sobre la lista de claves.
   - Ejecuta: `cd /home/marin/projects/rustica/admin-dashboard && npm test` → pasa.
3. REFACTOR: extraer constante `KEYS` con los nombres del contrato; un solo punto de verdad para iterar en `clear`.

---

## T-03: `apiClient.js` — fetch wrapper con interceptor 401/403
**Specialist**: react-specialist
**Estimación**: M
**Modo AI-TDD**: **strict** (RED→GREEN→REFACTOR)
**Dependencias**: T-01, T-02
**Escenarios BDD cubiertos**: "Sesión expirada durante el uso", base de "Servicio del restaurante no disponible"
**Requiere revisión de @security-auditor** (inyección de Bearer, manejo de 401)

### Contexto
Cliente HTTP propio sobre `fetch` (DT-04). Lee `rustica_token` y `rustica_api_url` vía `session`, inyecta `Authorization: Bearer`, y al recibir `401/403` (`jwt_auth_*`) emite el evento global `rustica:unauthorized`. Es el punto único de expiración reactiva.

### Archivos a crear/modificar
- `src/api/apiClient.js` — `apiClient(path, options)`; inyecta Bearer; en 401/403 emite `window.dispatchEvent(new Event('rustica:unauthorized'))` y lanza error.
- `src/api/apiClient.test.js` — tests con MSW.
- `src/test/mocks/handlers.js` — handlers MSW para token y auth/me (200/401/403/network). (Si no existe aún, se crea aquí parcialmente y se completa en T-15.)
- `src/test/setup.js` — arranque del MSW server (si no existe, se crea aquí y se completa en T-15).

### Criterio de Done
- [ ] Tests pasan (`cd /home/marin/projects/rustica/admin-dashboard && npm test`).
- [ ] Cobertura >= 80% en `src/api/apiClient.js`.
- [ ] Un 401 emite `rustica:unauthorized` exactamente una vez.

### Sub-pasos AI-TDD
1. RED: `src/api/apiClient.test.js`
   - Test 1: petición OK añade header `Authorization: Bearer <rustica_token>`.
   - Test 2 (interceptor): respuesta MSW 401 → se dispara `rustica:unauthorized` (spy en `window`) y la promesa rechaza.
   - Ejecuta: `cd /home/marin/projects/rustica/admin-dashboard && npm test` → falla.
2. GREEN: `src/api/apiClient.js`
   - Construye URL desde `API_BASE`/`rustica_api_url`, inyecta Bearer, evalúa `res.status` 401/403 → dispatch evento + throw.
   - Ejecuta: `cd /home/marin/projects/rustica/admin-dashboard && npm test` → pasa.
3. REFACTOR: centralizar parseo de errores; nombre del evento como constante `UNAUTHORIZED_EVENT`.

---

## T-04: `AuthContext.jsx` + `useAuth.js` — sesión, login, logout, rehidratación
**Specialist**: react-specialist
**Estimación**: L
**Modo AI-TDD**: **strict** (RED→GREEN→REFACTOR)
**Dependencias**: T-02, T-03
**Escenarios BDD cubiertos**: "Ingreso exitoso de un mesero", "Ingreso exitoso de personal de cocina", "Ingreso exitoso de un gerente o administrador", "Recarga con sesión vigente", "Apertura sin sesión previa", "Cierre de sesión voluntario"
**Requiere revisión de @security-auditor** (núcleo de autenticación)

### Contexto
Provider del estado de sesión `{token, displayName, role, isManager, isStaff, isAuthenticated}`. `login()` orquesta `POST /jwt-auth/v1/token` + `GET /rustica/v1/auth/me` y persiste vía `session`. Rehidrata desde `localStorage` al montar. `logout()` ejecuta `session.clear`. Expone el destino de redirección por rol.

### Archivos a crear/modificar
- `src/auth/AuthContext.jsx` — `AuthProvider`, estado en memoria, `login()`, `logout()`, rehidratación en montaje, helper `resolveRoleRedirect(state)` (mesero→/comandas, cocina→/cocina, gerente/admin→/dashboard o `rustica_last_tool`, staff=0→/acceso-denegado).
- `src/auth/useAuth.js` — hook de consumo.
- `src/auth/AuthContext.test.jsx` — tests con MSW + `session`.

### Criterio de Done
- [ ] Tests pasan (`cd /home/marin/projects/rustica/admin-dashboard && npm test`).
- [ ] Cobertura >= 80% en `src/auth/AuthContext.jsx`.
- [ ] `login` mesero/cocina/gerente devuelve el destino correcto; `logout` limpia las 7 claves; rehidratación reconstruye el estado.

### Sub-pasos AI-TDD
1. RED: `src/auth/AuthContext.test.jsx`
   - `test('ingreso mesero redirige a /comandas')`, `test('ingreso cocina redirige a /cocina')`, `test('ingreso gerente redirige a /dashboard')`.
   - `test('rehidrata sesión desde localStorage')` (token presente → isAuthenticated true).
   - `test('sin token muestra estado no autenticado')`.
   - `test('logout limpia todas las claves')`.
   - Ejecuta: `cd /home/marin/projects/rustica/admin-dashboard && npm test` → falla.
2. GREEN: `src/auth/AuthContext.jsx` + `src/auth/useAuth.js`
   - Implementa provider, `login` (2 fetch vía `apiClient`), `logout`, rehidratación con `useEffect` inicial, `resolveRoleRedirect`.
   - Ejecuta: `cd /home/marin/projects/rustica/admin-dashboard && npm test` → pasa.
3. REFACTOR: extraer `resolveRoleRedirect` a función pura testeable; derivar `isManager`/`isStaff` de las claves string `"1"/"0"`.

---

## T-05: `ProtectedRoute.jsx` — guard de sesión
**Specialist**: react-specialist
**Estimación**: S
**Modo AI-TDD**: **strict** (RED→GREEN→REFACTOR)
**Dependencias**: T-04
**Escenarios BDD cubiertos**: "Apertura sin sesión previa"
**Requiere revisión de @security-auditor** (autorización)

### Contexto
Guard que exige sesión vigente. Sin `token` redirige a `/login`. Es UX, no seguridad real (la autoridad es el servidor), pero define el flujo de navegación.

### Archivos a crear/modificar
- `src/routes/ProtectedRoute.jsx` — lee `isAuthenticated` de `useAuth`; si falso `<Navigate to="/login" />`, si no `<Outlet/>`.
- `src/routes/ProtectedRoute.test.jsx` — tests.

### Criterio de Done
- [ ] Tests pasan (`cd /home/marin/projects/rustica/admin-dashboard && npm test`).
- [ ] Cobertura >= 80% en `src/routes/ProtectedRoute.jsx`.

### Sub-pasos AI-TDD
1. RED: `src/routes/ProtectedRoute.test.jsx`
   - `test('sin token muestra /login')`: sin sesión → render redirige a `/login`.
   - `test('con token renderiza el contenido protegido')`.
   - Ejecuta: `cd /home/marin/projects/rustica/admin-dashboard && npm test` → falla.
2. GREEN: `src/routes/ProtectedRoute.jsx` con `useAuth` + `<Navigate/>`/`<Outlet/>`.
   - Ejecuta: `cd /home/marin/projects/rustica/admin-dashboard && npm test` → pasa.
3. REFACTOR: limpiar; reutilizar el helper de redirección si aplica.

---

## T-06: `RoleRoute.jsx` — guard de autorización por rol
**Specialist**: react-specialist
**Estimación**: M
**Modo AI-TDD**: **strict** (RED→GREEN→REFACTOR)
**Dependencias**: T-04, T-05
**Escenarios BDD cubiertos**: "Mesero sin acceso a otras herramientas", "Cocina sin acceso a otras herramientas"
**Requiere revisión de @security-auditor** (autorización)

### Contexto
Guard que recibe los roles permitidos de una ruta y, si el rol del usuario no está permitido, redirige a su vista por rol (mesero→/comandas, cocina→/cocina). `is_staff === "0"` → `/acceso-denegado`. Gerente/admin pasa por las 3 herramientas.

### Archivos a crear/modificar
- `src/routes/RoleRoute.jsx` — `<RoleRoute allow={['mesero','gerente']}>`; usa `useAuth` + `resolveRoleRedirect`.
- `src/routes/RoleRoute.test.jsx` — tests.

### Criterio de Done
- [ ] Tests pasan (`cd /home/marin/projects/rustica/admin-dashboard && npm test`).
- [ ] Cobertura >= 80% en `src/routes/RoleRoute.jsx`.

### Sub-pasos AI-TDD
1. RED: `src/routes/RoleRoute.test.jsx`
   - `test('mesero en /cocina redirige a /comandas')`.
   - `test('cocina en /comandas redirige a /cocina')`.
   - `test('gerente accede a las tres herramientas')`.
   - `test('staff=0 redirige a /acceso-denegado')`.
   - Ejecuta: `cd /home/marin/projects/rustica/admin-dashboard && npm test` → falla.
2. GREEN: `src/routes/RoleRoute.jsx` con lógica de `allow` + redirección por rol.
   - Ejecuta: `cd /home/marin/projects/rustica/admin-dashboard && npm test` → pasa.
3. REFACTOR: reutilizar `resolveRoleRedirect` de T-04; evitar duplicar mapeo de roles.

---

## T-07: `App.jsx` — definición de rutas
**Specialist**: react-specialist
**Estimación**: M
**Modo AI-TDD**: test-after
**Dependencias**: T-05, T-06
**Escenarios BDD cubiertos**: estructura para "Gerente navega entre las tres herramientas", redirección por rol en `/` y `*`

### Contexto
Mapa de rutas de React Router: `/login` (pública), `/dashboard`, `/comandas`, `/cocina`, `/reservas` (Protected + Role), `/acceso-denegado` (Protected), `/` (redirige por rol), `*` → `/`. Envuelve las rutas protegidas en `AppShell`.

### Archivos a crear/modificar
- `src/App.jsx` — `<Routes>` con guards anidados y `AppShell` como layout de las protegidas.
- `src/App.test.jsx` — smoke test de renderizado de rutas con stubs.

### Criterio de Done
- [ ] Tests pasan (`cd /home/marin/projects/rustica/admin-dashboard && npm test`).
- [ ] Cada ruta del plan resuelve a su página/guard correcto.

### Sub-pasos AI-TDD (test-after)
1. Implementar `src/App.jsx` con la tabla de rutas del plan.
2. Escribir `src/App.test.jsx`: con sesión de cada rol, la ruta `/` resuelve al destino esperado; ruta desconocida → redirige.
3. Verificar: `cd /home/marin/projects/rustica/admin-dashboard && npm test` → verde.

---

## T-08: `TopBar.jsx` — barra superior (nombre, rol, navegación por rol, logout)
**Specialist**: react-specialist
**Estimación**: M
**Modo AI-TDD**: test-after (UI visual)
**Dependencias**: T-04
**Escenarios BDD cubiertos**: "Barra superior con datos de la persona"

### Contexto
Barra superior que muestra nombre y rol de la persona, navegación condicional por rol (solo el gerente ve enlaces a las 3 herramientas) y un botón de cerrar sesión siempre presente.

### Archivos a crear/modificar
- `src/layout/TopBar.jsx` — consume `useAuth`; render condicional de enlaces; botón logout llama `logout()`.
- `src/layout/TopBar.test.jsx` — test.

### Criterio de Done
- [ ] Tests pasan (`cd /home/marin/projects/rustica/admin-dashboard && npm test`).
- [ ] Muestra nombre, rol y botón logout; navegación visible solo según rol.

### Sub-pasos AI-TDD (test-after)
1. Implementar `src/layout/TopBar.jsx` con Tailwind v3.
2. Escribir `src/layout/TopBar.test.jsx`: `test('TopBar muestra nombre, rol y logout')`; gerente ve 3 enlaces, mesero ninguno extra; click en logout invoca `logout`.
3. Verificar: `cd /home/marin/projects/rustica/admin-dashboard && npm test` → verde.

---

## T-09: `AppShell.jsx` — layout + escucha de `rustica:unauthorized`
**Specialist**: react-specialist
**Estimación**: M
**Modo AI-TDD**: test-after, con assertion estricta del flujo 401 (integration)
**Dependencias**: T-08, T-03 (evento), T-04 (logout)
**Escenarios BDD cubiertos**: "Una herramienta detecta sesión inválida", soporte de "Sesión expirada durante el uso"

### Contexto
Contenedor de las rutas protegidas: `<TopBar/>` + `<Outlet/>`. Escucha el evento global `rustica:unauthorized`; al recibirlo ejecuta `logout()` y redirige a `/login?expired=1`.

### Archivos a crear/modificar
- `src/layout/AppShell.jsx` — `useEffect` que registra/limpia listener de `rustica:unauthorized`; al disparar → `logout()` + `navigate('/login?expired=1')`.
- `src/layout/AppShell.test.jsx` — test de integración del flujo del evento.

### Criterio de Done
- [ ] Tests pasan (`cd /home/marin/projects/rustica/admin-dashboard && npm test`).
- [ ] Disparar `rustica:unauthorized` ejecuta logout y navega a `/login?expired=1`.

### Sub-pasos AI-TDD
1. Implementar `src/layout/AppShell.jsx` (listener + layout).
2. Escribir `src/layout/AppShell.test.jsx`: `test('rustica:unauthorized dispara flujo de expiración')` → `window.dispatchEvent` del evento limpia sesión y redirige.
3. Verificar: `cd /home/marin/projects/rustica/admin-dashboard && npm test` → verde.

---

## T-10: `LoginPage.jsx` — formulario, validación y manejo de errores
**Specialist**: react-specialist
**Estimación**: L
**Modo AI-TDD**: test-after (con MSW para 401 y error de red)
**Dependencias**: T-04, T-07
**Escenarios BDD cubiertos**: "Credenciales incorrectas", "Campos vacíos al intentar ingresar", "Servicio del restaurante no disponible", soporte de "Recarga con sesión vigente" (si ya hay sesión, redirige)

### Contexto
Pantalla de ingreso con usuario/contraseña. Valida campos no vacíos antes de enviar. Llama `login()`; muestra mensaje claro en 401 (credenciales) y en error de red (reintentar). Lee `?expired=1` para mostrar aviso de sesión expirada. Sin campo editable de URL (viene de `.env`). Si ya hay sesión, redirige por rol.

### Archivos a crear/modificar
- `src/pages/LoginPage.jsx` — formulario controlado; validación; manejo de errores; lectura de query `expired`.
- `src/pages/LoginPage.test.jsx` — tests con MSW.

### Criterio de Done
- [ ] Tests pasan (`cd /home/marin/projects/rustica/admin-dashboard && npm test`).
- [ ] Campos vacíos bloquean el envío con aviso; 401 muestra mensaje sin iniciar sesión; error de red muestra reintentar; `?expired=1` muestra aviso.

### Sub-pasos AI-TDD (test-after con MSW)
1. Implementar `src/pages/LoginPage.jsx`.
2. Escribir `src/pages/LoginPage.test.jsx`:
   - `test('campos vacíos bloquean envío')` (unit, sin red).
   - `test('401 muestra mensaje y no inicia sesión')` (MSW 401).
   - `test('error de red muestra reintentar')` (MSW network error).
   - `test('?expired=1 muestra aviso de sesión expirada')`.
3. Verificar: `cd /home/marin/projects/rustica/admin-dashboard && npm test` → verde.

---

## T-11: `DashboardPage.jsx` — panel del gerente (3 tarjetas)
**Specialist**: react-specialist
**Estimación**: S
**Modo AI-TDD**: test-after (UI visual)
**Dependencias**: T-07
**Escenarios BDD cubiertos**: "Ingreso exitoso de un gerente o administrador" (destino), soporte de "Gerente navega entre las tres herramientas"

### Contexto
Panel general del gerente con 3 tarjetas que enlazan a `/comandas`, `/cocina`, `/reservas`. Sin métricas (decisión del spec).

### Archivos a crear/modificar
- `src/pages/DashboardPage.jsx` — 3 tarjetas-enlace con Tailwind.
- `src/pages/DashboardPage.test.jsx` — test.

### Criterio de Done
- [ ] Tests pasan (`cd /home/marin/projects/rustica/admin-dashboard && npm test`).
- [ ] Renderiza 3 tarjetas hacia las 3 rutas.

### Sub-pasos AI-TDD (test-after)
1. Implementar `src/pages/DashboardPage.jsx`.
2. Escribir test: existen 3 enlaces hacia `/comandas`, `/cocina`, `/reservas`.
3. Verificar: `cd /home/marin/projects/rustica/admin-dashboard && npm test` → verde.

---

## T-12: Páginas de apps — `ComandasPage`, `CocinaPage`, `ReservasPage`
**Specialist**: react-specialist
**Estimación**: M
**Modo AI-TDD**: test-after (con stubs de apps)
**Dependencias**: T-07, T-15 (stubs de apps para tests)
**Escenarios BDD cubiertos**: "Las herramientas operan con la sesión del workspace" (a nivel de montaje; el flujo real es E2E en T-16)

### Contexto
Tres páginas que envuelven las apps importadas (`@rustica-apps/apps/MeseroApp`, `CocinaApp`, `ReservasApp`). Cada página garantiza que `rustica_token` y `rustica_api_url` estén escritas en `localStorage` antes de montar la app (condición headless DT-01) y luego renderiza la app. En tests las apps se reemplazan por stubs vía alias de Vitest.

### Archivos a crear/modificar
- `src/pages/ComandasPage.jsx` — monta `MeseroApp`.
- `src/pages/CocinaPage.jsx` — monta `CocinaApp`.
- `src/pages/ReservasPage.jsx` — monta `ReservasApp`.
- `src/pages/AppPages.test.jsx` — test (con stubs): cada página monta su app y existe `rustica_token`/`rustica_api_url` en localStorage al montar.

### Criterio de Done
- [ ] Tests pasan (`cd /home/marin/projects/rustica/admin-dashboard && npm test`).
- [ ] Cada página renderiza su app (stub) y garantiza las claves del contrato.

### Sub-pasos AI-TDD (test-after)
1. Implementar las 3 páginas con import vía alias `@rustica-apps/*`.
2. Escribir `src/pages/AppPages.test.jsx` usando los stubs de T-15.
3. Verificar: `cd /home/marin/projects/rustica/admin-dashboard && npm test` → verde.

---

## T-13: `AccessDeniedPage.jsx` — sin permisos operativos
**Specialist**: react-specialist
**Estimación**: S
**Modo AI-TDD**: test-after (UI visual)
**Dependencias**: T-07
**Escenarios BDD cubiertos**: decisión "Rol sin permisos operativos" del spec

### Contexto
Pantalla para `is_staff === "0"`: mensaje "tu cuenta no tiene permisos operativos" y un único botón de cerrar sesión.

### Archivos a crear/modificar
- `src/pages/AccessDeniedPage.jsx` — mensaje + botón logout.
- `src/pages/AccessDeniedPage.test.jsx` — test.

### Criterio de Done
- [ ] Tests pasan (`cd /home/marin/projects/rustica/admin-dashboard && npm test`).
- [ ] Muestra el mensaje y el botón logout funcional.

### Sub-pasos AI-TDD (test-after)
1. Implementar `src/pages/AccessDeniedPage.jsx`.
2. Escribir test: presencia del mensaje y que el botón invoca `logout`.
3. Verificar: `cd /home/marin/projects/rustica/admin-dashboard && npm test` → verde.

---

## T-14: Test de integración del router — gerente navega y recuerda última herramienta
**Specialist**: react-specialist
**Estimación**: M
**Modo AI-TDD**: test-after (integration: router + localStorage + stubs)
**Dependencias**: T-07, T-11, T-12, T-15
**Escenarios BDD cubiertos**: "Gerente navega entre las tres herramientas"

### Contexto
Verifica el flujo de navegación del gerente entre dashboard y las 3 herramientas, y que la última herramienta visitada se persiste en `rustica_last_tool` para mejorar la UX al regresar.

### Archivos a crear/modificar
- `src/App.integration.test.jsx` — render del árbol completo con sesión de gerente y stubs.

### Criterio de Done
- [ ] Tests pasan (`cd /home/marin/projects/rustica/admin-dashboard && npm test`).
- [ ] `test('gerente navega y recuerda última herramienta')` verde.

### Sub-pasos AI-TDD (test-after)
1. Escribir `src/App.integration.test.jsx`: gerente entra a `/dashboard`, navega a `/cocina`, vuelve; `rustica_last_tool === 'cocina'`.
2. Si falta persistir `rustica_last_tool`, añadir la escritura en la página de app correspondiente (T-12).
3. Verificar: `cd /home/marin/projects/rustica/admin-dashboard && npm test` → verde.

---

## T-15: Infraestructura de tests — `setup.js`, `handlers.js`, `stubs/apps.jsx`
**Specialist**: react-specialist
**Estimación**: M
**Modo AI-TDD**: test-after (es la propia infraestructura de test)
**Dependencias**: T-01
**Escenarios BDD cubiertos**: habilita el mapeo BDD→tests completo (mocks MSW + stubs)

### Contexto
Consolida la infraestructura de tests que T-03/T-04 iniciaron parcialmente: `setup.js` (jest-dom + arranque/cierre del MSW server), `handlers.js` (token 200/401/network; auth/me 200 mesero/cocina/gerente y 403 sin staff) y `stubs/apps.jsx` (componentes dummy que reemplazan las apps importadas vía alias de Vitest en `vite.config.js`).

> Nota de orden: aunque T-03/T-04 necesitan handlers y setup mínimos, esta tarea los formaliza y completa. Si se prefiere, ejecutarla justo después de T-01; aquí se ubica como consolidación porque los stubs de apps los consumen T-12 y T-14.

### Archivos a crear/modificar
- `src/test/setup.js` — `@testing-library/jest-dom`; `beforeAll(server.listen)`, `afterEach(server.resetHandlers + localStorage.clear)`, `afterAll(server.close)`.
- `src/test/mocks/handlers.js` — handlers MSW completos.
- `src/test/stubs/apps.jsx` — `MeseroApp`/`CocinaApp`/`ReservasApp` dummy.
- `vite.config.js` — alias de Vitest que apunta `@rustica-apps/*` a los stubs en entorno de test (modificación).

### Criterio de Done
- [ ] Tests pasan (`cd /home/marin/projects/rustica/admin-dashboard && npm test`).
- [ ] MSW intercepta token y auth/me con todos los códigos requeridos; los stubs reemplazan las apps en tests.

### Sub-pasos AI-TDD (test-after)
1. Implementar `setup.js`, `handlers.js`, `stubs/apps.jsx` y el alias de test en `vite.config.js`.
2. Confirmar que los tests existentes (T-03/T-04) siguen verdes con la versión consolidada.
3. Verificar: `cd /home/marin/projects/rustica/admin-dashboard && npm test` → verde.

---

## T-16: E2E (Playwright) — login por rol, logout e integración de apps
**Specialist**: e2e-specialist
**Estimación**: L
**Modo AI-TDD**: test-after (E2E al final, contra WP real)
**Dependencias**: T-01..T-14 (dashboard funcional)
**Escenarios BDD cubiertos**: "Ingreso exitoso de un mesero" (e2e), "Cierre de sesión voluntario" (e2e), "Las herramientas operan con la sesión del workspace" (e2e)

### Contexto
Suite E2E contra el dashboard (build/dev) + WP **real** en Docker `:8080` con usuarios de prueba sembrados (mesero, cocina, gerente). Único nivel que toca la base de datos real. El seed de usuarios es precondición del entorno (fuera de esta feature).

### Archivos a crear/modificar
- `playwright.config.js` — baseURL del dashboard; webServer si aplica.
- `e2e/login.spec.js` — `test('ingreso mesero redirige a /comandas')` (flujo real).
- `e2e/logout.spec.js` — `test('logout limpia claves y vuelve a /login')`.
- `e2e/integracion-apps.spec.js` — `test('app real lee localStorage del dashboard')`.

### Criterio de Done
- [ ] E2E pasan (`cd /home/marin/projects/rustica/admin-dashboard && npm run test:e2e`).
- [ ] Login por rol, logout e integración de una app real verifican el flujo end-to-end.

### Sub-pasos AI-TDD (test-after)
1. Configurar `playwright.config.js` y precondiciones (WP `:8080` con usuarios sembrados).
2. Escribir las 3 specs E2E.
3. Verificar: `cd /home/marin/projects/rustica/admin-dashboard && npm run test:e2e` → verde.

---

## Resumen
| ID | Nombre | Specialist | Estim. | Modo AI-TDD | Dependencias |
|----|--------|-----------|--------|-------------|-------------|
| T-01 | Scaffolding del proyecto | react-specialist | M | after | - |
| T-02 | `session.js` (localStorage) | react-specialist | S | **strict** | T-01 |
| T-03 | `apiClient.js` (interceptor 401) | react-specialist | M | **strict** | T-01, T-02 |
| T-04 | `AuthContext` + `useAuth` | react-specialist | L | **strict** | T-02, T-03 |
| T-05 | `ProtectedRoute` | react-specialist | S | **strict** | T-04 |
| T-06 | `RoleRoute` | react-specialist | M | **strict** | T-04, T-05 |
| T-07 | `App.jsx` (rutas) | react-specialist | M | after | T-05, T-06 |
| T-08 | `TopBar` | react-specialist | M | after | T-04 |
| T-09 | `AppShell` (+ evento 401) | react-specialist | M | after | T-08, T-03, T-04 |
| T-10 | `LoginPage` | react-specialist | L | after | T-04, T-07 |
| T-11 | `DashboardPage` | react-specialist | S | after | T-07 |
| T-12 | Páginas de apps | react-specialist | M | after | T-07, T-15 |
| T-13 | `AccessDeniedPage` | react-specialist | S | after | T-07 |
| T-14 | Integración router (gerente) | react-specialist | M | after | T-07, T-11, T-12, T-15 |
| T-15 | Infra de tests (MSW + stubs) | react-specialist | M | after | T-01 |
| T-16 | E2E (Playwright) | e2e-specialist | L | after | T-01..T-14 |

### Notas de revisión de seguridad
- **T-02, T-03, T-04, T-05, T-06** tocan autenticación/autorización y manejo de token en `localStorage` → **requieren revisión de @security-auditor** antes de cerrar su ciclo (riesgo XSS aceptado y documentado en DT-05/D-05; los guards de cliente son UX, la autoridad real es el servidor).
