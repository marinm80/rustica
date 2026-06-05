# Tech Spec: Landing Page Restaurante "Rústica"
**Slug**: rustica-landing-wp-theme
**Fecha**: 2026-06-03
**Estado**: aprobado

## Contexto técnico
Stack **fijado por el cliente** (no negociable): Bootstrap 5 vía CDN, TypeScript compilado sin
bundler pesado, FontAwesome vía CDN, Google Fonts vía CDN, HTML5 semántico + CSS3 custom, sin
backend en esta entrega. La estructura debe poder portarse a un **tema WordPress reutilizable**.
El rol de este tech-spec es profundizar las decisiones, no cambiar el stack.

---

## Stack Definido
| Capa | Tecnología | Versión mínima | Entrega |
|------|-----------|----------------|---------|
| Markup | HTML5 semántico | — | `src/index.html` |
| Framework CSS | Bootstrap 5 | 5.3.x | CDN (`<link>` + `<script>` bundle) |
| Estilos custom | CSS3 (custom properties) | — | compilado a `dist/css/main.css` |
| Lenguaje interactividad | TypeScript | 5.4.x | compilado con `tsc` a ESM |
| Compilador TS | `tsc` (TypeScript Compiler) | 5.4.x | sin bundler — salida `dist/js/*.js` como ESM |
| Iconografía | FontAwesome Free | 6.5.x | CDN (kit/css) |
| Tipografías | Google Fonts | — | CDN (`<link>` preconnect) |
| Dev server | `live-server` o `vite` (solo dev/preview) | — | recarga en caliente local |
| Test unit | Vitest | 1.x | `*.test.ts` |
| DOM env (tests) | jsdom (vía Vitest `environment`) | — | — |
| E2E | Playwright | 1.44.x | `tests/e2e/*.spec.ts` |
| Runtime build | Node.js | 20 LTS | solo herramienta de build, no runtime de producción |

### Decisión de compilación: `tsc` directo (no esbuild)
Se elige **`tsc` puro** sobre esbuild por simplicidad y por alineación con el objetivo WordPress:
- No requiere bundle; los módulos se cargan como **ESM nativo** (`<script type="module">`),
  lo que mantiene un archivo por feature, fácil de mapear luego a `assets/js/` de un tema WP.
- Cero dependencias de runtime y configuración mínima (`tsconfig.json`).
- El CSS no pasa por el pipeline de TS: es CSS3 plano servido tal cual (portable directo a WP).

> Nota: se usa **Vite solo como dev server/preview opcional** para recarga rápida; el artefacto
> de producción se genera con `tsc` para no introducir un bundle acoplado. Si el equipo prefiere
> cero dependencia de Vite, `live-server` cubre el dev server (ver Comandos).

---

## Arquitectura de Archivos (`src/` tree)
```
rustica-landing/
├── src/
│   ├── index.html                  # one-page completa, marcado semántico
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
│   │   ├── modules/
│   │   │   ├── navbar.ts           # scroll → toggle clase sólida; smooth scroll por anclas
│   │   │   ├── gallery.ts          # cambio de pestañas + apertura/cierre lightbox (modal BS)
│   │   │   ├── reservation.ts      # validación cliente del formulario de reserva
│   │   │   ├── events-form.ts      # validación cliente del formulario catering/eventos
│   │   │   └── lightbox.ts         # control del visor modal (open/close, fuente de imagen)
│   │   ├── lib/
│   │   │   ├── validators.ts       # funciones puras: email, fecha-no-pasada, rango personas, requerido
│   │   │   ├── smooth-scroll.ts    # helper de scroll con offset de navbar fija
│   │   │   └── dom.ts              # helpers tipados de selección/eventos del DOM
│   │   └── types/
│   │       └── index.ts            # tipos compartidos (ReservationData, EventRequest, ValidationResult)
│   └── assets/
│       ├── img/                    # imágenes hero, galería, platos (placeholders en esta entrega)
│       └── favicon/                # favicon e iconos
├── tests/
│   ├── unit/                       # Vitest: validators y lógica pura (jsdom para módulos DOM)
│   │   ├── validators.test.ts
│   │   ├── reservation.test.ts
│   │   └── gallery.test.ts
│   └── e2e/                        # Playwright: flujos de UI reales
│       ├── navigation.spec.ts
│       ├── gallery.spec.ts
│       ├── reservation.spec.ts
│       └── responsive.spec.ts
├── dist/                           # salida compilada (tsc + css copiado) — gitignored
│   ├── index.html
│   ├── css/
│   └── js/
├── tsconfig.json
├── vitest.config.ts
├── playwright.config.ts
├── package.json
└── README.md
```

