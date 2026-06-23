# Plan Arquitectónico: Dashboard de Administración Operacional de Rústica
**Slug**: admin-dashboard-frontend
**Fecha**: 2026-06-09
**Estado**: aprobado

## Arquitectura General

SPA (Single Page Application) estática, independiente del sitio público de WordPress, que actúa como **espacio de trabajo (workspace) del personal**. La arquitectura es un **shell de aplicación cliente** (frontend-only) que:

- No tiene backend propio: consume la API REST ya existente del plugin `rustica-system` (`jwt-auth/v1` para login y `rustica/v1` para operación).
- Reutiliza las apps operativas existentes (`MeseroApp`, `CocinaApp`, `ReservasApp`) **por importación directa vía alias de Vite**, sin copiar ni refactorizarlas (DT-01).
- Aplica una arquitectura por capas con frontera hexagonal ligera: la **sesión** (dominio) está aislada en `src/auth/` y la **comunicación con el servicio** en `src/api/`, ambas inyectables y mockeables, separadas de las páginas y el layout (presentación).

El espacio de trabajo es **stateless en servidor**: toda la sesión vive en el cliente (`localStorage`), respetando el contrato que ya leen las apps importadas. La autenticación es JWT (WordPress JWT Auth), sin refresh token; la expiración se maneja de forma **reactiva** vía interceptor 401, no proactiva (no se almacena fecha de expiración).

Patrón de despliegue: build estático (`dist/`) servible desde Netlify/Vercel/Apache, con fallback SPA a `index.html` (BrowserRouter, DT-06).

## Estructura de Carpetas

```
admin-dashboard/
├── .env.example                # plantilla de variables (commiteada)
├── .env                        # local, NO commiteado (.gitignore)
├── .gitignore
├── index.html                  # punto de montaje #root + <script src=main.jsx>
├── package.json                # scripts: dev/build/preview/test/test:e2e
├── vite.config.js              # alias @rustica-apps, fs.allow, proxy /wp-json, dedupe react
├── tailwind.config.js          # content incluye rutas de las apps del plugin (DT-07)
├── postcss.config.js
├── playwright.config.js
├── vitest.config.js            # (o sección "test" en vite.config.js)
├── public/
└── src/
    ├── main.jsx                # createRoot + <BrowserRouter> + <AuthProvider> + <App/>
    ├── App.jsx                 # definición de rutas (públicas/protegidas/por rol)
    ├── index.css               # @tailwind base/components/utilities
    ├── config/
    │   └── env.js              # lee import.meta.env.VITE_API_BASE; expone API_BASE
    ├── auth/                    # === DOMINIO: sesión (cobertura ≥80%) ===
    │   ├── AuthContext.jsx     # provider: estado {token,user,role}; login(), logout(), rehidratación
    │   ├── useAuth.js          # hook de consumo del contexto
    │   └── session.js          # puerto de persistencia: read/write/clear de claves localStorage (contrato apps)
    ├── api/                     # === ADAPTADOR: red (cobertura ≥80%) ===
    │   └── apiClient.js        # fetch wrapper: inyecta Bearer; interceptor 401/403 → onUnauthorized
    ├── routes/                  # === DOMINIO: autorización (cobertura ≥80%) ===
    │   ├── ProtectedRoute.jsx  # exige sesión vigente; si no, → /login
    │   └── RoleRoute.jsx       # exige rol permitido; si no, redirige según rol
    ├── layout/
    │   ├── AppShell.jsx        # contenedor: <TopBar/> + <Outlet/>; escucha rustica:unauthorized
    │   └── TopBar.jsx          # nombre, rol, navegación condicional por rol, botón logout
    ├── pages/
    │   ├── LoginPage.jsx       # formulario usuario/contraseña; validación; errores; ?expired=1
    │   ├── DashboardPage.jsx   # panel gerente: 3 tarjetas → comandas/cocina/reservas
    │   ├── ComandasPage.jsx    # envuelve MeseroApp (garantiza localStorage antes de montar)
    │   ├── CocinaPage.jsx      # envuelve CocinaApp
    │   ├── ReservasPage.jsx    # envuelve ReservasApp
    │   └── AccessDeniedPage.jsx# "tu cuenta no tiene permisos operativos" + logout
    └── test/
        ├── setup.js            # jest-dom + arranque MSW server
        ├── mocks/
        │   └── handlers.js     # handlers MSW: token (200/401/network), auth/me (200/403)
        └── stubs/
            └── apps.jsx        # componentes dummy que reemplazan las apps importadas en unit/integration
```

