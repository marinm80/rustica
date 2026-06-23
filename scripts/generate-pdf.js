import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import PDFDocument from 'pdfkit';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Images ──
const BRAIN = '/home/marin/snap/antigravity-cli/4/.gemini/antigravity-cli/brain/37596356-0838-488b-8c06-e8ca7356c5b5';
const findImg = (...ps) => ps.find(p => fs.existsSync(p)) || null;
const LANDING_IMG  = findImg(path.join(BRAIN, 'landing_mockup_1781706248094.jpg'));
const DASHBOARD_IMG = findImg(path.join(BRAIN, 'dashboard_mockup_1781706263340.jpg'));

// ── Output ──
const DOCS = path.join(__dirname, '..', 'docs');
const OUT  = path.join(DOCS, 'propuesta_sistema_rustica.pdf');
if (!fs.existsSync(DOCS)) fs.mkdirSync(DOCS, { recursive: true });

// ── Palette ──
const C = {
    olive: '#4A5D3B', earth: '#7B3F00', dark: '#2C3E50', cream: '#FDFBF7',
    white: '#FFFFFF', gray: '#BDC3C7', mint: '#EBF3E6',
};

// ── Layout ──
const M  = 54, PW = 612, PH = 792;
const CW = PW - M * 2;       // 504
const CONTENT_TOP = 48;       // Y below header band
const FOOTER_Y    = PH - 58;  // max content Y

// ── Doc ──
const doc = new PDFDocument({ size: 'LETTER', autoFirstPage: false,
    margins: { top: M, bottom: M, left: M, right: M } });
const ws = fs.createWriteStream(OUT);
doc.pipe(ws);

let pageNum = 0;

// ── Draw header + footer on current page ──
//
// FIX (paginas en blanco): el encabezado se dibuja en y=6 (sobre el margen
// superior) y el pie en y=PH-20=772 (debajo del margen inferior de contenido,
// PH - M = 738). Cuando PDFKit renderiza texto fuera del area de contenido,
// su LineWrapper invoca continueOnNewPage() y AGREGA una pagina automatica
// por cada linea -> por eso aparecian 2 hojas en blanco tras cada pagina real.
//
// Solucion: anulamos temporalmente los margenes de la pagina (top/bottom = 0)
// mientras dibujamos el "chrome", de modo que el limite de paginacion pase a
// ser la pagina completa y PDFKit ya no inserte hojas. Restauramos los margenes
// al terminar. Ademas usamos lineBreak:false para forzar texto de una sola linea.
function drawChrome() {
    doc.save();
    const mB = doc.page.margins.bottom, mT = doc.page.margins.top;
    doc.page.margins.bottom = 0; doc.page.margins.top = 0;   // <-- clave del fix

    doc.rect(0, 0, PW, 22).fill(C.olive);
    doc.rect(0, 22, PW, 3).fill(C.earth);
    doc.fontSize(7).fillColor(C.white)
       .text('PROPUESTA TECNOLOGICA  -  SISTEMA DIGITAL RUSTICA', M, 6, { width: CW, lineBreak: false });
    doc.rect(0, PH - 28, PW, 0.4).fill(C.gray);
    doc.fontSize(6.5).fillColor(C.dark)
       .text('CONFIDENCIAL  -  Restaurante Rustica', M, PH - 20, { width: 240, lineBreak: false });
    doc.fontSize(6.5).fillColor(C.dark)
       .text('Pagina ' + pageNum, PW - M - 50, PH - 20, { width: 50, align: 'right', lineBreak: false });

    doc.page.margins.bottom = mB; doc.page.margins.top = mT;  // restauramos margenes
    doc.restore();
}

function newPage() {
    pageNum++;
    doc.addPage({ size: 'LETTER', margins: { top: M, bottom: M, left: M, right: M } });
    drawChrome();
    doc.x = M; doc.y = CONTENT_TOP;
}

// ── Ensure space; if not enough, start new page ──
function need(pts) {
    if (doc.y + pts > FOOTER_Y) newPage();
}