### Reglas de organización
- **Un módulo TS por feature.** Cada módulo exporta `init<Feature>()` y no se auto-ejecuta:
  `main.ts` orquesta el arranque. Esto facilita testear cada init de forma aislada y luego
  encolarlos por separado en `functions.php` de WordPress.
- **Lógica pura separada de DOM** (`lib/validators.ts` no toca el DOM) → 100% testeable en unit.
- **Sin estilos en línea** (restricción del spec): todo vive en `src/css/` con clases reutilizables.
- **CSS por componente** en archivos separados, unidos por `@import` en `main.css` para mapear
  1:1 a futuros bloques/partials de WordPress.

---

## Design System ("modern rustic")
Todas las variables viven en `src/css/tokens.css` como custom properties bajo `:root`. Nada de
valores hardcodeados en componentes: se referencian siempre vía `var(--...)`.

### Paleta tierra
```css
:root {
  /* Tierra / siena */
  --rustica-siena:        #A0522D;  /* acento cálido principal (CTAs, links activos) */
  --rustica-siena-dark:   #7A3E22;  /* hover/estados presionados */
  --rustica-terracotta:   #C97B5A;  /* detalles, etiquetas "Especialidad" */

  /* Beige / crema (fondos cálidos) */
  --rustica-beige:        #F3E9DC;  /* fondo de secciones claras */
  --rustica-cream:        #FBF6EF;  /* fondo base / body */
  --rustica-sand:         #E3D5C3;  /* bordes suaves, separadores */

  /* Verde oliva (acento natural) */
  --rustica-olive:        #6B7A4F;  /* acento secundario, iconos, etiquetas "Recomendado" */
  --rustica-olive-dark:   #4F5C3A;  /* navbar sólida, footer */

  /* Neutros */
  --rustica-charcoal:     #2E2A26;  /* texto principal */
  --rustica-muted:        #6E665E;  /* texto secundario */
  --rustica-white:        #FFFFFF;

  /* Semánticos (validación de formularios) */
  --rustica-success:      #5A8F4F;
  --rustica-error:        #B3543A;

  /* Tipografía */
  --font-serif:  'Playfair Display', Georgia, serif;   /* títulos / supertítulo Hero */
  --font-sans:   'Source Sans 3', system-ui, sans-serif; /* cuerpo, formularios, UI */

  --fs-display:  clamp(2.5rem, 6vw, 4.5rem);  /* supertítulo Hero */
  --fs-h2:       clamp(1.75rem, 3vw, 2.5rem); /* títulos de sección */
  --fs-body:     1rem;
  --lh-body:     1.6;

  /* Espaciado y forma */
  --space-section: clamp(3rem, 8vw, 6rem);    /* padding vertical de secciones */
  --radius:        0.5rem;
  --radius-lg:     1rem;
  --shadow-card:   0 8px 24px rgba(46, 42, 38, 0.12);

  /* Navbar */
  --navbar-height: 4.5rem;                    /* usado como offset de smooth-scroll */
  --navbar-bg-solid: var(--rustica-olive-dark);
}
```

### Tipografías (Google Fonts vía CDN)
- **Serif (títulos/emocional):** Playfair Display — pesos 600, 700.
- **Sans-serif (cuerpo/UI):** Source Sans 3 — pesos 400, 600.
- Carga con `preconnect` a `fonts.googleapis.com` y `fonts.gstatic.com` + `display=swap`.

