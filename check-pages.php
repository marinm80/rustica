<?php
/**
 * Helper script to find the exact WordPress pages and URLs for the Rustica Apps.
 * You can access this script in your browser (e.g. http://localhost/check-pages.php or http://localhost:8080/check-pages.php)
 */

define('WP_USE_THEMES', false);
require_once(__DIR__ . '/wp-load.php');

header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Enlaces de las Aplicaciones - La Rustica Terrazza</title>
    <style>
        body { font-family: 'Inter', sans-serif; background: #1a1a1a; color: #f5f0e8; padding: 40px; }
        h1 { font-family: 'Playfair Display', serif; color: #c9a84c; border-bottom: 2px solid #c9a84c; padding-bottom: 10px; }
        .card { background: #2a2a2a; border-radius: 12px; padding: 20px; margin-bottom: 20px; border: 1px solid #333; }
        .app-title { font-size: 18px; font-weight: bold; color: #c9a84c; margin-bottom: 5px; }
        .app-desc { font-size: 14px; color: #aaa; margin-bottom: 15px; }
        a { color: #5cb85c; font-weight: bold; text-decoration: none; word-break: break-all; }
        a:hover { text-decoration: underline; }
        .warning { color: #e74c3c; font-weight: bold; background: rgba(231,76,60,0.1); padding: 10px; border-radius: 6px; border: 1px solid rgba(231,76,60,0.2); margin-top: 20px; }
    </style>
</head>
<body>
    <h1>Enlaces de Acceso a las Aplicaciones</h1>
    <p>Este script detectó las siguientes páginas publicadas en tu base de datos de WordPress local:</p>

    <?php
    $apps = [
        'Mesero' => [
            'shortcode' => 'rustica_mesero',
            'desc' => 'Tablet de Mesero: Permite ver la cuadrícula de mesas, comanda activa y edición de precios (exclusiva para gerente).'
        ],
        'Cocina' => [
            'shortcode' => 'rustica_cocina',
            'desc' => 'Monitor de Cocina (KDS): Recibe los pedidos enviados a preparación y permite marcarlos como listos.'
        ],
        'Reservaciones' => [
            'shortcode' => 'rustica_reservas',
            'desc' => 'Módulo de Reservas: Wizard público de reservas para clientes, y Dashboard administrativo para el personal logueado.'
        ]
    ];

    foreach ($apps as $name => $info) {
        // Buscar páginas que contengan el shortcode en el contenido del post
        $query = new WP_Query([
            'post_type' => 'page',
            'post_status' => 'publish',
            's' => '[' . $info['shortcode'], // busca el shortcode en el contenido
            'posts_per_page' => 1
        ]);

        echo '<div class="card">';
        echo '<div class="app-title">' . htmlspecialchars($name) . ' (Shortcode: <code>[' . $info['shortcode'] . ']</code>)</div>';
        echo '<div class="app-desc">' . htmlspecialchars($info['desc']) . '</div>';

        if ($query->have_posts()) {
            $post = $query->posts[0];
            $url = get_permalink($post->ID);
            echo '<div>👉 Enlace detectado: <a href="' . esc_url($url) . '" target="_blank">' . esc_html($url) . '</a></div>';
        } else {
            // Intento secundario por slug alternativo si no encuentra por contenido de texto
            $slug_fallback = strtolower($name);
            $page_fallback = get_page_by_path($slug_fallback);
            if ($page_fallback && $page_fallback->post_status === 'publish') {
                $url = get_permalink($page_fallback->ID);
                echo '<div>👉 Enlace detectado (por slug): <a href="' . esc_url($url) . '" target="_blank">' . esc_html($url) . '</a></div>';
            } else {
                echo '<div class="warning">⚠ No se encontró ninguna página activa con este shortcode. Crea una página nueva en WordPress y pega el shortcode <code>[' . $info['shortcode'] . ']</code> en su contenido.</div>';
            }
        }
        echo '</div>';
    }
    ?>

    <p style="font-size: 12px; color: #666; margin-top: 40px; text-align: center;">Rustica Terraza - check-pages.php</p>
</body>
</html>
