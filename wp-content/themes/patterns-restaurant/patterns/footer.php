<?php
/**
 * Title: Footer
 * Slug: patterns-restaurant/footer
 * Categories: footer
 * Block Types: core/template-part/footer
 * Description: A pattern for displaying the site footer.
 *
 * @package    Patterns_Restaurant
 * @subpackage Patterns_Restaurant/patterns
 * @since      1.0.0
 */

?>
<!-- wp:pattern {"slug":"patterns-restaurant/featured-section-10"} /-->

<!-- wp:group {"align":"full","style":{"spacing":{"blockGap":"0px"}},"backgroundColor":"secondary","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-secondary-background-color has-background">
	
<!-- wp:group {"align":"wide","style":{"border":{"bottom":{"color":"var:preset|color|tertiary","style":"dashed","width":"1px"}},"spacing":{"padding":{"top":"var:preset|spacing|60","bottom":"var:preset|spacing|60"}}},"layout":{"type":"flex","flexWrap":"wrap","justifyContent":"space-between"}} -->
<div class="wp-block-group alignwide" style="border-bottom-color:var(--wp--preset--color--tertiary);border-bottom-style:dashed;border-bottom-width:1px;padding-top:var(--wp--preset--spacing--60);padding-bottom:var(--wp--preset--spacing--60)"><!-- wp:group {"layout":{"type":"flex","flexWrap":"nowrap"}} -->
<div class="wp-block-group"><!-- wp:image {"width":"auto","height":"40px","sizeSlug":"full","linkDestination":"custom"} -->
<figure class="wp-block-image size-full is-resized"><img src="<?php echo esc_url( get_template_directory_uri() ); ?>/assets/img/patternswp-logo-icon-white.png" style="width:auto;height:40px"/></figure>
<!-- /wp:image -->

<!-- wp:site-title {"level":3,"style":{"elements":{"link":{"color":{"text":"var:preset|color|default"},":hover":{"color":{"text":"var:preset|color|primary"}}}},"layout":{"selfStretch":"fixed","flexSize":"100px"}},"textColor":"default"} /-->

</div>
<!-- /wp:group -->

<!-- wp:social-links {"iconColor":"default","iconColorValue":"#ffffff","size":"has-normal-icon-size","align":"center","className":"is-style-logos-only","style":{"spacing":{"blockGap":{"left":"var:preset|spacing|20"}}}} -->
<ul class="wp-block-social-links aligncenter has-normal-icon-size has-icon-color is-style-logos-only"><!-- wp:social-link {"url":"#","service":"twitter"} /-->

<!-- wp:social-link {"url":"#","service":"instagram"} /-->

<!-- wp:social-link {"url":"#","service":"whatsapp"} /--></ul>
<!-- /wp:social-links --></div>
<!-- /wp:group -->

<!-- wp:columns {"verticalAlignment":"top","align":"wide","style":{"spacing":{"blockGap":{"left":"var:preset|spacing|80"},"padding":{"top":"var:preset|spacing|60","bottom":"var:preset|spacing|60"}},"border":{"bottom":{"color":"var:preset|color|tertiary","style":"dashed","width":"1px"}}}} -->
<div class="wp-block-columns alignwide are-vertically-aligned-top" style="border-bottom-color:var(--wp--preset--color--tertiary);border-bottom-style:dashed;border-bottom-width:1px;padding-top:var(--wp--preset--spacing--60);padding-bottom:var(--wp--preset--spacing--60)"><!-- wp:column {"verticalAlignment":"top","width":"33.33%"} -->
<div class="wp-block-column is-vertically-aligned-top" style="flex-basis:33.33%"><!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|20"}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group"><!-- wp:heading {"level":5,"style":{"elements":{"link":{"color":{"text":"var:preset|color|default"}}}},"textColor":"default"} -->
<h5 class="wp-block-heading has-default-color has-text-color has-link-color"><?php esc_html_e( 'About Us', 'patterns-restaurant' ); ?></h5>
<!-- /wp:heading -->

<!-- wp:group {"layout":{"type":"constrained"}} -->
<div class="wp-block-group"><!-- wp:paragraph {"textColor":"tertiary"} -->
<p class="has-tertiary-color has-text-color"><?php esc_html_e( 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Expedita repudiandae neque illum aspernatur fugiat maiores id magni, modi, quaerat vitae. Consectetur adipisicing elit.', 'patterns-restaurant' ); ?></p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"style":{"typography":{"fontStyle":"normal","fontWeight":"600"}}} -->
<p style="font-style:normal;font-weight:600"><a href="#"><?php esc_html_e( 'Read More', 'patterns-restaurant' ); ?></a></p>
<!-- /wp:paragraph -->

</div>
<!-- /wp:group --></div>
<!-- /wp:group --></div>
<!-- /wp:column -->

<!-- wp:column {"verticalAlignment":"top","width":"33.33%"} -->
<div class="wp-block-column is-vertically-aligned-top" style="flex-basis:33.33%"><!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|20"}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group"><!-- wp:heading {"level":5,"textColor":"default"} -->
<h5 class="wp-block-heading has-default-color has-text-color"><?php esc_html_e( 'Contact Info', 'patterns-restaurant' ); ?></h5>
<!-- /wp:heading -->

<!-- wp:group {"layout":{"type":"constrained"}} -->
<div class="wp-block-group"><!-- wp:paragraph {"textColor":"tertiary"} -->
<p class="has-tertiary-color has-text-color"><?php esc_html_e( '785 15h Street, Office 478 Berlin, De 81566 6391 Elgin St. Celina, 10299', 'patterns-restaurant' ); ?></p>
<!-- /wp:paragraph -->

<!-- wp:group {"style":{"spacing":{"blockGap":"0"}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group"><!-- wp:paragraph {"className":"pwp-txt-dec-non","fontSize":"large"} -->
<p class="pwp-txt-dec-non has-large-font-size"><a href="<?php echo esc_url( 'tel:000 - (629) 555-0129' ); ?>
"><?php esc_html_e( '000 - (629) 555-0129', 'patterns-restaurant' ); ?></a></p>
<!-- /wp:paragraph -->

<!-- wp:paragraph {"className":"pwp-txt-dec-non","fontSize":"medium"} -->
<p class="pwp-txt-dec-non has-medium-font-size"><a href="<?php echo esc_url( 'mailto:info@example.com' ); ?>
"><?php esc_html_e( 'info@example.com', 'patterns-restaurant' ); ?></a></p>
<!-- /wp:paragraph --></div>
<!-- /wp:group --></div>
<!-- /wp:group --></div>
<!-- /wp:group --></div>
<!-- /wp:column -->

<!-- wp:column {"verticalAlignment":"top","width":"33.33%"} -->
<div class="wp-block-column is-vertically-aligned-top" style="flex-basis:33.33%"><!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|20"}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group"><!-- wp:heading {"level":5,"textColor":"default"} -->
<h5 class="wp-block-heading has-default-color has-text-color"><?php esc_html_e( 'Working Hours', 'patterns-restaurant' ); ?></h5>
<!-- /wp:heading -->

<!-- wp:columns -->
<div class="wp-block-columns"><!-- wp:column -->
<div class="wp-block-column"><!-- wp:heading {"level":6,"textColor":"default"} -->
<h6 class="wp-block-heading has-default-color has-text-color"><?php esc_html_e( 'Monday - Friday', 'patterns-restaurant' ); ?></h6>
<!-- /wp:heading -->

<!-- wp:group {"style":{"spacing":{"blockGap":"0"}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group">

<!-- wp:paragraph {"textColor":"tertiary","fontSize":"small"} -->
<p class="has-tertiary-color has-text-color has-small-font-size"><?php esc_html_e( 'Our doors are open', 'patterns-restaurant' ); ?></p>
<!-- /wp:paragraph -->
<!-- wp:paragraph {"textColor":"tertiary","fontSize":"small"} -->
<p class="has-tertiary-color has-text-color has-small-font-size"><?php esc_html_e( '07:00 - 22:00', 'patterns-restaurant' ); ?></p>
<!-- /wp:paragraph -->

</div>
<!-- /wp:group -->

</div>
<!-- /wp:column -->

<!-- wp:column -->
<div class="wp-block-column"><!-- wp:heading {"level":6,"textColor":"default"} -->
<h6 class="wp-block-heading has-default-color has-text-color"><?php esc_html_e( 'Weekends', 'patterns-restaurant' ); ?></h6>
<!-- /wp:heading -->

<!-- wp:group {"style":{"spacing":{"blockGap":"0"}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group">

<!-- wp:paragraph {"textColor":"tertiary","fontSize":"small"} -->
<p class="has-tertiary-color has-text-color has-small-font-size"><?php esc_html_e( 'Our doors are open', 'patterns-restaurant' ); ?></p>
<!-- /wp:paragraph -->
<!-- wp:paragraph {"textColor":"tertiary","fontSize":"small"} -->
<p class="has-tertiary-color has-text-color has-small-font-size"><?php esc_html_e( '07:00 - 22:00', 'patterns-restaurant' ); ?></p>
<!-- /wp:paragraph -->

</div>
<!-- /wp:group -->

</div>
<!-- /wp:column --></div>
<!-- /wp:columns --></div>
<!-- /wp:group --></div>
<!-- /wp:column --></div>
<!-- /wp:columns -->

<!-- wp:group {"align":"full","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull">
	
<!-- wp:pattern {"slug":"patterns-restaurant/copyright"} /-->



</div>
<!-- /wp:group -->

<!-- wp:pattern {"slug":"patterns-restaurant/scroll-to-top-button"} /-->

</div>
<!-- /wp:group -->
