# Tasks: Landing Page Restaurante "Rústica" (base para tema WordPress)
**Slug**: rustica-landing-wp-theme
**Fecha**: 2026-06-04
**Total tareas**: 22
**Tiempo total estimado**: 1.555 min (~25,9 h)

> **Modo AI-TDD: parcial** (DT-06). TDD estricto RED→GREEN→REFACTOR en `src/ts/lib/` y la lógica
> de `src/ts/modules/` testeable con jsdom. Test-after (cubierto por E2E) en maquetación HTML/CSS
> y wiring de Bootstrap. Comando unit: `npm run test` / `npm run test:ci`. Comando E2E: `npm run test:e2e`.
> Type-check: `npm run lint` (`tsc --noEmit`).

> **Convención de specialist** (heredada del plan): proyecto vanilla TS sin SPA.
> Setup tooling Node/TS → `node-backend-specialist`. Maquetación HTML/CSS/TS y unit tests
> → `frontend-specialist` (frontend vanilla genérico). Tests E2E Playwright → `e2e-specialist`.

---

## FASE 0 — Setup del proyecto

## T-01: Esqueleto de carpetas + package.json + scripts npm
**Fase**: F0
**Specialist**: node-backend-specialist
**Estimación**: 45 min
**Dependencias**: ninguna
**Escenarios BDD cubiertos**: ninguno (infraestructura)

### Contexto
Crear el esqueleto del proyecto: `package.json` con todos los scripts del tech-spec y las
`devDependencies`, más el árbol de carpetas vacío que consumirán todas las fases siguientes.
No hay dependencias de producción (Bootstrap/FA/Fonts van por CDN).

### Archivos a crear/modificar
- `package.json` — scripts dev/build/build:ts/watch:ts/copy:assets/preview/test/test:ci/test:e2e/lint; devDependencies: typescript@^5.4, vitest@^1, jsdom@^24, @vitest/coverage-v8@^1, @playwright/test@^1.44, @types/bootstrap@^5.2, live-server@^1.2, npm-run-all@^4
- `src/css/components/` — carpeta vacía (con `.gitkeep` si hace falta)
- `src/ts/{data,modules,lib,types}/` — carpetas vacías
- `src/assets/{img,favicon}/` — carpetas vacías
- `tests/{unit,e2e}/` — carpetas vacías
- `README.md` — comandos y estructura del proyecto

### Criterio de Done
- [ ] `npm install` finaliza sin errores
- [ ] El árbol de carpetas del plan existe completo
- [ ] `npm run lint`, `npm run test`, `npm run test:e2e` están definidos en `package.json`

### Sub-pasos AI-TDD
> Tarea de tooling: **test-after**, sin ciclo RED/GREEN (validación por ejecución de comandos).
1. Crear `package.json` con scripts y devDependencies del tech-spec.
2. Crear el árbol de carpetas vacío.
3. Ejecutar `npm install` → debe finalizar sin errores.

---

## T-02: tsconfig.json (compilación a ESM)
**Fase**: F0
**Specialist**: node-backend-specialist
**Estimación**: 30 min
**Dependencias**: T-01
**Escenarios BDD cubiertos**: ninguno (infraestructura)

### Contexto
Configurar `tsc` directo (sin bundler, DT-01) para emitir ESM nativo: un módulo por feature
mapeable a `assets/js/` de un tema WordPress.

### Archivos a crear/modificar
- `tsconfig.json` — `target ES2020`, `module ES2020`, `moduleResolution Bundler`, `outDir dist/js`, `rootDir src/ts`, `strict true`, `sourceMap true`, `types: ["bootstrap"]`

### Criterio de Done
- [ ] `npm run lint` (`tsc --noEmit`) corre sin error de configuración aunque no haya código aún
- [ ] `npm run build:ts` no falla por config (emite a `dist/js/` cuando exista código)

### Sub-pasos AI-TDD
> Tooling: test-after.
1. Crear `tsconfig.json` con las opciones del tech-spec.
2. Ejecutar `npm run lint` → sin fallo de config.

---

## T-03: vitest.config.ts (jsdom + cobertura 80%)
**Fase**: F0
**Specialist**: node-backend-specialist
**Estimación**: 30 min
**Dependencias**: T-01
**Escenarios BDD cubiertos**: ninguno (infraestructura)

### Contexto
Configurar Vitest con `environment: 'jsdom'`, cobertura v8 y umbral 80% restringido a
`src/ts/lib/` y `src/ts/modules/` (DT-05, D-09).

### Archivos a crear/modificar
- `vitest.config.ts` — `environment: 'jsdom'`, `coverage.provider: 'v8'`, `coverage.include: ['src/ts/lib/**','src/ts/modules/**']`, thresholds 80%

### Criterio de Done
- [ ] `npx vitest run` ejecuta sin error de configuración (0 tests es válido)
- [ ] El umbral de cobertura aplica solo a `lib/` y `modules/`

