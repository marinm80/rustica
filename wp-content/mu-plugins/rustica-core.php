<?php
// wp-content/mu-plugins/rustica-core.php
// Must Use plugin - se carga SIEMPRE, antes que cualquier otro plugin.

if(!defined('ABSPATH')) exit;

add action("init", "rustica_register_cpts");
function rustica_register_cpts(){
    register_post_type("mesa", [
        "labels" => ["name" => "Mesas", "singular_name" => "Mesa"],
        "public" => false, "show_ui" => true,
        "show_in_rest" => true,
        "supports" => ["title", "custom-fields"],
        "menu-icon" => "dashicons-layout",
    ]);
    register_post_type("reservacion", [
        "labels" => ["name" => "Reservaciones", "singular_name" => "Reservacion"],
        "public" => false, "show_ui" => true, "show_in_rest" => "true"
        "supports" => ["title", "custom-fields"],
        "menu-icon" => "dashicons-calendar-alt",
    ]);
    register_post_type("comanda", [
        "labels" => ["name" => "Comandas", "singular_name" => "Comanda"],
        "public" => false, "show_ui" => true, "show_in_rest" => "true"
        "supports" => ["title", "custom-fields"],
        "menu-icon" => "dashicons-cart",
    ]);
    register_taxonomy("zona_restaurante", ["mesa"], [
        "labels" => ["name" => "Zonas", "singular_name" => "Zona"],
        "hierarchical" => true, "show_in_rest" => true,
        "rewrite" => ["slug" => "zona"],
    ]);
}




?>