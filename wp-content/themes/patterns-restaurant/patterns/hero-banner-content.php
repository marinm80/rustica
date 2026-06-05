<?php
/**
 * Title: Hero Banner Content
 * Slug: patterns-restaurant/hero-banner-content
 * Categories: featured
 * Description: A layout that displays a title, content, and button group, suited for showcasing a hero banner.
 *
 * @package    Patterns_Restaurant
 * @subpackage Patterns_Restaurant/patterns
 * @since      1.0.0
 */

?>
<!-- wp:columns {"metadata":{"name":"Hero content"},"align":"wide"} -->
<div class="wp-block-columns alignwide"><!-- wp:column -->
<div class="wp-block-column">
	
<!-- wp:group {"align":"wide","style":{"spacing":{"blockGap":"0"}},"layout":{"type":"constrained","contentSize":"","justifyContent":"center","wideSize":""}} -->
<div class="wp-block-group alignwide"><!-- wp:paragraph {"align":"left","style":{"typography":{"textTransform":"uppercase"}},"fontSize":"x-small"} -->
<p class="has-text-align-left has-x-small-font-size" style="text-transform:uppercase"><?php esc_html_e( '¡Bienvenidos a nuestra mesa!', 'patterns-restaurant' ); ?></p>
<!-- /wp:paragraph -->

<!-- wp:heading {"textAlign":"left","level":1} -->
<h1 class="wp-block-heading has-text-align-left"><?php esc_html_e( 'La Rústica Mesa', 'patterns-restaurant' ); ?></h1>
<!-- /wp:heading -->

<!-- wp:spacer {"height":"var:preset|spacing|20"} -->
<div style="height:var(--wp--preset--spacing--20)" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer -->

<!-- wp:paragraph {"align":"left","fontSize":"medium"} -->
<p class="has-text-align-left has-medium-font-size"><?php esc_html_e( 'Sabores auténticos que cruzan fronteras. Disfruta de una experiencia culinaria única que rinde homenaje a las ricas tradiciones de la cocina latinoamericana, con el toque rústico de la leña y el carbón.', 'patterns-restaurant' ); ?></p>
<!-- /wp:paragraph -->

<!-- wp:spacer {"height":"var:preset|spacing|20"} -->
<div style="height:var(--wp--preset--spacing--20)" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer -->

<!-- wp:buttons {"layout":{"type":"flex","justifyContent":"left"}} -->
<div class="wp-block-buttons"><!-- wp:button {"className":"is-style-fill"} -->
<div class="wp-block-button is-style-fill"><a class="wp-block-button__link wp-element-button"><?php esc_html_e( 'Ver Menú', 'patterns-restaurant' ); ?></a></div>
<!-- /wp:button --></div>
<!-- /wp:buttons --></div>
<!-- /wp:group -->

</div>
<!-- /wp:column -->

<!-- wp:column -->
<div class="wp-block-column"></div>
<!-- /wp:column --></div>
<!-- /wp:columns -->
