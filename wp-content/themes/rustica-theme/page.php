<?php
/**
 * Plantilla para páginas interiores.
 *
 * @package Rustica_Theme
 * @since   1.0.0
 */

get_header();
?>
<main class="container py-5">
	<?php while ( have_posts() ) : the_post(); ?>
		<h1 class="mb-4"><?php the_title(); ?></h1>
		<div class="page-content"><?php the_content(); ?></div>
	<?php endwhile; ?>
</main>
<?php
get_footer();
