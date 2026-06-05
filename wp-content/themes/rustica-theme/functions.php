<?php
/**
 * Rústica Theme — functions.php
 */

// ─────────────────────────────────────────────
// Assets
// ─────────────────────────────────────────────
add_action( 'wp_enqueue_scripts', 'rustica_enqueue_assets' );

function rustica_enqueue_assets() {
	wp_enqueue_style( 'rustica-fonts',
		'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Source+Sans+3:wght@300;400;600&display=swap',
		array(), null );

	wp_enqueue_style( 'bootstrap',
		'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css',
		array(), '5.3.3' );

	wp_enqueue_style( 'fontawesome',
		'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css',
		array(), '6.5.2' );

	wp_enqueue_style( 'rustica-main',
		get_stylesheet_directory_uri() . '/css/main.css',
		array( 'bootstrap', 'fontawesome', 'rustica-fonts' ), '1.0.0' );

	wp_enqueue_script( 'bootstrap-js',
		'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js',
		array(), '5.3.3', true );

	wp_enqueue_script( 'rustica-main-js',
		get_stylesheet_directory_uri() . '/dist/js/main.js',
		array( 'bootstrap-js' ), '1.0.0', true );

	add_filter( 'script_loader_tag', 'rustica_add_module_type', 10, 3 );

	// CSS dinámico desde Customizer (colores de marca)
	wp_add_inline_style( 'rustica-main', rustica_customizer_css() );
}

function rustica_add_module_type( $tag, $handle, $src ) {
	if ( 'rustica-main-js' === $handle ) {
		return '<script type="module" src="' . esc_url( $src ) . '"></script>' . "\n";
	}
	return $tag;
}

// ─────────────────────────────────────────────
// CSS dinámico desde Customizer
// ─────────────────────────────────────────────
function rustica_customizer_css() {
	$siena = get_theme_mod( 'rustica_color_siena', '#A0522D' );
	$olive = get_theme_mod( 'rustica_color_olive', '#6B7A4F' );

	// Derivar dark (oscurecer ~20%) de forma simple
	return "
		:root {
			--rustica-siena: {$siena};
			--rustica-accent: {$siena};
			--rustica-olive: {$olive};
			--rustica-secondary: {$olive};
		}
	";
}

// ─────────────────────────────────────────────
// Customizer
// ─────────────────────────────────────────────
add_action( 'customize_register', 'rustica_customize_register' );

