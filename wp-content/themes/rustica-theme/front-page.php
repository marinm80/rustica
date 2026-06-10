<?php
/**
 * Plantilla de la página de inicio (front-page.php).
 *
 * Renderiza el landing completo de La Rustica Terrazza:
 * Hero → Franja de datos → Filosofía → Carta destacada → Zonas interactivas → Formulario React.
 *
 * Las tarjetas de zona consultan mesas libres en tiempo real y emiten el evento
 * personalizado `rustica:zona` que captura ReservasApp.jsx para preseleccionar la zona.
 *
 * @package Rustica_Theme
 * @since   1.0.0
 */
get_header(); ?>

<!-- HERO -->
<section style="background-color:#1a1a1a;min-height:90vh;display:flex;align-items:center;justify-content:center;position:relative;">
    <div style="position:absolute;inset:0;background:rgba(26,26,26,.5);"></div>
    <div class="container text-center" style="position:relative;z-index:1;">
        <p class="text-uppercase mb-2" style="color:#c9a84c;letter-spacing:.2em;font-size:.85rem;">Bogotá · Colombia</p>
        <h1 class="display-2 fw-bold text-white mb-3" style="font-family:'Playfair Display',serif;">
            La Rustica Terrazza
        </h1>
        <p class="lead text-white mb-5" style="max-width:560px;margin:0 auto 2rem;">
            Cocina de autor donde cada plato cuenta una historia. Vive una experiencia gastronómica única en nuestra terrazza.
        </p>
        <div class="d-flex gap-3 justify-content-center flex-wrap">
            <a href="#reservas" class="btn btn-lg px-5 py-3" style="background:#c9a84c;color:#1a1a1a;font-weight:700;border:none;">
                Reservar mesa
            </a>
            <a href="/nuestra-carta" class="btn btn-lg btn-outline-light px-5 py-3">
                Ver carta
            </a>
        </div>
    </div>
</section>

<!-- FRANJA DE DATOS -->
<section class="py-4" style="background:#111;">
    <div class="container">
        <div class="row text-center g-3">
            <div class="col-6 col-md-3">
                <p class="mb-0 text-white fw-bold">Lun – Vie</p>
                <p class="mb-0 small" style="color:#c9a84c;">12:00 – 22:00</p>
            </div>
            <div class="col-6 col-md-3">
                <p class="mb-0 text-white fw-bold">Sáb – Dom</p>
                <p class="mb-0 small" style="color:#c9a84c;">12:00 – 23:00</p>
            </div>
            <div class="col-6 col-md-3">
                <p class="mb-0 text-white fw-bold">Reservaciones</p>
                <p class="mb-0 small" style="color:#c9a84c;">+57 1 234 5678</p>
            </div>
            <div class="col-6 col-md-3">
                <p class="mb-0 text-white fw-bold">Zonas</p>
                <p class="mb-0 small" style="color:#c9a84c;">Salón · Terrazza · VIP</p>
            </div>
        </div>
    </div>
</section>

<!-- NUESTRA PROPUESTA -->
<section class="py-5" style="background:#f5f0e8;">
    <div class="container">
        <div class="row align-items-center g-5">
            <div class="col-md-6">
                <p class="text-uppercase mb-2" style="color:#c9a84c;letter-spacing:.15em;font-size:.8rem;">Nuestra filosofía</p>
                <h2 style="font-family:'Playfair Display',serif;color:#1a1a1a;" class="mb-4">
                    Ingredientes locales,<br>técnica internacional
                </h2>
                <p class="mb-3" style="color:#555;">
                    Trabajamos con productores colombianos para traer lo mejor de cada región a tu mesa. Cada temporada trae nuevos sabores, nuevas historias.
                </p>
                <p style="color:#555;">
                    Nuestro equipo de cocina combina técnicas contemporáneas con recetas de tradición para crear una experiencia que va más allá del plato.
                </p>
                <a href="/nuestra-carta" class="btn mt-3 px-4 py-2" style="background:#1a1a1a;color:#c9a84c;font-weight:600;border:none;">
                    Explorar menú →
                </a>
            </div>
            <div class="col-md-6">
                <div class="row g-3">
                    <div class="col-6">
                        <div class="p-4 text-center rounded" style="background:#1a1a1a;">
                            <p class="display-6 fw-bold mb-1" style="color:#c9a84c;">30+</p>
                            <p class="text-white small mb-0">Platillos de temporada</p>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="p-4 text-center rounded" style="background:#1a1a1a;">
                            <p class="display-6 fw-bold mb-1" style="color:#c9a84c;">8</p>
                            <p class="text-white small mb-0">Años de experiencia</p>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="p-4 text-center rounded" style="background:#1a1a1a;">
                            <p class="display-6 fw-bold mb-1" style="color:#c9a84c;">30</p>
                            <p class="text-white small mb-0">Mesas disponibles</p>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="p-4 text-center rounded" style="background:#1a1a1a;">
                            <p class="display-6 fw-bold mb-1" style="color:#c9a84c;">★ 4.9</p>
                            <p class="text-white small mb-0">Valoración clientes</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- CARTA DESTACADA -->
