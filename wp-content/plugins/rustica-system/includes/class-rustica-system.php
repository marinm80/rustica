<?php

/**
 * Clase Rustica_System
 * 
 * Gestiona la inicialización de roles, ganchos de WooCommerce y de API,
 * así como la siembra (seeding) inicial de mesas.
 */
class Rustica_System {

    // Instancia única de la clase (Singleton)
    private static $instance = null;

    /**
     * Obtiene la instancia única de la clase.
     */
    public static function get_instance() {
        if (!self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Constructor de la clase. Registra las rutas de la REST API, shortcodes y hooks.
     */
    private function __construct() {
        add_action("rest_api_init", ["Rustica_API", "register_routes"]);
        add_action("wp_enqueue_scripts", [$this, "enqueue_apps"]);
        add_shortcode("rustica_mesero", [$this, "shortcode_mesero"]);
        add_shortcode("rustica_cocina", [$this, "shortcode_cocina"]);
        add_shortcode("rustica_reservas", [$this, "shortcode_reservas"]);
        add_action("woocommerce_order_status_completed", ["Rustica_Billing", "on_pago_completado"], 10, 1);
        add_action("rustica_cron_cleanup", ["Rustica_Cleanup", "limpiar_reservas_expiradas"]);
    }

    /**
     * Ejecuta las tareas requeridas durante la activación del plugin.
     */
    public static function activate() {
        self::crear_roles();
        self::seed_zonas();
        self::seed_mesas();
        if (!wp_next_scheduled("rustica_cron_cleanup")) {
            wp_schedule_event(time(), "daily", "rustica_cron_cleanup");
        }
        update_option("rustica_version", RUSTICA_VERSION);
    }

    /**
     * Registra las mesas iniciales del restaurante clasificadas por zonas en la base de datos.
     */
    private static function seed_mesas() {
        if (get_option("rustica_mesas_seeded")) {
            return;
        }
        
        $zonas = [
            "salon-principal" => ["inicio" => 1,  "fin" => 15, "cap" => 4, "vip" => false],
            "la-terrazza"     => ["inicio" => 16, "fin" => 25, "cap" => 4, "vip" => false],
            "zona-vip"        => ["inicio" => 26, "fin" => 30, "cap" => 8, "vip" => true],
        ];
        
        foreach ($zonas as $slug => $cfg) {
            for ($n = $cfg["inicio"]; $n <= $cfg["fin"]; $n++) {
                $id = wp_insert_post([
                    "post_type"   => "mesa",
                    "post_title"  => "Mesa $n",
                    "post_status" => "publish"
                ]);
                update_field("numero", $n, $id);
                update_field("capacidad", $cfg["cap"], $id);
                update_field("estado", "libre", $id);
                update_field("es_vip", $cfg["vip"], $id);
                update_field("consumo_minimo", $cfg["vip"] ? 150 : 0, $id);
                wp_set_post_terms($id, [$slug], "zona_restaurante");
            }
        }
        
        update_option("rustica_mesas_seeded", true);
    }

    /**
     * Registra los roles de usuario de Mesero, Cocina y Gerente con sus capacidades.
     */
    private static function crear_roles() {
        // Registrar rol de Mesero
        add_role("mesero", "Mesero", [
            "read"           => true,
            "tomar_comandas" => true,
            "ver_mesas"      => true,
            "cerrar_cuenta"  => true
        ]);
        
        // Registrar rol de Cocina
        add_role("cocina", "Cocina", [
            "read"         => true,
            "ver_comandas" => true,
            "marcar_listo" => true
        ]);
        
        // Registrar rol de Gerente
        add_role("gerente", "Gerente", [
            "read"               => true,
            "tomar_comandas"     => true,
            "ver_mesas"          => true,
            "cerrar_cuenta"      => true,
            "ver_reportes"       => true,
            "gestionar_menu"     => true,
            "gestionar_reservas" => true
        ]);
    }
}