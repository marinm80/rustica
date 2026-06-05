<?php
// Silence is golden — child theme of patterns-restaurant.

add_action( 'wp_enqueue_scripts', function() {
	wp_enqueue_style(
		'sabor-latino-fonts',
		'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Lato:wght@400;700&display=swap',
		[],
		null
	);
} );
