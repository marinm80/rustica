# Plan Arquitectónico: Landing Page Restaurante "Rústica"
**Slug**: rustica-landing-wp-theme
**Fecha**: 2026-06-04
**Estado**: borrador

## Arquitectura General
Sitio **estático one-page** (sin backend en esta entrega), construido con HTML5 semántico,
Bootstrap 5 vía CDN, CSS3 plano con custom properties y TypeScript compilado con `tsc` a
**ESM nativo** (un módulo por feature, sin bundler). La interactividad se orquesta desde
`main.ts` que inicializa cada módulo en `DOMContentLoaded`.

La arquitectura sigue un patrón **ligeramente hexagonal a escala de frontend**: la lógica de
dominio (validadores) son **funciones puras sin DOM** (el "núcleo"), y los módulos de feature
actúan como **adaptadores** que conectan ese núcleo al DOM y a la API JS de Bootstrap. Esto
habilita TDD estricto en el dominio y prepara la portabilidad mecánica a un **tema WordPress
reutilizable** (cada `<section>` → futuro `template-part`, cada `init*()` → `wp_enqueue_script`).

**No hay framework SPA** (sin React/Vue/Angular) ni bundler pesado: decisión vinculante del
tech-spec. Todo el contenido editable se centraliza en `src/ts/data/content.ts` para separar
contenido de presentación.

## Estructura de Carpetas
```
rustica-landing/
├── src/
│   ├── index.html                  # one-page completa, marcado semántico, comentarios <!-- section: X -->
│   ├── css/
│   │   ├── main.css                # punto de entrada: @import del resto en orden
│   │   ├── tokens.css              # design system: custom properties (paleta, fuentes, espaciado)
│   │   ├── base.css                # reset ligero, body, tipografía base, utilidades propias
│   │   ├── layout.css              # contenedores, secciones, grid helpers sobre Bootstrap
│   │   └── components/
│   │       ├── navbar.css          # estados transparente/sólido, fija
│   │       ├── hero.css            # imagen de fondo, overlay, CTA
│   │       ├── gallery.css         # tabs, grid, hover zoom, lightbox
│   │       ├── menu.css            # cards de platos destacados, etiquetas
│   │       ├── reservation.css     # formulario de reserva, estados de validación
│   │       ├── contact.css         # dos columnas, mapa, formulario eventos
│   │       └── footer.css          # redes sociales, copyright
│   ├── ts/
│   │   ├── main.ts                 # bootstrap: importa e inicializa cada módulo en DOMContentLoaded
│   │   ├── data/
│   │   │   └── content.ts          # contenido centralizado: platos, contacto, redes, slots horarios, rango personas
│   │   ├── modules/
│   │   │   ├── navbar.ts           # scroll → toggle clase sólida; smooth scroll por anclas
│   │   │   ├── gallery.ts          # cambio de pestañas + apertura/cierre lightbox (modal BS)
│   │   │   ├── lightbox.ts         # control del visor modal (open/close, fuente de imagen)
│   │   │   ├── reservation.ts      # validación cliente del formulario de reserva
│   │   │   └── events-form.ts      # validación cliente del formulario catering/eventos
│   │   ├── lib/
│   │   │   ├── validators.ts       # funciones puras: email, fecha-no-pasada, rango personas, requerido
│   │   │   ├── smooth-scroll.ts    # helper de scroll con offset de navbar fija
│   │   │   └── dom.ts              # helpers tipados de selección/eventos del DOM
│   │   └── types/
│   │       └── index.ts            # tipos compartidos (ReservationData, EventRequest, ValidationResult, FieldError)
│   └── assets/
│       ├── img/                    # imágenes hero, galería, platos (placeholders)
│       └── favicon/                # favicon e iconos
├── tests/
│   ├── unit/                       # Vitest
│   │   ├── validators.test.ts
│   │   ├── reservation.test.ts
│   │   ├── events-form.test.ts
│   │   ├── gallery.test.ts
│   │   └── smooth-scroll.test.ts
│   └── e2e/                        # Playwright
│       ├── navigation.spec.ts
│       ├── gallery.spec.ts
│       ├── reservation.spec.ts
│       ├── events.spec.ts
│       └── responsive.spec.ts
├── dist/                           # salida compilada (tsc + css/html/assets copiados) — gitignored
├── tsconfig.json
├── vitest.config.ts
├── playwright.config.ts
├── package.json
├── .gitignore
└── README.md
```