<section class="py-5" style="background:#fff;">
    <div class="container">
        <div class="text-center mb-5">
            <p class="text-uppercase mb-2" style="color:#c9a84c;letter-spacing:.15em;font-size:.8rem;">Lo mejor de hoy</p>
            <h2 style="font-family:'Playfair Display',serif;color:#1a1a1a;">Carta destacada</h2>
        </div>
        <?php
        if (function_exists('wc_get_products')) :
            $productos = wc_get_products(['limit' => 4, 'status' => 'publish']);
        else :
            $productos = [];
        endif;
        if ($productos) :
        ?>
        <div class="row g-4">
            <?php foreach ($productos as $producto) : ?>
            <div class="col-sm-6 col-lg-3">
                <div class="card h-100 border-0 shadow-sm" style="border-radius:.75rem;overflow:hidden;">
                    <?php if ($producto->get_image_id()) : ?>
                        <img src="<?php echo esc_url(wp_get_attachment_image_url($producto->get_image_id(), 'rustica-card')); ?>"
                             class="card-img-top" style="height:200px;object-fit:cover;"
                             alt="<?php echo esc_attr($producto->get_name()); ?>">
                    <?php else : ?>
                        <div style="height:200px;background:#f5f0e8;display:flex;align-items:center;justify-content:center;font-size:2.5rem;">
                            🍽
                        </div>
                    <?php endif; ?>
                    <div class="card-body">
                        <h5 class="card-title" style="font-family:'Playfair Display',serif;">
                            <?php echo esc_html($producto->get_name()); ?>
                        </h5>
                        <p class="card-text text-muted small">
                            <?php echo wp_trim_words($producto->get_short_description(), 12); ?>
                        </p>
                    </div>
                    <div class="card-footer bg-white border-0 d-flex justify-content-between align-items-center">
                        <strong style="color:#c9a84c;font-size:1.1rem;">
                            $<?php echo number_format((float) $producto->get_price(), 0, ',', '.'); ?>
                        </strong>
                    </div>
                </div>
            </div>
            <?php endforeach; ?>
        </div>
        <div class="text-center mt-4">
            <a href="/nuestra-carta" class="btn px-5 py-2" style="border:2px solid #1a1a1a;color:#1a1a1a;font-weight:600;">
                Ver toda la carta
            </a>
        </div>
        <?php else : ?>
        <p class="text-center text-muted">Pronto publicaremos nuestra carta completa.</p>
        <?php endif; ?>
    </div>
</section>

