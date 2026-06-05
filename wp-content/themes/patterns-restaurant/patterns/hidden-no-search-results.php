<?php
/**
 * Title: No Search Result
 * Slug: patterns-restaurant/hidden-no-search-results
 * Inserter: no
 *
 * @package    Patterns_Restaurant
 * @subpackage Patterns_Restaurant/patterns
 * @since      1.0.0
 */

?>
<!-- wp:paragraph -->
<p>
<?php esc_html_e( 'Sorry, but nothing matched your search terms. Please try again with some different keywords.', 'patterns-restaurant' ); ?>
</p>
<!-- /wp:paragraph -->

<!-- wp:search {"label":"<?php echo esc_html_x( 'Search', 'label', 'patterns-restaurant' ); ?>","placeholder":"<?php echo esc_attr_x( 'Search...', 'placeholder for search field', 'patterns-restaurant' ); ?>","showLabel":false,"buttonText":"<?php esc_attr_e( 'Search', 'patterns-restaurant' ); ?>","buttonUseIcon":true} /-->