## Modelo de Contenido ✅ (aprobado por usuario con correcciones)

> No hay base de datos en esta entrega. El "modelo de datos" es el **modelo de contenido**: las
> estructuras tipadas que viven en `src/ts/data/content.ts` y los contratos de formulario en
> `src/ts/types/index.ts`. Esta separación contenido/presentación es la que habilita la portabilidad
> a campos de WordPress (Customizer / ACF / theme.json).

### Estructura: `Dish` (plato destacado)
| Campo | Tipo | Restricciones | Descripción |
|-------|------|--------------|-------------|
| id | string | requerido, único | identificador del plato |
| name | string | requerido | nombre del plato |
| description | string | requerido, breve | descripción corta |
| price | number | requerido, > 0 | precio en euros |
| image | string | requerido | ruta a `assets/img/` |
| tag | 'recomendado' \| 'especialidad' \| null | opcional | etiqueta visual |

**Cardinalidad**: exactamente **4** platos (criterio de aceptación del spec).

### Estructura: `ReservationData` (contrato del formulario de reserva)
| Campo | Tipo | Restricciones de validación | Descripción |
|-------|------|----------------------------|-------------|
| name | string | requerido, no vacío | nombre del comensal |
| email | string | requerido, formato email válido | correo de contacto |
| phone | string | requerido, no vacío | teléfono de contacto |
| date | string (YYYY-MM-DD) | requerido, **hoy o posterior** (no pasada) | fecha de la reserva |
| time | string (HH:MM) | requerido, dentro de slots permitidos | franja horaria |
| partySize | number | requerido, **entero entre 1 y 30** (ambos inclusive) | número de comensales |

### Estructura: `EventRequest` (contrato del formulario de catering/eventos)
| Campo | Tipo | Restricciones de validación | Descripción |
|-------|------|----------------------------|-------------|
| name | string | requerido, no vacío | nombre del organizador |
| email | string | requerido, formato email válido | correo de contacto |
| phone | string | requerido, no vacío | teléfono de contacto |
| eventType | string | requerido | tipo de evento (boda, corporativo, cumpleaños, otro) |
| eventDate | string (YYYY-MM-DD) | requerido, hoy o posterior | fecha tentativa del evento |
| guests | number | requerido, entero ≥ 1 | número estimado de invitados |
| message | string | opcional | detalles adicionales |

### Estructura: `ValidationResult` y `FieldError`
| Tipo | Forma | Descripción |
|------|-------|-------------|
| `FieldError` | `{ field: string; message: string }` | error de un campo concreto |
| `ValidationResult` | `{ valid: boolean; errors: FieldError[] }` | resultado de validar un formulario completo |

### Estructura: `SiteContent` (contenido centralizado — `data/content.ts`)
| Campo | Tipo | Descripción |
|-------|------|-------------|
| hero | `{ title: string; subtitle: string; ctaLabel: string }` | textos del Hero |
| dishes | `Dish[]` (4) | platos destacados |
| galleryRestaurant | `string[]` | rutas de imágenes pestaña "El Restaurante" |
| galleryDishes | `string[]` | rutas de imágenes pestaña "Nuestros Platos" |
| contact | `{ address: string; phone: string; hours: string; mapEmbed: string }` | datos de contacto + placeholder mapa |
| social | `{ network: string; url: string; icon: string }[]` | enlaces a redes |

### CORRECCIONES APLICADAS (aprobadas por el usuario)

**1. Rango de comensales (`partySize`)** — el restaurante tiene 30 mesas:
```ts
export const PARTY_SIZE_MIN = 1;
export const PARTY_SIZE_MAX = 30;
```
Validador: `isPartySizeInRange(n)` → entero con `1 <= n <= 30`. Fuera de rango bloquea el envío
y muestra "El número de comensales debe estar entre 1 y 30".