function rustica_customize_register( WP_Customize_Manager $wp_customize ) {

	// ── Panel principal ──────────────────────
	$wp_customize->add_panel( 'rustica_panel', array(
		'title'    => '🍽 Rústica — Contenido',
		'priority' => 30,
	) );

	// ── SECCIÓN: Hero ────────────────────────
	$wp_customize->add_section( 'rustica_hero', array(
		'title' => 'Hero (portada)',
		'panel' => 'rustica_panel',
	) );

	rustica_add_setting( $wp_customize, 'hero_image', '',
		'Imagen de fondo', 'rustica_hero', 'image' );

	rustica_add_setting( $wp_customize, 'hero_title', 'Sabores que saben a casa',
		'Título principal', 'rustica_hero', 'text' );

	rustica_add_setting( $wp_customize, 'hero_subtitle',
		'Producto de temporada, fuego lento y la calidez del campo en cada plato. Reserva tu mesa y déjate llevar.',
		'Subtítulo', 'rustica_hero', 'textarea' );

	rustica_add_setting( $wp_customize, 'hero_cta', 'Reserva una Mesa',
		'Texto del botón CTA', 'rustica_hero', 'text' );

	// ── SECCIÓN: Menú (4 platos) ─────────────
	$wp_customize->add_section( 'rustica_menu', array(
		'title' => 'Menú — Platos destacados',
		'panel' => 'rustica_panel',
	) );

	$platos_defaults = array(
		1 => array( 'name' => 'Cordero al horno de leña',       'desc' => 'Paletilla cocida a fuego lento con romero, miel y patatas confitadas.',          'price' => '24,50 €', 'badge' => 'Especialidad' ),
		2 => array( 'name' => 'Risotto de setas de temporada',   'desc' => 'Arroz cremoso con boletus, parmesano curado y aceite de trufa.',                  'price' => '18,00 €', 'badge' => 'Recomendado' ),
		3 => array( 'name' => 'Huerto a la brasa',               'desc' => 'Verduras de nuestro huerto asadas con vinagreta de hierbas y queso de cabra.',    'price' => '15,50 €', 'badge' => 'Recomendado' ),
		4 => array( 'name' => 'Tarta rústica de manzana',        'desc' => 'Masa quebrada artesanal, manzana caramelizada y helado de vainilla.',             'price' => '8,50 €',  'badge' => '' ),
	);

	foreach ( $platos_defaults as $n => $p ) {
		rustica_add_setting( $wp_customize, "dish_{$n}_name",  $p['name'],  "Plato {$n} — Nombre",       'rustica_menu', 'text' );
		rustica_add_setting( $wp_customize, "dish_{$n}_desc",  $p['desc'],  "Plato {$n} — Descripción",  'rustica_menu', 'textarea' );
		rustica_add_setting( $wp_customize, "dish_{$n}_price", $p['price'], "Plato {$n} — Precio",       'rustica_menu', 'text' );
		rustica_add_setting( $wp_customize, "dish_{$n}_badge", $p['badge'], "Plato {$n} — Etiqueta",     'rustica_menu', 'select',
			array( '' => '(Sin etiqueta)', 'Especialidad' => 'Especialidad', 'Recomendado' => 'Recomendado' ) );
		rustica_add_setting( $wp_customize, "dish_{$n}_image", '',          "Plato {$n} — Imagen",       'rustica_menu', 'image' );
	}

	// ── SECCIÓN: Contacto ────────────────────
	$wp_customize->add_section( 'rustica_contact', array(
		'title' => 'Contacto',
		'panel' => 'rustica_panel',
	) );

	rustica_add_setting( $wp_customize, 'contact_address', 'Camino del Molino 12, 28010 Madrid, España',
		'Dirección', 'rustica_contact', 'text' );

	rustica_add_setting( $wp_customize, 'contact_phone', '+34 910 123 456',
		'Teléfono', 'rustica_contact', 'text' );

	rustica_add_setting( $wp_customize, 'contact_email', 'hola@rustica.example',
		'Email', 'rustica_contact', 'text' );

	rustica_add_setting( $wp_customize, 'contact_hours', 'Mar–Dom: 13:00–16:00 y 20:00–23:30 · Lunes cerrado',
		'Horarios', 'rustica_contact', 'textarea' );

	// ── SECCIÓN: Redes Sociales ──────────────
	$wp_customize->add_section( 'rustica_social', array(
		'title' => 'Redes Sociales',
		'panel' => 'rustica_panel',
	) );

	rustica_add_setting( $wp_customize, 'social_instagram', '#', 'Instagram (URL)', 'rustica_social', 'url' );
	rustica_add_setting( $wp_customize, 'social_facebook',  '#', 'Facebook (URL)',  'rustica_social', 'url' );
	rustica_add_setting( $wp_customize, 'social_tripadvisor', '#', 'TripAdvisor (URL)', 'rustica_social', 'url' );

	// ── SECCIÓN: Colores de marca ────────────
	$wp_customize->add_section( 'rustica_colors', array(
		'title' => 'Colores de marca',
		'panel' => 'rustica_panel',
	) );

	$wp_customize->add_setting( 'rustica_color_siena', array(
		'default'           => '#A0522D',
		'sanitize_callback' => 'sanitize_hex_color',
		'transport'         => 'postMessage',
	) );
	$wp_customize->add_control( new WP_Customize_Color_Control( $wp_customize, 'rustica_color_siena', array(
		'label'   => 'Color principal (siena)',
		'section' => 'rustica_colors',
	) ) );

	$wp_customize->add_setting( 'rustica_color_olive', array(
		'default'           => '#6B7A4F',
		'sanitize_callback' => 'sanitize_hex_color',
		'transport'         => 'postMessage',
	) );
	$wp_customize->add_control( new WP_Customize_Color_Control( $wp_customize, 'rustica_color_olive', array(
		'label'   => 'Color secundario (oliva)',
		'section' => 'rustica_colors',
	) ) );
}

// ─────────────────────────────────────────────
// ACF — Campos de la landing page
// ─────────────────────────────────────────────
add_action( 'acf/init', 'rustica_register_acf_fields' );