## Modelo de Datos / Estado ✅ (aprobado por usuario)

> No existe base de datos propia en esta feature. El "modelo de datos" del dashboard es el **modelo de estado de sesión en el cliente**, persistido en `localStorage`. Estas claves son un **contrato vinculante** ya leído por las apps importadas (`MeseroApp`, `CocinaApp`, `ReservasApp`) y **no pueden renombrarse** sin modificar dichas apps.

### Colección: `localStorage` (claves de sesión)

| Clave | Tipo (string) | Origen | Restricciones | Descripción |
|-------|---------------|--------|---------------|-------------|
| `rustica_token` | string (JWT) | `POST /jwt-auth/v1/token` | requerido para sesión activa | JWT Bearer. Su presencia define "sesión activa". |
| `rustica_api_url` | string (URL) | `VITE_API_BASE` en login | requerido; **sin** sufijo `/rustica/v1` | URL base de WP REST. Las apps le anexan `/rustica/v1`. Ej.: `http://localhost:8080/wp-json`. |
| `rustica_user_display_name` | string | respuesta de `/jwt-auth/v1/token` | — | Nombre visible de la persona (TopBar). |
| `rustica_user_role` | string | `GET /rustica/v1/auth/me` | — | Rol crudo del usuario (p. ej. `mesero`, `cocina`, `administrator`). |
| `rustica_es_gerente` | string `"0"` \| `"1"` | `GET /rustica/v1/auth/me` | — | `"1"` ⇒ gerente/administrador (acceso a las 3 herramientas). |
| `rustica_is_staff` | string `"0"` \| `"1"` | `GET /rustica/v1/auth/me` | — | `"0"` ⇒ sin permisos operativos ⇒ Acceso Denegado. |
| `rustica_last_tool` | string (`comandas`\|`cocina`\|`reservas`) | escrita por el dashboard | opcional; solo aplica a gerente | Última herramienta visitada por el gerente; mejora UX al regresar (decisión spec). |

**Relaciones / invariantes:**
- `rustica_token` es la clave maestra: su ausencia ⇒ no hay sesión ⇒ se exige login.
- `rustica_token` y `rustica_api_url` **deben** estar escritas antes de montar cualquier página que renderice una app importada (condición de funcionamiento headless, DT-01).
- `rustica_es_gerente` y `rustica_is_staff` derivan reglas de autorización; no son editables por el cliente, se rehidratan desde `/auth/me`.
- **Sin `rustica_token_exp`**: la expiración del JWT (1h, config WP) NO se persiste ni se vigila proactivamente. Se detecta de forma **reactiva** cuando el servicio responde `401/403` (per-spec, sección de decisiones). Esto evita relojes desincronizados cliente/servidor y reduce la superficie de estado.

**Modelo en memoria (`AuthContext`):** se rehidrata desde las claves anteriores al cargar la app.

| Campo en estado | Derivado de | Descripción |
|-----------------|-------------|-------------|
| `token` | `rustica_token` | sesión activa si no es nulo |
| `displayName` | `rustica_user_display_name` | nombre para TopBar |
| `role` | `rustica_user_role` | rol crudo |
| `isManager` | `rustica_es_gerente === "1"` | acceso a las 3 herramientas |
| `isStaff` | `rustica_is_staff === "1"` | acceso operativo; si falso ⇒ Acceso Denegado |
| `isAuthenticated` | `Boolean(token)` | gate de `ProtectedRoute` |

## Rutas / Endpoints

### Rutas internas del dashboard (React Router)

| Ruta | Página | Guard | Roles permitidos | Descripción |
|------|--------|-------|------------------|-------------|
| `/login` | `LoginPage` | pública | — | Formulario de ingreso. Acepta `?expired=1` para mostrar aviso de sesión expirada. Si ya hay sesión, redirige según rol. |
| `/dashboard` | `DashboardPage` | Protected + Role | gerente/admin | Panel general con 3 tarjetas. |
| `/comandas` | `ComandasPage` (MeseroApp) | Protected + Role | mesero, gerente/admin | Herramienta de comandas. |
| `/cocina` | `CocinaPage` (CocinaApp) | Protected + Role | cocina, gerente/admin | Cola de cocina. |
| `/reservas` | `ReservasPage` (ReservasApp) | Protected + Role | gerente/admin | Reservaciones. |
| `/acceso-denegado` | `AccessDeniedPage` | Protected | staff = `"0"` | Sin permisos operativos; solo logout. |
| `/` | redirección | Protected | — | Redirige a la vista que corresponde al rol (post-login y al rehidratar). |
| `*` | redirección | — | — | Cualquier ruta desconocida → `/` (resuelve a la vista del rol o `/login`). |

