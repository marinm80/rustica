<?php
/**
 * Template Name: Rústica Landing Page
 * Front page — contenido gestionado desde ACF (Admin → página Inicio).
 * Fallback a valores por defecto si ACF no está activo o el campo está vacío.
 */

// ── Datos del Hero ────────────────────────────────────────────────────────────
$hero_image    = rustica_field_url( 'hero_bg' );
$hero_title    = rustica_field( 'hero_title',    'Sabores de nuestra tierra' );
$hero_subtitle = rustica_field( 'hero_subtitle', 'La tradición y la calidez de la cocina latinoamericana al fuego de la leña. Reserva tu mesa y déjate llevar.' );
$hero_cta      = rustica_field( 'hero_cta',      'Reserva una Mesa' );

$hero_bg_style = $hero_image
	? ' style="background-image:url(' . $hero_image . ')"'
	: '';

// ── Datos de los 4 platos ─────────────────────────────────────────────────────
$platos_defaults = array(
	1 => array( 'name' => 'Lomo Saltado',      'desc' => 'Tiras de res al wok con cebolla, tomate, ají amarillo, servido con papas fritas y arroz.',        'price' => '22,00 €', 'badge' => 'Especialidad', 'img' => 'cordero.jpg' ),
	2 => array( 'name' => 'Ceviche Clásico', 'desc' => 'Pescado blanco marinado en leche de tigre con cebolla morada, camote y choclo.',                'price' => '15,00 €', 'badge' => 'Recomendado',  'img' => 'risotto.jpg' ),
	3 => array( 'name' => 'Arepa Reina Pepiada',             'desc' => 'Arepa de maíz rellena de ensalada de pollo desmechado y aguacate cremoso.', 'price' => '9,00 €', 'badge' => 'Recomendado',  'img' => 'huerto.jpg' ),
	4 => array( 'name' => 'Tres Leches Tres Sabores',      'desc' => 'Bizcocho tradicional bañado en tres leches con un toque de canela y merengue.',           'price' => '8,50 €',  'badge' => '',            'img' => 'tarta-manzana.jpg' ),
);

$platos = array();
foreach ( $platos_defaults as $n => $d ) {
	$acf_img = function_exists( 'get_field' ) ? get_field( "dish_{$n}_image" ) : '';
	$platos[ $n ] = array(
		'name'  => rustica_field( "dish_{$n}_name",  $d['name'] ),
		'desc'  => rustica_field( "dish_{$n}_desc",  $d['desc'] ),
		'price' => rustica_field( "dish_{$n}_price", $d['price'] ),
		'badge' => rustica_field( "dish_{$n}_badge", $d['badge'] ),
		'img'   => $acf_img
			? esc_url( $acf_img )
			: esc_url( get_stylesheet_directory_uri() . '/assets/img/menu/' . $d['img'] ),
	);
}

// ── Datos de contacto ─────────────────────────────────────────────────────────
$contact = array(
	'address' => rustica_field( 'contact_address', 'Calle de la Tradición 123, 28010 Madrid, España' ),
	'phone'   => rustica_field( 'contact_phone',   '+34 912 345 678' ),
	'email'   => rustica_field( 'contact_email',   'contacto@larusticamesa.com' ),
	'hours'   => rustica_field( 'contact_hours',   'Mar–Dom: 13:00–23:30 · Lunes cerrado' ),
	'map'     => rustica_field_url( 'contact_map', 'https://maps.google.com/maps?q=Madrid,Spain&output=embed' ),
);

// ── Redes sociales ────────────────────────────────────────────────────────────
$social = array(
	'instagram'   => rustica_field_url( 'social_instagram',   '#' ),
	'facebook'    => rustica_field_url( 'social_facebook',    '#' ),
	'tripadvisor' => rustica_field_url( 'social_tripadvisor', '#' ),
);