function rustica_register_acf_fields() {
	if ( ! function_exists( 'acf_add_local_field_group' ) ) return;

	// ── HERO ──────────────────────────────────
	acf_add_local_field_group( array(
		'key'      => 'group_rustica_hero',
		'title'    => '🎯 Rústica — Hero',
		'location' => array( array( array(
			'param' => 'page_type', 'operator' => '==', 'value' => 'front_page',
		) ) ),
		'menu_order' => 0,
		'fields' => array(
			array( 'key' => 'field_hero_bg',       'label' => 'Imagen de fondo',  'name' => 'hero_bg',       'type' => 'image',    'return_format' => 'url', 'preview_size' => 'medium' ),
			array( 'key' => 'field_hero_title',    'label' => 'Título',           'name' => 'hero_title',    'type' => 'text',     'default_value' => 'Sabores que saben a casa' ),
			array( 'key' => 'field_hero_subtitle', 'label' => 'Subtítulo',        'name' => 'hero_subtitle', 'type' => 'textarea', 'default_value' => 'Producto de temporada, fuego lento y la calidez del campo en cada plato. Reserva tu mesa y déjate llevar.', 'rows' => 3 ),
			array( 'key' => 'field_hero_cta',      'label' => 'Texto botón CTA',  'name' => 'hero_cta',      'type' => 'text',     'default_value' => 'Reserva una Mesa' ),
		),
	) );

	// ── MENÚ — 4 platos ───────────────────────
	$dish_fields = array();
	$dishes = array(
		1 => array( 'name' => 'Cordero al horno de leña',      'desc' => 'Paletilla cocida a fuego lento con romero, miel y patatas confitadas.',        'price' => '24,50 €', 'badge' => 'Especialidad' ),
		2 => array( 'name' => 'Risotto de setas de temporada', 'desc' => 'Arroz cremoso con boletus, parmesano curado y aceite de trufa.',                'price' => '18,00 €', 'badge' => 'Recomendado' ),
		3 => array( 'name' => 'Huerto a la brasa',             'desc' => 'Verduras de nuestro huerto asadas con vinagreta de hierbas y queso de cabra.', 'price' => '15,50 €', 'badge' => 'Recomendado' ),
		4 => array( 'name' => 'Tarta rústica de manzana',      'desc' => 'Masa quebrada artesanal, manzana caramelizada y helado de vainilla.',           'price' => '8,50 €',  'badge' => '' ),
	);

	foreach ( $dishes as $n => $d ) {
		$dish_fields[] = array( 'key' => "field_dish_{$n}_tab",   'label' => "Plato {$n}", 'name' => '', 'type' => 'tab' );
		$dish_fields[] = array( 'key' => "field_dish_{$n}_name",  'label' => 'Nombre',     'name' => "dish_{$n}_name",  'type' => 'text',     'default_value' => $d['name'] );
		$dish_fields[] = array( 'key' => "field_dish_{$n}_desc",  'label' => 'Descripción','name' => "dish_{$n}_desc",  'type' => 'textarea', 'default_value' => $d['desc'], 'rows' => 2 );
		$dish_fields[] = array( 'key' => "field_dish_{$n}_price", 'label' => 'Precio',     'name' => "dish_{$n}_price", 'type' => 'text',     'default_value' => $d['price'] );
		$dish_fields[] = array( 'key' => "field_dish_{$n}_badge", 'label' => 'Etiqueta',   'name' => "dish_{$n}_badge", 'type' => 'select',
			'choices'       => array( '' => '(Sin etiqueta)', 'Especialidad' => 'Especialidad', 'Recomendado' => 'Recomendado' ),
			'default_value' => $d['badge'],
		);
		$dish_fields[] = array( 'key' => "field_dish_{$n}_image", 'label' => 'Foto del plato', 'name' => "dish_{$n}_image", 'type' => 'image', 'return_format' => 'url', 'preview_size' => 'thumbnail' );
	}

	acf_add_local_field_group( array(
		'key'        => 'group_rustica_menu',
		'title'      => '🍽 Rústica — Menú Destacado',
		'location'   => array( array( array(
			'param' => 'page_type', 'operator' => '==', 'value' => 'front_page',
		) ) ),
		'menu_order' => 10,
		'fields'     => $dish_fields,
	) );

	// ── CONTACTO ──────────────────────────────
	acf_add_local_field_group( array(
		'key'        => 'group_rustica_contact',
		'title'      => '📍 Rústica — Contacto',
		'location'   => array( array( array(
			'param' => 'page_type', 'operator' => '==', 'value' => 'front_page',
		) ) ),
		'menu_order' => 20,
		'fields'     => array(
			array( 'key' => 'field_contact_address', 'label' => 'Dirección', 'name' => 'contact_address', 'type' => 'text',     'default_value' => 'Camino del Molino 12, 28010 Madrid, España' ),
			array( 'key' => 'field_contact_phone',   'label' => 'Teléfono',  'name' => 'contact_phone',   'type' => 'text',     'default_value' => '+34 910 123 456' ),
			array( 'key' => 'field_contact_email',   'label' => 'Email',     'name' => 'contact_email',   'type' => 'email',    'default_value' => 'hola@rustica.example' ),
			array( 'key' => 'field_contact_hours',   'label' => 'Horarios',  'name' => 'contact_hours',   'type' => 'textarea', 'default_value' => 'Mar–Dom: 13:00–16:00 y 20:00–23:30 · Lunes cerrado', 'rows' => 2 ),
			array( 'key' => 'field_contact_map',     'label' => 'URL embed mapa (iframe src)', 'name' => 'contact_map', 'type' => 'url', 'default_value' => 'https://maps.google.com/maps?q=Madrid,Spain&output=embed' ),
		),
	) );

	// ── REDES SOCIALES ────────────────────────
	acf_add_local_field_group( array(
		'key'        => 'group_rustica_social',
		'title'      => '📱 Rústica — Redes Sociales',
		'location'   => array( array( array(
			'param' => 'page_type', 'operator' => '==', 'value' => 'front_page',
		) ) ),
		'menu_order' => 30,
		'fields'     => array(
			array( 'key' => 'field_social_instagram',   'label' => 'Instagram URL',   'name' => 'social_instagram',   'type' => 'url', 'default_value' => '#' ),
			array( 'key' => 'field_social_facebook',    'label' => 'Facebook URL',    'name' => 'social_facebook',    'type' => 'url', 'default_value' => '#' ),
			array( 'key' => 'field_social_tripadvisor', 'label' => 'TripAdvisor URL', 'name' => 'social_tripadvisor', 'type' => 'url', 'default_value' => '#' ),
		),
	) );
}