**2. Franjas horarias (`time`)** — de **12:00 a 24:00 cada 30 minutos = 24 opciones**.
Última franja seleccionable: **23:30** (24:00 es el cierre, no una franja de inicio):
```ts
// 24 slots: 12:00, 12:30, 13:00, 13:30, ... 23:00, 23:30
export const TIME_SLOTS: string[] = Array.from({ length: 24 }, (_, i) => {
  const totalMinutes = 12 * 60 + i * 30;   // arranca a las 12:00
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
});
```
El validador acepta `time` solo si pertenece a `TIME_SLOTS`. El `<select>` de la reserva se
genera a partir de esta constante (fuente única de verdad).

**3. Resto del modelo de contenido**: aprobado tal cual.

## Fases de Implementación

> **Convención de specialist**: por ser proyecto vanilla TS (sin SPA), NO se usa `react-specialist`.
> El setup de tooling Node/TS se asigna a `node-backend-specialist`; la maquetación HTML/CSS/TS a un
> **especialista frontend vanilla** (genérico); los tests E2E a `e2e-specialist`.

---

### Fase 0 — Setup del proyecto
- **Objetivo**: dejar el esqueleto de build operativo (TS compila, scripts npm funcionan).
- **Specialist**: `node-backend-specialist`
- **Archivos a crear**:
  - `package.json` (scripts dev/build/build:ts/watch:ts/copy:assets/preview/test/test:ci/test:e2e/lint; devDependencies del tech-spec)
  - `tsconfig.json` (`target ES2020`, `module ES2020`, `moduleResolution Bundler`, `outDir dist/js`, `rootDir src/ts`, `strict true`, `sourceMap true`)
  - `vitest.config.ts` (`environment: 'jsdom'`, coverage v8, umbral 80% en `src/ts/lib` y `src/ts/modules`)
  - `playwright.config.ts` (baseURL al preview/dev server; proyectos desktop + mobile viewport)
  - `.gitignore` (`node_modules/`, `dist/`, coverage, playwright artifacts)
  - `README.md` (comandos y estructura)
  - Árbol de carpetas vacío: `src/css/components/`, `src/ts/{data,modules,lib,types}/`, `src/assets/{img,favicon}/`, `tests/{unit,e2e}/`
- **Done verificable**:
  - `npm install` finaliza sin errores.
  - `npm run lint` (`tsc --noEmit`) corre (aunque no haya código aún) sin fallo de config.
  - `npx vitest run` y `npx playwright --version` ejecutan sin error de configuración.
- **Depende de**: nada (fase inicial).

---

### Fase 1 — Design system
- **Objetivo**: tokens y estilos base disponibles para todos los componentes.
- **Specialist**: frontend vanilla
- **Archivos a crear**:
  - `src/css/tokens.css` (todas las custom properties del tech-spec: paleta tierra/oliva, tipografías, fs, espaciado, navbar)
  - `src/css/base.css` (reset ligero, `body` con `--rustica-cream` + `--font-sans`, tipografía base, utilidades `.rustica-*`)
  - `src/css/layout.css` (contenedores, `--space-section`, grid helpers sobre Bootstrap)
  - `src/css/main.css` (`@import` de tokens → base → layout → components en orden)
- **Done verificable**:
  - `main.css` importa en orden correcto sin rutas rotas.
  - Las custom properties resuelven (verificación visual con una página de prueba o devtools); ningún valor hardcodeado fuera de `tokens.css`.
- **Depende de**: Fase 0 (estructura de carpetas).

---

### Fase 2 — HTML semántico completo
- **Objetivo**: `index.html` one-page con todo el contenido estático y landmarks correctos.
- **Specialist**: frontend vanilla
- **Archivos a crear/modificar**:
  - `src/index.html`: `<head>` con CDN (Bootstrap 5.3, FontAwesome 6.5, Google Fonts preconnect + Playfair Display/Source Sans 3), `<link>` a `css/main.css`, `<script type="module" src="js/main.js">`.
  - Estructura: `<header><nav>` (navbar + hamburguesa), `<main>` con `<section id="hero">`, `<section id="gallery">` (tabs + grids), `<section id="menu">` (4 cards de plato), `<section id="reservation">` (form con `<select>` de 24 slots y `<input>` partySize min=1 max=30), `<section id="contact">` (2 columnas: datos+mapa placeholder / form eventos), `<footer>` (redes + copyright).
  - Cada sección con comentario `<!-- section: <nombre> -->` y clases namespaced `rustica-*` (sin estilos en línea).