// ── Section title: only forces new page if <200pt left ──
function secTitle(t) {
    if (doc.y > FOOTER_Y - 200) newPage();
    else if (doc.y > CONTENT_TOP + 10) { doc.y += 18; } // separator
    doc.fontSize(16).fillColor(C.olive).text(t, M, doc.y, { width: CW, lineGap: 8 });
    doc.moveDown(0.3);
}

function heading(t) {
    need(26);
    doc.fontSize(11).fillColor(C.dark).text(t, M, doc.y, { width: CW, underline: true, lineGap: 4 });
    doc.moveDown(0.25);
}

function para(t) {
    need(16);
    doc.fontSize(9.5).fillColor(C.dark).text(t, M, doc.y, { width: CW, align: 'justify', lineGap: 4 });
    doc.moveDown(0.3);
}

function bul(label, body) {
    need(22);
    doc.fontSize(9.5).fillColor(C.olive).text('> ' + label + ': ', M, doc.y, { width: CW, continued: true, lineGap: 3.5 });
    doc.fillColor(C.dark).text(body, { lineGap: 3.5 });
    doc.moveDown(0.1);
}

function bulS(t) {
    need(13);
    doc.fontSize(9).fillColor(C.dark).text('  -  ' + t, M, doc.y, { width: CW, lineGap: 3 });
}

function box(title, body, h) {
    h = h || 75;
    need(h + 6);
    const y0 = doc.y;
    doc.save();
    doc.rect(M, y0, CW, h).fill(C.mint);
    doc.fontSize(10).fillColor(C.olive).text(title, M + 10, y0 + 8, { width: CW - 20, lineGap: 4 });
    doc.fontSize(8.5).fillColor(C.dark).text(body, M + 10, y0 + 24, { width: CW - 20, lineGap: 3 });
    doc.restore();
    doc.x = M; doc.y = y0 + h + 4;
}

function row(label, val, i) {
    need(19);
    const y0 = doc.y;
    doc.save();
    doc.rect(M, y0, CW, 18).fill(i % 2 === 0 ? C.mint : C.white);
    doc.rect(M, y0 + 18, CW, 0.3).fill(C.gray);
    doc.fontSize(8.5).fillColor(C.olive).text(label, M + 8, y0 + 4, { width: 165 });
    doc.fontSize(8.5).fillColor(C.dark).text(val, M + 175, y0 + 4, { width: CW - 185 });
    doc.restore();
    doc.x = M; doc.y = y0 + 19;
}

function placeholder(label) {
    need(140);
    const y0 = doc.y;
    doc.save();
    doc.rect(M, y0, CW, 120).lineWidth(0.8).dash(4).stroke(C.gray);
    doc.undash();
    doc.fontSize(9).fillColor(C.gray)
       .text('[' + label + ' - imagen no disponible]', M + 80, y0 + 55, { width: CW - 160, align: 'center' });
    doc.restore();
    doc.x = M; doc.y = y0 + 130;
}

// ═══════════════════════════════════════════════════════════════════════════
//  COVER
// ═══════════════════════════════════════════════════════════════════════════
pageNum++;
doc.addPage({ size: 'LETTER', margins: { top: M, bottom: M, left: M, right: M } });
doc.save();
doc.rect(0, 0, PW, PH).fill(C.cream);
doc.rect(0, 0, PW, 320).fill(C.olive);
doc.rect(0, 320, PW, 8).fill(C.earth);
doc.fillColor(C.white)
   .fontSize(32).text('RUSTICA', M, 80, { width: CW, lineGap: 6 })
   .fontSize(18).text('SISTEMA INTEGRAL DE RESERVAS', { width: CW, lineGap: 4 })
   .text('Y OPERACIONES PARA RESTAURANTE', { width: CW, lineGap: 8 })
   .fontSize(11).text('Transformacion digital con alma campestre y gestion agil', { width: CW });
doc.fillColor(C.dark).fontSize(10)
   .text('PROPUESTA COMERCIAL Y ESPECIFICACION TECNICA', M, PH - 210, { width: CW, lineGap: 4 });
doc.fillColor(C.olive).fontSize(9)
   .text('Para: Gerencia de Restaurante Rustica', M, undefined, { width: CW, lineGap: 2.5 })
   .text('Por: Equipo de Desarrollo y Arquitectura Digital', M, undefined, { width: CW, lineGap: 2.5 })
   .text('Fecha: Junio 2026', M, undefined, { width: CW, lineGap: 2.5 })
   .text('Version 1.0  -  Landing + Dashboard + Plugin WordPress', M, undefined, { width: CW });