**Redirección por rol (post-login y resolución de `/`):**
- `mesero` → `/comandas`
- `cocina` → `/cocina`
- `gerente`/`administrator` (`es_gerente === "1"`) → `/dashboard` (o `rustica_last_tool` si existe)
- `is_staff === "0"` → `/acceso-denegado`
- sin sesión → `/login`

### Endpoints externos consumidos (API WP existente — NO se modifican)

| Método | Ruta | Auth | Consumido por | Descripción |
|--------|------|------|---------------|-------------|
| POST | `{API_BASE}/jwt-auth/v1/token` | No (envía credenciales) | `AuthContext.login()` | Devuelve `{ token, user_display_name, ... }`. |
| GET | `{API_BASE}/rustica/v1/auth/me` | Bearer | `AuthContext.login()` / rehidratación | Devuelve `{ user_role, es_gerente, is_staff, ... }`. |
| (varias) | `{API_BASE}/rustica/v1/*` | Bearer | apps importadas | 12+ rutas operativas; las apps anexan `/rustica/v1` a `rustica_api_url`. |

## Decisiones Arquitectónicas (ADR-lite)

- **D-01: SPA estática frontend-only, sin backend propio** — **Contexto**: la API operativa y el login JWT ya existen en el plugin; esta feature solo aporta el shell de acceso y navegación. — **Consecuencias**: cero superficie de servidor que mantener; el deploy es un `dist/` estático; toda la lógica vive en el cliente y se prueba con MSW sin levantar WP.

- **D-02: Reutilización de las apps por alias de Vite a la fuente del plugin** (hereda DT-01) — **Contexto**: las apps viven en `wp-content/plugins/rustica-system/frontend/src/` y operan headless leyendo `localStorage`. — **Consecuencias**: una sola fuente de verdad; los arreglos se reflejan al instante; requiere `server.fs.allow: ['..']` y `resolve.dedupe: ['react','react-dom']`; el `content` de Tailwind debe incluir las rutas de las apps.

- **D-03: Estado global solo con React Context (`AuthContext`)** (hereda DT-03) — **Contexto**: el único estado compartido entre rutas es la sesión. — **Consecuencias**: sin Redux/Zustand; menor superficie y dependencias; el contexto es el punto único de `login`/`logout`/rehidratación.

- **D-04: `apiClient` propio sobre `fetch` con interceptor 401/403** (hereda DT-04) — **Contexto**: las apps ya usan `fetch`; mantener una sola tecnología HTTP. — **Consecuencias**: cero dependencia extra; el interceptor centraliza la expiración reactiva; se expone `onUnauthorized` / evento `rustica:unauthorized`.

- **D-05: Sesión en `localStorage`, expiración reactiva sin `rustica_token_exp`** (hereda DT-05 + decisión del spec) — **Contexto**: contrato existente leído por las apps; el JWT WP caduca en 1h sin refresh. — **Consecuencias**: no se vigila la expiración de forma proactiva ni se almacena fecha de caducidad; un `401/403` del servicio dispara `logout()` + redirección a `/login?expired=1`. Riesgo XSS aceptado por ser herramienta interna sin contenido de terceros embebido.

- **D-06: `BrowserRouter` con fallback a `index.html`** (hereda DT-06) — **Contexto**: URLs limpias para el personal. — **Consecuencias**: el servidor estático necesita una regla de rewrite (Netlify `_redirects`, Apache `FallbackResource /index.html`).

- **D-07: Tailwind v3 con `content` extendido a las apps del plugin** (hereda DT-07) — **Contexto**: la base instalada es v3.4.1 y las apps usan ese markup. — **Consecuencias**: evita purgar las clases de las apps importadas; alineación total de versiones.

- **D-08: Proxy de Vite a `:8080` en dev** (hereda DT-08) — **Contexto**: WP en Docker `:8080`, dashboard en `:5173`. — **Consecuencias**: en dev `VITE_API_BASE=/wp-json` (relativo) elimina CORS sin tocar WP; en prod requiere CORS habilitado o servir el `dist/` desde el mismo dominio.

