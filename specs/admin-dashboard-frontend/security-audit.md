# Security Audit: admin-dashboard — Superficie de Autenticación y Autorización
**Fecha**: 2026-06-09
**Auditor**: @security-auditor
**Veredicto**: ✅ Aprobado con observaciones menores

## Superficie Auditada
- `src/auth/session.js` — contrato localStorage (read/write/clear)
- `src/auth/AuthContext.jsx` — login atómico JWT, logout, rehidratación, resolución de redirect
- `src/api/apiClient.js` — fetch wrapper, inyección Bearer, interceptor 401/403
- `src/routes/ProtectedRoute.jsx` — guard de sesión (UX)
- `src/routes/RoleRoute.jsx` — guard de autorización por rol (UX)
- `src/pages/LoginPage.jsx` — formulario de login
- Contexto adicional revisado: `App.jsx` (tabla de rutas), `AppShell.jsx` (listener `rustica:unauthorized`), `TopBar.jsx` (render de `displayName`/rol), `config/env.js`, páginas que escriben `lastTool`.

## Modelo de confianza asumido
- La autoridad de autorización real es el servidor WordPress, que valida JWT + rol en cada endpoint. Los guards del cliente son exclusivamente UX (declarado por el equipo y confirmado en código).
- D-05/DT-05: JWT en `localStorage` es un riesgo XSS **aceptado y documentado**. No se reporta como hallazgo nuevo. Las observaciones de abajo se centran en **reducir la superficie XSS y los caminos de fuga**, no en re-litigar la decisión de almacenamiento.

## Respuestas a las preguntas clave

### 1. ¿El `login()` es atómico? — SÍ, correcto
El flujo persiste `token`/`apiUrl`/`displayName`, luego llama `/auth/me`. Si `/auth/me` falla (red o HTTP error vía `apiClient`), el `catch` ejecuta `clearSession()` y lanza error sin despachar `LOGIN`. El estado de Redux nunca queda "authenticated" con una sesión a medias y el `localStorage` queda limpio. Atomicidad correcta.

Observación menor (BAJO, no bloqueante): existe una **ventana de inconsistencia temporal** entre `writeSession({ token, ... })` (línea 77) y el `clearSession()` del catch (línea 87). Durante esa ventana hay un token válido en `localStorage`. Si una pestaña paralela rehidrata o un componente lee la sesión en ese instante, podría observar un token sin rol. En la práctica el `login()` es síncrono respecto al usuario y la ventana es de milisegundos; el impacto es teórico. Mitigación opcional: mantener token/displayName en variables locales y escribir todo el `writeSession` recién después de validar `/auth/me`.

### 2. ¿`apiClient` inyecta el token de forma segura? — SÍ
- El token se inyecta como `headers['Authorization'] = \`Bearer ${token}\``. No hay riesgo de **header injection (CRLF)** porque la API `fetch`/`Headers` del navegador rechaza valores con `\r`/`\n`; no se construyen headers crudos por concatenación de strings sobre un canal de texto.
- El token proviene de la respuesta del servidor JWT, no de input directo del usuario.
- `path` se concatena a `base` para formar la URL. **Todos los call sites usan literales hardcodeados** (`'/rustica/v1/auth/me'` es el único uso encontrado); no hay input del usuario fluyendo a `path`. Se mantiene como nota de mantenimiento: no introducir `apiClient(userControlledPath)` sin validación.

### 3. ¿Los guards son bypass-ables desde el cliente? — SÍ, por diseño (aceptable)
`ProtectedRoute` y `RoleRoute` leen estado derivado de `localStorage`, que el usuario controla totalmente (puede editar `rustica_user_role`, `rustica_es_gerente`, `rustica_is_staff`). Un usuario puede forzar el render de cualquier página cliente. **Esto es aceptable únicamente porque el servidor WP es la autoridad** y revalida JWT+rol en cada endpoint. Confirmado que los guards no toman decisiones de seguridad server-side. Riesgo residual: si algún endpoint futuro confiara en el rol enviado por el cliente en lugar de derivarlo del JWT server-side, esto se convertiría en escalada de privilegios. Recomendación: documentar explícitamente en el contrato de API que el servidor NUNCA debe confiar en claims de rol provenientes del cliente.

