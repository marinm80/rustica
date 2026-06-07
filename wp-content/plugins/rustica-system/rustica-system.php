<?php
/**
 * Plugin Name: Rustica System
 * Description: Sistema de gestión para el restaurante Rustica Terraza.
 * Version: 1.0.0
 * Author: Rafael Marin
 * Requires PHP: 8.0
 */
if(!defined('ABSPATH')) exit;

define("RUSTICA_VERSION", "1.0.0");
define("RUSTICA_PATH", plugin_dir_path(__FILE__));
define("RUSTICA_URL", plugin_dir_url(__FILE__));

spl_autoload_register(function($class){
    $file = RUSTICA_PATH . "includes/class-" . 
            strlower(str_replace("_", "-", $class)) . ".php";
    if(file_exists($file)) require_once $file;   
});

register_activation_hook(__FILE__, ["RusticaSystem", "activate"]);
register_deactivation_hook(__FILE__, ["RusticaSystem", "deactivate"]);
add_action("plugins_loaded", fn() => Rustica_System::get_instance());
?>