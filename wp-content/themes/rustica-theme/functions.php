<?php
/**
 * Rustica Theme — functions.php
 *
 * Bootstrap 5 CDN, WooCommerce support, ACF Blocks registration.
 *
 * @package Rustica_Theme
 * @since   1.0.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// ─────────────────────────────────────────────────────────────────────────────
// Theme setup
// ─────────────────────────────────────────────────────────────────────────────
add_action( 'after_setup_theme', function () {
	add_theme_support( 'woocommerce' );
	add_theme_support( 'wc-product-gallery-zoom' );
	add_theme_support( 'wc-product-gallery-lightbox' );
	add_theme_support( 'wp-block-styles' );
	add_theme_support( 'editor-styles' );
	add_editor_style( 'assets/css/main.css' );
	add_theme_support( 'post-thumbnails' );
	add_image_size( 'rustica-hero', 1920, 800, true );
	add_image_size( 'rustica-card', 600, 400, true );
	register_nav_menus( [
		'primary' => 'Menú Principal',
		'footer'  => 'Menú Footer',
	] );
	add_theme_support( 'title-tag' );
} );

// ─────────────────────────────────────────────────────────────────────────────
// Enqueue assets
// ─────────────────────────────────────────────────────────────────────────────
add_action( 'wp_enqueue_scripts', function () {
	wp_enqueue_style(
		'bootstrap',
		'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css',
		[],
		'5.3.3'
	);
	wp_enqueue_style(
		'rustica-main',
		get_template_directory_uri() . '/assets/css/main.css',
		[ 'bootstrap' ],
		wp_get_theme()->get( 'Version' )
	);
	wp_enqueue_script(
		'bootstrap',
		'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js',
		[],
		'5.3.3',
		true
	);
	wp_enqueue_script(
		'rustica-main',
		get_template_directory_uri() . '/assets/js/main.js',
		[ 'bootstrap' ],
		wp_get_theme()->get( 'Version' ),
		true
	);
} );

// ─────────────────────────────────────────────────────────────────────────────
// ACF Blocks registration
// ─────────────────────────────────────────────────────────────────────────────
add_action( 'init', function () {
	if ( ! function_exists( 'acf_register_block_type' ) ) {
		return;
	}
	foreach ( [ 'hero', 'menu-showcase', 'gallery-section', 'reservation-cta' ] as $block ) {
		register_block_type( get_template_directory() . "/blocks/{$block}" );
	}
} );
