<?php
/**
 * Script de creación automática de páginas para La Rustica Terrazza.
 */
define('WP_USE_THEMES', false);
require_once(__DIR__ . '/wp-load.php');

$pages_to_create = [
    'mesero' => [
        'title' => 'Mesero App',
        'content' => '[rustica_mesero]'
    ],
    'cocina' => [
        'title' => 'Cocina App',
        'content' => '[rustica_cocina]'
    ],
    'reservaciones' => [
        'title' => 'Reservaciones',
        'content' => '[rustica_reservas]'
    ]
];

$creadas = 0;
foreach ($pages_to_create as $slug => $data) {
    $page = get_page_by_path($slug);
    if (!$page) {
        $id = wp_insert_post([
            'post_title'    => $data['title'],
            'post_content'  => $data['content'],
            'post_status'   => 'publish',
            'post_type'     => 'page',
            'post_name'     => $slug
        ]);
        if ($id && !is_wp_error($id)) {
            $creadas++;
        }
    }
}

// Redirigir de vuelta a check-pages.php para ver los enlaces
header('Location: check-pages.php');
exit;
