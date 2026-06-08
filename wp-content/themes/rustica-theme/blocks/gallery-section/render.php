<?php
/**
 * Block render: Galería.
 *
 * @package Rustica_Theme
 * @since   1.0.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$titulo   = get_field( 'titulo' )   ?: 'La Terrazza';
$imagenes = get_field( 'imagenes' ) ?: [];
?>
<section class="rustica-gallery py-5" style="background-color:#f5f0e8;">
	<div class="container">
		<h2 class="text-center mb-5"><?php echo esc_html( $titulo ); ?></h2>
		<div class="row g-3">
		<?php foreach ( $imagenes as $img ) : ?>
			<div class="col-sm-6 col-lg-4">
				<img src="<?php echo esc_url( $img['url'] ); ?>"
				     alt="<?php echo esc_attr( $img['alt'] ); ?>"
				     class="img-fluid rounded shadow-sm w-100"
				     style="height:250px; object-fit:cover;">
			</div>
		<?php endforeach; ?>
		</div>
	</div>
</section>