- **Done verificable**:
  - HTML valida como HTML5 (landmarks `header/nav/main/section/footer` presentes).
  - Las 6 secciones tienen `id` para anclas; el `<select>` de hora lista exactamente 24 opciones (12:00–23:30); el campo personas declara `min=1 max=30`.
  - Cero atributos `style=` en línea.
- **Depende de**: Fase 1 (clases y tokens referenciables). El contenido refleja `data/content.ts` (Fase 4 lo formaliza; aquí va estático/placeholder).

---

### Fase 3 — CSS por componente
- **Objetivo**: estética "modern rustic" responsiva en cada bloque.
- **Specialist**: frontend vanilla
- **Archivos a crear**:
  - `src/css/components/navbar.css` (transparente sobre Hero / `.navbar--solid` en oliva-dark, fija, offset)
  - `src/css/components/hero.css` (imagen de fondo, overlay, CTA prominente)
  - `src/css/components/gallery.css` (tabs activos, grid responsive, hover zoom sutil, estilos lightbox)
  - `src/css/components/menu.css` (cards de plato, etiquetas Recomendado/Especialidad, grid 1→2→4 columnas)
  - `src/css/components/reservation.css` (form, estados `.is-valid/.is-invalid`, mensajes)
  - `src/css/components/contact.css` (2 columnas en `lg`, apilado en móvil, iconos, mapa)
  - `src/css/components/footer.css` (iconos sociales, copyright)
- **Done verificable**:
  - Cada componente importado desde `main.css` renderiza acorde a `tokens.css`.
  - Mobile-first sin desbordes horizontales en breakpoints xs/md/lg (verificación visual + cubierto luego por E2E responsive).
- **Depende de**: Fase 1 (tokens) y Fase 2 (markup con las clases destino).

---

### Fase 4 — TypeScript `lib/` + `types/` + `data/` (TDD primero)
- **Objetivo**: núcleo de dominio puro y tipado, con tests RED→GREEN antes de la implementación.
- **Specialist**: frontend vanilla (con disciplina TDD estricta — DT-04/DT-06)
- **Archivos a crear**:
  - `src/ts/types/index.ts` (`ReservationData`, `EventRequest`, `ValidationResult`, `FieldError`, `Dish`, `SiteContent`)
  - `src/ts/data/content.ts` (`TIME_SLOTS` [24 slots], `PARTY_SIZE_MIN=1`, `PARTY_SIZE_MAX=30`, `dishes` [4], contacto, redes)
  - `src/ts/lib/validators.ts` (`isRequired`, `isValidEmail`, `isNotPastDate`, `isPartySizeInRange`, `validateReservation`, `validateEventRequest`)
  - `src/ts/lib/smooth-scroll.ts` (`scrollToAnchor(hash, offset)` con offset de navbar)
  - `src/ts/lib/dom.ts` (`qs`, `qsa`, `on`, `setError`, `clearError`)
- **Tests TDD (escritos antes)**:
  - `tests/unit/validators.test.ts`, `tests/unit/smooth-scroll.test.ts`
- **Done verificable**:
  - Tests escritos primero fallan (RED), luego pasan (GREEN) tras implementar.
  - Casos clave cubiertos: email inválido, campo vacío, fecha pasada, `partySize` 0/31/30/1, `time` fuera de `TIME_SLOTS`, `TIME_SLOTS.length === 24` con primero `12:00` y último `23:30`.
  - `tsc --noEmit` limpio (strict). Cobertura de `lib/` cerca del 100%.
- **Depende de**: Fase 0 (tsc/vitest). Independiente del CSS (Fases 1–3).

---