- **D-09: Testabilidad y AI-TDD por capa**
  - **Puertos a inyectar (frontera hexagonal):**
    - `session` (`src/auth/session.js`): puerto de persistencia (read/write/clear de claves `localStorage`). Mockeable para probar `AuthContext` sin tocar el navegador.
    - `apiClient` (`src/api/apiClient.js`): puerto de salida hacia el servicio REST. Su red se intercepta con **MSW** en unit/integration.
    - `onUnauthorized` (callback/evento `rustica:unauthorized`): puerto de notificación de expiración, registrado por `AppShell`/`AuthContext`; permite probar el flujo 401→logout aislado.
    - apps importadas: reemplazadas por **stubs dummy** (`src/test/stubs/apps.jsx`) vía alias de Vitest para aislar el shell del routing.
  - **Mapeo BDD → tests** (en `admin-dashboard/src/**` y `admin-dashboard/e2e/**`):
    | Scenario (spec) | test() | Ubicación | Nivel |
    |---|---|---|---|
    | `Ingreso exitoso de un mesero` | `test('ingreso mesero redirige a /comandas')` | `src/auth/AuthContext.test.jsx` + `e2e/login.spec.js` | unit + e2e |
    | `Ingreso exitoso de personal de cocina` | `test('ingreso cocina redirige a /cocina')` | `src/auth/AuthContext.test.jsx` | unit |
    | `Ingreso exitoso de un gerente o administrador` | `test('ingreso gerente redirige a /dashboard')` | `src/auth/AuthContext.test.jsx` | unit |
    | `Credenciales incorrectas` | `test('401 muestra mensaje y no inicia sesión')` | `src/pages/LoginPage.test.jsx` (MSW 401) | integration |
    | `Campos vacíos al intentar ingresar` | `test('campos vacíos bloquean envío')` | `src/pages/LoginPage.test.jsx` | unit |
    | `Servicio del restaurante no disponible` | `test('error de red muestra reintentar')` | `src/pages/LoginPage.test.jsx` (MSW network error) | integration |
    | `Barra superior con datos de la persona` | `test('TopBar muestra nombre, rol y logout')` | `src/layout/TopBar.test.jsx` | unit |
    | `Mesero sin acceso a otras herramientas` | `test('mesero en /cocina redirige a /comandas')` | `src/routes/RoleRoute.test.jsx` | unit |
    | `Cocina sin acceso a otras herramientas` | `test('cocina en /comandas redirige a /cocina')` | `src/routes/RoleRoute.test.jsx` | unit |
    | `Gerente navega entre las tres herramientas` | `test('gerente navega y recuerda última herramienta')` | `src/App.integration.test.jsx` (router + localStorage) | integration |
    | `Recarga con sesión vigente` | `test('rehidrata sesión desde localStorage')` | `src/auth/AuthContext.test.jsx` | unit |
    | `Apertura sin sesión previa` | `test('sin token muestra /login')` | `src/routes/ProtectedRoute.test.jsx` | unit |
    | `Cierre de sesión voluntario` | `test('logout limpia todas las claves')` | `src/auth/AuthContext.test.jsx` + `e2e/logout.spec.js` | unit + e2e |
    | `Sesión expirada durante el uso` | `test('401 dispara logout y redirige con aviso')` | `src/api/apiClient.test.js` (MSW 401) | integration |
    | `Las herramientas operan con la sesión del workspace` | `test('app real lee localStorage del dashboard')` | `e2e/integracion-apps.spec.js` | e2e |
    | `Una herramienta detecta sesión inválida` | `test('rustica:unauthorized dispara flujo de expiración')` | `src/layout/AppShell.test.jsx` | integration |
  - **Comando único de CI:**
    ```bash
    cd /home/marin/projects/rustica/admin-dashboard && npm test && npm run test:e2e
    ```
    (unit+integration con Vitest, luego E2E con Playwright contra WP real en Docker `:8080`.)
  - **Estrategia de seeds/fixtures:**
    - **Unit/integration**: sin WordPress real. MSW provee handlers para `/jwt-auth/v1/token` (200, 401, network error) y `/rustica/v1/auth/me` (200 mesero/cocina/gerente, 403 sin staff). Fixtures de usuario como objetos en `src/test/mocks/handlers.js`. Las apps importadas se stubean.
    - **E2E**: usuarios de prueba sembrados en WP Docker `:8080` (mesero, cocina, gerente) — único nivel que toca la base de datos real. El seed se documenta como precondición del entorno E2E (script/WP-CLI fuera de esta feature).
    - **Cobertura mínima**: ≥80% en `src/auth/`, `src/api/`, `src/routes/`; objetivo global 70% (DT-09).