### Breakpoints (Bootstrap 5, mobile-first)
Se usan los breakpoints nativos de Bootstrap; las media queries custom usan los mismos cortes.
| Token | Min-width | Uso clave |
|-------|-----------|-----------|
| `xs`  | <576px    | base mobile-first (1 columna; menú y contacto apilados) |
| `sm`  | ≥576px    | ajustes menores |
| `md`  | ≥768px    | menú 2 columnas, navbar expandida (fin del hamburguesa) |
| `lg`  | ≥992px    | menú 4 columnas, contacto 2 columnas, galería grid amplia |
| `xl`  | ≥1200px   | contenedor máximo |

---

## Módulos TypeScript y responsabilidades
| Módulo | Export | Responsabilidad | Depende de |
|--------|--------|-----------------|------------|
| `main.ts` | — | Orquesta `init*()` de todos los módulos en `DOMContentLoaded` | todos |
| `modules/navbar.ts` | `initNavbar()` | Listener de scroll: alterna clase `.navbar--solid` pasado el Hero; activa smooth-scroll en enlaces de ancla | `lib/smooth-scroll` |
| `modules/gallery.ts` | `initGallery()` | Cambio de pestañas (El Restaurante / Nuestros Platos), conmuta visibilidad de grids y estado activo | `modules/lightbox`, `lib/dom` |
| `modules/lightbox.ts` | `initLightbox()`, `openLightbox(src)` | Abre/cierra visor modal (Bootstrap Modal) con la imagen ampliada y control de cierre | `lib/dom` |
| `modules/reservation.ts` | `initReservation()` | Intercepta submit, valida campos vía `validators`, muestra errores y confirmación visual | `lib/validators`, `lib/dom`, `types` |
| `modules/events-form.ts` | `initEventsForm()` | Igual patrón para el formulario de catering/eventos | `lib/validators`, `lib/dom`, `types` |
| `lib/validators.ts` | `isValidEmail`, `isRequired`, `isNotPastDate`, `isPartySizeInRange`, `validateReservation` | **Funciones puras** sin DOM, devuelven `ValidationResult` | `types` |
| `lib/smooth-scroll.ts` | `scrollToAnchor(hash, offset)` | Desplazamiento suave con offset de navbar fija | — |
| `lib/dom.ts` | `qs`, `qsa`, `on`, `setError`, `clearError` | Helpers tipados de DOM y manejo de estados de validación visual | — |
| `types/index.ts` | `ReservationData`, `EventRequest`, `ValidationResult`, `FieldError` | Contratos de datos compartidos | — |

### Compilación a ESM
`tsconfig.json`: `"target": "ES2020"`, `"module": "ES2020"`, `"moduleResolution": "Bundler"`,
`"outDir": "dist/js"`, `"rootDir": "src/ts"`, `"strict": true`, `"sourceMap": true` (dev).
`index.html` carga solo `<script type="module" src="js/main.js"></script>`; el resto se resuelve
por imports ESM nativos.

---

## Specialist Assignments
- **Frontend**: (ninguno de los SPA — proyecto HTML/CSS/TS vanilla). Implementación a cargo de un
  especialista de frontend vanilla / `e2e-specialist` para los tests de UI.
- **Backend**: (ninguno — sin backend en esta entrega).
- **E2E**: `e2e-specialist` (Playwright).
- **WordPress (fase futura)**: `wordpress-specialist` para la portabilidad a tema.
- **DevOps**: no aplica en esta entrega.

> Vinculante: al no haber framework SPA ni backend, los agentes downstream NO deben introducir
> React/Vue/Angular ni un bundler pesado. Cualquier interactividad va en los módulos TS descritos.

---

## Estrategia AI-TDD
- **Modo**: **parcial** — TDD estricto (RED→GREEN→REFACTOR) en la **lógica de dominio** (validadores
  y lógica de módulos testeable con jsdom); **test-after** en maquetación HTML/CSS pura y wiring de
  Bootstrap (se cubre por E2E).
- **Niveles activos**: `unit` (Vitest) + `e2e` (Playwright). Sin integration/contract/load/mutation
  (no hay backend ni API en esta entrega).