// ── Imágenes de galería ───────────────────────────────────────────────────────
$gallery_base = get_stylesheet_directory_uri() . '/assets/img/gallery/';
$gallery = array(
	'restaurante' => array(
		array( 'src' => $gallery_base . 'salon-01.jpg',    'alt' => 'Salón principal de La Rústica Mesa' ),
		array( 'src' => $gallery_base . 'terraza-02.jpg',  'alt' => 'Terraza exterior de La Rústica Mesa' ),
		array( 'src' => $gallery_base . 'barra-03.jpg',    'alt' => 'Barra y coctelería' ),
		array( 'src' => $gallery_base . 'chimenea-04.jpg', 'alt' => 'Rincón acogedor' ),
	),
	'platos' => array(
		array( 'src' => $gallery_base . 'plato-01.jpg', 'alt' => 'Lomo Saltado' ),
		array( 'src' => $gallery_base . 'plato-02.jpg', 'alt' => 'Ceviche Clásico' ),
		array( 'src' => $gallery_base . 'plato-03.jpg', 'alt' => 'Arepa Reina Pepiada' ),
		array( 'src' => $gallery_base . 'plato-04.jpg', 'alt' => 'Tres Leches Tres Sabores' ),
	),
);
?><!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
  <meta charset="<?php bloginfo( 'charset' ); ?>">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>

<!-- section: navbar -->
<header>
  <nav id="navbar" class="navbar navbar-expand-lg fixed-top navbar-transparent" aria-label="Navegación principal">
    <div class="container">
      <a class="navbar-brand" href="#hero"><?php bloginfo( 'name' ); ?></a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navMenu"
        aria-controls="navMenu" aria-expanded="false" aria-label="Abrir menú">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navMenu">
        <ul class="navbar-nav ms-auto">
          <li class="nav-item"><a class="nav-link" href="#galeria">Galería</a></li>
          <li class="nav-item"><a class="nav-link" href="#menu">Menú</a></li>
          <li class="nav-item"><a class="nav-link" href="#reservas">Reservas</a></li>
          <li class="nav-item"><a class="nav-link" href="#contacto">Contacto</a></li>
        </ul>
      </div>
    </div>
  </nav>
</header>
<!-- /section: navbar -->

