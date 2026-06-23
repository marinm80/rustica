# Tech Spec: Dashboard de Administración Operacional de Rústica
**Slug**: admin-dashboard-frontend
**Fecha**: 2026-06-09
**Estado**: aprobado

## Contexto técnico heredado (hallazgos del código existente)
Antes de decidir el CÓMO, se auditó el plugin `rustica-system`. Estos hechos son vinculantes:

- Las apps (`MeseroApp`, `CocinaApp`, `ReservasApp`) ya operan en **modo headless**: si `window.RusticaConfig` no existe, resuelven la API y el token desde `localStorage`.
- Claves de `localStorage` que las apps **leen** (contrato de integración, no se pueden renombrar sin tocar las apps):
  - `rustica_token` — JWT Bearer.
  - `rustica_api_url` — URL base de WP **sin** `/rustica/v1` (las apps le anexan `/rustica/v1`). Ej.: `http://localhost:8080/wp-json`.
  - `rustica_user_role`, `rustica_es_gerente`, `rustica_is_staff`, `rustica_user_display_name`.
- Endpoint de login JWT: `POST {api_url}/jwt-auth/v1/token` → `{ token, user_display_name, ... }`.
- Endpoint de rol: `GET {api_url}/rustica/v1/auth/me` con `Authorization: Bearer` → `{ user_role, es_gerente, is_staff, ... }`.
- API operativa bajo `rustica/v1` (12+ rutas). Las apps anexan `/rustica/v1` a `rustica_api_url`.
- Stack instalado real: React 18.2, Vite 5.1, **Tailwind v3.4.1** (PostCSS + autoprefixer). El contexto mencionó v4; la base de código está en v3. El dashboard se alinea con **Tailwind v3** para máxima compatibilidad con las apps importadas y su markup `className` existente.

> **Implicación de diseño clave**: las apps importadas seguirán funcionando sin modificarlas si el dashboard escribe las mismas claves de `localStorage` antes de montarlas. No se requiere refactorizar las apps para inyectar token por props.

## Stack Definido
| Capa | Tecnología | Versión mínima |
|------|-----------|----------------|
| Frontend | React | 18.2 |
| Lenguaje | JavaScript (JSX) — sin TypeScript, para alinear con las apps existentes en JSX | ES2022 |
| Bundler / Dev server | Vite | 5.1 |
| CSS | Tailwind CSS v3 (PostCSS + autoprefixer) | 3.4 |
| Routing | React Router | 6.22 |
| State management | React Context + hooks (`AuthContext`). Sin Redux/Zustand: el estado global es solo la sesión | — |
| HTTP client | `fetch` nativo envuelto en un cliente `apiClient` propio (interceptor 401) | — |
| Test runner | Vitest | 1.4 |
| Testing React | @testing-library/react + @testing-library/jest-dom + jsdom | 14 / 6 |
| Mock de red | MSW (Mock Service Worker) | 2.x |
| E2E | Playwright | 1.42 |

## Specialist Assignments
- **Frontend**: `react-specialist` (responsable principal: routing, AuthContext, login, layout, guards)
- **Backend**: (ninguno) — la API WP ya existe; no se modifica el plugin en esta feature
- **E2E**: `e2e-specialist`
- **DevOps**: `devops-engineer` (solo si se formaliza pipeline de deploy estático; opcional en esta fase)

## Estructura de carpetas del proyecto `/admin-dashboard/`
```
admin-dashboard/
├── .env.example            # plantilla de variables (commiteada)
├── .env                    # local, NO commiteado (.gitignore)
├── index.html
├── package.json
├── vite.config.js          # alias hacia las apps del plugin + proxy dev
├── tailwind.config.js
├── postcss.config.js
├── playwright.config.js
├── vitest.config.js        # o sección "test" dentro de vite.config.js
├── public/
└── src/
    ├── main.jsx            # createRoot + <BrowserRouter> + <AuthProvider>
    ├── App.jsx             # definición de rutas
    ├── index.css           # @tailwind base/components/utilities
    ├── config/
    │   └── env.js          # lee import.meta.env.VITE_* y expone API base
    ├── auth/
    │   ├── AuthContext.jsx # provider: token, user, role, login(), logout()
    │   ├── useAuth.js
    │   └── session.js      # lee/escribe las claves localStorage (contrato apps)
    ├── api/
    │   └── apiClient.js    # fetch wrapper: inyecta Bearer, maneja 401 → logout
    ├── routes/
    │   ├── ProtectedRoute.jsx   # exige sesión
    │   └── RoleRoute.jsx        # exige rol permitido; si no, redirige/deniega
    ├── layout/
    │   ├── AppShell.jsx    # barra superior (nombre, rol, logout) + <Outlet/>
    │   └── TopBar.jsx
    ├── pages/
    │   ├── LoginPage.jsx
    │   ├── DashboardPage.jsx     # panel del gerente: tarjetas a las 3 apps
    │   ├── ComandasPage.jsx      # envuelve MeseroApp
    │   ├── CocinaPage.jsx        # envuelve CocinaApp
    │   ├── ReservasPage.jsx      # envuelve ReservasApp
    │   └── AccessDeniedPage.jsx  # "tu cuenta no tiene permisos operativos"
    └── test/
        ├── setup.js        # jest-dom, MSW server
        └── mocks/handlers.js
```