### 4. ¿Riesgo de XSS más allá del localStorage? — BAJO, controlado
- `displayName`, `role` y demás datos de la API se renderizan vía interpolación JSX (`{user?.displayName}` en `TopBar.jsx`), que **auto-escapa** por defecto en React. No es un sink de XSS.
- **No hay uso de `dangerouslySetInnerHTML` ni `innerHTML`** en todo el código auditado (grep limpio).
- Las apps importadas (`@rustica-apps/apps/*` — MeseroApp, CocinaApp, ReservasApp) **no fueron auditadas en este pase** (están fuera de `src/` del dashboard, son el contrato heredado). Dado que D-05 acepta XSS basándose en la ausencia de sinks peligrosos en el bundle, **cualquier `dangerouslySetInnerHTML` dentro de esas apps reabriría el riesgo de robo de token**. Recomendación: auditar esas apps en un pase separado para confirmar la premisa de D-05.

### 5. ¿El interceptor 401/403 fuga token o datos? — NO
- En 401/403, despacha el evento `rustica:unauthorized` y lanza `Error("Unauthorized: <status>")`. No incluye el token ni el cuerpo de respuesta en el mensaje. `AppShell` reacciona haciendo `logout()` (limpia sesión) y redirige a `/login?expired=1`. Camino de error limpio.
- En error de red, lanza `Error(\`Network error: ${networkError.message}\`)`. El mensaje nativo de error de red del navegador no contiene el token. Sin fuga.
- En `login()`, los `catch` traducen a mensajes genéricos; `LoginPage` muestra solo "Credenciales incorrectas" / "No fue posible conectar". No se exponen stack traces ni detalles del backend al usuario.

## Hallazgos de Seguridad

### 🚫 Críticos (VETO)
Ninguno.

### ⚠️ Altos
Ninguno en el scope auditado.

### 🔶 Medios
| CVSSv3 | Vulnerabilidad | Archivo | Línea | CWE |
|--------|----------------|---------|-------|-----|
| 4.8 | `apiUrl` se lee de `localStorage` (controlable por el atacante en un XSS o por una pestaña previa) y se usa como base de la URL de `fetch`, incluyendo el endpoint de login `jwt-auth/v1/token` al que se envían credenciales. Un atacante con control de `rustica_api_url` podría redirigir credenciales/token a un host arbitrario (exfiltración) | `AuthContext.jsx` / `apiClient.js` | 57, 8-9 | CWE-601 / CWE-20 |

Detalle: `login()` toma `readSession().apiUrl ?? API_BASE`. Si `rustica_api_url` ya contiene un valor malicioso (sembrado por un XSS previo, otra pestaña, o el contrato heredado), las credenciales del siguiente login se POSTean a ese origen. Bajo el modelo de amenaza de D-05 (XSS aceptado), esto **amplifica** el impacto del XSS de robo de token a robo de credenciales en claro. Mitigación recomendada: validar `apiUrl` contra una allowlist de orígenes conocidos (o usar siempre `API_BASE` para el endpoint de autenticación, ignorando el valor persistido). En despliegues donde `VITE_API_BASE` es relativo (`/wp-json`, mismo origen), forzar el default elimina el vector.

### 💡 Bajos / Mejoras
| Hallazgo | Recomendación |
|----------|---------------|
| Ventana de inconsistencia en `login()` (token persistido antes de validar `/auth/me`) | Persistir todo el `writeSession` solo tras validar `/auth/me`; mantener token en variable local mientras tanto |
| `resolveRedirectFor` usa `s.lastTool` interpolado en una ruta (`\`/${s.lastTool}\``) | Ya hay allowlist (`validTools.includes`) que neutraliza open-redirect interno; mantener esa validación. Sin riesgo actual |
| Sin rate limiting visible en cliente para login | El rate limiting debe vivir en el servidor WP (login/JWT). Confirmar que el endpoint `jwt-auth/v1/token` tiene throttling server-side |
| Apps importadas `@rustica-apps/*` fuera de scope | Auditar por separado para validar la premisa de "sin sinks XSS" que sostiene D-05 |

