<?php
/**
 * Title: Hero Banner
 * Slug: patterns-restaurant/hero-banner
 * Categories: banner
 * Description: A layout for displaying hero banner content with a background and SVGs.
 *
 * @package    Patterns_Restaurant
 * @subpackage Patterns_Restaurant/patterns
 * @since      1.0.0
 */

?>
<!-- wp:cover {"url":"<?php echo esc_url( get_template_directory_uri() ); ?>/assets/img/img-1.jpg","hasParallax":true,"dimRatio":50,"overlayColor":"secondary","isUserOverlayColor":true,"minHeight":90,"minHeightUnit":"vh","contentPosition":"center center","metadata":{"name":"Hero Banner"},"align":"full","style":{"spacing":{"padding":{"right":"var:preset|spacing|30","left":"var:preset|spacing|30"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-cover alignfull has-parallax" style="padding-right:var(--wp--preset--spacing--30);padding-left:var(--wp--preset--spacing--30);min-height:90vh"><span aria-hidden="true"
		class="wp-block-cover__background has-secondary-background-color has-background-dim"></span>
	<div class="wp-block-cover__image-background has-parallax" style="background-position:50% 50%;background-image:url(<?php echo esc_url( get_template_directory_uri() ); ?>/assets/img/img-1.jpg)">
	</div>
	<div class="wp-block-cover__inner-container">

	<!-- wp:pattern {"slug":"patterns-restaurant/hero-banner-content"} /-->

</div></div>
<!-- /wp:cover -->
