<?php
/**
 * Title: Page Full Width
 * Slug: patterns-restaurant/single-page-full-width
 * Template Types: singular, page
 * Description: A full-width layout template for displaying a page without sidebars.
 *
 * @package    Patterns_Restaurant
 * @subpackage Patterns_Restaurant/patterns
 * @since      1.0.0
 */

?>
<!-- wp:template-part {"slug":"header-absolute","tagName":"header"} /-->
<!-- wp:template-part {"slug":"single-header", "align":"full"} /-->

<!-- wp:group {"tagName":"main","metadata":{"name":"Main"},"align":"full","layout":{"type":"constrained"}} -->
<main class="wp-block-group alignfull">
	<!-- wp:post-content {"className":"pwp-child-reset","align":"full","layout":{"type":"constrained"}} /--> 
</main>
<!-- /wp:group -->

<!-- wp:template-part {"slug":"footer","tagName":"footer"} /-->