### Fase 5 — TypeScript `modules/` + `main.ts`
- **Objetivo**: wiring de la interactividad al DOM y a Bootstrap.
- **Specialist**: frontend vanilla
- **Archivos a crear**:
  - `src/ts/modules/navbar.ts` (`initNavbar()`: scroll → `.navbar--solid`; smooth-scroll en anclas)
  - `src/ts/modules/lightbox.ts` (`initLightbox()`, `openLightbox(src)`: Bootstrap Modal)
  - `src/ts/modules/gallery.ts` (`initGallery()`: cambio de tabs + visibilidad + apertura lightbox)
  - `src/ts/modules/reservation.ts` (`initReservation()`: intercepta submit, usa `validateReservation`, marca errores, confirmación visual; puebla `<select>` desde `TIME_SLOTS`)
  - `src/ts/modules/events-form.ts` (`initEventsForm()`: mismo patrón con `validateEventRequest`)
  - `src/ts/main.ts` (orquesta todos los `init*()` en `DOMContentLoaded`)
- **Done verificable**:
  - `npm run build:ts` emite ESM a `dist/js/` sin errores.
  - `npm run build` + `npm run preview`: la página carga, navbar conmuta, tabs cambian, lightbox abre/cierra, formularios bloquean envío inválido y confirman el válido (verificación manual previa a E2E).
  - Cada módulo exporta `init*()` y NO se auto-ejecuta.
- **Depende de**: Fase 4 (lib/types/data), Fase 2 (markup con ids/clases), Fase 3 (clases de estado como `.navbar--solid`).

---

### Fase 6 — Tests unitarios (Vitest, jsdom)
- **Objetivo**: cubrir la lógica de módulos con DOM real de jsdom; consolidar cobertura ≥80%.
- **Specialist**: frontend vanilla
- **Archivos a crear**:
  - `tests/unit/reservation.test.ts` (bloqueo submit inválido, marcado de errores, confirmación; rango 1–30; slots)
  - `tests/unit/events-form.test.ts` (validación e incompletos)
  - `tests/unit/gallery.test.ts` (cambio de pestaña: estado activo + visibilidad)
- **Done verificable**:
  - `npm run test:ci` pasa con cobertura **≥80%** en `src/ts/lib/` y `src/ts/modules/`.
  - Mapeo BDD→test verificable (ver D-09).
- **Depende de**: Fase 5 (módulos implementados). Reutiliza tests de Fase 4.

---

### Fase 7 — Tests E2E (Playwright)
- **Objetivo**: validar flujos de UI reales que jsdom no cubre (scroll, viewport, Bootstrap JS).
- **Specialist**: `e2e-specialist`
- **Archivos a crear**:
  - `tests/e2e/navigation.spec.ts` (navbar transparente→sólida, fija, smooth scroll sin ocultar sección, CTA Hero→reservas, hamburguesa móvil)
  - `tests/e2e/gallery.spec.ts` (cambio de tab, abrir/cerrar lightbox, hover zoom escritorio)
  - `tests/e2e/reservation.spec.ts` (envío válido confirma; vacíos/email/fecha pasada/personas fuera de 1–30 bloquean)
  - `tests/e2e/events.spec.ts` (envío válido confirma; incompletos bloquean)
  - `tests/e2e/responsive.spec.ts` (sin desbordes horizontales en móvil/tablet/escritorio; apilado de contacto)
- **Done verificable**:
  - `npm run test:e2e` pasa en verde contra `npm run preview` (artefacto de `dist/`).
  - Todos los escenarios BDD del spec quedan cubiertos por unit o E2E.
- **Depende de**: Fase 5 (build funcional) y Fases 2–3 (UI completa).

## Dependencias entre Fases
```
Fase 0 (setup)
  ├─► Fase 1 (design system) ─► Fase 3 (CSS componentes)
  │                                  ▲
  ├─► Fase 2 (HTML) ─────────────────┤
  │        │                         │
  └─► Fase 4 (lib TDD) ─► Fase 5 (modules) ─► Fase 6 (unit jsdom)
                              │
                              └──────────────► Fase 7 (E2E)  ◄── requiere Fases 2,3 (UI completa)
```
- Fases 1 y 4 pueden arrancar en paralelo tras la 0 (CSS no depende de TS y viceversa).
- Fase 5 es el punto de convergencia: necesita 4 (lógica), 2 (markup), 3 (clases de estado).
- Fase 7 cierra: necesita build funcional (5) y UI completa (2+3).

