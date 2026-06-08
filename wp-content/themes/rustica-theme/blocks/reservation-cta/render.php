<?php
/**
 * Block render: Reservación CTA.
 *
 * @package Rustica_Theme
 * @since   1.0.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$titulo    = get_field( 'titulo' )    ?: 'Reserva tu mesa';
$subtitulo = get_field( 'subtitulo' ) ?: 'Vive la experiencia Rustica Terrazza';
?>
<section class="py-5 text-center" style="background-color:#1a1a1a; color:#f5f0e8;">
	<div class="container">
		<h2 style="color:#c9a84c;"><?php echo esc_html( $titulo ); ?></h2>
		<p class="lead mb-4"><?php echo esc_html( $subtitulo ); ?></p>
		<?php echo do_shortcode( '[rustica_reservas]' ); ?>
	</div>
</section>
