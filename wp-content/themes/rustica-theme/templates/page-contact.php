<?php
/**
 * Template Name: Contacto
 *
 * Página de contacto con información del restaurante.
 *
 * @package Rustica_Theme
 * @since   1.0.0
 */

get_header();
?>
<main class="container py-5">
	<h1 class="mb-4"><?php esc_html_e( 'Contacto', 'rustica-theme' ); ?></h1>
	<div class="row">
		<div class="col-md-6">
			<?php the_content(); ?>
		</div>
		<div class="col-md-6">
			<div class="card border-0 shadow-sm p-4">
				<h5 style="color:#c9a84c;"><?php esc_html_e( 'Encuéntranos', 'rustica-theme' ); ?></h5>
				<p><strong><?php esc_html_e( 'Dirección:', 'rustica-theme' ); ?></strong> <?php esc_html_e( 'La Terrazza, Bogotá', 'rustica-theme' ); ?></p>
				<p><strong><?php esc_html_e( 'Teléfono:', 'rustica-theme' ); ?></strong> +57 1 234 5678</p>
				<p><strong><?php esc_html_e( 'Email:', 'rustica-theme' ); ?></strong>
					<a href="mailto:reservas@rusticaterrazza.com">reservas@rusticaterrazza.com</a>
				</p>
			</div>
		</div>
	</div>
</main>
<?php
get_footer();