<main>

  <!-- section: hero -->
  <section id="hero" aria-label="Presentación del restaurante">
    <div class="hero-bg" role="img" aria-label="Interior del restaurante Rústica"<?php echo $hero_bg_style; ?>></div>
    <div class="hero-overlay" aria-hidden="true"></div>
    <div class="hero-content">
      <h1 class="hero-supertitle"><?php echo $hero_title; ?></h1>
      <p class="hero-subtitle"><?php echo $hero_subtitle; ?></p>
      <a href="#reservas" class="btn-rustica"><?php echo $hero_cta; ?></a>
    </div>
    <div class="hero-scroll-indicator" aria-hidden="true">
      <i class="fa-solid fa-chevron-down"></i>
    </div>
  </section>
  <!-- /section: hero -->

  <!-- section: gallery -->
  <section id="galeria" class="section-padding bg-cream" aria-label="Galería de imágenes">
    <div class="container">
      <div class="section-header">
        <h2 class="section-title">Descubre Rústica</h2>
        <hr class="section-divider">
        <p class="section-subtitle">El ambiente y los sabores que nos definen</p>
        <ul class="nav gallery-tabs justify-content-center mb-4" id="galleryTabs" role="tablist">
          <li class="nav-item" role="presentation">
            <button class="nav-link active" id="tab-restaurante" data-bs-toggle="tab"
              data-bs-target="#pane-restaurante" type="button" role="tab"
              aria-controls="pane-restaurante" aria-selected="true">El Restaurante</button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link" id="tab-platos" data-bs-toggle="tab"
              data-bs-target="#pane-platos" type="button" role="tab"
              aria-controls="pane-platos" aria-selected="false">Nuestros Platos</button>
          </li>
        </ul>
      </div>

      <div class="tab-content" id="galleryTabContent">
        <?php foreach ( array( 'restaurante', 'platos' ) as $tab ) :
          $active = $tab === 'restaurante' ? 'show active' : '';
          $tab_id = "pane-{$tab}";
          $label  = "tab-{$tab}";
        ?>
        <div class="tab-pane fade <?php echo $active; ?>" id="<?php echo $tab_id; ?>"
          role="tabpanel" aria-labelledby="<?php echo $label; ?>">
          <div class="gallery-grid">
            <?php foreach ( $gallery[ $tab ] as $img ) : ?>
            <button class="gallery-item"
              data-lightbox-src="<?php echo esc_attr( $img['src'] ); ?>"
              data-lightbox-alt="<?php echo esc_attr( $img['alt'] ); ?>"
              aria-label="Ampliar: <?php echo esc_attr( $img['alt'] ); ?>">
              <img src="<?php echo esc_url( $img['src'] ); ?>"
                   alt="<?php echo esc_attr( $img['alt'] ); ?>"
                   class="gallery-img" loading="lazy">
            </button>
            <?php endforeach; ?>
          </div>
        </div>
        <?php endforeach; ?>
      </div>
    </div>

    <div class="modal fade" id="galleryModal" tabindex="-1" aria-label="Visor ampliado" aria-modal="true" role="dialog">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content">
          <div class="modal-body">
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            <img id="lightboxImg" src="" alt="" class="img-fluid">
          </div>
        </div>
      </div>
    </div>
  </section>
  <!-- /section: gallery -->

  <!-- section: menu -->
  <section id="menu" class="section-padding bg-beige" aria-label="Platos destacados">
    <div class="container">
      <div class="section-header">
        <h2 class="section-title">Nuestra Cocina</h2>
        <hr class="section-divider">
        <p class="section-subtitle">Cuatro platos que resumen nuestra filosofía</p>
      </div>
      <div class="row g-4">
        <?php foreach ( $platos as $plato ) :
          $badge_class = $plato['badge'] === 'Especialidad'
            ? 'menu-badge--especialidad'
            : ( $plato['badge'] === 'Recomendado' ? 'menu-badge--recomendado' : '' );
        ?>
        <div class="col-12 col-sm-6 col-lg-3">
          <article class="menu-card">
            <div class="menu-card-img-wrapper">
              <img src="<?php echo $plato['img']; ?>" alt="<?php echo $plato['name']; ?>" loading="lazy">
              <?php if ( $plato['badge'] ) : ?>
              <span class="menu-badge <?php echo $badge_class; ?>"><?php echo $plato['badge']; ?></span>
              <?php endif; ?>
            </div>
            <div class="menu-card-body">
              <h3 class="menu-card-title"><?php echo $plato['name']; ?></h3>
              <p class="menu-card-desc"><?php echo $plato['desc']; ?></p>
              <span class="menu-price"><?php echo $plato['price']; ?></span>
            </div>
          </article>
        </div>
        <?php endforeach; ?>
      </div>
    </div>
  </section>
  <!-- /section: menu -->

  <!-- section: reservation -->
  <section id="reservas" class="section-padding bg-cream" aria-label="Sistema de reservas">
    <div class="container">
      <div class="section-header">
        <h2 class="section-title">Reserva tu Mesa</h2>
        <hr class="section-divider">
        <p class="section-subtitle">Cuéntanos cuándo vienes y te esperamos</p>
      </div>
      <div class="reservation-wrapper">
        <div class="row g-0">
          <div class="col-lg-5 d-none d-lg-block">
            <div class="reservation-image-side" style="background-image: url('<?php echo esc_url( get_stylesheet_directory_uri() . '/assets/img/gallery/mesa-reservada.jpg' ); ?>');"></div>
          </div>
          <div class="col-lg-7">
            <div class="reservation-form-container">
              <form id="reservationForm" novalidate aria-label="Formulario de reserva">
                <?php wp_nonce_field( 'rustica_reservation', 'rustica_nonce' ); ?>
                <div class="row g-3">
                  <div class="col-12 col-md-6">
                    <label for="res-name" class="form-label">Nombre completo</label>
                    <input type="text" class="form-control" id="res-name" name="name" placeholder="Tu nombre" required autocomplete="name">
                    <div class="invalid-feedback">El nombre es obligatorio.</div>
                  </div>
                  <div class="col-12 col-md-6">
                    <label for="res-email" class="form-label">Correo electrónico</label>
                    <input type="email" class="form-control" id="res-email" name="email" placeholder="tu@correo.com" required autocomplete="email">
                    <div class="invalid-feedback">Introduce un correo válido.</div>
                  </div>
                  <div class="col-12 col-md-6">
                    <label for="res-phone" class="form-label">Teléfono</label>
                    <input type="tel" class="form-control" id="res-phone" name="phone" placeholder="+34 612 345 678" required autocomplete="tel">
                    <div class="invalid-feedback">El teléfono es obligatorio (mín. 7 dígitos).</div>
                  </div>
                  <div class="col-12 col-md-6">
                    <label for="res-party" class="form-label">Número de personas</label>
                    <input type="number" class="form-control" id="res-party" name="partySize" min="1" max="30" value="2" required>
                    <div class="invalid-feedback">Entre 1 y 30 personas.</div>
                  </div>
                  <div class="col-12 col-md-6">
                    <label for="res-date" class="form-label">Fecha</label>
                    <input type="date" class="form-control" id="res-date" name="date" required>
                    <div class="invalid-feedback">Selecciona una fecha válida (hoy o posterior).</div>
                  </div>
                  <div class="col-12 col-md-6">
                    <label for="res-time" class="form-label">Hora</label>
                    <select class="form-select" id="res-time" name="time" required>
                      <option value="" disabled selected>Selecciona hora</option>
                      <?php for ( $h = 12; $h < 24; $h++ ) {
                        foreach ( array( '00', '30' ) as $m ) {
                          $val = sprintf( '%02d:%s', $h, $m );
                          echo '<option value="' . esc_attr( $val ) . '">' . esc_html( $val ) . "</option>\n";
                        }
                      } ?>
                    </select>
                    <div class="invalid-feedback">Selecciona una hora.</div>
                  </div>
                  <div class="col-12">
                    <div id="reservationAlert"></div>
                    <button type="submit" class="btn-rustica w-100"><?php echo esc_html( $hero_cta ); ?></button>
                    <p class="reservation-cta-note">
                      <i class="fa-solid fa-users fa-sm me-1"></i>
                      Para grupos de más de 30 personas, <a href="#contacto">contáctanos por eventos</a>.
                    </p>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
  <!-- /section: reservation -->

  <!-- section: contact -->
  <section id="contacto" class="section-padding bg-beige" aria-label="Contacto y eventos">
    <div class="container">
      <div class="section-header">
        <h2 class="section-title">Encuéntranos</h2>
        <hr class="section-divider">
        <p class="section-subtitle">Ven a visitarnos o escríbenos para tu próximo evento</p>
      </div>
      <div class="row g-5">
        <div class="col-12 col-lg-5">
          <div class="contact-info-item">
            <span class="contact-info-icon"><i class="fa-solid fa-location-dot"></i></span>
            <div class="contact-info-text">
              <strong>Dirección</strong>
              <span><?php echo $contact['address']; ?></span>
            </div>
          </div>
          <div class="contact-info-item">
            <span class="contact-info-icon"><i class="fa-solid fa-phone"></i></span>
            <div class="contact-info-text">
              <strong>Teléfono</strong>
              <span><a href="tel:<?php echo esc_attr( preg_replace( '/\s+/', '', $contact['phone'] ) ); ?>"><?php echo $contact['phone']; ?></a></span>
            </div>
          </div>
          <div class="contact-info-item">
            <span class="contact-info-icon"><i class="fa-solid fa-envelope"></i></span>
            <div class="contact-info-text">
              <strong>Email</strong>
              <span><a href="mailto:<?php echo esc_attr( $contact['email'] ); ?>"><?php echo $contact['email']; ?></a></span>
            </div>
          </div>
          <div class="contact-info-item">
            <span class="contact-info-icon"><i class="fa-solid fa-clock"></i></span>
            <div class="contact-info-text">
              <strong>Horarios</strong>
              <span><?php echo nl2br( $contact['hours'] ); ?></span>
            </div>
          </div>
          <div class="map-placeholder mt-4" aria-label="Mapa de ubicación">
            <iframe src="https://maps.google.com/maps?q=Madrid,Spain&output=embed"
              title="Ubicación Rústica" loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
              aria-hidden="true" tabindex="-1"></iframe>
          </div>
        </div>

        <div class="col-12 col-lg-7">
          <div class="events-form-wrapper">
            <img src="<?php echo esc_url( get_stylesheet_directory_uri() . '/assets/img/gallery/catering-event.jpg' ); ?>" alt="Servicio de catering y eventos de cocina latina" class="events-form-img">
            <h3 class="events-form-title">Catering y Eventos Privados</h3>
            <form id="eventsForm" novalidate aria-label="Formulario de eventos y catering">
              <?php wp_nonce_field( 'rustica_events', 'rustica_events_nonce' ); ?>
              <div class="row g-3">
                <div class="col-12 col-md-6">
                  <label for="evt-name" class="form-label">Nombre</label>
                  <input type="text" class="form-control" id="evt-name" name="name" placeholder="Tu nombre" required autocomplete="name">
                  <div class="invalid-feedback">El nombre es obligatorio.</div>
                </div>
                <div class="col-12 col-md-6">
                  <label for="evt-email" class="form-label">Correo electrónico</label>
                  <input type="email" class="form-control" id="evt-email" name="email" placeholder="tu@correo.com" required autocomplete="email">
                  <div class="invalid-feedback">Introduce un correo válido.</div>
                </div>
                <div class="col-12 col-md-6">
                  <label for="evt-phone" class="form-label">Teléfono <span class="text-muted fw-normal">(opcional)</span></label>
                  <input type="tel" class="form-control" id="evt-phone" name="phone" placeholder="+34 612 345 678" autocomplete="tel">
                  <div class="invalid-feedback">El teléfono debe tener al menos 7 dígitos.</div>
                </div>
                <div class="col-12 col-md-6">
                  <label for="evt-type" class="form-label">Tipo de evento</label>
                  <select class="form-select" id="evt-type" name="eventType" required>
                    <option value="" disabled selected>Selecciona</option>
                    <option value="Boda">Boda</option>
                    <option value="Cumpleaños">Cumpleaños</option>
                    <option value="Corporativo">Corporativo</option>
                    <option value="Otro">Otro</option>
                  </select>
                  <div class="invalid-feedback">Selecciona el tipo de evento.</div>
                </div>
                <div class="col-12 col-md-6">
                  <label for="evt-date" class="form-label">Fecha del evento</label>
                  <input type="date" class="form-control" id="evt-date" name="date" required>
                  <div class="invalid-feedback">Selecciona una fecha válida (hoy o posterior).</div>
                </div>
                <div class="col-12 col-md-6">
                  <label for="evt-guests" class="form-label">Número de invitados</label>
                  <input type="number" class="form-control" id="evt-guests" name="guests" min="1" max="300" placeholder="50" required>
                  <div class="invalid-feedback">Entre 1 y 300 invitados.</div>
                </div>
                <div class="col-12">
                  <label for="evt-message" class="form-label">Cuéntanos sobre tu evento</label>
                  <textarea class="form-control" id="evt-message" name="message" rows="4"
                    placeholder="Describe el tipo de evento, necesidades especiales, menú deseado..." required></textarea>
                  <div class="invalid-feedback">El mensaje es obligatorio.</div>
                </div>
                <div class="col-12">
                  <div id="eventsAlert"></div>
                  <button type="submit" class="btn-rustica w-100">Enviar Solicitud</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </section>
  <!-- /section: contact -->

