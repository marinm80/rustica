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
        add_shortcode("rustica_mesero",   [$this, "shortcode_mesero"]);
        add_shortcode("rustica_cocina",   [$this, "shortcode_cocina"]);
        add_shortcode("rustica_reservas", [$this, "shortcode_reservas"]);
        add_shortcode("rustica_zonas",    [$this, "shortcode_zonas"]);
        add_action("rest_api_init",       [$this, "add_cors_headers"], 15);
        add_action("woocommerce_order_status_completed", 
                    ["Rustica_Billing", "on_pago_completado"], 10, 1);
        add_action("rustica_cron_cleanup", 
                    ["Rustica_Cleanup", "limpiar_reservas_expiradas"]);
        
        if ( is_admin() ) {
            add_action( 'add_meta_boxes_reservacion', [ $this, 'registrar_metabox_reservacion' ] );
            add_action( 'save_post_reservacion',      [ $this, 'guardar_y_validar_reservacion' ], 10, 2 );

            // Disponibilidad de productos en el listado de WooCommerce.
            add_filter( 'manage_product_posts_columns',        [ $this, 'columna_disponible_header' ] );
            add_action( 'manage_product_posts_custom_column',  [ $this, 'columna_disponible_render' ], 10, 2 );
            add_action( 'admin_footer',                        [ $this, 'columna_disponible_script' ] );
            add_action( 'wp_ajax_rustica_toggle_disponible',   [ $this, 'ajax_toggle_disponible' ] );

            // Metabox en la pantalla de edición de producto.
            add_action( 'add_meta_boxes_product',  [ $this, 'registrar_metabox_disponible' ] );
            add_action( 'save_post_product',       [ $this, 'guardar_metabox_disponible' ], 10, 2 );
        }
    }

    /**
     * Ejecuta las tareas requeridas durante la activación del plugin.
     */
    public static function activate() {
        // Asegurar que los CPTs y taxonomías estén registrados durante la activación
        if (function_exists('rustica_register_cpts')) {
            rustica_register_cpts();
        }
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
            $term = get_term_by('slug', $slug, 'zona_restaurante');
            
            for ($n = $cfg["inicio"]; $n <= $cfg["fin"]; $n++) {
                $id = wp_insert_post([
                    "post_type"   => "mesa",
                    "post_title"  => "Mesa $n",
                    "post_status" => "publish"
                ]);
                if ($id && !is_wp_error($id)) {
                    update_post_meta($id, "numero", $n);
                    update_post_meta($id, "capacidad", $cfg["cap"]);
                    update_post_meta($id, "estado", "libre");
                    update_post_meta($id, "es_vip", $cfg["vip"]);
                    update_post_meta($id, "consumo_minimo", $cfg["vip"] ? 150 : 0);
                    if ($term) {
                        wp_set_post_terms($id, [(int) $term->term_id], "zona_restaurante");
                    }
                }
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

        foreach ( ['mesero', 'cocina', 'reservas', 'zonas'] as $app ) {
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
        $current_user = wp_get_current_user();
        $roles = (array) $current_user->roles;
        $user_role = !empty($roles) ? $roles[0] : '';
        $es_gerente = in_array( 'gerente', $roles ) || in_array( 'administrator', $roles );
        $is_staff = in_array( 'mesero', $roles ) || in_array( 'cocina', $roles ) || $es_gerente;

        wp_localize_script( 'rustica-reservas', 'RusticaConfig', [
            'nonce'     => wp_create_nonce( 'wp_rest' ),
            'apiUrl'    => esc_url_raw( rest_url( 'rustica/v1' ) ),
            'siteUrl'   => esc_url_raw( home_url() ),
            'user_role' => $user_role,
            'es_gerente'=> $es_gerente,
            'is_staff'  => $is_staff,
        ] );
    }

    public function shortcode_mesero() {
        $mesa_id = (int) ( $_GET['mesa'] ?? 0 );
        $current_user = wp_get_current_user();
        $roles = (array) $current_user->roles;
        $user_role = !empty($roles) ? $roles[0] : '';
        $es_gerente = in_array( 'gerente', $roles ) || in_array( 'administrator', $roles );
        $is_staff = in_array( 'mesero', $roles ) || in_array( 'cocina', $roles ) || $es_gerente;

        wp_enqueue_script( 'rustica-mesero' );
        wp_localize_script( 'rustica-mesero', 'RusticaConfig', [
            'nonce'     => wp_create_nonce( 'wp_rest' ),
            'apiUrl'    => esc_url_raw( rest_url( 'rustica/v1' ) ),
            'mesa_id'   => $mesa_id,
            'user_role' => $user_role,
            'es_gerente'=> $es_gerente,
            'is_staff'  => $is_staff,
        ] );
        return '<div id="rustica-mesero"></div>';
    }

    public function shortcode_cocina() {
        $current_user = wp_get_current_user();
        $roles = (array) $current_user->roles;
        $user_role = !empty($roles) ? $roles[0] : '';
        $es_gerente = in_array( 'gerente', $roles ) || in_array( 'administrator', $roles );
        $is_staff = in_array( 'mesero', $roles ) || in_array( 'cocina', $roles ) || $es_gerente;

        wp_enqueue_script( 'rustica-cocina' );
        wp_localize_script( 'rustica-cocina', 'RusticaConfig', [
            'nonce'     => wp_create_nonce( 'wp_rest' ),
            'apiUrl'    => esc_url_raw( rest_url( 'rustica/v1' ) ),
            'user_role' => $user_role,
            'es_gerente'=> $es_gerente,
            'is_staff'  => $is_staff,
        ] );
        return '<div id="rustica-cocina"></div>';
    }

    public function shortcode_reservas() {
        $current_user = wp_get_current_user();
        $roles = (array) $current_user->roles;
        $user_role = !empty($roles) ? $roles[0] : '';
        $es_gerente = in_array( 'gerente', $roles ) || in_array( 'administrator', $roles );
        $is_staff = in_array( 'mesero', $roles ) || in_array( 'cocina', $roles ) || $es_gerente;

        wp_enqueue_script( 'rustica-reservas' );
        wp_localize_script( 'rustica-reservas', 'RusticaConfig', [
            'nonce'     => wp_create_nonce( 'wp_rest' ),
            'apiUrl'    => esc_url_raw( rest_url( 'rustica/v1' ) ),
            'siteUrl'   => esc_url_raw( home_url() ),
            'user_role' => $user_role,
            'es_gerente'=> $es_gerente,
            'is_staff'  => $is_staff,
        ] );
        return '<div id="rustica-reservas"></div>';
    }

    /**
     * Monta ZonasApp: tarjetas de zona con conteo de mesas libres en tiempo real.
     * Se actualiza vía evento DOM rustica:reservacion_completada sin recargar la página.
     */
    public function shortcode_zonas() {
        wp_enqueue_script( 'rustica-zonas' );
        return '<div id="rustica-zonas"></div>';
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

    /**
     * Registra el metabox de reservaciones en el panel de administración.
     */
    public function registrar_metabox_reservacion() {
        add_meta_box(
            'rustica_reservacion_details',
            'Detalles de la Reservación',
            [$this, 'render_metabox_reservacion'],
            'reservacion',
            'normal',
            'high'
        );
    }

    /**
     * Renderiza el contenido del metabox de reservación.
     */
    public function render_metabox_reservacion($post) {
        wp_nonce_field('rustica_reservacion_meta_box', 'rustica_reservacion_meta_box_nonce');

        $mesa_id = get_post_meta($post->ID, 'mesa_id', true);
        $inicio = get_post_meta($post->ID, 'hora_inicio', true);
        
        $fecha = $inicio ? date('Y-m-d', $inicio) : '';
        $hora = $inicio ? date('H:i', $inicio) : '';
        
        $personas = get_post_meta($post->ID, 'personas', true) ?: 2;
        $nombre = get_post_meta($post->ID, 'nombre', true);
        $email = get_post_meta($post->ID, 'email', true);
        $telefono = get_post_meta($post->ID, 'telefono', true);
        $notas = get_post_meta($post->ID, 'notas', true);
        $estado = get_post_meta($post->ID, 'estado', true) ?: 'pendiente';

        // Obtener todas las mesas
        $mesas = get_posts([
            'post_type' => 'mesa',
            'posts_per_page' => -1,
            'post_status' => 'publish',
            'orderby' => 'meta_value_num',
            'meta_key' => 'numero',
            'order' => 'ASC'
        ]);

        ?>
        <div style="padding: 10px 0;">
            <style>
                .rustica-admin-field { margin-bottom: 15px; }
                .rustica-admin-field label { display: block; font-weight: bold; margin-bottom: 5px; }
                .rustica-admin-field input, .rustica-admin-field select, .rustica-admin-field textarea { width: 100%; max-width: 400px; padding: 6px; }
                .rustica-admin-row { display: flex; gap: 20px; flex-wrap: wrap; }
            </style>
            
            <div class="rustica-admin-row">
                <div class="rustica-admin-field" style="flex: 1; min-width: 200px;">
                    <label for="r_mesa_id">Mesa</label>
                    <select id="r_mesa_id" name="mesa_id" required>
                        <option value="">Selecciona una mesa</option>
                        <?php foreach ($mesas as $m) :
                            $num = get_post_meta($m->ID, 'numero', true);
                            $cap = get_post_meta($m->ID, 'capacidad', true);
                            $vip = get_post_meta($m->ID, 'es_vip', true) ? ' [VIP]' : '';
                            $terms = wp_get_post_terms($m->ID, 'zona_restaurante');
                            $zona_name = (!is_wp_error($terms) && !empty($terms)) ? $terms[0]->name : 'Sin Zona';
                            $selected = ($mesa_id == $m->ID) ? 'selected' : '';
                            echo "<option value='{$m->ID}' $selected>Mesa $num ($zona_name) - Cap: $cap$vip</option>";
                        endforeach; ?>
                    </select>
                </div>

                <div class="rustica-admin-field" style="flex: 1; min-width: 200px;">
                    <label for="r_estado">Estado</label>
                    <select id="r_estado" name="estado">
                        <option value="pendiente" <?php selected($estado, 'pendiente'); ?>>Pendiente</option>
                        <option value="confirmada" <?php selected($estado, 'confirmada'); ?>>Confirmada</option>
                        <option value="cancelada" <?php selected($estado, 'cancelada'); ?>>Cancelada</option>
                    </select>
                </div>
            </div>

            <div class="rustica-admin-row">
                <div class="rustica-admin-field" style="flex: 1; min-width: 200px;">
                    <label for="r_fecha">Fecha</label>
                    <input type="date" id="r_fecha" name="fecha" value="<?php echo esc_attr($fecha); ?>" required>
                </div>

                <div class="rustica-admin-field" style="flex: 1; min-width: 200px;">
                    <label for="r_hora">Hora</label>
                    <select id="r_hora" name="hora" required>
                        <option value="">Selecciona hora</option>
                        <?php foreach (['12:00','13:00','14:00','15:00','19:00','20:00','21:00','22:00'] as $h) : ?>
                            <option value="<?php echo $h; ?>" <?php selected($hora, $h); ?>><?php echo $h; ?></option>
                        <?php endforeach; ?>
                    </select>
                </div>

                <div class="rustica-admin-field" style="flex: 1; min-width: 200px;">
                    <label for="r_personas">Personas</label>
                    <input type="number" id="r_personas" name="personas" value="<?php echo esc_attr($personas); ?>" min="1" max="50" required>
                </div>
            </div>

            <hr style="margin: 20px 0; border: 0; border-top: 1px solid #ccc;">

            <div class="rustica-admin-row">
                <div class="rustica-admin-field" style="flex: 1; min-width: 200px;">
                    <label for="r_nombre">Nombre del Cliente</label>
                    <input type="text" id="r_nombre" name="nombre" value="<?php echo esc_attr($nombre); ?>" required>
                </div>

                <div class="rustica-admin-field" style="flex: 1; min-width: 200px;">
                    <label for="r_email">Correo Electrónico</label>
                    <input type="email" id="r_email" name="email" value="<?php echo esc_attr($email); ?>" required>
                </div>

                <div class="rustica-admin-field" style="flex: 1; min-width: 200px;">
                    <label for="r_telefono">Teléfono</label>
                    <input type="text" id="r_telefono" name="telefono" value="<?php echo esc_attr($telefono); ?>">
                </div>
            </div>

            <div class="rustica-admin-field">
                <label for="r_notas">Notas / Observaciones</label>
                <textarea id="r_notas" name="notas" rows="4"><?php echo esc_textarea($notes = $notas); ?></textarea>
            </div>
        </div>
        <?php
    }

    /**
     * Guarda y valida los datos de la reservación desde el administrador.
     */
    public function guardar_y_validar_reservacion($post_id, $post) {
        if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
        if ($post->post_status === 'trash' || $post->post_status === 'auto-draft') return;

        if (!isset($_POST['rustica_reservacion_meta_box_nonce'])) return;
        if (!wp_verify_nonce($_POST['rustica_reservacion_meta_box_nonce'], 'rustica_reservacion_meta_box')) return;

        if (!current_user_can('edit_post', $post_id)) return;

        // Leer variables enviadas
        $mesa_id = isset($_POST['mesa_id']) ? (int) $_POST['mesa_id'] : 0;
        $fecha = isset($_POST['fecha']) ? sanitize_text_field($_POST['fecha']) : '';
        $hora = isset($_POST['hora']) ? sanitize_text_field($_POST['hora']) : '';
        $personas = isset($_POST['personas']) ? (int) $_POST['personas'] : 2;
        $nombre = isset($_POST['nombre']) ? sanitize_text_field($_POST['nombre']) : '';
        $email = isset($_POST['email']) ? sanitize_email($_POST['email']) : '';
        $telefono = isset($_POST['telefono']) ? sanitize_text_field($_POST['telefono']) : '';
        $notas = isset($_POST['notas']) ? sanitize_textarea_field($_POST['notas']) : '';
        $estado = isset($_POST['estado']) ? sanitize_text_field($_POST['estado']) : 'pendiente';

        if (!$mesa_id || !$fecha || !$hora || !$nombre || !$email) {
            return;
        }

        $inicio = strtotime("$fecha $hora");
        $fin = $inicio + (2 * 3600);

        // Validar solapamiento (excluyendo el post actual)
        // Solo validamos si la reserva está activa (no cancelada)
        if ($estado !== 'cancelada') {
            $conflictos = new WP_Query([
                'post_type'      => 'reservacion',
                'posts_per_page' => 1,
                'post_status'    => ['publish', 'pending'],
                'post__not_in'   => [$post_id],
                'meta_query'     => [
                    [ 'key' => 'mesa_id', 'value' => $mesa_id ],
                    [ 'key' => 'estado',  'value' => 'cancelada', 'compare' => '!=' ],
                    [ 'key' => 'hora_inicio', 'value' => $fin,    'compare' => '<', 'type' => 'NUMERIC' ],
                    [ 'key' => 'hora_fin',    'value' => $inicio, 'compare' => '>', 'type' => 'NUMERIC' ],
                ],
                'fields'         => 'ids',
            ]);

            if ($conflictos->have_posts()) {
                remove_action('save_post_reservacion', [$this, 'guardar_y_validar_reservacion'], 10);
                wp_die('Error: La mesa seleccionada ya tiene una reservación activa que se solapa con este horario.', 'Conflicto de Reservación', ['back_link' => true]);
            }
        }

        // Guardar metadatos
        update_post_meta($post_id, 'mesa_id',     $mesa_id);
        update_post_meta($post_id, 'hora_inicio', $inicio);
        update_post_meta($post_id, 'hora_fin',    $fin);
        update_post_meta($post_id, 'personas',    $personas);
        update_post_meta($post_id, 'nombre',      $nombre);
        update_post_meta($post_id, 'email',       $email);
        update_post_meta($post_id, 'telefono',    $telefono);
        update_post_meta($post_id, 'notas',       $notas);
        update_post_meta($post_id, 'estado',      $estado);
    }

    /**
     * Habilita los encabezados CORS para permitir peticiones externas (headless).
     */
    public function add_cors_headers() {
        remove_filter( 'rest_pre_serve_request', 'rest_send_cors_headers' );
        add_filter( 'rest_pre_serve_request', function( $value ) {
            header( 'Access-Control-Allow-Origin: *' );
            header( 'Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE' );
            header( 'Access-Control-Allow-Credentials: true' );
            header( 'Access-Control-Allow-Headers: Authorization, X-WP-Nonce, Content-Type, Keep-Alive, User-Agent, Cache-Control' );
            return $value;
        } );
    }

    // ──────────────────────────────────────────────────────────────────────────
    // DISPONIBILIDAD DE PRODUCTOS EN EL ADMIN DE WP
    // ──────────────────────────────────────────────────────────────────────────

    /** Agrega la columna "En menú" a la lista de productos. */
    public function columna_disponible_header( array $cols ): array {
        $new = [];
        foreach ( $cols as $key => $label ) {
            $new[ $key ] = $label;
            if ( $key === 'name' ) {
                $new['rustica_disponible'] = 'En menú';
            }
        }
        return $new;
    }

    /** Renderiza el toggle en cada fila de la lista de productos. */
    public function columna_disponible_render( string $col, int $post_id ): void {
        if ( $col !== 'rustica_disponible' ) return;

        $disponible = get_post_meta( $post_id, 'rustica_disponible', true ) !== 'no';
        $clase      = $disponible ? 'rustica-toggle-on' : 'rustica-toggle-off';
        $label      = $disponible ? 'Activo' : 'Agotado';
        $nonce      = wp_create_nonce( 'rustica_toggle_' . $post_id );

        printf(
            '<button class="rustica-toggle %s" data-id="%d" data-nonce="%s" title="%s"
                style="cursor:pointer;border:none;background:none;padding:0;font-size:13px;">%s</button>',
            esc_attr( $clase ),
            $post_id,
            esc_attr( $nonce ),
            esc_attr( $label ),
            $disponible
                ? '<span style="display:inline-flex;align-items:center;gap:5px;color:#00a32a;font-weight:600;">&#9679; Activo</span>'
                : '<span style="display:inline-flex;align-items:center;gap:5px;color:#d63638;font-weight:600;">&#9679; Agotado</span>'
        );
    }

    /** Inyecta el JS inline que maneja el clic AJAX en la lista de productos. */
    public function columna_disponible_script(): void {
        $screen = get_current_screen();
        if ( ! $screen || $screen->id !== 'edit-product' ) return;
        ?>
        <style>
            .column-rustica_disponible { width: 90px; }
            .rustica-toggle { transition: opacity .15s; }
            .rustica-toggle:hover { opacity: .7; }
        </style>
        <script>
        jQuery(function($){
            $(document).on('click', '.rustica-toggle', function(){
                var btn  = $(this);
                var id   = btn.data('id');
                var nonc = btn.data('nonce');
                var isOn = btn.hasClass('rustica-toggle-on');
                btn.prop('disabled', true).css('opacity', .5);
                $.post(ajaxurl, {
                    action:      'rustica_toggle_disponible',
                    producto_id: id,
                    disponible:  isOn ? 0 : 1,
                    nonce:       nonc,
                }, function(res){
                    if (res.success) {
                        var ahora = res.data.disponible;
                        btn.removeClass('rustica-toggle-on rustica-toggle-off')
                           .addClass(ahora ? 'rustica-toggle-on' : 'rustica-toggle-off')
                           .html(ahora
                               ? '<span style="display:inline-flex;align-items:center;gap:5px;color:#00a32a;font-weight:600;">&#9679; Activo</span>'
                               : '<span style="display:inline-flex;align-items:center;gap:5px;color:#d63638;font-weight:600;">&#9679; Agotado</span>'
                           );
                    }
                    btn.prop('disabled', false).css('opacity', 1);
                });
            });
        });
        </script>
        <?php
    }

    /** Manejador AJAX del toggle (admin-ajax.php). */
    public function ajax_toggle_disponible(): void {
        $producto_id = (int) ( $_POST['producto_id'] ?? 0 );
        $disponible  = (bool) ( $_POST['disponible']  ?? true );
        $nonce       = sanitize_text_field( $_POST['nonce'] ?? '' );

        if ( ! wp_verify_nonce( $nonce, 'rustica_toggle_' . $producto_id ) ) {
            wp_send_json_error( [ 'message' => 'Nonce inválido' ] );
        }

        if ( ! current_user_can( 'edit_posts' ) ) {
            wp_send_json_error( [ 'message' => 'Sin permisos' ] );
        }

        update_post_meta( $producto_id, 'rustica_disponible', $disponible ? 'si' : 'no' );
        wp_send_json_success( [ 'disponible' => $disponible ] );
    }

    /** Registra el metabox "Disponibilidad en Menú" en la pantalla de edición de producto. */
    public function registrar_metabox_disponible(): void {
        add_meta_box(
            'rustica_disponible_box',
            'Disponibilidad en Menú — Rústica',
            [ $this, 'render_metabox_disponible' ],
            'product',
            'side',
            'high'
        );
    }

    /** Renderiza el metabox en la pantalla de edición. */
    public function render_metabox_disponible( \WP_Post $post ): void {
        $disponible = get_post_meta( $post->ID, 'rustica_disponible', true ) !== 'no';
        wp_nonce_field( 'rustica_disponible_nonce_' . $post->ID, 'rustica_disponible_nonce' );
        ?>
        <div style="padding: 4px 0;">
            <label style="display:flex;align-items:center;gap:10px;cursor:pointer;font-size:13px;">
                <input
                    type="checkbox"
                    name="rustica_disponible"
                    value="1"
                    <?php checked( $disponible ); ?>
                    style="width:18px;height:18px;cursor:pointer;"
                />
                <span><?php echo $disponible ? '<strong style="color:#00a32a;">Producto activo en el menú</strong>' : '<strong style="color:#d63638;">Marcado como agotado (86)</strong>'; ?></span>
            </label>
            <p style="margin:8px 0 0;color:#777;font-size:12px;">
                Cuando está desactivado, el producto no aparece en la app del mesero ni en el buscador.
            </p>
        </div>
        <?php
    }

    /** Guarda el valor del metabox al actualizar el producto. */
    public function guardar_metabox_disponible( int $post_id, \WP_Post $post ): void {
        $nonce = sanitize_text_field( $_POST['rustica_disponible_nonce'] ?? '' );
        if ( ! wp_verify_nonce( $nonce, 'rustica_disponible_nonce_' . $post_id ) ) return;
        if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) return;
        if ( ! current_user_can( 'edit_post', $post_id ) ) return;

        $valor = isset( $_POST['rustica_disponible'] ) ? 'si' : 'no';
        update_post_meta( $post_id, 'rustica_disponible', $valor );
    }
}