### Sub-pasos AI-TDD
> Tooling: test-after.
1. Crear `vitest.config.ts`.
2. Ejecutar `npx vitest run` → sin error de config.

---

## T-04: playwright.config.ts (desktop + mobile)
**Fase**: F0
**Specialist**: node-backend-specialist
**Estimación**: 30 min
**Dependencias**: T-01
**Escenarios BDD cubiertos**: ninguno (infraestructura)

### Contexto
Configurar Playwright con `baseURL` apuntando al `npm run preview` (artefacto de `dist/`) y
proyectos para viewport desktop + mobile (cubre los escenarios responsivos).

### Archivos a crear/modificar
- `playwright.config.ts` — `baseURL`, `webServer` lanzando `npm run preview`, proyectos `desktop` (chromium) y `mobile` (viewport estrecho)

### Criterio de Done
- [ ] `npx playwright --version` ejecuta sin error
- [ ] La config declara al menos un proyecto desktop y uno mobile

### Sub-pasos AI-TDD
> Tooling: test-after.
1. Crear `playwright.config.ts`.
2. Ejecutar `npx playwright --version` → sin error.

---

## T-05: .gitignore + scripts build/copy:assets
**Fase**: F0
**Specialist**: node-backend-specialist
**Estimación**: 30 min
**Dependencias**: T-01, T-02
**Escenarios BDD cubiertos**: ninguno (infraestructura)

### Contexto
Cerrar el setup: ignorar artefactos y formalizar el pipeline de build (`tsc` + copia de
HTML/CSS/assets a `dist/`) orquestado con `npm-run-all`.

### Archivos a crear/modificar
- `.gitignore` — `node_modules/`, `dist/`, `coverage/`, `playwright-report/`, `test-results/`
- `package.json` — finalizar `build` (build:ts + copy:assets) y `copy:assets`, `preview`

### Criterio de Done
- [ ] `npm run build` corre sin error (aunque produzca poco contenido aún)
- [ ] `dist/` y `node_modules/` están ignorados por git

### Sub-pasos AI-TDD
> Tooling: test-after.
1. Crear `.gitignore`.
2. Completar scripts `build`/`copy:assets`/`preview` en `package.json`.
3. Ejecutar `npm run build` → sin error.

---

## FASE 1 — Design system

## T-06: tokens.css (custom properties "modern rustic")
**Fase**: F1
**Specialist**: frontend-specialist
**Estimación**: 45 min
**Dependencias**: T-01
**Escenarios BDD cubiertos**: Scenario: Diseño mobile-first coherente (parcial: estética tonos tierra/oliva, serif+sans)

### Contexto
Definir todo el design system como custom properties bajo `:root` (paleta tierra/siena/oliva,
tipografías serif+sans, escalas de fuente, espaciado, sombras, navbar). Fuente única de verdad;
ningún valor hardcodeado fuera de este archivo (D-04).

### Archivos a crear/modificar
- `src/css/tokens.css` — todas las custom properties del tech-spec (paleta, `--font-serif`/`--font-sans`, `--fs-*`, `--space-section`, `--radius*`, `--shadow-card`, `--navbar-height`, `--navbar-bg-solid`)

### Criterio de Done
- [ ] Todas las variables del tech-spec están presentes con sus valores exactos
- [ ] Ningún componente posterior usará literales de color/fuente fuera de `var(--...)`

### Sub-pasos AI-TDD
> CSS: test-after (cubierto luego por E2E responsive/visual).
1. Crear `:root` con la paleta, tipografías, escalas, espaciado y tokens de navbar.
2. Verificar resolución de variables en devtools sobre una página de prueba.

---

## T-07: base.css + layout.css + main.css (orquestador @import)
**Fase**: F1
**Specialist**: frontend-specialist
**Estimación**: 45 min
**Dependencias**: T-06
**Escenarios BDD cubiertos**: Scenario: Diseño mobile-first coherente (parcial)

### Contexto
Estilos base (reset ligero, `body` con `--rustica-cream` + `--font-sans`, tipografía base,
utilidades `.rustica-*`), helpers de layout (contenedores, `--space-section`, grid sobre
Bootstrap) y el punto de entrada `main.css` que importa todo en orden.

