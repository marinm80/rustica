<?php
/**
 * Detalle de un producto/platillo WooCommerce.
 *
 * @package Rustica_Theme
 * @since   1.0.0
 */

get_header();
?>
<main class="container py-5">
	<?php while ( have_posts() ) : the_post(); ?>
		<?php wc_get_template_part( 'content', 'single-product' ); ?>
	<?php endwhile; ?>
</main>
<?php
get_footer();
