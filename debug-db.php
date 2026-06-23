<?php
require_once __DIR__ . '/wp-load.php';

$post = get_post(45);
if ($post) {
    echo "=== HOME PAGE CONTENT ===\n";
    echo $post->post_content . "\n";
} else {
    echo "Home page not found.\n";
}
