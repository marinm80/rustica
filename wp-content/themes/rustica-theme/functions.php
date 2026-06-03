<?php
/**
 * Rustica Theme Theme functions and definitions.
 *
 * @link https://developer.wordpress.org/themes/basics/theme-functions/
 *
 * @package rustica-theme
 */

add_action( 'wp_enqueue_scripts', 'rustica_theme_parent_theme_enqueue_styles' );

/**
 * Enqueue scripts and styles.
 */
function rustica_theme_parent_theme_enqueue_styles() {
	wp_enqueue_style( 'astra-style', get_template_directory_uri() . '/style.css', array(), '0.1.0' );
	wp_enqueue_style(
		'rustica-theme-style',
		get_stylesheet_directory_uri() . '/style.css',
		array( 'astra-style' ),
		'0.1.0'
	);
}