## Estrategia de reutilización de las apps existentes
**Decisión: importación directa vía alias de Vite (sin copiar, sin symlink, sin workspace).**

- Las apps viven en `wp-content/plugins/rustica-system/frontend/src/`. Vite puede importar fuera de su raíz declarando el directorio en `server.fs.allow` y un alias:
  ```js
  // vite.config.js
  resolve: {
    alias: {
      '@rustica-apps': path.resolve(__dirname, '../wp-content/plugins/rustica-system/frontend/src'),
    },
  },
  server: {
    fs: { allow: ['..'] },  // permitir leer fuera de /admin-dashboard
  }
  ```
- Uso: `import MeseroApp from '@rustica-apps/apps/MeseroApp'`.
- **Por qué no symlink**: frágil en Windows/WSL y rompe el `fs.allow`. **Por qué no monorepo workspace**: sobre-ingeniería; el plugin no es un paquete npm publicable y mezclar `node_modules` añade riesgo. **Por qué no copy**: duplica la fuente de verdad y desincroniza arreglos. El alias mantiene **una sola fuente de verdad** y refleja cambios al instante en dev.
- **Condición de funcionamiento**: las apps detectan headless por ausencia de `window.RusticaConfig`. El dashboard NO define `window.RusticaConfig`, así que las apps caen al camino `localStorage` automáticamente. El dashboard solo debe garantizar que `rustica_token` y `rustica_api_url` estén escritas antes de renderizar la página que monta una app.
- **Dependencias compartidas**: React debe ser único. El dashboard usa su propio React 18.2; las apps importadas usan ese mismo React (resuelto por el alias dentro del árbol de `/admin-dashboard/node_modules`). Vite dedup `react`/`react-dom` por defecto; se añade `resolve.dedupe: ['react','react-dom']` por seguridad.
- **Tailwind**: el `content` de `tailwind.config.js` del dashboard debe incluir las rutas de las apps importadas para no purgar sus clases:
  ```js
  content: [
    './index.html', './src/**/*.{js,jsx}',
    '../wp-content/plugins/rustica-system/frontend/src/**/*.{js,jsx}',
  ]
  ```

## Estrategia de autenticación (flujo JWT)
1. **Login** (`LoginPage` → `AuthContext.login()`):
   - `POST {API_BASE}/jwt-auth/v1/token` con `{ username, password }`.
   - Si OK → guardar `rustica_token`, `rustica_api_url` (= API_BASE sin `/rustica/v1`), `rustica_user_display_name`.
   - Luego `GET {API_BASE}/rustica/v1/auth/me` con Bearer → guardar `rustica_user_role`, `rustica_es_gerente`, `rustica_is_staff`.
