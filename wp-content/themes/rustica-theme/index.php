<?php
/**
 * Plantilla genérica de fallback.
 *
 * @package Rustica_Theme
 * @since   1.0.0
 */

get_header();
?>
<main class="container py-5">
	<?php if ( have_posts() ) : while ( have_posts() ) : the_post(); ?>
		<article><?php the_title( '<h1>', '</h1>' ); the_content(); ?></article>
	<?php endwhile; endif; ?>
</main>
<?php
get_footer();