## CVEs en Dependencias
Dependencias de runtime: `react ^18.2.0`, `react-dom ^18.2.0`, `react-router-dom ^6.22.0`. No se ejecutó `npm install`/lockfile en este entorno; revisión por superficie de versión:

| Paquete | Versión declarada | Observación |
|---------|-------------------|-------------|
| react / react-dom | ^18.2.0 | Sin CVEs críticos conocidos en la rama 18.x para uso de render estándar |
| react-router-dom | ^6.22.0 | Recomendado fijar/actualizar dentro de 6.x; han existido avisos de seguridad en 6.x posteriores (ej. cache poisoning / spoofing en versiones específicas). Acción: ejecutar `npm audit` con el lockfile real |

Acción requerida (no bloqueante para esta superficie): ejecutar `npm audit` / `npm audit fix` contra el `package-lock.json` real y revisar avisos de `react-router-dom`. El árbol de devDependencies (vite, vitest, playwright, msw) no se despliega a producción.

## Resumen de Headers HTTP
Los headers de seguridad son responsabilidad del servidor que sirve el bundle (Apache / WP), no del código React auditado. No verificables desde este scope.

| Header | Estado | Observación |
|--------|--------|-------------|
| Content-Security-Policy | ❓ No verificable aquí | **Crítico para mitigar D-05**: una CSP estricta (sin `unsafe-inline`, `connect-src` allowlist) reduce drásticamente el impacto del XSS aceptado y del hallazgo MEDIO de `apiUrl`. Verificar en config Apache/WP |
| Strict-Transport-Security | ❓ No verificable aquí | Verificar en servidor |
| X-Content-Type-Options | ❓ No verificable aquí | Debe ser `nosniff` |
| X-Frame-Options / frame-ancestors | ❓ No verificable aquí | Recomendado para evitar clickjacking del panel |

## Recomendaciones Priorizadas
1. **[MEDIO]** Validar/forzar el origen de `apiUrl` para el endpoint de autenticación. La forma más simple: usar siempre `API_BASE` en el POST a `jwt-auth/v1/token` (no derivarlo de `localStorage`), o validar contra allowlist de orígenes.
2. **[MEDIO/Infra]** Desplegar una **CSP estricta** en el servidor. Es la mitigación compensatoria más fuerte para el riesgo XSS aceptado (D-05) y reduce el hallazgo de exfiltración de credenciales vía `connect-src`.
3. **[BAJO]** Hacer el `writeSession` del token diferido hasta después de validar `/auth/me` (cerrar la ventana de inconsistencia).
4. **[BAJO]** Ejecutar `npm audit` contra el lockfile real y revisar avisos de `react-router-dom`.
5. **[BAJO]** Auditar las apps `@rustica-apps/*` para confirmar ausencia de sinks XSS (`dangerouslySetInnerHTML`), validando la premisa de D-05.
6. **[Contrato]** Documentar que el servidor WP NUNCA debe confiar en claims de rol enviados por el cliente; el rol debe derivarse del JWT verificado server-side.

## Decisión de Merge
**APROBADO** (con observaciones menores).

La superficie de autenticación/autorización del dashboard está bien diseñada: login atómico correcto, sin header injection, sin sinks XSS en el código auditado, interceptor 401/403 sin fugas, y un modelo de confianza coherente donde el servidor es la autoridad. No hay hallazgos críticos ni altos que justifiquen veto.

El único hallazgo de nivel MEDIO (`apiUrl` desde `localStorage` usado en el endpoint de login) y la dependencia de una CSP server-side son condiciones recomendadas para endurecer, pero no bloquean el merge dado el modelo de amenaza declarado (herramienta interna). Se recomienda abordar la recomendación #1 y #2 antes del despliegue a producción.