- **Cobertura mínima**: **80%** en `src/ts/lib/` y `src/ts/modules/` (la lógica pura debe rozar 100%).
- **Política de mocks**:
  - No hay DB ni servicios externos → no se mockea backend.
  - Validadores se testean como funciones puras (sin mocks).
  - Módulos con DOM se testean con **jsdom** (Vitest `environment: 'jsdom'`) montando fragmentos de
    HTML reales; no se mockea el DOM, se usa el real de jsdom.
  - El envío de formularios (sin backend) se valida como confirmación visual; no se mockean fetch
    porque no hay llamadas de red en esta entrega.

### Qué se testea con Vitest (unit, en TS puro / jsdom)
| Área | Tipo |
|------|------|
| `validators.ts`: email, requerido, fecha no pasada, rango de personas | puro |
| `validateReservation()` / validación de evento (composición) | puro |
| `smooth-scroll.ts` cálculo de offset | puro |
| `gallery.ts` lógica de cambio de pestaña (estado activo, visibilidad) | jsdom |
| `reservation.ts` / `events-form.ts`: bloqueo de submit inválido, marcado de errores, confirmación | jsdom |

### Qué requiere E2E (Playwright)
| Escenario del spec | Razón |
|--------------------|-------|
| Navbar transparente→sólida al scroll + permanece fija | scroll real + estilos computados |
| Smooth scroll a sección sin quedar oculta tras navbar | layout + scroll real |
| Menú hamburguesa en móvil (colapso Bootstrap) | viewport real + JS de Bootstrap |
| Galería: cambio de pestaña + abrir/cerrar lightbox (modal Bootstrap) | componentes Bootstrap reales |
| Hover zoom en galería (escritorio) | interacción de puntero / CSS hover |
| Validación de formularios end-to-end + confirmación visual | flujo de usuario completo |
| Responsive: sin desbordes horizontales en móvil/tablet/escritorio | múltiples viewports |
| CTA del Hero lleva a reservas | navegación real |

### Comandos de tests
- **Backend**: N/A (sin backend en esta entrega).
- **Unit (Vitest)**: `npm run test`  (CI: `npm run test:ci` con cobertura)
- **E2E (Playwright)**: `npm run test:e2e`

---

## Dependencias Clave
### Runtime (cargadas por CDN, NO en package.json)
- Bootstrap 5.3.x — grid, navbar, tabs, modal, validación de formularios, utilidades.
- FontAwesome Free 6.5.x — iconografía (contacto, redes, etiquetas).
- Google Fonts — Playfair Display + Source Sans 3.

### devDependencies (package.json)
- `typescript@^5.4` — compilación de los módulos TS a ESM.
- `vitest@^1` — runner de tests unitarios.
- `jsdom@^24` — entorno DOM para tests de módulos.
- `@vitest/coverage-v8@^1` — cobertura.
- `@playwright/test@^1.44` — E2E.
- `@types/bootstrap@^5.2` — tipados de la API JS de Bootstrap (Modal, Tab).
- `live-server@^1.2` (o `vite@^5` como alternativa) — dev server con recarga.
- `npm-run-all@^4` — orquestar build de TS + copia de assets en paralelo.

> No hay dependencias de producción en `package.json`: el sitio final es HTML/CSS/JS estático.

---

## Variables de Entorno Requeridas
No se requieren variables de entorno en esta entrega (sin backend, sin claves de API; el mapa es un
placeholder). Si en una fase futura se integra un proveedor de mapas real:
```env
# Fase futura (no usar en esta entrega)
MAPS_EMBED_API_KEY=   # clave del proveedor de mapas para el iframe embebido
```

---

## Notas de Migración a Tema WordPress (fase futura)
Convenciones que se adoptan **ahora** para que la portabilidad sea mecánica, no una reescritura:

1. **Bloques semánticos = futuros partials.** Cada `<section id="...">` del one-page corresponde a
   un futuro `template-parts/section-<nombre>.php` (`hero`, `gallery`, `menu`, `reservation`,
   `contact`, `footer`). Marcar cada sección con un comentario `<!-- section: hero -->`.