### Archivos a crear/modificar
- `src/css/base.css` — reset, body, tipografía base, utilidades `rustica-*`
- `src/css/layout.css` — contenedores, secciones, grid helpers
- `src/css/main.css` — `@import` en orden: tokens → base → layout → components/*

### Criterio de Done
- [ ] `main.css` importa en orden correcto sin rutas rotas
- [ ] `body` usa `--rustica-cream` y `--font-sans`; títulos usan `--font-serif`

### Sub-pasos AI-TDD
> CSS: test-after.
1. Crear `base.css` y `layout.css` referenciando solo tokens.
2. Crear `main.css` con los `@import` ordenados (incluye placeholders de components/).
3. Cargar en navegador y verificar que no hay imports rotos.

---

## FASE 2 — HTML semántico completo

## T-08: index.html — head (CDN) + landmarks + navbar/hero
**Fase**: F2
**Specialist**: frontend-specialist
**Estimación**: 75 min
**Dependencias**: T-07
**Escenarios BDD cubiertos**: Scenario: La barra de navegación es transparente al inicio; Scenario: Navegación accesible en móvil; Scenario: Presentación del mensaje emocional

### Contexto
Crear `index.html` con `<head>` (Bootstrap 5.3, FontAwesome 6.5, Google Fonts preconnect +
Playfair Display/Source Sans 3, `<link>` a `css/main.css`, `<script type="module" src="js/main.js">`),
los landmarks HTML5 (`<header><nav>`, `<main>`, `<footer>`) y las secciones navbar (con botón
hamburguesa) y `<section id="hero">` con CTA "Reserva una Mesa".

### Archivos a crear/modificar
- `src/index.html` — head con CDN+SRI donde aplique; `<header><nav>` con logo, enlaces de ancla y toggler Bootstrap; `<section id="hero">` con imagen de fondo, supertítulo, subtítulo y CTA enlazando a `#reservation`; comentarios `<!-- section: navbar -->`/`<!-- section: hero -->`

### Criterio de Done
- [ ] Landmarks `header/nav/main/footer` presentes; navbar con toggler hamburguesa
- [ ] Hero tiene supertítulo, subtítulo y CTA `href="#reservation"` con texto "Reserva una Mesa"
- [ ] Cero atributos `style=` en línea; clases `rustica-*`

### Sub-pasos AI-TDD
> HTML: test-after (cubierto por E2E navegación/hero).
1. Maquetar `<head>` con CDNs y enlaces a CSS/JS.
2. Maquetar navbar (logo + anclas + hamburguesa) y hero (CTA→#reservation).
3. Validar HTML5 y ausencia de estilos en línea.

---

## T-09: index.html — galería (tabs+grids) + menú (4 cards)
**Fase**: F2
**Specialist**: frontend-specialist
**Estimación**: 75 min
**Dependencias**: T-08
**Escenarios BDD cubiertos**: Scenario: Cambio entre pestañas de galería; Scenario: Ampliar una imagen en visor (lightbox) [markup]; Scenario: Visualización de los 4 platos estrella

### Contexto
Maquetar `<section id="gallery">` con las pestañas Bootstrap "El Restaurante"/"Nuestros Platos"
y sus grids de imágenes, más el contenedor del lightbox (modal Bootstrap). Maquetar
`<section id="menu">` con exactamente 4 cards de plato (foto, nombre, descripción, precio,
etiqueta Recomendado/Especialidad donde aplique).

### Archivos a crear/modificar
- `src/index.html` — `<section id="gallery">` (nav-tabs + tab-panes con grids, modal lightbox); `<section id="menu">` (4 `.rustica-dish-card`); comentarios `<!-- section: gallery -->`/`<!-- section: menu -->`

### Criterio de Done
- [ ] Galería con 2 pestañas y sus grids; contenedor modal para lightbox presente
- [ ] Menú con exactamente 4 cards; cada una con foto, nombre, descripción, precio y etiqueta donde aplique
- [ ] Cero `style=` en línea

### Sub-pasos AI-TDD
> HTML: test-after (cubierto por E2E galería + unit gallery jsdom).
1. Maquetar tabs + grids + modal de la galería.
2. Maquetar las 4 cards de plato con sus campos.
3. Validar conteo de cards (4) y estructura de tabs.

---

## T-10: index.html — reserva + contacto/eventos + footer
**Fase**: F2
**Specialist**: frontend-specialist
**Estimación**: 90 min
**Dependencias**: T-09
**Escenarios BDD cubiertos**: Scenario: Visualización de datos de contacto en escritorio; Scenario: Acceso a redes sociales y copyright; (markup base de reserva y eventos)

### Contexto
Maquetar `<section id="reservation">` (form con Nombre, Correo, Teléfono, Fecha, `<select>` Hora
de 24 slots 12:00–23:30, Personas `min=1 max=30`), `<section id="contact">` (2 columnas: datos
con iconos + mapa placeholder a la izquierda / form catering-eventos a la derecha) y `<footer>`
(iconos de redes sociales + copyright).

### Archivos a crear/modificar
- `src/index.html` — `<section id="reservation">` (form completo, select 24 opciones, partySize min/max); `<section id="contact">` (datos+iconos+mapa placeholder + form eventos con tipo/fecha/invitados/mensaje); `<footer>` (redes + copyright); comentarios `<!-- section: X -->`

### Criterio de Done
- [ ] El `<select>` de hora lista exactamente 24 opciones (12:00 … 23:30)
- [ ] El campo personas declara `min=1 max=30`
- [ ] Contacto en 2 columnas (datos+mapa / form eventos); footer con redes y copyright
- [ ] Cero `style=` en línea

### Sub-pasos AI-TDD
> HTML: test-after (cubierto por E2E reserva/eventos/responsive).
1. Maquetar form de reserva (con select de 24 slots y partySize min/max).
2. Maquetar contacto (2 columnas + mapa placeholder + form eventos) y footer.
3. Validar conteo de slots (24), atributos min/max, landmarks y ausencia de `style=`.

---

## FASE 3 — CSS por componente

## T-11: navbar.css + hero.css
**Fase**: F3
**Specialist**: frontend-specialist
**Estimación**: 60 min
**Dependencias**: T-08, T-07
**Escenarios BDD cubiertos**: Scenario: La barra de navegación es transparente al inicio; Scenario: La barra se vuelve sólida al desplazarse; Scenario: Presentación del mensaje emocional

### Contexto
Estilar la navbar (transparente sobre Hero / `.navbar--solid` en `--rustica-olive-dark`, fija,
offset `--navbar-height`) y el Hero (imagen de fondo, overlay, CTA prominente). La clase
`.navbar--solid` es el contrato que togglea el módulo `navbar.ts` (F5).

### Archivos a crear/modificar
- `src/css/components/navbar.css` — estados transparente/sólida, fija, transición
- `src/css/components/hero.css` — fondo, overlay, jerarquía tipográfica, CTA

### Criterio de Done
- [ ] Navbar fija; `.navbar--solid` aplica fondo oliva-dark; transición suave
- [ ] Hero legible sobre la imagen (overlay) con CTA prominente; todo vía tokens

### Sub-pasos AI-TDD
> CSS: test-after (cubierto por E2E navegación).
1. Estilar navbar (transparente, `.navbar--solid`, fija, offset).
2. Estilar hero (fondo, overlay, CTA).

---

## T-12: gallery.css + menu.css
**Fase**: F3
**Specialist**: frontend-specialist
**Estimación**: 60 min
**Dependencias**: T-09, T-07
**Escenarios BDD cubiertos**: Scenario: Efecto visual al pasar el cursor; Scenario: Adaptación responsiva de la cuadrícula; (estilos lightbox y tabs activos)

### Contexto
Estilar la galería (tabs activos, grid responsive, hover zoom sutil en escritorio, estilos del
lightbox) y el menú (cards de plato, etiquetas Recomendado/Especialidad, grid 1→2→4 columnas).

### Archivos a crear/modificar
- `src/css/components/gallery.css` — tab activo, grid responsive, hover zoom, modal lightbox
- `src/css/components/menu.css` — cards, etiquetas, grid 1→2→4 columnas

### Criterio de Done
- [ ] Hover aplica zoom sutil en escritorio; tab activo destacado
- [ ] Menú reorganiza 1→2→4 columnas por breakpoint sin recortar info

### Sub-pasos AI-TDD
> CSS: test-after (cubierto por E2E galería/responsive).
1. Estilar galería (tabs, grid, hover zoom, lightbox).
2. Estilar menú (cards, etiquetas, grid responsive).

---

## T-13: reservation.css + contact.css + footer.css
**Fase**: F3
**Specialist**: frontend-specialist
**Estimación**: 60 min
**Dependencias**: T-10, T-07
**Escenarios BDD cubiertos**: Scenario: Visualización de datos de contacto en escritorio; Scenario: Apilado de columnas en móvil; Scenario: Acceso a redes sociales y copyright; (estados de validación de formularios)

### Contexto
Estilar el formulario de reserva (incluyendo estados `.is-valid`/`.is-invalid` y mensajes), la
sección de contacto (2 columnas en `lg`, apilado en móvil, iconos, mapa) y el footer (iconos
sociales, copyright).

### Archivos a crear/modificar
- `src/css/components/reservation.css` — form, estados de validación, mensajes
- `src/css/components/contact.css` — 2 columnas lg / apiladas móvil, iconos, mapa
- `src/css/components/footer.css` — iconos sociales, copyright

### Criterio de Done
- [ ] Estados `.is-valid`/`.is-invalid` con colores semánticos (`--rustica-success`/`--rustica-error`)
- [ ] Contacto 2 columnas en `lg` y apilado en móvil; footer estilado
- [ ] Mobile-first sin desbordes horizontales

### Sub-pasos AI-TDD
> CSS: test-after (cubierto por E2E reserva/responsive).
1. Estilar form de reserva + estados de validación.
2. Estilar contacto (2 columnas/apilado + mapa) y footer.

---

## FASE 4 — TypeScript lib/ + types/ + data/ (TDD estricto)

## T-14: types/index.ts (contratos de datos)
**Fase**: F4
**Specialist**: frontend-specialist
**Estimación**: 30 min
**Dependencias**: T-02
**Escenarios BDD cubiertos**: ninguno directo (contratos compartidos)

### Contexto
Definir los tipos compartidos que consumen validadores, módulos y datos. Hoja del grafo de
dependencias (sin imports internos).

### Archivos a crear/modificar
- `src/ts/types/index.ts` — `FieldError`, `ValidationResult`, `ReservationData`, `EventRequest`, `Dish`, `SiteContent`

### Criterio de Done
- [ ] Tipos coinciden con el modelo de contenido del plan
- [ ] `npm run lint` limpio (strict)

### Sub-pasos AI-TDD
> Tipos puros: test-after (se ejercitan vía los tests de validadores).
1. Declarar todas las interfaces/types del modelo de contenido.
2. `npm run lint` → sin errores.

---

## T-15: lib/validators.ts (TDD estricto)
**Fase**: F4
**Specialist**: frontend-specialist
**Estimación**: 90 min
**Dependencias**: T-14, T-03
**Escenarios BDD cubiertos**: Scenario: Formato de correo inválido; Scenario: Fecha en el pasado; Scenario: Número de personas fuera de rango; Scenario: Campos obligatorios vacíos (lógica pura); Scenario: Envío de una reserva válida (composición); Scenario: Solicitud de eventos incompleta (composición)

### Contexto
Núcleo de dominio puro (sin DOM, D-05): `isRequired`, `isValidEmail`, `isNotPastDate`,
`isPartySizeInRange` (entero 1–30), `validateReservation`, `validateEventRequest`. Debe rozar
el 100% de cobertura. TDD estricto: tests primero.

### Archivos a crear/modificar
- `tests/unit/validators.test.ts` — casos: email inválido/válido, requerido vacío, fecha pasada/hoy/futura, partySize 0/1/30/31 y no-entero, time fuera de TIME_SLOTS, composición válida/ inválida
- `src/ts/lib/validators.ts` — implementación de las funciones puras

### Criterio de Done
- [ ] Tests RED escritos antes y luego GREEN (`npm run test`)
- [ ] Cobertura de `validators.ts` cerca de 100%
- [ ] `npm run lint` limpio

### Sub-pasos AI-TDD
1. **RED**: `tests/unit/validators.test.ts` con todos los casos límite. `npm run test` → falla (módulo inexistente).
2. **GREEN**: implementar `src/ts/lib/validators.ts` mínimo. `npm run test` → pasa.
3. **REFACTOR**: extraer regex de email, helpers de fecha; mejorar nombres. `npm run test` → sigue verde.

---

## T-16: data/content.ts (TIME_SLOTS, rango, platos, contacto)
**Fase**: F4
**Specialist**: frontend-specialist
**Estimación**: 45 min
**Dependencias**: T-14, T-15
**Escenarios BDD cubiertos**: Scenario: Visualización de los 4 platos estrella (datos); Scenario: Número de personas fuera de rango (constantes 1–30)

### Contexto
Contenido centralizado (D-06, fuente única de verdad): `PARTY_SIZE_MIN=1`, `PARTY_SIZE_MAX=30`,
`TIME_SLOTS` (24 slots 12:00–23:30 generados por algoritmo), `dishes` (exactamente 4), contacto
y redes. Alimenta tanto el `<select>` como los validadores.

### Archivos a crear/modificar
- `tests/unit/validators.test.ts` — añadir asserts: `TIME_SLOTS.length === 24`, primero `12:00`, último `23:30`; `dishes.length === 4`
- `src/ts/data/content.ts` — `PARTY_SIZE_*`, `TIME_SLOTS`, `dishes`, `contact`, `social`

### Criterio de Done
- [ ] `TIME_SLOTS` tiene 24 entradas (primera 12:00, última 23:30)
- [ ] Exactamente 4 platos; constantes de rango = 1 y 30
- [ ] Tests verdes (`npm run test`)

### Sub-pasos AI-TDD
1. **RED**: añadir asserts de `TIME_SLOTS`/`dishes`/rango. `npm run test` → falla.
2. **GREEN**: implementar `content.ts` (generador de slots + datos). `npm run test` → pasa.
3. **REFACTOR**: aislar el generador de slots; tipar con `Dish`/`SiteContent`. Verde.

---

## T-17: lib/smooth-scroll.ts (TDD) + lib/dom.ts
**Fase**: F4
**Specialist**: frontend-specialist
**Estimación**: 60 min
**Dependencias**: T-14, T-03
**Escenarios BDD cubiertos**: Scenario: Navegación con desplazamiento suave (cálculo de offset, lógica pura); (helpers DOM usados por validación visual)

### Contexto
`smooth-scroll.ts`: `scrollToAnchor(hash, offset)` con cálculo de offset de navbar fija (parte
pura testeable, efecto de scroll aislado). `dom.ts`: helpers tipados `qs`, `qsa`, `on`,
`setError`, `clearError` (adaptador de DOM testeable con jsdom). TDD estricto en el cálculo de offset.

### Archivos a crear/modificar
- `tests/unit/smooth-scroll.test.ts` — cálculo de posición destino con offset; resolución de hash inexistente
- `src/ts/lib/smooth-scroll.ts` — `scrollToAnchor`
- `src/ts/lib/dom.ts` — `qs`, `qsa`, `on`, `setError`, `clearError`

### Criterio de Done
- [ ] Test del cálculo de offset RED→GREEN (`npm run test`)
- [ ] `dom.ts` helpers tipados; `setError`/`clearError` togglean clases/mensajes en jsdom
- [ ] `npm run lint` limpio

### Sub-pasos AI-TDD
1. **RED**: `smooth-scroll.test.ts` con cálculo de offset. `npm run test` → falla.
2. **GREEN**: implementar `smooth-scroll.ts` y `dom.ts`. `npm run test` → pasa.
3. **REFACTOR**: separar cálculo puro del efecto `scrollTo`; tipar helpers DOM. Verde.

---

## FASE 5 — TypeScript modules/ + main.ts

## T-18: modules/reservation.ts + events-form.ts (TDD jsdom)
**Fase**: F5
**Specialist**: frontend-specialist
**Estimación**: 120 min
**Dependencias**: T-15, T-16, T-17, T-10
**Escenarios BDD cubiertos**: Scenario: Envío de una reserva válida; Scenario: Campos obligatorios vacíos; Scenario: Formato de correo inválido; Scenario: Fecha en el pasado; Scenario: Número de personas fuera de rango; Scenario: Envío de solicitud de catering/eventos válida; Scenario: Solicitud de eventos incompleta

### Contexto
Adaptadores de formulario: interceptan submit, validan vía `validateReservation`/
`validateEventRequest` (puros), marcan errores con `lib/dom.ts` y muestran confirmación visual.
`reservation.ts` puebla el `<select>` desde `TIME_SLOTS`. TDD estricto con jsdom montando el
markup real de cada `<section>`.

### Archivos a crear/modificar
- `tests/unit/reservation.test.ts` — bloqueo submit inválido (vacíos/email/fecha/personas 1–30), marcado de errores, confirmación, poblado de slots
- `tests/unit/events-form.test.ts` — validación e incompletos, confirmación
- `src/ts/modules/reservation.ts` — `initReservation()`
- `src/ts/modules/events-form.ts` — `initEventsForm()`

### Criterio de Done
- [ ] Tests RED→GREEN con fragmentos HTML reales en jsdom (`npm run test`)
- [ ] Submit inválido bloqueado y campos marcados; submit válido confirma visualmente
- [ ] Cada módulo exporta `init*()` y NO se auto-ejecuta

### Sub-pasos AI-TDD
1. **RED**: tests jsdom montando el form real; casos válido/ inválido. `npm run test` → falla.
2. **GREEN**: implementar `reservation.ts` (puebla slots + valida) y `events-form.ts`. `npm run test` → pasa.
3. **REFACTOR**: extraer patrón común de wiring formulario→validador→errores. Verde.

---

## T-19: modules/lightbox.ts + gallery.ts (gallery TDD jsdom)
**Fase**: F5
**Specialist**: frontend-specialist
**Estimación**: 90 min
**Dependencias**: T-17, T-09
**Escenarios BDD cubiertos**: Scenario: Cambio entre pestañas de galería (lógica jsdom); Scenario: Ampliar una imagen en visor (lightbox) (wiring; cierre cubierto por E2E)

### Contexto
`lightbox.ts`: `initLightbox()`, `openLightbox(src)` sobre Bootstrap Modal (cubierto por E2E).
`gallery.ts`: `initGallery()` cambio de pestañas (estado activo + visibilidad de grids) y
apertura del lightbox al click en imagen. La lógica de cambio de pestaña se prueba con jsdom (TDD).

### Archivos a crear/modificar
- `tests/unit/gallery.test.ts` — cambio de tab: pane activo + visibilidad de grids
- `src/ts/modules/lightbox.ts` — `initLightbox()`, `openLightbox(src)`
- `src/ts/modules/gallery.ts` — `initGallery()`

### Criterio de Done
- [ ] `gallery.test.ts` RED→GREEN para cambio de pestaña (`npm run test`)
- [ ] Click en imagen invoca `openLightbox(src)` con la fuente correcta
- [ ] Cada módulo exporta `init*()` y NO se auto-ejecuta

### Sub-pasos AI-TDD
1. **RED**: `gallery.test.ts` (tab activo + visibilidad) en jsdom. `npm run test` → falla.
2. **GREEN**: implementar `gallery.ts` (tabs) y `lightbox.ts` (open/close). `npm run test` → pasa.
3. **REFACTOR**: separar lógica de estado de tabs del binding Bootstrap. Verde.

---

## T-20: modules/navbar.ts + main.ts (orquestador) + build verificable
**Fase**: F5
**Specialist**: frontend-specialist
**Estimación**: 75 min
**Dependencias**: T-17, T-18, T-19, T-11
**Escenarios BDD cubiertos**: Scenario: La barra se vuelve sólida al desplazarse (wiring); Scenario: Navegación con desplazamiento suave (wiring); Scenario: La CTA del Hero lleva a reservas (wiring) — verificación final por E2E en F7

### Contexto
`navbar.ts`: `initNavbar()` (listener de scroll → toggle `.navbar--solid` pasado el Hero;
smooth-scroll en enlaces de ancla vía `lib/smooth-scroll`). `main.ts`: orquesta todos los
`init*()` en `DOMContentLoaded`. Punto de convergencia: deja el build ejecutable.

### Archivos a crear/modificar
- `src/ts/modules/navbar.ts` — `initNavbar()`
- `src/ts/main.ts` — importa e inicializa navbar/gallery/lightbox/reservation/events-form en `DOMContentLoaded`

### Criterio de Done
- [ ] `npm run build:ts` emite ESM a `dist/js/` sin errores
- [ ] `npm run build` + `npm run preview`: navbar conmuta, tabs cambian, lightbox abre/cierra, forms bloquean inválido y confirman válido (verificación manual previa a E2E)
- [ ] `main.ts` es el único auto-ejecutable; los módulos solo exportan `init*()`

### Sub-pasos AI-TDD
> navbar (scroll real) y main: test-after, cubierto por E2E en F7.
1. Implementar `navbar.ts` (scroll toggle + smooth-scroll de anclas).
2. Implementar `main.ts` (orquesta init* en DOMContentLoaded).
3. `npm run build` + `npm run preview` → verificación manual del flujo completo.

---

## FASE 6 — Tests unitarios (consolidación cobertura)

## T-21: Consolidación cobertura unit ≥80% (Vitest CI)
**Fase**: F6
**Specialist**: frontend-specialist
**Estimación**: 75 min
**Dependencias**: T-18, T-19, T-20
**Escenarios BDD cubiertos**: (consolida los unit de reserva/eventos/galería/validadores)

### Contexto
Cerrar la cobertura unitaria: completar huecos en `tests/unit/` (reservation, events-form,
gallery) para alcanzar **≥80%** en `src/ts/lib/` y `src/ts/modules/` y verificar el mapeo
BDD→test del plan (D-09).

### Archivos a crear/modificar
- `tests/unit/reservation.test.ts` — completar casos faltantes (slots, rango límite)
- `tests/unit/events-form.test.ts` — completar incompletos/inválidos
- `tests/unit/gallery.test.ts` — completar ramas de visibilidad

### Criterio de Done
- [ ] `npm run test:ci` pasa con cobertura **≥80%** en `lib/` y `modules/`
- [ ] Mapeo BDD→test (D-09) verificable: cada escenario unit del plan tiene su test

### Sub-pasos AI-TDD
1. **RED**: añadir tests para ramas no cubiertas detectadas por el reporte de cobertura.
2. **GREEN**: ajustar implementación mínima si alguna rama falla. `npm run test:ci` → pasa con ≥80%.
3. **REFACTOR**: deduplicar helpers de montaje de fixtures HTML. Verde.

---

## FASE 7 — Tests E2E (Playwright)

## T-22: Suite E2E Playwright (navegación, galería, reserva, eventos, responsive)
**Fase**: F7
**Specialist**: e2e-specialist
**Estimación**: 180 min
**Dependencias**: T-20, T-08, T-09, T-10, T-11, T-12, T-13
**Escenarios BDD cubiertos**: Scenario: La barra de navegación es transparente al inicio; Scenario: La barra se vuelve sólida al desplazarse; Scenario: Navegación con desplazamiento suave; Scenario: Navegación accesible en móvil; Scenario: La CTA del Hero lleva a reservas; Scenario: Cambio entre pestañas de galería; Scenario: Ampliar una imagen en visor (lightbox); Scenario: Efecto visual al pasar el cursor; Scenario: Envío de una reserva válida; Scenario: Campos obligatorios vacíos; Scenario: Formato de correo inválido; Scenario: Fecha en el pasado; Scenario: Número de personas fuera de rango; Scenario: Visualización de datos de contacto en escritorio; Scenario: Envío de solicitud de catering/eventos válida; Scenario: Solicitud de eventos incompleta; Scenario: Apilado de columnas en móvil; Scenario: Adaptación responsiva de la cuadrícula; Scenario: Diseño mobile-first coherente

### Contexto
Validar los flujos de UI reales que jsdom no cubre (scroll, viewport, Bootstrap JS) contra el
artefacto servido por `npm run preview`. Cierra el mapeo BDD→test del plan.

### Archivos a crear/modificar
- `tests/e2e/navigation.spec.ts` — navbar transparente→sólida + fija, smooth scroll sin ocultar sección, CTA Hero→reservas, hamburguesa móvil
- `tests/e2e/gallery.spec.ts` — cambio de tab, abrir/cerrar lightbox, hover zoom escritorio
- `tests/e2e/reservation.spec.ts` — envío válido confirma; vacíos/email/fecha pasada/personas fuera de 1–30 bloquean
- `tests/e2e/events.spec.ts` — envío válido confirma; incompletos bloquean
- `tests/e2e/responsive.spec.ts` — sin desbordes horizontales móvil/tablet/escritorio; apilado de contacto

### Criterio de Done
- [ ] `npm run test:e2e` pasa en verde contra `npm run preview`
- [ ] Todos los escenarios BDD del spec quedan cubiertos por unit (F4/F6) o E2E (F7)

### Sub-pasos AI-TDD
> E2E: test-after por naturaleza (valida UI ya construida). Sin ciclo RED/GREEN de implementación.
1. Escribir specs por feature (navegación, galería, reserva, eventos, responsive).
2. Ejecutar `npm run test:e2e` contra `npm run preview` → verde.
3. Verificar el mapeo BDD→test completo (D-09).

---

## Resumen
| ID | Fase | Nombre | Specialist | Est. (min) | Dependencias |
|----|------|--------|-----------|-----------|-------------|
| T-01 | F0 | Esqueleto carpetas + package.json + scripts | node-backend-specialist | 45 | - |
| T-02 | F0 | tsconfig.json (ESM) | node-backend-specialist | 30 | T-01 |
| T-03 | F0 | vitest.config.ts (jsdom + cov 80%) | node-backend-specialist | 30 | T-01 |
| T-04 | F0 | playwright.config.ts (desktop+mobile) | node-backend-specialist | 30 | T-01 |
| T-05 | F0 | .gitignore + scripts build/copy | node-backend-specialist | 30 | T-01, T-02 |
| T-06 | F1 | tokens.css | frontend-specialist | 45 | T-01 |
| T-07 | F1 | base/layout/main.css | frontend-specialist | 45 | T-06 |
| T-08 | F2 | index.html — head + navbar + hero | frontend-specialist | 75 | T-07 |
| T-09 | F2 | index.html — galería + menú | frontend-specialist | 75 | T-08 |
| T-10 | F2 | index.html — reserva + contacto + footer | frontend-specialist | 90 | T-09 |
| T-11 | F3 | navbar.css + hero.css | frontend-specialist | 60 | T-08, T-07 |
| T-12 | F3 | gallery.css + menu.css | frontend-specialist | 60 | T-09, T-07 |
| T-13 | F3 | reservation/contact/footer.css | frontend-specialist | 60 | T-10, T-07 |
| T-14 | F4 | types/index.ts | frontend-specialist | 30 | T-02 |
| T-15 | F4 | lib/validators.ts (TDD) | frontend-specialist | 90 | T-14, T-03 |
| T-16 | F4 | data/content.ts (slots/rango/platos) | frontend-specialist | 45 | T-14, T-15 |
| T-17 | F4 | lib/smooth-scroll.ts (TDD) + lib/dom.ts | frontend-specialist | 60 | T-14, T-03 |
| T-18 | F5 | modules/reservation + events-form (TDD jsdom) | frontend-specialist | 120 | T-15, T-16, T-17, T-10 |
| T-19 | F5 | modules/lightbox + gallery (TDD jsdom) | frontend-specialist | 90 | T-17, T-09 |
| T-20 | F5 | modules/navbar + main.ts + build | frontend-specialist | 75 | T-17, T-18, T-19, T-11 |
| T-21 | F6 | Consolidación cobertura unit ≥80% | frontend-specialist | 75 | T-18, T-19, T-20 |
| T-22 | F7 | Suite E2E Playwright | e2e-specialist | 180 | T-20, T-08, T-09, T-10, T-11, T-12, T-13 |

**Total: 22 tareas · 1.440 min ≈ 24,0 h**

### Reparto por specialist
| Specialist | Tareas | Minutos |
|-----------|--------|---------|
| node-backend-specialist | 5 (T-01…T-05) | 165 |
| frontend-specialist | 16 (T-06…T-21) | 1.095 |
| e2e-specialist | 1 (T-22) | 180 |

### Ruta crítica
`T-01 → T-02 → T-14 → T-15 → T-16/T-17 → T-18 → T-20 → T-21/T-22`
(las Fases 1+4 pueden solaparse tras T-01; F3 depende de su HTML+tokens; F7 cierra sobre build+UI).