// Helper: lee campo ACF con fallback
function rustica_field( string $name, string $default = '' ): string {
	if ( ! function_exists( 'get_field' ) ) return esc_html( $default );
	$val = get_field( $name );
	return esc_html( $val ?: $default );
}

function rustica_field_url( string $name, string $default = '#' ): string {
	if ( ! function_exists( 'get_field' ) ) return esc_url( $default );
	$val = get_field( $name );
	return esc_url( $val ?: $default );
}

// ─────────────────────────────────────────────
// Helper: registra setting + control de una vez
// ─────────────────────────────────────────────
function rustica_add_setting( $wp_customize, $id, $default, $label, $section, $type, $choices = array() ) {
	$sanitize = match( $type ) {
		'url'      => 'esc_url_raw',
		'textarea' => 'sanitize_textarea_field',
		'image'    => 'esc_url_raw',
		'select'   => 'sanitize_text_field',
		default    => 'sanitize_text_field',
	};

	$wp_customize->add_setting( "rustica_{$id}", array(
		'default'           => $default,
		'sanitize_callback' => $sanitize,
		'transport'         => 'refresh',
	) );

	if ( $type === 'image' ) {
		$wp_customize->add_control( new WP_Customize_Image_Control( $wp_customize, "rustica_{$id}", array(
			'label'   => $label,
			'section' => $section,
		) ) );
	} elseif ( $type === 'select' ) {
		$wp_customize->add_control( "rustica_{$id}", array(
			'label'   => $label,
			'section' => $section,
			'type'    => 'select',
			'choices' => $choices,
		) );
	} else {
		$wp_customize->add_control( "rustica_{$id}", array(
			'label'   => $label,
			'section' => $section,
			'type'    => $type,
		) );
	}
}
