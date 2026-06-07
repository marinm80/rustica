<?php
/**
 * Plugin Name: Rustica System
 * Description: Sistema de gestión para el restaurante Rustica Terraza.
 * Version: 1.0.0
 * Author: Rafael Marin
 * Requires PHP: 8.0
 */
if(!defined('ABSPATH')) exit;

// Definición de las constantes principales del plugin para directorios y URL de assets
define("RUSTICA_VERSION", "1.0.0");
define("RUSTICA_PATH", plugin_dir_path(__FILE__));
define("RUSTICA_URL", plugin_dir_url(__FILE__));

// Registro de la función de autocarga (autoloader) para incluir dinámicamente las clases del plugin
spl_autoload_register(function($class){
    // Corregido: strlower -> strtolower (la función strlower no existe en PHP)
    $file = RUSTICA_PATH . "includes/class-" . 
            strtolower(str_replace("_", "-", $class)) . ".php";
    if(file_exists($file)) require_once $file;   
});

// Hooks para inicializar el plugin en la activación o desactivación desde el administrador
// Corregidos: "RusticaSystem" -> "Rustica_System" (nombre correcto de la clase)
register_activation_hook(__FILE__, ["Rustica_System", "activate"]);
register_deactivation_hook(__FILE__, ["Rustica_System", "deactivate"]);

// Gancho de acción para inicializar la clase coordinadora principal
add_action("plugins_loaded", fn() => Rustica_System::get_instance());


