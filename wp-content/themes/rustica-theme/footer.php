<footer class="py-5 mt-5" style="background-color:#1a1a1a; color:#f5f0e8;">
	<div class="container">
		<div class="row">
			<div class="col-md-4 mb-3">
				<h5 style="color:#c9a84c;"><?php bloginfo( 'name' ); ?></h5>
				<p class="small"><?php esc_html_e( 'Cocina de autor en La Terrazza', 'rustica-theme' ); ?></p>
			</div>
			<div class="col-md-4 mb-3">
				<h6 style="color:#c9a84c;"><?php esc_html_e( 'Horarios', 'rustica-theme' ); ?></h6>
				<p class="small"><?php esc_html_e( 'Lun–Vie: 12:00–22:00', 'rustica-theme' ); ?><br><?php esc_html_e( 'Sáb–Dom: 12:00–23:00', 'rustica-theme' ); ?></p>
			</div>
			<div class="col-md-4 mb-3">
				<?php
				wp_nav_menu( [
					'theme_location' => 'footer',
					'container'      => false,
					'menu_class'     => 'list-unstyled',
					'fallback_cb'    => false,
				] );
				?>
			</div>
		</div>
		<hr style="border-color:#c9a84c;">
		<p class="text-center small mb-0">&copy; <?php echo esc_html( date( 'Y' ) ); ?> <?php bloginfo( 'name' ); ?></p>
	</div>
</footer>
<?php wp_footer(); ?>
</body>
</html>
