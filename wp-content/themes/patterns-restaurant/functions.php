<?php // phpcs:ignore
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Patterns Restaurant functions and definitions
 *
 * @link https://developer.wordpress.org/themes/basics/theme-functions/
 *
 * @package Patterns Restaurant
 */

/**
 * Current theme path.
 * Current theme url.
 * Current theme version.
 * Current theme name.
 * Current theme option name.
 */
define( 'PATTERNS_RESTAURANT_PATH', trailingslashit( get_template_directory() ) );
define( 'PATTERNS_RESTAURANT_URL', trailingslashit( get_template_directory_uri() ) );
define( 'PATTERNS_RESTAURANT_VERSION', '1.0.1' );
define( 'PATTERNS_RESTAURANT_THEME_NAME', 'patterns-restaurant' );
define( 'PATTERNS_RESTAURANT_OPTION_NAME', 'patterns-restaurant' );

/**
 * The core theme class that is used to define internationalization,
 * admin-specific hooks, and public-facing site hooks.
 */
require PATTERNS_RESTAURANT_PATH . 'includes/main.php';

/**
 * Begins execution of the theme.
 *
 * @since    1.0.0
 */
function patterns_restaurant_run() {
	new Patterns_Restaurant();
}
patterns_restaurant_run();
