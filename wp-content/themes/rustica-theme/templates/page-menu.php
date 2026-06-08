<?php
/**
 * Template Name: Nuestra Carta
 *
 * Muestra el archivo completo de productos WooCommerce con filtros por categoría.
 *
 * @package Rustica_Theme
 * @since   1.0.0
 */

get_header();

$categories = get_terms( [ 'taxonomy' => 'product_cat', 'hide_empty' => true ] );
?>
<main class="container py-5">
	<h1 class="text-center mb-5"><?php esc_html_e( 'Nuestra Carta', 'rustica-theme' ); ?></h1>

	<div class="d-flex gap-2 mb-4 flex-wrap justify-content-center">
		<a href="<?php echo esc_url( get_post_type_archive_link( 'product' ) ); ?>"
		   class="btn btn-sm btn-outline-secondary">
			<?php esc_html_e( 'Todos', 'rustica-theme' ); ?>
		</a>
		<?php foreach ( $categories as $cat ) : ?>
			<a href="<?php echo esc_url( get_term_link( $cat ) ); ?>"
			   class="btn btn-sm btn-outline-secondary">
				<?php echo esc_html( $cat->name ); ?>
			</a>
		<?php endforeach; ?>
	</div>

	<?php
	$platillos = new WP_Query( [ 'post_type' => 'product', 'posts_per_page' => -1 ] );
	if ( $platillos->have_posts() ) :
	?>
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
				<div class="card-footer bg-white border-0 d-flex justify-content-between align-items-center">
					<strong>$<?php echo esc_html( number_format( (float) $product->get_price(), 0, ',', '.' ) ); ?></strong>
					<?php if ( $tiempo ) : ?>
						<small class="text-muted"><?php echo esc_html( $tiempo ); ?> min</small>
					<?php endif; ?>
				</div>
			</div>
		</div>
	<?php endwhile; wp_reset_postdata(); ?>
	</div>
	<?php endif; ?>
</main>
<?php
get_footer();