2. **Almacenamiento**: `localStorage` (NO cookie/sessionStorage), porque es el **contrato existente** que las apps importadas ya leen. Cambiarlo obligaría a refactorizar las 3 apps. Riesgo XSS aceptado y mitigado por ser herramienta interna; documentado en DT-05.
3. **Inyección en requests**: el `apiClient` lee `rustica_token` y añade `Authorization: Bearer <token>` a toda petición del dashboard. Las apps importadas inyectan el header por su cuenta (mismo origen de token).
4. **Persistencia / rehidratación**: al cargar, `AuthProvider` lee `localStorage`; si hay `rustica_token`, considera sesión activa y rehidrata `user/role`. No hay refresh token (JWT WP caduca en 1h, decisión D del spec).
5. **Expiración / 401**: el `apiClient` intercepta cualquier respuesta `401/403 jwt_auth_*`; ejecuta `logout()` (limpia todas las claves) y redirige a `/login?expired=1` mostrando aviso "tu sesión expiró". Las apps importadas que reciban 401 también deben disparar este flujo; se expone un callback global `onUnauthorized` registrado por el dashboard (o las apps simplemente borran token y el guard del dashboard reacciona en la siguiente navegación). Camino mínimo: `AppShell` escucha el evento `storage`/un `window` event `rustica:unauthorized`.
6. **Autorización por rol (routing)**:
   - `mesero` → solo `/comandas`. Otras rutas → redirige a `/comandas`.
   - `cocina` → solo `/cocina`.
   - `gerente`/`administrator` (`es_gerente === '1'`) → `/dashboard` + acceso a `/comandas`, `/cocina`, `/reservas`.
   - `is_staff` falso → `/acceso-denegado`.
   - Redirección post-login según rol (criterio de aceptación del spec).

## Configuración de entorno
`.env` (Vite expone solo variables con prefijo `VITE_`):
```env
VITE_API_BASE=http://localhost:8080/wp-json   # URL base de WP REST (sin /rustica/v1). En prod: https://rocanegras.com/wp-json
```
- `config/env.js` lee `import.meta.env.VITE_API_BASE`. Este valor se escribe en `rustica_api_url` al hacer login (manteniendo el contrato de las apps).
- El `LoginScreen` interno del plugin permite editar la URL manualmente; en el dashboard la URL viene de `.env` y NO se muestra campo editable (UX más limpia para personal). Cambiar entorno = cambiar `.env` y rebuild, o `VITE_API_BASE` en el panel de deploy (Netlify/Vercel).

## Estrategia de build y dev
- **Comandos** (`package.json`):
  - `npm run dev` → `vite` (dev server, default puerto 5173)
  - `npm run build` → `vite build` (genera `dist/` estático)
  - `npm run preview` → `vite preview`
  - `npm test` → `vitest run`
  - `npm run test:watch` → `vitest`
  - `npm run test:e2e` → `playwright test`
- **Proxy dev para CORS**: WP corre en Docker `:8080` y el dashboard en `:5173` → distinto origen. Se configura proxy de Vite para que el dashboard llame rutas relativas y Vite reenvíe a WP:
  ```js
  server: {
    proxy: {
      '/wp-json': { target: 'http://localhost:8080', changeOrigin: true },
    },
  }
  ```
  En dev `VITE_API_BASE=/wp-json` (relativo → pasa por el proxy, sin CORS). En prod `VITE_API_BASE=https://.../wp-json` (CORS debe habilitarse en WP, o servir el `dist/` desde el mismo dominio Apache).
- **Deploy estático**: `dist/` servible desde Netlify, Vercel o Apache/Nginx. Por ser SPA con React Router en modo `BrowserRouter`, configurar fallback a `index.html` (Netlify `_redirects`, Apache `FallbackResource /index.html`). Alternativa sin config de servidor: `HashRouter`. **Decisión: `BrowserRouter`** (DT-06).

## Estrategia AI-TDD
- **Modo**: **parcial** — TDD estricto (RED→GREEN→REFACTOR) en la lógica de dominio del dashboard (AuthContext, guards de rol, apiClient/interceptor 401, redirección por rol); **test-after** para layout puramente visual (TopBar, tarjetas del panel) y para las apps importadas (ya existen y NO son objeto de esta feature).
- **Niveles activos**: `unit`, `integration` (componente + MSW), `e2e`.
- **Cobertura mínima**: **80%** sobre `src/auth/`, `src/api/`, `src/routes/` (lógica crítica). Global objetivo 70%.
- **Política de mocks**:
  - **NO** se levanta WordPress real en unit/integration: se mockea la red con **MSW** (handlers para `/jwt-auth/v1/token` y `/rustica/v1/auth/me`, incluyendo 200, 401, 403 y fallo de red).
  - Las apps importadas NO se testean aquí (out of scope); en tests del dashboard se **stubbea** cada app con un componente dummy vía alias de Vitest, para aislar el shell del routing.
  - **E2E (Playwright)**: corre contra el dashboard build + WP **real** en Docker `:8080` con usuarios de prueba sembrados (mesero, cocina, gerente). Único nivel que toca la base de datos real.