doc.rect(M, PH - 60, 70, 3).fill(C.olive);
doc.rect(M + 78, PH - 60, 30, 3).fill(C.earth);
doc.restore();

// ═══════════════════════════════════════════════════════════════════════════
//  TOC
// ═══════════════════════════════════════════════════════════════════════════
newPage();
doc.fontSize(16).fillColor(C.olive).text('INDICE DE CONTENIDOS', M, doc.y, { width: CW, lineGap: 8 });
doc.moveDown(0.5);
[
    '1.  Resumen Ejecutivo',
    '2.  Modulo Publico: Landing Page',
    '3.  Vista de Diseno: Landing Page',
    '4.  Modulo Interno: Dashboard de Control',
    '5.  Vista de Diseno: Dashboard',
    '6.  Arquitectura del Backend: Plugin WordPress',
    '7.  API REST: Endpoints del Sistema',
    '8.  Infraestructura y Despliegue',
    '9.  Testing y Aseguramiento de Calidad',
    '10. Especificacion Tecnica y Roadmap',
    '11. Analisis de Mercado y Estrategia',
].forEach(t => doc.fontSize(10.5).fillColor(C.dark).text(t, M + 16, doc.y, { width: CW - 32, lineGap: 8 }));

// ═══════════════════════════════════════════════════════════════════════════
//  1. RESUMEN EJECUTIVO
// ═══════════════════════════════════════════════════════════════════════════
newPage();
secTitle('1. RESUMEN EJECUTIVO');

para('El Restaurante Rustica ofrece una propuesta gastronomica tradicional con alma campestre. ' +
     'En el entorno digital actual, carece de una plataforma propia que proyecte esta identidad ' +
     'y capture el interes de nuevos comensales de manera directa.');

para('Las reservas y consultas dependen de canales dispersos. La operacion diaria (comandas, ' +
     'cocina, reservas) carece de software integrado. Esto mezcla la operacion administrativa ' +
     'con la publica y reduce la eficiencia en horas pico.');

para('Esta propuesta detalla un ecosistema tecnologico completo sobre WordPress con tres modulos:');

box('A. PRESENCIA PUBLICA (LANDING PAGE)',
    '- Identidad "Modern Rustic" con Bootstrap 5 y TypeScript.\n' +
    '- Galeria dinamica con tabs y lightbox. Menu con platos destacados.\n' +
    '- Formulario de reserva con validacion. Seccion de catering/eventos.', 68);

box('B. PANEL OPERACIONAL (DASHBOARD REACT)',
    '- SPA independiente en React + Vite + TailwindCSS.\n' +
    '- Vistas: Mesero (comandas), Cocina (KDS), Gerente (panel completo).\n' +
    '- Autenticacion JWT. Persistencia de sesion y cierre limpio.', 62);

box('C. BACKEND WORDPRESS (PLUGIN RUSTICA SYSTEM)',
    '- 33 endpoints REST en namespace rustica/v1.\n' +
    '- Gestion de 30 mesas, 3 zonas, reservas, comandas y facturacion.\n' +
    '- KDS con alertas >15 min. Roles: mesero, cocina, gerente, admin.', 62);

heading('Beneficios del Enfoque');
bulS('Crecimiento de Reservas: captura directa sin intermediarios ni comisiones.');
bulS('Eficiencia del Personal: pantallas optimizadas por rol reducen retrasos.');
bulS('Escalabilidad: WordPress permite agregar e-commerce, multidiomas o sucursales.');
bulS('Propiedad Total: sin cuotas SaaS; datos 100% del restaurante.');

// ═══════════════════════════════════════════════════════════════════════════
//  2. LANDING PAGE
// ═══════════════════════════════════════════════════════════════════════════
secTitle('2. MODULO PUBLICO: LANDING PAGE');

para('Landing Page One-Page con desplazamiento suave por anclas. Construida con HTML5, ' +
     'Bootstrap 5 (CDN), CSS "Modern Rustic" y TypeScript compilado.');

