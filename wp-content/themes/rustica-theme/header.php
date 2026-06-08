<!doctype html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
<nav class="navbar navbar-expand-lg navbar-dark" style="background-color:#1a1a1a;">
	<div class="container">
		<a class="navbar-brand fw-bold" style="color:#c9a84c;" href="<?php echo esc_url( home_url() ); ?>">
			<?php bloginfo( 'name' ); ?>
		</a>
		<button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navMain"
			aria-controls="navMain" aria-expanded="false" aria-label="<?php esc_attr_e( 'Abrir menú', 'rustica-theme' ); ?>">
			<span class="navbar-toggler-icon"></span>
		</button>
		<div class="collapse navbar-collapse" id="navMain">
			<?php
			wp_nav_menu( [
				'theme_location' => 'primary',
				'container'      => false,
				'menu_class'     => 'navbar-nav ms-auto',
				'fallback_cb'    => false,
			] );
			?>
		</div>
	</div>
</nav>