<!-- ZONAS DEL RESTAURANTE — tarjetas PHP con conteo real + botón Reservar -->
<section id="reservas" class="py-5" style="background:#1a1a1a;">
    <div class="container">
        <div class="text-center mb-5">
            <p class="text-uppercase mb-2" style="color:#c9a84c;letter-spacing:.15em;font-size:.8rem;">Nuestros espacios</p>
            <h2 style="font-family:'Playfair Display',serif;color:#fff;">Elige tu ambiente</h2>
        </div>

        <div class="row g-4 justify-content-center">
        <?php
        $zonas_def = [
            'salon-principal' => ['nombre' => 'Salón Principal', 'desc' => 'Mesas para grupos desde 2 personas. El corazón del restaurante.'],
            'la-terrazza'     => ['nombre' => 'La Terrazza',     'desc' => 'Mesas al aire libre con vista panorámica. Ambiente único.'],
            'zona-vip'        => ['nombre' => 'Zona VIP',        'desc' => 'Mesas privadas con consumo mínimo. Para ocasiones especiales.'],
        ];
        foreach ($zonas_def as $slug => $z) :
            $q = new WP_Query([
                'post_type' => 'mesa', 'posts_per_page' => -1, 'fields' => 'ids',
                'tax_query' => [['taxonomy' => 'zona_restaurante', 'field' => 'slug', 'terms' => $slug]],
            ]);
            $total = $q->found_posts;
            $ql = new WP_Query([
                'post_type' => 'mesa', 'posts_per_page' => -1, 'fields' => 'ids',
                'tax_query' => [['taxonomy' => 'zona_restaurante', 'field' => 'slug', 'terms' => $slug]],
                'meta_query' => [['key' => 'estado', 'value' => 'libre']],
            ]);
            $libres = $ql->found_posts;
            $sin_mesas = $libres === 0;
        ?>
        <div class="col-md-4">
            <div style="border:1px solid <?php echo $sin_mesas ? '#444' : 'rgba(201,168,76,.35)'; ?>;border-radius:14px;padding:28px;height:100%;opacity:<?php echo $sin_mesas ? '.55' : '1'; ?>;">
                <h4 style="color:#c9a84c;font-family:'Playfair Display',serif;margin-bottom:8px;">
                    <?php echo esc_html($z['nombre']); ?>
                </h4>
                <p style="color:#aaa;font-size:14px;margin-bottom:20px;">
                    <?php echo esc_html($z['desc']); ?>
                </p>

                <!-- Barra de disponibilidad -->
                <div style="margin-bottom:20px;">
                    <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
                        <span style="font-size:12px;color:#888;">Mesas disponibles</span>
                        <span style="font-size:13px;font-weight:700;color:<?php echo $sin_mesas ? '#e74c3c' : '#c9a84c'; ?>;">
                            <?php echo $sin_mesas ? 'Sin disponibilidad' : "$libres / $total"; ?>
                        </span>
                    </div>
                    <div style="height:4px;background:#333;border-radius:2px;">
                        <div style="height:100%;width:<?php echo $total > 0 ? round(($libres/$total)*100) : 0; ?>%;background:<?php echo $sin_mesas ? '#e74c3c' : '#c9a84c'; ?>;border-radius:2px;"></div>
                    </div>
                </div>

                <?php if (!$sin_mesas) : ?>
                <button
                    class="btn-reservar-zona"
                    data-zona="<?php echo esc_attr($slug); ?>"
                    data-nombre="<?php echo esc_attr($z['nombre']); ?>"
                    data-bs-toggle="modal"
                    data-bs-target="#modalReserva"
                    style="width:100%;padding:12px;background:#c9a84c;color:#1a1a1a;border:none;border-radius:8px;font-weight:700;font-size:15px;cursor:pointer;">
                    Reservar en <?php echo esc_html($z['nombre']); ?>
                </button>
                <?php else : ?>
                <p style="text-align:center;color:#e74c3c;font-size:13px;font-weight:600;margin:0;">
                    No hay mesas disponibles por el momento
                </p>
                <?php endif; ?>
            </div>
        </div>
        <?php endforeach; ?>
        </div>
    </div>
</section>

<!-- MODAL DE RESERVA -->
<div class="modal fade" id="modalReserva" tabindex="-1" aria-labelledby="modalReservaLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content" style="border-radius:16px;border:none;overflow:hidden;">
            <div class="modal-header" style="background:#1a1a1a;border:none;padding:20px 24px;">
                <h5 class="modal-title" id="modalReservaLabel" style="color:#c9a84c;font-family:'Playfair Display',serif;">
                    Reservar mesa
                </h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body" style="padding:28px;">

                <!-- Estado: formulario -->
                <div id="reservaForm">
                    <p id="reservaZonaLabel" style="font-size:13px;color:#888;margin-bottom:20px;"></p>

                    <div class="mb-3">
                        <label class="form-label fw-semibold">Nombre completo</label>
                        <input type="text" id="rNombre" class="form-control" placeholder="Tu nombre" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label fw-semibold">Teléfono</label>
                        <input type="tel" id="rTelefono" class="form-control" placeholder="+57 300 000 0000" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label fw-semibold">Correo electrónico</label>
                        <input type="email" id="rEmail" class="form-control" placeholder="correo@ejemplo.com" required>
                    </div>
                    <div class="row g-2 mb-3">
                        <div class="col-6">
                            <label class="form-label fw-semibold">Fecha</label>
                            <input type="date" id="rFecha" class="form-control" required>
                        </div>
                        <div class="col-6">
                            <label class="form-label fw-semibold">Hora</label>
                            <select id="rHora" class="form-select">
                                <option value="">Selecciona</option>
                                <?php foreach (['12:00','13:00','14:00','15:00','19:00','20:00','21:00','22:00'] as $h) : ?>
                                    <option value="<?php echo $h; ?>"><?php echo $h; ?></option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label fw-semibold">Número de personas</label>
                        <select id="rPersonas" class="form-select">
                            <?php for ($i=1;$i<=8;$i++) echo "<option value='$i'>$i persona".($i>1?'s':'')."</option>"; ?>
                        </select>
                    </div>

                    <div id="reservaError" class="alert alert-danger d-none" role="alert"></div>

                    <button id="btnConfirmarReserva"
                        style="width:100%;padding:14px;background:#c9a84c;color:#1a1a1a;border:none;border-radius:8px;font-weight:700;font-size:16px;cursor:pointer;">
                        Confirmar reserva
                    </button>
                </div>

                <!-- Estado: éxito -->
                <div id="reservaExito" class="d-none text-center py-3">
                    <div style="font-size:48px;margin-bottom:12px;">✓</div>
                    <h5 style="color:#28a745;font-family:'Playfair Display',serif;">¡Reserva confirmada!</h5>
                    <p class="text-muted" id="reservaExitoMsg"></p>
                    <button class="btn btn-outline-secondary btn-sm mt-2" data-bs-dismiss="modal">Cerrar</button>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