heading('Secciones y Caracteristicas');
bul('Cabecera Inteligente', 'Barra que pasa de transparente a solida segun el scroll.');
bul('Hero Emocional', 'Tipografia serif, imagen HD del local, CTA hacia reservas.');
bul('Galeria Dinamica', 'Tabs entre fotos del local y platos. Lightbox tactil con flechas.');
bul('Platos Destacados', 'Cuadricula con fotos, precios, ingredientes y badges.');
bul('Formulario Reservas', 'Valida fecha, email y tamano de grupo. Conecta con API REST.');
bul('Contacto y Eventos', 'Datos de contacto, mapa y formulario de cotizacion de catering.');

heading('Stack Tecnico');
bulS('HTML5 semantico + Bootstrap 5.3 CDN + CSS personalizado.');
bulS('TypeScript: validators.ts, gallery.ts, reservation.ts, smooth-scroll.ts.');
bulS('5 archivos de tests unitarios con Vitest + cobertura V8.');

// ═══════════════════════════════════════════════════════════════════════════
//  3. VISTA LANDING
// ═══════════════════════════════════════════════════════════════════════════
secTitle('3. VISTA DE DISENO: LANDING PAGE');

para('Diseno visual del sitio publico con lineamientos "Modern Rustic" (crema, verde oliva, maderas):');

if (LANDING_IMG) {
    need(300);
    doc.image(LANDING_IMG, M, doc.y, { width: CW });
    doc.x = M; doc.y += 290;
} else {
    placeholder('Mockup de Landing Page');
}

heading('Notas de Diseno');
bulS('Tipografia: serif para titulos + sans-serif para cuerpo.');
bulS('Tarjetas de Platos con badges animados de precio y categoria.');
bulS('Paleta: Olive #4A5D3B, Crema #FDFBF7, Terracotta #7B3F00.');
bulS('Diseno mobile-first adaptable a telefonos, tablets y escritorio.');

// ═══════════════════════════════════════════════════════════════════════════
//  4. DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════
secTitle('4. MODULO INTERNO: DASHBOARD DE CONTROL');

para('Dashboard SPA en React independiente, conectado via JWT a la API de WordPress. ' +
     'Estructura basada en cuatro roles del personal.');

heading('Roles del Personal');

box('[MESERO] Comandas de Mesa',
    'Levanta/modifica comandas desde tablet. Redireccion automatica a Comandas. ' +
    'Modificadores (termino, acompanamiento, tamano, hielo, gas), notas y split billing.', 60);

box('[COCINA] Cola de Pedidos (KDS)',
    'Pantallas tactiles grandes. Cola por orden de llegada. Estados: PENDIENTE -> EN PROGRESO -> LISTO. ' +
    'Alertas de urgencia >15 min. Polling cada 5s.', 60);

box('[GERENTE] Supervision Completa',
    'Acceso total. Metricas de ventas, mapa de 30 mesas en 3 zonas, cola de cocina, ' +
    'bandeja de reservas. Recuerda ultima pestana en localStorage.', 60);

heading('Seguridad y Sesiones');
bulS('JWT Auth: token firmado, 1 hora de vigencia, sin refresh automatico.');
bulS('Cierre limpio: token eliminado del navegador al cerrar sesion.');
bulS('Expulsion automatica al expirar el token, con aviso al usuario.');
bulS('RBAC estricto: cada rol solo ve sus herramientas asignadas.');

heading('Paginas React del Dashboard');
[['LoginPage', 'Inicio de sesion con manejo de errores.'],
 ['DashboardPage', 'Panel general del gerente.'],
 ['ComandasPage', 'Gestion de comandas por mesa.'],
 ['CocinaPage', 'KDS con cola de pedidos.'],
 ['ReservasPage', 'Reservaciones con conversion a comanda.'],
 ['FacturacionPage', 'Facturacion: IVA 19%, metodos de pago, propinas.'],
 ['CartaPage', 'Vista de la carta del restaurante.'],
 ['AccessDeniedPage', 'Pantalla para roles sin permisos.'],
].forEach(([n, d], i) => row(n, d, i));

// ═══════════════════════════════════════════════════════════════════════════
//  5. VISTA DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════
secTitle('5. VISTA DE DISENO: DASHBOARD');