</main>

<!-- section: footer -->
<footer role="contentinfo">
  <div class="container text-center">
    <span class="footer-logo"><?php bloginfo( 'name' ); ?></span>
    <p class="footer-tagline">Cocina de campo, alma de hogar</p>
    <nav class="footer-social" aria-label="Redes sociales">
      <a href="<?php echo $social['instagram']; ?>" aria-label="Instagram" rel="noopener noreferrer" target="_blank">
        <i class="fa-brands fa-instagram" aria-hidden="true"></i>
      </a>
      <a href="<?php echo $social['facebook']; ?>" aria-label="Facebook" rel="noopener noreferrer" target="_blank">
        <i class="fa-brands fa-facebook-f" aria-hidden="true"></i>
      </a>
      <a href="<?php echo $social['tripadvisor']; ?>" aria-label="TripAdvisor" rel="noopener noreferrer" target="_blank">
        <i class="fa-brands fa-tripadvisor" aria-hidden="true"></i>
      </a>
    </nav>
    <nav class="footer-links" aria-label="Navegación del pie de página">
      <a href="#galeria">Galería</a>
      <a href="#menu">Menú</a>
      <a href="#reservas">Reservas</a>
      <a href="#contacto">Contacto</a>
    </nav>
    <hr class="footer-divider">
    <p class="footer-copyright">
      &copy; <?php echo date( 'Y' ); ?> <?php bloginfo( 'name' ); ?>. Todos los derechos reservados.
    </p>
  </div>
</footer>
<!-- /section: footer -->

<?php wp_footer(); ?>
</body>
</html>