(function () {
    var zonaSeleccionada = '';

    // Al abrir el modal, captura la zona del botón que lo disparó
    document.getElementById('modalReserva').addEventListener('show.bs.modal', function (e) {
        var btn = e.relatedTarget;
        if (!btn) return;
        zonaSeleccionada = btn.dataset.zona || '';
        var nombreZona   = btn.dataset.nombre || '';
        document.getElementById('reservaZonaLabel').textContent =
            nombreZona ? 'Zona seleccionada: ' + nombreZona : '';
        // Resetear formulario al abrir
        document.getElementById('reservaForm').classList.remove('d-none');
        document.getElementById('reservaExito').classList.add('d-none');
        document.getElementById('reservaError').classList.add('d-none');
        // Fecha mínima = hoy
        document.getElementById('rFecha').min = new Date().toISOString().split('T')[0];
    });

    document.getElementById('btnConfirmarReserva').addEventListener('click', async function () {
        var nombre   = document.getElementById('rNombre').value.trim();
        var telefono = document.getElementById('rTelefono').value.trim();
        var email    = document.getElementById('rEmail').value.trim();
        var fecha    = document.getElementById('rFecha').value;
        var hora     = document.getElementById('rHora').value;
        var personas = document.getElementById('rPersonas').value;
        var errEl    = document.getElementById('reservaError');

        if (!nombre || !telefono || !email || !fecha || !hora) {
            errEl.textContent = 'Por favor completa todos los campos requeridos.';
            errEl.classList.remove('d-none');
            return;
        }
        errEl.classList.add('d-none');

        var btn = this;
        btn.textContent = 'Buscando mesa disponible…';
        btn.disabled    = true;

        try {
            // 1. Buscar mesa disponible en la zona
            var params = new URLSearchParams({ fecha, hora, personas });
            if (zonaSeleccionada) params.append('zona', zonaSeleccionada);
            var resMesas = await fetch('/wp-json/rustica/v1/mesas/disponibles?' + params);
            var dataMesas = await resMesas.json();

            if (!dataMesas.disponibles || dataMesas.disponibles.length === 0) {
                errEl.textContent = 'No hay mesas disponibles para ese horario en esta zona. Intenta con otra hora.';
                errEl.classList.remove('d-none');
                btn.textContent = 'Confirmar reserva';
                btn.disabled    = false;
                return;
            }

            // 2. Tomar la primera mesa disponible
            var mesa = dataMesas.disponibles[0];
            btn.textContent = 'Confirmando…';

            // 3. Crear la reservación
            var resReserva = await fetch('/wp-json/rustica/v1/reservacion', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({
                    mesa_id: mesa.id, fecha, hora,
                    personas: parseInt(personas),
                    nombre, email, telefono,
                }),
            });
            var dataReserva = await resReserva.json();

            if (dataReserva.checkout_url) {
                // Zona VIP — redirigir al pago
                window.location.href = dataReserva.checkout_url;
                return;
            }

            // 4. Mostrar confirmación
            document.getElementById('reservaForm').classList.add('d-none');
            document.getElementById('reservaExitoMsg').textContent =
                'Mesa ' + mesa.numero + ' reservada para el ' + fecha + ' a las ' + hora + '. Te enviamos la confirmación a ' + email + '.';
            document.getElementById('reservaExito').classList.remove('d-none');

        } catch (e) {
            errEl.textContent = 'Error al procesar la reserva. Intenta de nuevo.';
            errEl.classList.remove('d-none');
            btn.textContent = 'Confirmar reserva';
            btn.disabled    = false;
        }
    });
})();
</script>

<?php get_footer(); ?>
