# Code Review: Dashboard de Administración Operacional de Rústica
**Fecha**: 2026-06-09
**Revisor**: @code-reviewer
**Veredicto**: ✅ Apto con observaciones

## Resumen Ejecutivo
La implementación del shell de cliente (`admin-dashboard/`) sigue fielmente el plan y la tech-spec: capas de dominio (`auth/`, `routes/`) y adaptador de red (`api/`) están aisladas de la presentación, la sesión respeta el contrato `localStorage` heredado, la expiración es reactiva vía evento `rustica:unauthorized`, y la suite pasa (46/46 tests). No se encontraron vulnerabilidades nuevas más allá del riesgo XSS ya aceptado y documentado (D-05/DT-05). Hay observaciones menores de robustez y consistencia, ninguna bloqueante.

## Hallazgos

### 🚫 Críticos (bloquean el merge)
Ninguno.

No hay SQL, deserialización del lado servidor ni plantillas HTML server-side en este proyecto (es SPA estática que consume el JWT de WordPress). Las superficies OWASP server-side (A01/A03/A05/A08/A10) recaen en el plugin `rustica-system`, fuera del alcance de esta feature.

### ⚠️ Importantes (deben resolverse antes del deploy)
| # | Archivo | Línea | Problema | Categoría |
|---|---------|-------|----------|-----------|
| 1 | `src/auth/AuthContext.jsx` | 56-68 | `login()` usa `fetch` directo en lugar del `apiClient`. El POST a `/jwt-auth/v1/token` no pasa por la frontera hexagonal definida en D-09 (`apiClient` es el único puerto de salida). Es intencional (login no lleva Bearer y un 401 aquí NO debe disparar `rustica:unauthorized`/logout global), pero rompe la regla de "una sola tecnología HTTP" y duplica el manejo de errores de red. Recomendación: extraer un método del cliente (p. ej. `apiClient(path, { skipAuthRedirect: true })`) para mantener un único punto de fetch sin emitir el evento de expiración en el login. | Arquitectura / Mantenibilidad |
| 2 | `src/auth/AuthContext.jsx` | 70-75 | Si `GET /rustica/v1/auth/me` devuelve 401/403 *después* de que el token ya fue persistido (línea 68), el `apiClient` emite `rustica:unauthorized` y lanza, pero `rustica_token`/`rustica_api_url`/`displayName` quedan escritos en `localStorage`. El login propaga el error a `LoginPage` (que muestra "Credenciales incorrectas", mensaje engañoso para este caso) dejando una sesión parcial corrupta. Recomendación: envolver `auth/me` en try/catch que haga `clearSession()` antes de re-lanzar, garantizando atomicidad del login. | Robustez / Integridad de estado |
| 3 | `src/api/apiClient.js` / `src/auth/AuthContext.jsx` | — | Errores de red exponen el mensaje crudo del navegador (`Network error: ${networkError.message}`, `HTTP error: ${response.status}`). En el login `LoginPage` lo filtra por la subcadena `'Network'`/`'fetch'`; este acoplamiento por string-matching es frágil (un cambio de wording rompe la clasificación de "servicio no disponible" vs "credenciales"). Recomendación: usar tipos/códigos de error en vez de inspeccionar `message`. | Calidad / Mantenibilidad |

### 💡 Sugerencias (mejoras opcionales)
| # | Archivo | Sugerencia |
|---|---------|------------|
| 1 | `src/pages/ComandasPage.jsx` | Importa `useAuth` y desestructura `user` pero no lo usa (lee `esGerente` vía `readSession()` en su lugar). Inconsistente con `CocinaPage`/`ReservasPage` que sí usan `user.isManager`. Unificar a `user?.isManager` y eliminar el import/lectura redundante. |
| 2 | `src/auth/session.js` (`writeSession`) | `localStorage.setItem` coacciona a string; si algún campo llega como `null` se guarda el literal `"null"`. Hoy `auth/me` siempre devuelve strings, pero conviene validar/normalizar `value != null` (actualmente solo filtra `=== undefined`). |
| 3 | `src/routes/RoleRoute.jsx` y `src/auth/AuthContext.jsx` (`resolveRedirectFor`) | La lógica de redirección por rol está duplicada (`getRedirect` vs `resolveRedirectFor`). Extraer a una sola función compartida reduce el riesgo de divergencia futura. |
| 4 | `src/api/apiClient.js` | Para peticiones `GET` se envía `Content-Type: application/json` sin body. Inofensivo, pero conviene omitirlo cuando no hay cuerpo. |
| 5 | `src/auth/AuthContext.jsx` (login) | El interpolado `${apiUrl}/jwt-auth/v1/token` no normaliza barras finales; si `rustica_api_url` llegara con `/` final produciría `//jwt-auth`. Hoy el valor viene de `.env` sin barra, pero un guard (`.replace(/\/$/, '')`) lo blinda. |
| 6 | Tests | Warnings de `act(...)` no envuelto en `LoginPage.test.jsx` (actualización de estado tras `await login`). No falla, pero conviene envolver para evitar falsos verdes futuros. |