para('Prototipo del Dashboard del Gerente con interfaz oscura, graficos de ventas y mesas en tiempo real:');

if (DASHBOARD_IMG) {
    need(300);
    doc.image(DASHBOARD_IMG, M, doc.y, { width: CW });
    doc.x = M; doc.y += 290;
} else {
    placeholder('Mockup del Dashboard');
}

heading('Elementos de la Interfaz');
bulS('Grafico de ventas horarias. Grilla de mesas (ocupadas, libres, facturando).');
bulS('Cola de cocina con tiempos de espera. Listado de proximas reservas.');
bulS('Navegacion por pestanas: Comandas, Cocina, Reservas, Facturacion, Carta.');

// ═══════════════════════════════════════════════════════════════════════════
//  6. BACKEND
// ═══════════════════════════════════════════════════════════════════════════
secTitle('6. ARQUITECTURA DEL BACKEND: PLUGIN WORDPRESS');

para('Plugin "Rustica System": toda la logica de negocio en clases PHP con autoloader, ' +
     'exponiendo funcionalidad via API REST bajo rustica/v1.');

heading('Estructura del Plugin');
[['rustica-system.php', 'Archivo principal: hooks, autoloader y constantes.'],
 ['class-rustica-system.php', 'Clase coordinadora (27 KB): Singleton, CPTs, taxonomias.'],
 ['class-rustica-api.php', 'Controlador API REST (58 KB): 33 endpoints.'],
 ['class-rustica-billing.php', 'Facturacion: IVA 19%, propinas, split billing.'],
 ['class-rustica-emails.php', 'Correos transaccionales de confirmacion.'],
 ['class-rustica-cleanup.php', 'Mantenimiento de datos temporales y expirados.'],
].forEach(([n, d], i) => row(n, d, i));

heading('Funcionalidades');
bul('Mesas y Zonas', '30 mesas en 3 zonas. Estados: libre, ocupada, facturando, reservada. Mesas VIP.');
bul('Reservas', 'Validacion de solapamiento. Deposito VIP 30% via WooCommerce. Conversion a comanda.');
bul('Comandas', 'Modificadores, notas por plato, edicion posterior, division de cuenta.');
bul('Cocina (KDS)', 'Cola por antiguedad. Alertas >15 min. Polling 5s. Pendiente -> Progreso -> Listo.');
bul('Facturacion', 'Numeracion secuencial. IVA 19%. Multiples metodos. Propinas. Split billing.');
bul('Roles', '4 roles con capacidades granulares. JWT + WP nonce para doble seguridad.');

// ═══════════════════════════════════════════════════════════════════════════
//  7. API REST
// ═══════════════════════════════════════════════════════════════════════════
secTitle('7. API REST: ENDPOINTS DEL SISTEMA');

para('33 endpoints REST bajo rustica/v1. Autenticacion JWT requerida excepto endpoints publicos.');

heading('Mesas y Zonas');
[['GET  /mesas', 'Lista mesas con estado y zona.'],
 ['GET  /mesas/{id}', 'Detalle de mesa.'],
 ['PUT  /mesas/{id}/estado', 'Actualizar estado.'],
 ['GET  /zonas', 'Lista las 3 zonas con sus mesas.'],
].forEach(([e, d], i) => row(e, d, i));

heading('Reservas');
[['GET  /reservas', 'Lista (filtros: fecha, estado, zona).'],
 ['POST /reservas', 'Crear con validacion de solapamiento.'],
 ['PUT  /reservas/{id}', 'Actualizar reserva.'],
 ['DEL  /reservas/{id}', 'Cancelar reserva.'],
 ['POST /reservas/{id}/convertir', 'Convertir en comanda activa.'],
].forEach(([e, d], i) => row(e, d, i));

heading('Comandas');
[['GET  /comandas', 'Lista activas (mesa, estado, fecha).'],
 ['POST /comandas', 'Crear nueva comanda.'],
 ['PUT  /comandas/{id}', 'Modificar (platos, notas).'],
 ['POST /comandas/{id}/cerrar', 'Cerrar y generar pre-factura.'],
].forEach(([e, d], i) => row(e, d, i));

