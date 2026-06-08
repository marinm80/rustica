<?php
/**
 * Block render: Hero Principal.
 *
 * @package Rustica_Theme
 * @since   1.0.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$titulo    = get_field( 'titulo' )    ?: 'La Rustica Terrazza';
$subtitulo = get_field( 'subtitulo' ) ?: 'Cocina de autor en La Terrazza';
$cta_texto = get_field( 'cta_texto' ) ?: 'Reservar mesa';
$cta_link  = get_field( 'cta_link' )  ?: '/reservar';
$imagen    = get_field( 'imagen_fondo' );
$bg_url    = $imagen ? $imagen['url'] : get_template_directory_uri() . '/assets/images/hero-default.jpg';
?>
<section class="rustica-hero" style="background-image: url('<?php echo esc_url( $bg_url ); ?>')">
	<div class="rustica-hero__overlay"></div>
	<div class="container text-center rustica-hero__content">
		<h1 class="display-3 fw-bold text-white"><?php echo esc_html( $titulo ); ?></h1>
		<p class="lead text-white mb-4"><?php echo esc_html( $subtitulo ); ?></p>
		<a href="<?php echo esc_url( $cta_link ); ?>" class="btn btn-outline-light btn-lg px-5">
			<?php echo esc_html( $cta_texto ); ?>
		</a>
	</div>
</section>