## Flujo de Datos

**Login:**
1. `LoginPage` valida campos no vacíos → `AuthContext.login(username, password)`.
2. `apiClient` → `POST {API_BASE}/jwt-auth/v1/token`. Si falla (401 → credenciales; network → servicio no disponible) se propaga error a `LoginPage` que muestra el mensaje; no se persiste nada.
3. Si OK: `session.write` guarda `rustica_token`, `rustica_api_url` (= `API_BASE`), `rustica_user_display_name`.
4. `apiClient` → `GET {API_BASE}/rustica/v1/auth/me` con Bearer → `session.write` de `rustica_user_role`, `rustica_es_gerente`, `rustica_is_staff`.
5. `AuthContext` actualiza estado en memoria → `App` redirige según rol.

**Rehidratación (recarga):** al montar, `AuthProvider` lee `localStorage` vía `session`; si hay `rustica_token`, marca sesión activa y reconstruye `user/role`; `App` resuelve `/` a la vista del rol. Sin token → `/login`.

**Operación (apps):** la página (`ComandasPage`/`CocinaPage`/`ReservasPage`) garantiza que `rustica_token` y `rustica_api_url` estén escritas y monta la app importada, que lee `localStorage` y opera contra `rustica/v1` con su propio `fetch`.

**Expiración reactiva:** cualquier `401/403` (del `apiClient` del dashboard o de una app importada) emite `rustica:unauthorized` → `AppShell`/`AuthContext` ejecuta `logout()` (`session.clear` de todas las claves) y redirige a `/login?expired=1` con aviso.

**Logout voluntario:** `TopBar` → `AuthContext.logout()` → `session.clear` → redirección a `/login`.

## Consideraciones de Seguridad

- **Token en `localStorage`** (D-05): riesgo XSS aceptado por ser herramienta interna sin contenido de terceros embebido; no hay scripts externos no confiables. Mitigación práctica: build propio sin dependencias de terceros en runtime más allá de React/Router.
- **Sin refresh token**: ventana de validez acotada a 1h por config WP; la expiración reactiva fuerza re-login.
- **Autorización en cliente es UX, no seguridad real**: los guards (`ProtectedRoute`/`RoleRoute`) ocultan/bloquean navegación, pero la **autoridad real es el servidor** — cada endpoint `rustica/v1` valida el JWT y el rol. Un mesero que forzara la URL `/cocina` vería la app, pero la API rechazaría las operaciones no autorizadas.
- **CORS**: en prod debe habilitarse en WP o servirse el `dist/` desde el mismo dominio (D-08); en dev se evita con el proxy de Vite.
- **`.env` no commiteado**; solo `.env.example` con `VITE_API_BASE` de plantilla.

## Dependencias entre Módulos

```
main.jsx
  └─ App.jsx (rutas)
       ├─ depende de routes/ (ProtectedRoute, RoleRoute)
       │     └─ dependen de auth/useAuth → auth/AuthContext
       ├─ layout/AppShell → TopBar → auth/useAuth
       └─ pages/
             ├─ LoginPage → auth/useAuth (login) → api/apiClient
             ├─ DashboardPage → (navegación interna)
             └─ Comandas/Cocina/ReservasPage → @rustica-apps/* (apps importadas)

auth/AuthContext
  ├─ depende de auth/session (puerto persistencia localStorage)
  └─ depende de api/apiClient (login, auth/me)

api/apiClient
  ├─ depende de auth/session (lee rustica_token, rustica_api_url)
  ├─ depende de config/env (API_BASE)
  └─ emite rustica:unauthorized (consumido por AppShell/AuthContext)

apps importadas (@rustica-apps/*)
  └─ dependen SOLO del contrato localStorage (no del código del dashboard)
```

- **Regla de dirección**: `pages`/`layout`/`routes` dependen de `auth` y `api`; `auth` y `api` no dependen de presentación. `config/env` es hoja (sin dependencias internas). Las apps importadas son una dependencia externa acoplada únicamente al contrato `localStorage`, nunca al código del dashboard.