heading('Cocina (KDS)');
[['GET  /cocina/cola', 'Cola de pedidos por antiguedad.'],
 ['PUT  /cocina/{id}/estado', 'Avanzar: pendiente -> progreso -> listo.'],
 ['GET  /cocina/alertas', 'Pedidos con >15 min de espera.'],
].forEach(([e, d], i) => row(e, d, i));

heading('Facturacion y Reportes');
[['POST /facturacion/generar', 'Factura desde comanda cerrada.'],
 ['GET  /facturacion/{id}', 'Detalle con IVA y propina.'],
 ['GET  /reportes/cierre-dia', 'Ventas, propinas, top productos, metodos.'],
].forEach(([e, d], i) => row(e, d, i));

// ═══════════════════════════════════════════════════════════════════════════
//  8. INFRAESTRUCTURA
// ═══════════════════════════════════════════════════════════════════════════
secTitle('8. INFRAESTRUCTURA Y DESPLIEGUE');

para('Docker Compose orquesta el entorno de desarrollo local con tres servicios:');

box('WordPress (6.5-php8.2-apache)',
    'Apache + PHP 8.2 + WP 6.5. Puerto 8080. Monta wp-content/ como volumen. Depende de MySQL con healthcheck.', 52);
box('MySQL 8.0',
    'Autenticacion nativa. Puerto externo 3307. Volumen persistente ./db_data. Healthcheck cada 10s.', 48);
box('phpMyAdmin',
    'Interfaz web de BD en puerto 8081. Depuracion de mesas, reservas, comandas y facturas.', 44);

heading('Estructura de Directorios');
[['src/', 'Frontend publico: HTML5, CSS, TypeScript.'],
 ['admin-dashboard/', 'SPA React + Vite + Tailwind.'],
 ['wp-content/themes/rustica-theme/', 'Tema WP: front-page.php, blocks, templates.'],
 ['wp-content/plugins/rustica-system/', 'Plugin core: API REST, clases PHP.'],
 ['specs/', 'Especificaciones BDD y analisis de mercado.'],
 ['tests/', 'Tests unitarios (Vitest) y E2E (Playwright).'],
 ['docker-compose.yml', 'Orquestacion Docker para desarrollo.'],
].forEach(([d, x], i) => row(d, x, i));

heading('Plugins WordPress');
[['Rustica System', 'Plugin principal (desarrollo propio).'],
 ['JWT Auth for WP REST', 'Autenticacion JWT para API.'],
 ['ACF (Advanced Custom Fields)', 'Campos personalizados.'],
 ['WooCommerce + PayPal', 'E-commerce para depositos VIP.'],
 ['WP Mail SMTP / Site Mailer', 'Correos transaccionales.'],
 ['Query Monitor', 'Depuracion (solo desarrollo).'],
].forEach(([n, d], i) => row(n, d, i));

// ═══════════════════════════════════════════════════════════════════════════
//  9. TESTING
// ═══════════════════════════════════════════════════════════════════════════
secTitle('9. TESTING Y CALIDAD');

para('Testing en multiples capas con Vitest y Playwright.');

heading('Tests Unitarios Frontend (Vitest)');
[['validators.test.ts', 'Email, fecha, tamano de grupo, campos.'],
 ['gallery.test.ts', 'Tabs, lightbox, navegacion.'],
 ['reservation.test.ts', 'Envio, validacion, errores.'],
 ['events-form.test.ts', 'Catering: validacion y envio.'],
 ['smooth-scroll.test.ts', 'Scroll suave entre secciones.'],
].forEach(([n, d], i) => row(n, d, i));

heading('Tests Dashboard React (46+ tests)');
[['App.integration.test.jsx', 'Integracion del flujo completo.'],
 ['LoginPage.test.jsx', 'Login, credenciales, campos, red.'],
 ['DashboardPage.test.jsx', 'Panel gerente y herramientas.'],
 ['AppPages.test.jsx', 'Navegacion y control por rol.'],
 ['AccessDeniedPage.test.jsx', 'Acceso denegado y logout.'],
].forEach(([n, d], i) => row(n, d, i));

