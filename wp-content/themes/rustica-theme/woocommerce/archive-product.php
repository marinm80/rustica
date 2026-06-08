<?php
/**
 * Archivo de productos WooCommerce — Bootstrap grid.
 *
 * @package Rustica_Theme
 * @since   1.0.0
 */

get_header();

$categories = get_terms( [ 'taxonomy' => 'product_cat', 'hide_empty' => true ] );
?>
<main class="container py-5">
	<div class="d-flex gap-2 mb-4 flex-wrap">
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

	<div class="row g-4">
		<?php
		woocommerce_product_loop_start();
		while ( have_posts() ) {
			the_post();
			wc_get_template_part( 'content', 'product' );
		}
		woocommerce_product_loop_end();
		?>
	</div>
	<?php woocommerce_pagination(); ?>
</main>
<?php
get_footer();