## Decisiones Arquitectónicas (ADR-lite)
- **D-01**: **One-page estática sin backend** — Contexto: el spec excluye persistencia/envío real en esta entrega. Consecuencias: formularios validan y confirman solo en cliente; `action` queda listo para conectar a handler PHP/CF7 en fase WordPress.
- **D-02**: **`tsc` directo a ESM, sin bundler** (hereda DT-01) — Contexto: objetivo de portar a tema WP con un script por feature. Consecuencias: un `.js` por módulo encolable con `wp_enqueue_script`; trade-off: sin tree-shaking/minify (irrelevante para este tamaño).
- **D-03**: **Bootstrap/FontAwesome/Fonts por CDN** (hereda DT-02) — Contexto: restricción del cliente. Consecuencias: cero dependencias de producción en `package.json`; las mismas URLs CDN migran a `wp_enqueue` sin cambio de versión.
- **D-04**: **CSS3 plano con custom properties, sin Sass** (hereda DT-03) — Contexto: portabilidad directa a `style.css` del tema. Consecuencias: design system 100% en `tokens.css`; trade-off: sin mixins/nesting (suplido por organización por componente).
- **D-05**: **Lógica pura separada del DOM** (hereda DT-04) — Contexto: habilitar TDD estricto y cobertura alta. Consecuencias: `lib/validators.ts` testeable sin jsdom; los módulos solo hacen wiring.
- **D-06**: **Contenido centralizado en `data/content.ts`** (hereda DT-07) — Contexto: separar contenido de presentación para mapear a campos WP. Consecuencias: `TIME_SLOTS`, rango de personas, platos y contacto son fuente única de verdad; el markup los consume.
- **D-07**: **Cada `<section>` = futuro `template-part`; cada `init*()` = script encolable** — Contexto: portabilidad mecánica a tema. Consecuencias: comentarios `<!-- section: X -->`, clases `rustica-*`, módulos independientes.
- **D-08**: **Slots horarios y rango de comensales como constantes derivables** — Contexto: corrección aprobada (1–30 personas; 24 franjas 12:00–23:30). Consecuencias: `TIME_SLOTS` se genera por algoritmo y alimenta tanto el `<select>` como el validador (sin duplicación entre UI y dominio).

- **D-09: Testabilidad y AI-TDD por capa**:
  - **Puertos a inyectar** (frontera dominio↔adaptador):
    - `validators` (núcleo puro) inyectado en `reservation.ts` / `events-form.ts`.
    - `lib/dom.ts` (`qs`, `qsa`, `on`, `setError`, `clearError`) como adaptador de DOM testeable con jsdom.
    - `lib/smooth-scroll.ts` (cálculo de offset puro, efecto de scroll aislado).
    - API JS de Bootstrap (Modal, Tab) tipada vía `@types/bootstrap`, accedida en `lightbox.ts`/`gallery.ts` (cubierta por E2E, no por unit).
  - **Modo AI-TDD**: **parcial** (DT-06) — TDD estricto RED→GREEN→REFACTOR en `lib/` y lógica de `modules/` con jsdom; test-after en maquetación HTML/CSS y wiring de Bootstrap (cubierto por E2E).
  - **Niveles activos**: `unit` (Vitest + jsdom) + `e2e` (Playwright). Sin integration/contract/load (sin backend).
  - **Cobertura mínima**: **80%** en `src/ts/lib/` y `src/ts/modules/`; lógica pura cerca de 100%.
  - **Mapeo BDD → tests**:
    | Scenario (spec) | Test | Ubicación |
    |---|---|---|
    | Envío de una reserva válida | `test('reserva válida confirma', ...)` | `tests/unit/reservation.test.ts` + `tests/e2e/reservation.spec.ts` |
    | Campos obligatorios vacíos | `test('bloquea submit con campos vacíos', ...)` | `tests/unit/reservation.test.ts` |
    | Formato de correo inválido | `test('email inválido bloquea', ...)` | `tests/unit/validators.test.ts` |
    | Fecha en el pasado | `test('fecha pasada inválida', ...)` | `tests/unit/validators.test.ts` |
    | Número de personas fuera de rango (1–30) | `test('partySize fuera de 1..30 inválido', ...)` | `tests/unit/validators.test.ts` |
    | Cambio entre pestañas de galería | `test('cambia tab y visibilidad', ...)` | `tests/unit/gallery.test.ts` |
    | Ampliar imagen en lightbox | `test('abre/cierra lightbox', ...)` | `tests/e2e/gallery.spec.ts` |
    | Barra transparente→sólida al scroll | `test('navbar solid on scroll', ...)` | `tests/e2e/navigation.spec.ts` |
    | Navegación con smooth scroll / CTA Hero | `test('CTA Hero scrollea a reservas', ...)` | `tests/e2e/navigation.spec.ts` |
    | Menú hamburguesa en móvil | `test('hamburguesa despliega', ...)` | `tests/e2e/navigation.spec.ts` |
    | Solicitud de eventos válida / incompleta | `test('eventos valida y confirma/bloquea', ...)` | `tests/unit/events-form.test.ts` + `tests/e2e/events.spec.ts` |
    | Apilado de columnas / sin desbordes | `test('responsive sin overflow', ...)` | `tests/e2e/responsive.spec.ts` |
  - **Comando único de CI**: `npm run test:ci && npm run test:e2e` (Vitest con cobertura 80% + Playwright).
  - **Estrategia de seeds/fixtures**: no hay DB. Las fixtures son **fragmentos de HTML reales** montados en jsdom (el markup de cada `<section>`) y **datos de prueba derivados de `data/content.ts`** (platos, slots, rango). Para E2E, el "seed" es el propio `dist/` servido por `npm run preview`; sin estado externo que resetear.