## Evaluación por categoría

**🔒 Seguridad (OWASP)**
- A01 (Access Control): los guards de cliente (`ProtectedRoute`/`RoleRoute`) son UX, no autoridad — correcto y documentado (D-09). La autoridad real es el servidor WP. Verificado: `ProtectedRoute` respeta el estado `loading` (no parpadea hacia `/login` antes de rehidratar). `RoleRoute` deniega correctamente por `isStaff` y por rol.
- A02 (Cryptographic Failures): no se manejan secretos ni hashing en cliente; el JWT lo emite WP.
- A03 (Injection): sin SQL ni `dangerouslySetInnerHTML`; todo el render es JSX escapado por React. Sin riesgo de XSS por inyección de datos de la API.
- A05 (Misconfiguration): `.env` correctamente en `.gitignore` y NO trackeado por git; solo `.env.example` (plantilla sin secretos). `VITE_API_BASE` no contiene credenciales.
- A07 (Auth Failures): sin protección contra fuerza bruta en cliente (correcto — es responsabilidad del servidor WP). Expiración reactiva 401/403 → logout + `/login?expired=1` implementada y testeada.
- A09 (Logging): no se loggean datos sensibles (no hay `console.log` de token/credenciales en la ruta crítica).
- **Riesgo XSS (token en `localStorage`)**: aceptado y documentado (D-05/DT-05) por contrato heredado de las apps importadas y por ser herramienta interna sin contenido de terceros. No es un hallazgo nuevo.

**⚡ Performance**
- Sin N+1, sin operaciones bloqueantes ni listados sin paginar (no aplica a este shell).
- `AppShell` registra/desregistra correctamente el listener `rustica:unauthorized` en el cleanup del `useEffect` (sin memory leak).
- Sin re-renders patológicos detectables; el `value` del `AuthContext.Provider` se recrea por render pero el árbol es pequeño y no es un problema real aquí.

**🏗️ Arquitectura**
- Estructura de carpetas coincide 1:1 con el plan. Regla de dirección de dependencias respetada (`pages`/`layout`/`routes` → `auth`/`api`; `config/env` hoja). Reutilización de apps por alias de Vite (`@rustica-apps`) con `dedupe: ['react','react-dom']` y `fs.allow: ['..']` según DT-01. Stubs de apps vía alias de Vitest para aislar el shell. Única desviación arquitectónica: el `fetch` directo en `login()` (Importante #1).

**🧪 Tests**
- 46/46 pasan. Cobertura de los escenarios BDD del plan presente (login por rol, credenciales incorrectas, rehidratación, logout, 401/403→evento, error de red sin evento). Los stubs no disfrazan bugs reales del shell (las apps están explícitamente fuera de alcance). Falta cobertura del caso de `auth/me` que falla tras persistir token (Importante #2) — recomendado añadir test antes de cerrar esa observación.

## Confirmaciones (qué está bien hecho)
- Contrato `localStorage` respetado al pie de la letra (claves `rustica_*` centralizadas en `session.js`); `clearSession()` borra todas las claves en logout.
- Expiración reactiva vía evento global desacoplado (`UNAUTHORIZED_EVENT`), registrado/limpiado correctamente por `AppShell`.
- Distinción correcta entre 401/403 (dispara evento) y error de red (NO dispara evento) en `apiClient` — verificado por tests.
- `ProtectedRoute` maneja el estado `loading` evitando el flash de redirección durante la rehidratación.
- `.env` fuera de control de versiones; sin secretos commiteados.

## Decisión sobre Auditoría de Seguridad Especializada
- [x] **Se requiere `@security-auditor`** — Hay superficie de autenticación (manejo de JWT, login, sesión en `localStorage`) aunque la autoridad real sea el servidor. Recomendado un pase específico para: (a) confirmar que el plugin `rustica-system` valida JWT + rol en *cada* endpoint `rustica/v1` (premisa D-09 sobre la que descansa toda la seguridad del dashboard), y (b) revisar la config CORS de producción (D-08) cuando el `dist/` no se sirva del mismo dominio. **Nota**: esa validación servidor está fuera del repo de esta feature; el testigo aplica al plugin.
- [ ] No se requiere auditoría especializada

## Próximos Pasos
1. (Importante #2) Hacer atómico el `login()`: `clearSession()` si `auth/me` falla tras persistir el token, y diferenciar el mensaje de error de "credenciales" vs "sesión no autorizada". Añadir test del escenario.
2. (Importante #1) Encauzar el POST de login a través del `apiClient` con una opción para no emitir `rustica:unauthorized`, unificando la tecnología HTTP.
3. (Importante #3) Reemplazar la clasificación de errores por string-matching por tipos/códigos de error.
4. Aplicar sugerencias #1 y #3 (limpiar `ComandasPage` y deduplicar la lógica de redirección por rol).
5. Pasar el testigo a `@security-auditor` para validar la premisa de autorización server-side (D-09) y la config CORS de prod.
