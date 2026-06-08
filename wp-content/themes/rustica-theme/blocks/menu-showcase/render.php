<?php
/**
 * Block render: Menu Showcase.
 *
 * Reemplaza Elementor Loop Grid — muestra productos WooCommerce disponibles hoy.
 *
 * @package Rustica_Theme
 * @since   1.0.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$categoria  = get_field( 'categoria' )      ?: '';
$limite     = (int) ( get_field( 'limite' ) ?: 8 );
$titulo_sec = get_field( 'titulo_seccion' ) ?: 'Nuestra Carta';

$args = [
	'post_type'      => 'product',
	'posts_per_page' => $limite,
	'meta_query'     => [
		[ 'key' => 'disponible_hoy', 'value' => '1' ],
	],
];

if ( $categoria ) {
	$args['tax_query'] = [ [
		'taxonomy' => 'product_cat',
		'field'    => 'slug',
		'terms'    => $categoria,
	] ];
}

$platillos = new WP_Query( $args );
?>
<section class="rustica-menu-showcase py-5">
	<div class="container">
		<h2 class="text-center mb-5"><?php echo esc_html( $titulo_sec ); ?></h2>
		<div class="row g-4">
		<?php while ( $platillos->have_posts() ) : $platillos->the_post();
			$product   = wc_get_product( get_the_ID() );
			$alergenos = get_field( 'alergenos' ) ?: [];
			$tiempo    = get_field( 'tiempo_prep_min' );
		?>
			<div class="col-sm-6 col-lg-3">
				<div class="card h-100 border-0 shadow-sm">
					<?php if ( has_post_thumbnail() ) : ?>
						<img src="<?php echo esc_url( get_the_post_thumbnail_url( null, 'rustica-card' ) ); ?>"
						     class="card-img-top"
						     alt="<?php echo esc_attr( get_the_title() ); ?>">
					<?php endif; ?>
					<div class="card-body">
						<h5 class="card-title"><?php the_title(); ?></h5>
						<p class="card-text text-muted small"><?php the_excerpt(); ?></p>
						<?php foreach ( $alergenos as $a ) : ?>
							<span class="badge bg-warning text-dark"><?php echo esc_html( $a ); ?></span>
						<?php endforeach; ?>
					</div>
					<div class="card-footer bg-white border-0 d-flex justify-content-between">
						<strong>$<?php echo esc_html( number_format( (float) $product->get_price(), 0, ',', '.' ) ); ?></strong>
						<?php if ( $tiempo ) : ?>
							<small class="text-muted"><?php echo esc_html( $tiempo ); ?> min</small>
						<?php endif; ?>
					</div>
				</div>
			</div>
		<?php endwhile; wp_reset_postdata(); ?>
		</div>
	</div>
</section>