2. **Contenido separado de presentación.** Textos, platos, datos de contacto y enlaces sociales se
   centralizan en un objeto de datos (`src/ts/data/content.ts` o `data-*` attributes) para mapearlos
   luego a *Customizer settings* / *ACF fields* / `theme.json` sin tocar el markup.
3. **Clases CSS reutilizables y namespaced** (`rustica-*` o BEM por componente) → migran tal cual a
   `style.css` / `assets/css/` del tema; ningún estilo en línea.
4. **Assets en rutas relativas predecibles** (`assets/img/`, `dist/css/`, `dist/js/`) → mapean a
   `get_template_directory_uri() . '/assets/...'`.
5. **JS modular y encolable por feature.** Cada `init*()` independiente → cada módulo se puede
   `wp_enqueue_script` por separado o agrupar en un solo handle, sin acoplamiento.
6. **CDN compatible con `wp_enqueue`.** Bootstrap/FontAwesome/Google Fonts ya van por CDN → en WP se
   declaran con `wp_enqueue_style/script` apuntando a las mismas URLs CDN (cero cambios de versión).
7. **HTML5 landmark correcto** (`<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`) → encaja con
   `header.php` / `footer.php` y plantillas de bloque.
8. **Formularios sin backend hoy** → los `<form>` quedan listos para conectarse a un handler PHP
   (`admin-post.php` / REST) o a Contact Form 7 cambiando solo el `action`, sin tocar la validación
   cliente.

---

## Comandos de Desarrollo
Definidos en `package.json`:
| Comando | Acción |
|---------|--------|
| `npm run dev` | Compila TS en watch + sirve `src/` con recarga en caliente (`live-server`/`vite`) |
| `npm run build` | `tsc` a `dist/js/` + copia `index.html`, `css/`, `assets/` a `dist/` |
| `npm run build:ts` | Solo compilación TypeScript (`tsc -p tsconfig.json`) |
| `npm run watch:ts` | `tsc --watch` para desarrollo |
| `npm run copy:assets` | Copia HTML/CSS/assets a `dist/` |
| `npm run preview` | Sirve `dist/` para revisar el artefacto final de producción |
| `npm run test` | Vitest en watch (unit) |
| `npm run test:ci` | Vitest una vez + cobertura (umbral 80%) |
| `npm run test:e2e` | Playwright E2E |
| `npm run lint` | Type-check estricto sin emitir (`tsc --noEmit`) |

---

## Decisiones Técnicas
- **DT-01**: **`tsc` directo en vez de esbuild/webpack** — el spec exige "bundler ligero o tsc";
  `tsc` + ESM nativo es lo más simple y produce un módulo por feature, alineado con la futura
  estructura de scripts de un tema WordPress. Justificación: cero acoplamiento de bundle.
- **DT-02**: **Bootstrap por CDN, no via npm** — restricción del spec ("CDN, no build step" para
  Bootstrap). Se instala solo `@types/bootstrap` como devDependency para tipar Modal/Tab en TS.
- **DT-03**: **CSS3 plano con custom properties, sin preprocesador (Sass)** — mantiene el CSS
  portable directo a `style.css` de WordPress y evita un paso de build extra; el design system se
  resuelve con variables CSS nativas.
- **DT-04**: **Lógica de validación en funciones puras (`lib/validators.ts`)** separada del DOM —
  habilita TDD estricto y cobertura alta sin jsdom; el wiring al formulario va en los módulos.
- **DT-05**: **Vitest sobre Jest** — más rápido, config mínima, ESM-first (coincide con la salida
  `tsc` ESM) y soporte `jsdom` integrado.
- **DT-06**: **AI-TDD modo parcial** — TDD estricto en dominio (validadores/lógica de módulos),
  test-after en maquetación cubierta por E2E. Vinculante para `@plan-builder` (decisión D-09).
- **DT-07**: **Datos de contenido centralizados** (`data/content.ts` o `data-*`) — prepara la
  separación contenido/presentación que exige la portabilidad a tema reutilizable.
- **DT-08**: **Sin variables de entorno ni secretos** en esta entrega — mapa como placeholder,
  formularios sin envío real; se documenta la futura `MAPS_EMBED_API_KEY` por anticipación.
