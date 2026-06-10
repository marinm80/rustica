<?php
// wp-content/mu-plugins/rustica-core.php
// Must Use plugin - se carga SIEMPRE, antes que cualquier otro plugin.

if(!defined('ABSPATH')) exit;

// Registra la acción init de WordPress para inicializar los Custom Post Types y las Taxonomías
// Corregido: add action -> add_action (se eliminó el espacio)
// Garantiza que los roles de operación tengan las capabilities necesarias para wp_insert_post.
// Se ejecuta en cada carga pero solo escribe en DB cuando falta la cap (primera vez).
add_action("init", "rustica_ensure_role_caps", 1);
function rustica_ensure_role_caps() {
    $map = [
        'mesero'  => [ 'publish_posts', 'edit_posts', 'delete_posts' ],
        'cocina'  => [ 'edit_posts' ],
        'gerente' => [ 'publish_posts', 'edit_posts', 'delete_posts', 'edit_others_posts', 'delete_others_posts' ],
    ];
    foreach ( $map as $role_name => $caps ) {
        $role = get_role( $role_name );
        if ( ! $role ) continue;
        foreach ( $caps as $cap ) {
            if ( ! $role->has_cap( $cap ) ) {
                $role->add_cap( $cap, true );
            }
        }
    }
}

// Fuerza que los posts de tipo 'comanda' siempre se guarden como 'publish',
// sin importar las capabilities del usuario autenticado vía JWT.
add_filter( 'wp_insert_post_data', 'rustica_force_comanda_publish', 10, 2 );
function rustica_force_comanda_publish( $data, $postarr ) {
    if ( isset( $data['post_type'] ) && $data['post_type'] === 'comanda' ) {
        $data['post_status'] = 'publish';
    }
    return $data;
}

add_action("init", "rustica_register_cpts");
function rustica_register_cpts(){
    // Registrar el Custom Post Type 'mesa'
    register_post_type("mesa", [
        "labels" => ["name" => "Mesas", "singular_name" => "Mesa"],
        "public" => false, "show_ui" => true,
        "show_in_rest" => true,
        "supports" => ["title", "custom-fields"],
        "menu_icon" => "dashicons-layout", // Corregido: menu-icon -> menu_icon
    ]);
    // Registrar el Custom Post Type 'reservacion'
    register_post_type("reservacion", [
        "labels" => ["name" => "Reservaciones", "singular_name" => "Reservacion"],
        "public" => false, "show_ui" => true, "show_in_rest" => true, // Corregido: "true" string -> true boolean y añadida coma final
        "supports" => ["title", "custom-fields"],
        "menu_icon" => "dashicons-calendar-alt", // Corregido: menu-icon -> menu_icon
    ]);
    // Registrar el Custom Post Type 'comanda'
    register_post_type("comanda", [
        "labels" => ["name" => "Comandas", "singular_name" => "Comanda"],
        "public" => false, "show_ui" => true, "show_in_rest" => true, // Corregido: "true" string -> true boolean y añadida coma final
        "supports" => ["title", "custom-fields"],
        "menu_icon" => "dashicons-cart", // Corregido: menu-icon -> menu_icon
    ]);
    // Registrar la Taxonomía 'zona_restaurante' para clasificar las mesas
    register_taxonomy("zona_restaurante", ["mesa"], [
        "labels" => ["name" => "Zonas", "singular_name" => "Zona"],
        "hierarchical" => true, "show_in_rest" => true,
        "rewrite" => ["slug" => "zona"],
    ]);
}