## Flujo de Datos
1. **Carga**: `index.html` (CDN + `css/main.css`) → `<script type="module" src="js/main.js">`.
2. **Bootstrap**: `main.ts` espera `DOMContentLoaded` → llama `initNavbar()`, `initGallery()`, `initLightbox()`, `initReservation()`, `initEventsForm()`.
3. **Contenido**: `reservation.ts` lee `TIME_SLOTS` y `PARTY_SIZE_*` de `data/content.ts` para poblar/validar el formulario (fuente única de verdad).
4. **Validación (submit)**: módulo de formulario → `lib/validators.ts` (puro) → `ValidationResult`. Si `valid` → confirmación visual; si no → `setError()` por campo vía `lib/dom.ts`.
5. **Navegación**: click en ancla → `navbar.ts` → `lib/smooth-scroll.ts` (scroll con offset de `--navbar-height`).
6. **Galería**: tab → `gallery.ts` conmuta grids; click en imagen → `lightbox.ts.openLightbox(src)` (Bootstrap Modal).

## Consideraciones de Seguridad
- **Sin secretos ni env vars** en esta entrega (DT-08); el mapa es placeholder, sin clave de API.
- **Sin envío de datos**: los formularios no transmiten información a ningún backend; no hay PII en tránsito ni almacenamiento.
- **CDN con integridad**: cargar Bootstrap/FontAwesome con atributos `integrity`+`crossorigin` (SRI) cuando el proveedor los publique, para mitigar manipulación del recurso.
- **Validación solo cliente** es de UX, no de seguridad: se documenta que al conectar backend (fase WP) la validación deberá reimplementarse en servidor.
- **Sin `style=` en línea** facilita endurecer una futura CSP (`style-src`/`script-src`).

## Dependencias entre Módulos
- `main.ts` → depende de **todos** los módulos (orquestador).
- `navbar.ts` → `lib/smooth-scroll.ts`.
- `gallery.ts` → `modules/lightbox.ts`, `lib/dom.ts`.
- `lightbox.ts` → `lib/dom.ts` + API Bootstrap Modal (`@types/bootstrap`).
- `reservation.ts` → `lib/validators.ts`, `lib/dom.ts`, `data/content.ts`, `types`.
- `events-form.ts` → `lib/validators.ts`, `lib/dom.ts`, `types`.
- `lib/validators.ts` → `types` (sin DOM).
- `lib/smooth-scroll.ts`, `lib/dom.ts` → sin dependencias internas (hojas).
- `data/content.ts` → `types`.
