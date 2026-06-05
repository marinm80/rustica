<?php
/**
 * Title: Featured Section 1
 * Slug: patterns-restaurant/featured-section-1
 * Categories: about, featured
 * Description: A collection of various WordPress inbuilt blocks, such as headings, paragraphs, image, groups, and buttons, arranged in different positions to form a complete page layout.
 *
 * @package    Patterns_Restaurant
 * @subpackage Patterns_Restaurant/patterns
 * @since      1.0.0
 */

?>
<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|80","bottom":"var:preset|spacing|80"}}},"backgroundColor":"default","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-default-background-color has-background" style="padding-top:var(--wp--preset--spacing--80);padding-bottom:var(--wp--preset--spacing--80)"><!-- wp:columns {"verticalAlignment":"center","align":"wide","style":{"spacing":{"blockGap":{"left":"var:preset|spacing|60"}}}} -->
<div class="wp-block-columns alignwide are-vertically-aligned-center"><!-- wp:column {"verticalAlignment":"center","width":"55%"} -->
<div class="wp-block-column is-vertically-aligned-center" style="flex-basis:55%">
	
<!-- wp:group {"style":{"spacing":{"blockGap":"0px"}},"layout":{"type":"flex","flexWrap":"nowrap"}} -->
<div class="wp-block-group">
	
<!-- wp:group {"layout":{"type":"constrained"}} -->
<div class="wp-block-group">
	
<!-- wp:image {"sizeSlug":"full","linkDestination":"none","className":"is-style-default","style":{"border":{"radius":"5px"}}} -->
<figure class="wp-block-image size-full has-custom-border is-style-default"><img src="<?php echo esc_url( get_template_directory_uri() ); ?>/assets/img/img-2.jpg" style="border-radius:5px"/></figure>
<!-- /wp:image --></div>
<!-- /wp:group -->

<!-- wp:group {"layout":{"type":"constrained"}} -->
<div class="wp-block-group">
	
<!-- wp:image {"sizeSlug":"full","linkDestination":"none","style":{"border":{"radius":"5px"}}} -->
<figure class="wp-block-image size-full has-custom-border"><img src="<?php echo esc_url( get_template_directory_uri() ); ?>/assets/img/img-3.jpg"  style="border-radius:5px"/></figure>
<!-- /wp:image --></div>
<!-- /wp:group --></div>
<!-- /wp:group --></div>
<!-- /wp:column -->

<!-- wp:column {"verticalAlignment":"center","width":"45%"} -->
<div class="wp-block-column is-vertically-aligned-center" style="flex-basis:45%">
	
<!-- wp:pattern {"slug":"patterns-restaurant/section-title-1"} /-->

<!-- wp:paragraph {"align":"left","fontSize":"medium"} -->
<p class="has-text-align-left has-medium-font-size"><?php esc_html_e( '“La comida es nuestra forma de compartir amor, cultura y la alegría de estar juntos alrededor de una buena mesa”.', 'patterns-restaurant' ); ?></p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"align":"left","style":{"typography":{"lineHeight":"1.7"}},"fontSize":"small"} -->
<p class="has-text-align-left has-small-font-size" style="line-height:1.7"><?php esc_html_e( 'En La Rústica Mesa fusionamos recetas ancestrales con técnicas contemporáneas. Cada plato cuenta una historia: desde el frescor vibrante de nuestros ceviches hasta la calidez de nuestras arepas de maíz peto hechas a mano y el ahumado de nuestras carnes.', 'patterns-restaurant' ); ?></p>
<!-- /wp:paragraph -->

<!-- wp:buttons -->
<div class="wp-block-buttons"><!-- wp:button -->
<div class="wp-block-button"><a class="wp-block-button__link wp-element-button"><?php esc_html_e( 'Conocer Más', 'patterns-restaurant' ); ?></a></div>
<!-- /wp:button --></div>
<!-- /wp:buttons --></div>
<!-- /wp:column --></div>
<!-- /wp:columns --></div>
<!-- /wp:group -->