heading('Tests E2E (Playwright)');
bulS('Config: playwright.config.ts (raiz) y playwright.config.js (dashboard).');
bulS('Flujos criticos: reservas, login, navegacion por roles, comandas.');
bulS('Compatible con CI/CD (GitHub Actions).');

heading('Herramientas de Calidad');
bulS('TypeScript (tsc --noEmit): verificacion de tipos.');
bulS('Vitest con cobertura V8 automatica.');
bulS('ESLint/Prettier en el dashboard.');

// ═══════════════════════════════════════════════════════════════════════════
//  10. ROADMAP
// ═══════════════════════════════════════════════════════════════════════════
secTitle('10. ESPECIFICACION TECNICA Y ROADMAP');

heading('Ficha de Componentes');
[['Arquitectura', 'WordPress 6.5 (contenido, BD, API REST).'],
 ['Base de Datos', 'MySQL 8.0, autenticacion nativa, healthchecks.'],
 ['Servidor', 'Apache + PHP 8.2 en Docker.'],
 ['Autenticacion', 'JWT REST API (tokens 1h).'],
 ['Frontend Publico', 'HTML5 + Bootstrap 5 + TypeScript.'],
 ['Dashboard', 'React v18 + Vite + TailwindCSS.'],
 ['Testing', 'Vitest (unit), Playwright (E2E), 46+ tests.'],
 ['E-commerce', 'WooCommerce + PayPal para depositos VIP.'],
].forEach(([l, v], i) => row(l, v, i));

heading('Fases de Lanzamiento');

box('Fase 1: Landing Page [COMPLETADA]',
    '- Bootstrap 5 + TypeScript. Validacion de reservas y eventos.\n' +
    '- Galeria con lightbox. 5 archivos de tests unitarios.', 52);
box('Fase 2: Dashboard [COMPLETADA]',
    '- Endpoints REST para comandas, cocina, reservas. JWT + roles.\n' +
    '- 46+ tests React. KDS con alertas de urgencia.', 52);
box('Fase 3: Integraciones [EN DISENO]',
    '- Impresion ESC/POS. Facturacion electronica por pais.\n' +
    '- Pagos QR (Mercado Pago). Notificaciones push/SMS.\n' +
    '- UI de reportes con graficos y export CSV.', 60);

// ═══════════════════════════════════════════════════════════════════════════
//  11. MERCADO
// ═══════════════════════════════════════════════════════════════════════════
secTitle('11. ANALISIS DE MERCADO Y ESTRATEGIA');

para('Rustica esta posicionado como producto de implementacion personalizada (no SaaS). ' +
     'El flujo operativo nucleo (reservas -> comanda -> cocina -> cobro) esta completo.');

heading('Diferenciador frente a SaaS LATAM');
bulS('Fudo (USD 39-130/mes): KDS y delivery aparte.');
bulS('Soft Restaurant (USD 28-50/mes): cerrado, solo CFDI Mexico.');
bulS('Rustica: sin cuota perpetua, datos propios, codigo abierto. ROI en 12-18 meses.');

heading('Funcionalidades Criticas Pendientes');
[['Impresion ESC/POS', 'Tickets cocina/caja; universal en LATAM.'],
 ['Facturacion electronica', 'CFDI, DIAN, SUNAT, SII por pais.'],
 ['Pagos QR', 'Mercado Pago como primera integracion.'],
 ['UI de reportes', 'Endpoint existe; falta graficos y CSV.'],
].forEach(([n, d], i) => row(n, d, i));

heading('Estrategia de Venta');
bulS('Servicios WP/React en Workana usando Rustica como portfolio.');
bulS('Demo en vivo el primer dia; cotizar personalizacion USD 800-2,500.');
bulS('Cierre llave en mano + mantenimiento USD 30-60/mes.');
bulS('Evitar competir como carta QR o prometer facturacion sin tenerla.');

// ── Cierre ──
// NOTA: bloque de contacto eliminado por reglas de portfolio (Workana no
// permite datos de contacto en el material publicado).

// ═══════════════════════════════════════════════════════════════════════════
doc.end();
ws.on('finish', () => console.log('PDF generado: ' + OUT + '  (' + pageNum + ' paginas)'));
ws.on('error', (e) => console.error('Error:', e));
