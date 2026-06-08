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

<!-- ZONAS DEL RESTAURANTE — renderizado por ZonasApp (React) para conteo en tiempo real -->
<section class="py-5" style="background:#1a1a1a;">
    <div class="container">
        <div class="text-center mb-5">
            <p class="text-uppercase mb-2" style="color:#c9a84c;letter-spacing:.15em;font-size:.8rem;">Nuestros espacios</p>
            <h2 style="font-family:'Playfair Display',serif;color:#fff;">Elige tu ambiente</h2>
            <p style="color:#aaa;max-width:500px;margin:.5rem auto 0;">
                Haz clic en la zona que prefieras para reservar tu mesa directamente.
            </p>
        </div>
        <?php echo do_shortcode('[rustica_zonas]'); ?>
    </div>
</section>

<!-- RESERVA -->
<section id="reservas" class="py-5" style="background:#f5f0e8;">
    <div class="container">
        <div class="row justify-content-center">
            <div class="col-lg-7 text-center">
                <p class="text-uppercase mb-2" style="color:#c9a84c;letter-spacing:.15em;font-size:.8rem;">¿Listo para visitarnos?</p>
                <h2 style="font-family:'Playfair Display',serif;color:#1a1a1a;" class="mb-3">Reserva tu mesa</h2>
                <p class="text-muted mb-4">Reserva en línea en menos de 2 minutos. Confirmación inmediata por correo.</p>
                <?php echo do_shortcode('[rustica_reservas]'); ?>
            </div>
        </div>
    </div>
</section>

<?php get_footer(); ?>