- **Comando tests backend**: `n/a` (no se modifica backend en esta feature)
- **Comando tests frontend**: `cd /home/marin/projects/rustica/admin-dashboard && npm test`
- **Comando E2E**: `cd /home/marin/projects/rustica/admin-dashboard && npm run test:e2e`

### Mapeo escenarios BDD → tests (guía para `@plan-builder`)
| Escenario spec | Nivel | Tipo |
|---|---|---|
| Ingreso exitoso mesero/cocina/gerente + redirección por rol | unit + e2e | AuthContext.login(), RoleRoute, flujo real |
| Credenciales incorrectas / campos vacíos / servicio no disponible | unit + integration | LoginPage + MSW (401, validación, network error) |
| Mesero/Cocina sin acceso a otras herramientas | unit | RoleRoute redirige |
| Gerente navega entre las 3 + recuerda última herramienta | integration | router + localStorage |
| Recarga con sesión vigente / apertura sin sesión | unit | rehidratación AuthProvider |
| Cierre de sesión voluntario | unit + e2e | logout() limpia claves |
| Sesión expirada (401 durante uso) → logout + aviso | integration | apiClient interceptor + MSW 401 |
| Apps operan con la sesión del workspace | e2e | app real lee localStorage |

## Dependencias Clave
### Frontend (runtime)
- `react@^18.2.0`, `react-dom@^18.2.0` — base UI (alineado con apps existentes)
- `react-router-dom@^6.22.0` — routing SPA y guards

### Frontend (dev / tooling)
- `vite@^5.1.0` — bundler y dev server
- `@vitejs/plugin-react@^4.2.1` — soporte JSX/Fast Refresh
- `tailwindcss@^3.4.1`, `postcss@^8.4.35`, `autoprefixer@^10.4.18` — estilos (mismas versiones que el plugin)
- `vitest@^1.4.0`, `jsdom@^24.0.0` — test runner unit/integration
- `@testing-library/react@^14.2.0`, `@testing-library/jest-dom@^6.4.0`, `@testing-library/user-event@^14.5.0` — testing de componentes
- `msw@^2.2.0` — mock de la API REST en tests
- `@playwright/test@^1.42.0` — E2E

## Variables de Entorno Requeridas
```env
VITE_API_BASE=/wp-json                          # dev: relativo (usa proxy Vite → Docker :8080)
# producción: VITE_API_BASE=https://rocanegras.com/wp-json
```

## Decisiones Técnicas
- **DT-01**: Reutilizar apps por **alias de Vite a la fuente del plugin**, no copy/symlink/workspace. Justificación: una sola fuente de verdad, refleja arreglos al instante, evita fragilidad de symlinks en WSL.
- **DT-02**: Sin TypeScript; JSX puro. Justificación: las apps importadas son JSX; introducir TS crearía fricción de tipos en la frontera y no aporta valor en esta feature acotada.
- **DT-03**: State global solo con React Context (`AuthContext`); sin Redux/Zustand. Justificación: el único estado compartido es la sesión.
- **DT-04**: `fetch` envuelto en `apiClient` propio con interceptor 401, en lugar de Axios. Justificación: las apps ya usan `fetch`; mantener una sola tecnología HTTP y cero dependencia extra.
- **DT-05**: Token en `localStorage` (no cookie httpOnly). Justificación: contrato existente que las apps importadas leen; cambiarlo obligaría a refactorizar 3 apps. Mitigación: herramienta interna, sin exposición pública, sin contenido de terceros embebido.
- **DT-06**: `BrowserRouter` + fallback a `index.html` en el servidor. Justificación: URLs limpias; el deploy estático lo soporta con una regla de rewrite.
- **DT-07**: Tailwind **v3** (no v4) y se incluye la ruta de las apps en `content`. Justificación: la base de código instalada es v3.4.1; evita purgar las clases de las apps importadas.
- **DT-08**: Proxy de Vite a `:8080` en dev con `VITE_API_BASE` relativo. Justificación: elimina CORS en desarrollo sin tocar la config de WP.
- **DT-09**: AI-TDD modo **parcial**, cobertura 80% en auth/api/routes. Justificación: concentra el rigor TDD donde está la lógica crítica (sesión, roles, expiración) y evita test-first sobre UI puramente visual y sobre código heredado fuera de alcance.
```
