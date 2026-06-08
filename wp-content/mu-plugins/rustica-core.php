<?php
// wp-content/mu-plugins/rustica-core.php
// Must Use plugin - se carga SIEMPRE, antes que cualquier otro plugin.

if(!defined('ABSPATH')) exit;

// Registra la acción init de WordPress para inicializar los Custom Post Types y las Taxonomías
// Corregido: add action -> add_action (se eliminó el espacio)
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