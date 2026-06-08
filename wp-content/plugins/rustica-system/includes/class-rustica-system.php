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
        if (!self::$instance) self::$instance = new self();
        
        return self::$instance;
    }

    /**
     * Constructor de la clase. Registra las rutas de la REST API, shortcodes y hooks.
     */
    private function __construct() {
        add_action("rest_api_init",       ["Rustica_API",      "register_routes"]);
        add_action("wp_enqueue_scripts",  [$this,              "enqueue_apps"]);
        add_shortcode("rustica_mesero",   [$this,              "shortcode_mesero"]);
        add_shortcode("rustica_cocina",   [$this,              "shortcode_cocina"]);
        add_shortcode("rustica_reservas", [$this, "shortcode_reservas"]);
        add_action("woocommerce_order_status_completed", 
                    ["Rustica_Billing", "on_pago_completado"], 10, 1);
        add_action("rustica_cron_cleanup", 
                    ["Rustica_Cleanup", "limpiar_reservas_expiradas"]);
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
     * Crea los términos de taxonomía zona_restaurante si no existen.
     */
    private static function seed_zonas() {
        $zonas = [
            "salon-principal" => "Salón Principal",
            "la-terrazza"     => "La Terrazza",
            "zona-vip"        => "Zona VIP",
        ];
        foreach ($zonas as $slug => $nombre) {
            if (!term_exists($slug, "zona_restaurante")) {
                wp_insert_term($nombre, "zona_restaurante", ["slug" => $slug]);
            }
        }
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
                update_post_meta($id, "numero", $n);
                update_post_meta($id, "capacidad", $cfg["cap"]);
                update_post_meta($id, "estado", "libre");
                update_post_meta($id, "es_vip", $cfg["vip"]);
                update_post_meta($id, "consumo_minimo", $cfg["vip"] ? 150 : 0);
                wp_set_post_terms($id, [$slug], "zona_restaurante");
            }
        }
        
        update_option("rustica_mesas_seeded", true);
    }

    public static function deactivate() {
        wp_clear_scheduled_hook("rustica_cron_cleanup");
    }

    public function enqueue_apps() {
        $dist = RUSTICA_URL . 'assets/dist/';
        $ver  = RUSTICA_VERSION;

        foreach ( ['mesero', 'cocina', 'reservas'] as $app ) {
            $file = RUSTICA_PATH . "assets/dist/{$app}.js";
            if ( file_exists( $file ) ) {
                wp_register_script(
                    "rustica-{$app}",
                    $dist . "{$app}.js",
                    [],
                    $ver,
                    true
                );
            }
        }

        // Config global accesible desde window.RusticaConfig en todas las apps.
        wp_localize_script( 'rustica-reservas', 'RusticaConfig', [
            'nonce'   => wp_create_nonce( 'wp_rest' ),
            'apiUrl'  => esc_url_raw( rest_url( 'rustica/v1' ) ),
            'siteUrl' => esc_url_raw( home_url() ),
        ] );
    }

    public function shortcode_mesero() {
        $mesa_id = (int) ( $_GET['mesa'] ?? 0 );
        wp_enqueue_script( 'rustica-mesero' );
        wp_localize_script( 'rustica-mesero', 'RusticaConfig', [
            'nonce'   => wp_create_nonce( 'wp_rest' ),
            'apiUrl'  => esc_url_raw( rest_url( 'rustica/v1' ) ),
            'mesa_id' => $mesa_id,
        ] );
        return '<div id="rustica-mesero"></div>';
    }

    public function shortcode_cocina() {
        wp_enqueue_script( 'rustica-cocina' );
        wp_localize_script( 'rustica-cocina', 'RusticaConfig', [
            'nonce'  => wp_create_nonce( 'wp_rest' ),
            'apiUrl' => esc_url_raw( rest_url( 'rustica/v1' ) ),
        ] );
        return '<div id="rustica-cocina"></div>';
    }

    public function shortcode_reservas() {
        wp_enqueue_script( 'rustica-reservas' );
        return '<div id="rustica-reservas"></div>';
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