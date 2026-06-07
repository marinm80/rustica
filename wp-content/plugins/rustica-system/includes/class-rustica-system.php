<?php

// Clase coordinadora principal del sistema del restaurante Rustica
class Rustica_System {

    // Guarda la instancia única del Singleton
    private static $instance = null;

    // Obtiene la instancia única o la crea si no existe
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    // Inicializa los hooks de WordPress, endpoints de la REST API y los shortcodes
    private function __construct() {
        add_action("rest_api_init", ["Rustica_API", "register_routes"]);
        add_action("wp_enqueue_scripts", [$this, "enqueue_apps"]);
        add_shortcode("rustica_mesero", [$this, "shortcode_mesero"]);
        add_shortcode("rustica_cocina", [$this, "shortcode_cocina"]);
        add_shortcode("rustica_reservas", [$this, "shortcode_reservas"]);
        add_action("woocommerce_order_status_completed", ["Rustica_Billing", "on_pago_completado"], 10, 1);
        add_action("rustica_cron_cleanup", ["Rustica_Cleanup", "limpiar_reservas_expiradas"]);
    }

    // Código ejecutado al activar el plugin: inicializa roles, taxonomías y datos
    public static function activate() {
        self::crear_roles();
        self::seed_zonas();
        self::seed_mesas();

        // Programa el cron job diario para limpiar reservas obsoletas si no está agendado
        if (!wp_next_scheduled("rustica_cron_cleanup")) {
            wp_schedule_event(time(), "daily", "rustica_cron_cleanup");
        }

        update_option("rustica_version", RUSTICA_VERSION);
    }

    // Código ejecutado al desactivar el plugin: limpia el cron job programado
    public static function deactivate() {
        wp_clear_scheduled_hook("rustica_cron_cleanup");
    }

    // Añade las zonas físicas iniciales en la taxonomía 'zona_restaurante'
    private static function seed_zonas() {
        $zonas = [
            "Salón Principal" => "salon-principal",
            "La Terrazza"     => "la-terrazza",
            "Zona VIP"        => "zona-vip"
        ];

        foreach ($zonas as $name => $slug) {
            if (!term_exists($slug, "zona_restaurante")) {
                wp_insert_term($name, "zona_restaurante", ["slug" => $slug]);
            }
        }
    }

    // Crea y configura las 30 mesas de pruebas en la base de datos
    private static function seed_mesas() {
        if (get_option("rustica_mesas_seeded")) return;

        $zonas = [
            "salon-principal" => ["inicio" => 1,  "fin" => 15, "cap" => 4, "vip" => false],
            "la-terrazza"     => ["inicio" => 16, "fin" => 25, "cap" => 4, "vip" => false],
            "zona-vip"        => ["inicio" => 26, "fin" => 30, "cap" => 8, "vip" => true],
        ];

        foreach ($zonas as $slug => $cfg) {
            for ($n = $cfg['inicio']; $n <= $cfg['fin']; $n++) {
                $id = wp_insert_post([
                    "post_type"   => "mesa",
                    "post_title"  => "Mesa " . $n,
                    "post_status" => "publish"
                ]);

                if (!is_wp_error($id)) {
                    // Verificación robusta de la existencia de ACF (update_field)
                    if (function_exists('update_field')) {
                        update_field("numero", $n, $id);
                        update_field("capacidad", $cfg['cap'], $id);
                        update_field("estado", "libre", $id);
                        update_field("es_vip", $cfg['vip'], $id);
                        update_field("consumo_minimo", $cfg['vip'] ? 1500 : 0, $id);
                    } else {
                        // Fallback seguro usando metadatos nativos de WordPress si ACF no está activo
                        update_post_meta($id, "numero", $n);
                        update_post_meta($id, "capacidad", $cfg['cap']);
                        update_post_meta($id, "estado", "libre");
                        update_post_meta($id, "es_vip", $cfg['vip'] ? 1 : 0);
                        update_post_meta($id, "consumo_minimo", $cfg['vip'] ? 1500 : 0);
                    }
                    wp_set_post_terms($id, [$slug], "zona_restaurante");
                }
            }
        }

        update_option("rustica_mesas_seeded", true);
    }

    // Crea los roles de usuario personalizados y asigna capacidades
    private static function crear_roles() {
        add_role("mesero", "Mesero", [
            "read"           => true,
            "tomar_comandas" => true,
            "ver_mesas"      => true,
            "cerrar_cuenta"  => true
        ]);

        add_role("cocina", "Cocina", [
            "read"          => true,
            "ver_comandas"  => true,
            "marcar_listo"  => true
        ]);

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

    // Encola los assets javascript/css correspondientes
    public function enqueue_apps() {
    }

    // Renderiza el shortcode para la aplicación de mesero
    public function shortcode_mesero($atts) {
        return '<div id="rustica-mesero-root"></div>';
    }

    // Renderiza el shortcode para la aplicación de cocina
    public function shortcode_cocina($atts) {
        return '<div id="rustica-cocina-root"></div>';
    }

    // Renderiza el shortcode para la aplicación de reservas
    public function shortcode_reservas($atts) {
        return '<div id="rustica-reservas-root"></div>';
    }
}