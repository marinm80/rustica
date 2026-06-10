<?php
/**
 * Rustica_API — 12 endpoints REST para el sistema de restaurante.
 *
 * @package Rustica_System
 * @since   1.0.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Clase que registra y gestiona todos los endpoints REST de Rustica.
 *
 * @since 1.0.0
 */
class Rustica_API {

	/**
	 * Registra las 12 rutas REST bajo el namespace rustica/v1.
	 *
	 * @since 1.0.0
	 * @return void
	 */
	public static function register_routes() {
		$ns = 'rustica/v1';

		register_rest_route( $ns, '/mesas', [
			'methods'             => 'GET',
			'callback'            => [ self::class, 'get_mesas' ],
			'permission_callback' => '__return_true',
		] );

		register_rest_route( $ns, '/mesas/disponibles', [
			'methods'             => 'GET',
			'callback'            => [ self::class, 'get_mesas_disponibles' ],
			'permission_callback' => '__return_true',
		] );

		// Endpoint público: conteo de mesas libres por zona — usado por ZonasApp en el landing.
		register_rest_route( $ns, '/zonas', [
			'methods'             => 'GET',
			'callback'            => [ self::class, 'get_zonas_disponibles' ],
			'permission_callback' => '__return_true',
		] );

		register_rest_route( $ns, '/reservacion', [
			'methods'             => 'POST',
			'callback'            => [ self::class, 'crear_reservacion' ],
			'permission_callback' => '__return_true',
		] );

		register_rest_route( $ns, '/reservaciones', [
			'methods'             => 'GET',
			'callback'            => [ self::class, 'get_todas_reservaciones' ],
			'permission_callback' => [ self::class, 'verificar_jwt' ],
		] );

		register_rest_route( $ns, '/reservacion/actualizar', [
			'methods'             => 'POST',
			'callback'            => [ self::class, 'actualizar_reservacion' ],
			'permission_callback' => [ self::class, 'verificar_jwt' ],
		] );

		register_rest_route( $ns, '/reservacion/eliminar', [
			'methods'             => 'POST',
			'callback'            => [ self::class, 'eliminar_reservacion' ],
			'permission_callback' => [ self::class, 'verificar_gerente' ],
		] );

		register_rest_route( $ns, '/reservaciones/activas', [
			'methods'             => 'GET',
			'callback'            => [ self::class, 'get_reservaciones_activas' ],
			'permission_callback' => [ self::class, 'verificar_jwt' ],
		] );

		register_rest_route( $ns, '/auth/me', [
			'methods'             => 'GET',
			'callback'            => [ self::class, 'get_current_user_info' ],
			'permission_callback' => [ self::class, 'verificar_jwt' ],
		] );

		register_rest_route( $ns, '/reservacion/convertir-comanda', [
			'methods'             => 'POST',
			'callback'            => [ self::class, 'convertir_reserva_a_comanda' ],
			'permission_callback' => [ self::class, 'verificar_jwt' ],
		] );

		register_rest_route( $ns, '/comanda-activa', [
			'methods'             => 'GET',
			'callback'            => [ self::class, 'get_comanda_activa' ],
			'permission_callback' => [ self::class, 'verificar_jwt' ],
		] );

		register_rest_route( $ns, '/comanda/crear', [
			'methods'             => 'POST',
			'callback'            => [ self::class, 'crear_comanda' ],
			'permission_callback' => [ self::class, 'verificar_jwt' ],
		] );

		register_rest_route( $ns, '/comanda/agregar-item', [
			'methods'             => 'POST',
			'callback'            => [ self::class, 'agregar_item' ],
			'permission_callback' => [ self::class, 'verificar_jwt' ],
		] );

		register_rest_route( $ns, '/comanda/enviar', [
			'methods'             => 'POST',
			'callback'            => [ self::class, 'enviar_comanda' ],
			'permission_callback' => [ self::class, 'verificar_jwt' ],
		] );

		register_rest_route( $ns, '/cocina/comandas-activas', [
			'methods'             => 'GET',
			'callback'            => [ self::class, 'get_comandas_cocina' ],
			'permission_callback' => [ self::class, 'verificar_jwt' ],
		] );

		register_rest_route( $ns, '/cocina/marcar-listo', [
			'methods'             => 'POST',
			'callback'            => [ self::class, 'marcar_listo' ],
			'permission_callback' => [ self::class, 'verificar_jwt' ],
		] );

		register_rest_route( $ns, '/cuenta/mesa/(?P<id>\d+)', [
			'methods'             => 'GET',
			'callback'            => [ self::class, 'get_cuenta' ],
			'permission_callback' => [ self::class, 'verificar_jwt' ],
		] );

		register_rest_route( $ns, '/cuenta/dividir', [
			'methods'             => 'POST',
			'callback'            => [ self::class, 'dividir_cuenta' ],
			'permission_callback' => [ self::class, 'verificar_jwt' ],
		] );

		register_rest_route( $ns, '/cuenta/cerrar', [
			'methods'             => 'POST',
			'callback'            => [ self::class, 'cerrar_cuenta' ],
			'permission_callback' => [ self::class, 'verificar_jwt' ],
		] );

		register_rest_route( $ns, '/comanda/solicitar-cuenta', [
			'methods'             => 'POST',
			'callback'            => [ self::class, 'solicitar_cuenta' ],
			'permission_callback' => [ self::class, 'verificar_jwt' ],
		] );

		register_rest_route( $ns, '/facturacion/pendientes', [
			'methods'             => 'GET',
			'callback'            => [ self::class, 'get_facturacion_pendientes' ],
			'permission_callback' => [ self::class, 'verificar_jwt' ],
		] );

		register_rest_route( $ns, '/facturacion/emitir', [
			'methods'             => 'POST',
			'callback'            => [ self::class, 'emitir_factura' ],
			'permission_callback' => [ self::class, 'verificar_jwt' ],
		] );

		register_rest_route( $ns, '/reportes/cierre-dia', [
			'methods'             => 'GET',
			'callback'            => [ self::class, 'get_reporte_dia' ],
			'permission_callback' => [ self::class, 'verificar_jwt' ],
		] );

		register_rest_route( $ns, '/comanda/eliminar', [
			'methods'             => 'POST',
			'callback'            => [ self::class, 'eliminar_comanda' ],
			'permission_callback' => [ self::class, 'verificar_jwt' ],
		] );

		// Reemplaza los items de una comanda abierta (para editar cantidades o eliminar desde el tablet del mesero).
		register_rest_route( $ns, '/comanda/actualizar-items', [
			'methods'             => 'POST',
			'callback'            => [ self::class, 'actualizar_items' ],
			'permission_callback' => [ self::class, 'verificar_jwt' ],
		] );

		// Menú público agrupado por categoría WooCommerce — usado por MeseroApp y la carta.
		register_rest_route( $ns, '/menu', [
			'methods'             => 'GET',
			'callback'            => [ self::class, 'get_menu' ],
			'permission_callback' => '__return_true',
		] );

		// Liberar una mesa directamente (cliente se retira, sin facturar).
		register_rest_route( $ns, '/mesa/liberar', [
			'methods'             => 'POST',
			'callback'            => [ self::class, 'liberar_mesa' ],
			'permission_callback' => [ self::class, 'verificar_jwt' ],
		] );

		// Listar productos con su disponibilidad (gerente/staff).
		register_rest_route( $ns, '/productos', [
			'methods'             => 'GET',
			'callback'            => [ self::class, 'get_productos_admin' ],
			'permission_callback' => [ self::class, 'verificar_jwt' ],
		] );

		// Activar / desactivar un producto del menú (86).
		register_rest_route( $ns, '/producto/disponibilidad', [
			'methods'             => 'POST',
			'callback'            => [ self::class, 'toggle_disponibilidad' ],
			'permission_callback' => [ self::class, 'verificar_gerente' ],
		] );
	}

	/**
	 * POST /mesa/liberar — Cierra comandas abiertas y libera la mesa sin emitir factura.
	 */
	public static function liberar_mesa( WP_REST_Request $req ): WP_REST_Response {
		$mesa_id = (int) $req->get_param( 'mesa_id' );
		if ( ! $mesa_id ) {
			return new WP_REST_Response( [ 'ok' => false, 'message' => 'mesa_id requerido' ], 400 );
		}

		$q = new WP_Query( [
			'post_type'      => 'comanda',
			'posts_per_page' => -1,
			'fields'         => 'ids',
			'meta_query'     => [
				[ 'key' => 'mesa_id', 'value' => $mesa_id ],
				[ 'key' => 'estado',  'value' => [ 'abierta', 'en_cocina', 'listo', 'cuenta_solicitada' ], 'compare' => 'IN' ],
			],
		] );

		foreach ( $q->posts as $id ) {
			update_post_meta( $id, 'estado',      'cerrada' );
			update_post_meta( $id, 'hora_cierre', time() );
		}

		update_post_meta( $mesa_id, 'estado', 'libre' );

		return new WP_REST_Response( [ 'ok' => true, 'mesa_id' => $mesa_id ], 200 );
	}

	/**
	 * Verifica que el usuario esté autenticado (JWT/cookie session).
	 *
	 * @since  1.0.0
	 * @param  WP_REST_Request $request Petición REST.
	 * @return bool
	 */
	public static function verificar_jwt( WP_REST_Request $request ) {
		return is_user_logged_in();
	}

	/**
	 * Verifica que el usuario sea gerente o administrador.
	 *
	 * @since  1.0.0
	 * @param  WP_REST_Request $request Petición REST.
	 * @return bool
	 */
	public static function verificar_gerente( WP_REST_Request $request ): bool {
		if ( ! is_user_logged_in() ) return false;
		$user = wp_get_current_user();
		return in_array( 'gerente', (array) $user->roles, true )
			|| in_array( 'administrator', (array) $user->roles, true );
	}

	/**
	 * GET /mesas — Lista todas las mesas del restaurante.
	 *
	 * @since  1.0.0
	 * @param  WP_REST_Request $req Petición REST.
	 * @return WP_REST_Response
	 */
	public static function get_mesas( WP_REST_Request $req ) {
		$mesas = get_posts( [
			'post_type'      => 'mesa',
			'posts_per_page' => -1,
			'post_status'    => 'publish',
			'orderby'        => 'meta_value_num',
			'meta_key'       => 'numero',
			'order'          => 'ASC',
		] );

		// Obtener todas las reservaciones de hoy
		$hoy_inicio = strtotime( 'today midnight' );
		$hoy_fin    = strtotime( 'tomorrow midnight' ) - 1;
		$q_reservas = new WP_Query( [
			'post_type'      => 'reservacion',
			'posts_per_page' => -1,
			'meta_query'     => [
				[
					'key'     => 'estado',
					'value'   => [ 'confirmada', 'pendiente' ],
					'compare' => 'IN',
				]
			],
		] );

		$reservas_por_mesa = [];
		foreach ( $q_reservas->posts as $r_post ) {
			$r_inicio = (int) get_post_meta( $r_post->ID, 'hora_inicio', true );
			if ( $r_inicio >= $hoy_inicio && $r_inicio <= $hoy_fin ) {
				$m_id = (int) get_post_meta( $r_post->ID, 'mesa_id', true );
				$reservas_por_mesa[ $m_id ][] = [
					'id'       => $r_post->ID,
					'nombre'   => get_post_meta( $r_post->ID, 'nombre', true ) ?: 'Cliente sin nombre',
					'hora'     => date( 'H:i', $r_inicio ),
					'personas' => (int) get_post_meta( $r_post->ID, 'personas', true ),
				];
			}
		}

		$data = array_map(
			function ( $p ) use ( $reservas_por_mesa ) {
				$terminos = wp_get_post_terms( $p->ID, 'zona_restaurante' );
				$m_id = $p->ID;
				$estado = get_post_meta( $m_id, 'estado', true ) ?: 'libre';
				
				// Buscar si tiene comanda activa para sacar el nombre del cliente y total
				$cliente    = '';
				$total      = 0;
				$comanda_id = null;
				if ( $estado !== 'libre' ) {
					$q_comanda = new WP_Query( [
						'post_type'      => 'comanda',
						'post_status'    => 'any',
						'posts_per_page' => 1,
						'orderby'        => 'date',
						'order'          => 'DESC',
						'meta_query'     => [
							'relation' => 'AND',
							[ 'key' => 'mesa_id', 'value' => $m_id, 'type' => 'NUMERIC' ],
							[ 'key' => 'estado',  'value' => [ 'abierta', 'en_cocina', 'listo', 'cuenta_solicitada' ], 'compare' => 'IN' ],
						],
					] );
					if ( $q_comanda->have_posts() ) {
						$c_post = $q_comanda->posts[0];
						$comanda_id = $c_post->ID;
						$cliente = get_post_meta( $c_post->ID, 'cliente', true ) ?: '';
						$items = get_post_meta( $c_post->ID, 'items', true ) ?: [];
						$total = array_sum( array_column( $items, 'subtotal' ) );
					}
				}

				return [
					'id'           => $m_id,
					'numero'       => (int) get_post_meta( $m_id, 'numero', true ),
					'capacidad'    => (int) get_post_meta( $m_id, 'capacidad', true ),
					'estado'       => $estado,
					'es_vip'       => (bool) get_post_meta( $m_id, 'es_vip', true ),
					'zona'         => ! is_wp_error( $terminos ) && ! empty( $terminos ) ? $terminos[0]->name : '',
					'reservas_hoy' => $reservas_por_mesa[ $m_id ] ?? [],
					'cliente'      => $cliente,
					'total_cuenta' => $total,
					'comanda_id'   => $comanda_id ?? null,
				];
			},
			$mesas
		);

		return new WP_REST_Response( $data, 200 );
	}

	/**
	 * GET /mesas/disponibles — Mesas disponibles para fecha, hora y cantidad de personas.
	 *
	 * @since  1.0.0
	 * @param  WP_REST_Request $req Petición REST.
	 * @return WP_REST_Response
	 */
	public static function get_mesas_disponibles( WP_REST_Request $req ) {
		$fecha    = sanitize_text_field( $req->get_param( 'fecha' ) );
		$hora     = sanitize_text_field( $req->get_param( 'hora' ) );
		$personas = (int) $req->get_param( 'personas' );
		$zona     = sanitize_text_field( $req->get_param( 'zona' ) );

		$inicio = strtotime( "$fecha $hora" );
		$fin    = $inicio + ( 2 * 3600 );

		// IDs de mesas con reservas que se solapan en la ventana horaria.
		$reservadas = new WP_Query( [
			'post_type'      => 'reservacion',
			'posts_per_page' => -1,
			'post_status'    => [ 'publish', 'pending' ],
			'meta_query'     => [
				[ 'key' => 'hora_inicio', 'value' => $fin,    'compare' => '<', 'type' => 'NUMERIC' ],
				[ 'key' => 'hora_fin',    'value' => $inicio, 'compare' => '>', 'type' => 'NUMERIC' ],
			],
			'fields'         => 'ids',
		] );

		$ids_reservadas = array_map(
			fn( $r ) => (int) get_post_meta( $r, 'mesa_id', true ),
			$reservadas->posts
		);

		// IDs de mesas actualmente ocupadas.
		$ocupadas = new WP_Query( [
			'post_type'      => 'mesa',
			'posts_per_page' => -1,
			'meta_query'     => [ [ 'key' => 'estado', 'value' => [ 'waiting', 'processing', 'eating', 'paying' ], 'compare' => 'IN' ] ],
			'fields'         => 'ids',
		] );

		$ids_ocupadas = array_unique( array_merge( $ids_reservadas, $ocupadas->posts ) );

		$args = [
			'post_type'      => 'mesa',
			'posts_per_page' => -1,
			'meta_query'     => [
				[
					'key'     => 'capacidad',
					'value'   => $personas,
					'compare' => '>=',
					'type'    => 'NUMERIC',
				],
			],
		];

		if ( ! empty( $ids_ocupadas ) ) {
			$args['post__not_in'] = $ids_ocupadas;
		}

		if ( $zona ) {
			$args['tax_query'] = [ [
				'taxonomy' => 'zona_restaurante',
				'field'    => 'slug',
				'terms'    => $zona,
			] ];
		}

		$q         = new WP_Query( $args );
		$resultado = array_map(
			function ( $post ) {
				$terminos = wp_get_post_terms( $post->ID, 'zona_restaurante' );
				return [
					'id'          => $post->ID,
					'numero'      => (int)   get_post_meta( $post->ID, 'numero', true ),
					'capacidad'   => (int)   get_post_meta( $post->ID, 'capacidad', true ),
					'zona'        => ! is_wp_error( $terminos ) && ! empty( $terminos ) ? $terminos[0]->name : '',
					'es_vip'      => (bool)  get_post_meta( $post->ID, 'es_vip', true ),
					'consumo_min' => (float) get_post_meta( $post->ID, 'consumo_minimo', true ),
				];
			},
			$q->posts
		);

		return new WP_REST_Response( [
			'disponibles' => $resultado,
			'total'       => count( $resultado ),
			'ventana'     => [ 'inicio' => $inicio, 'fin' => $fin ],
		], 200 );
	}

	/**
	 * POST /reservacion — Crea una nueva reservación.
	 *
	 * @since  1.0.0
	 * @param  WP_REST_Request $req Petición REST.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function crear_reservacion( WP_REST_Request $req ) {
		$mesa_id  = (int) $req->get_param( 'mesa_id' );
		$fecha    = sanitize_text_field( $req->get_param( 'fecha' ) );
		$hora     = sanitize_text_field( $req->get_param( 'hora' ) );
		$personas = (int) $req->get_param( 'personas' );
		$nombre   = sanitize_text_field( $req->get_param( 'nombre' ) );
		$email    = sanitize_email( $req->get_param( 'email' ) );
		$telefono = sanitize_text_field( $req->get_param( 'telefono' ) );
		$notas    = sanitize_textarea_field( $req->get_param( 'notas' ) );

		if ( ! $mesa_id || ! $fecha || ! $hora || ! $nombre || ! $email ) {
			return new WP_Error( 'datos_incompletos', 'Faltan campos requeridos', [ 'status' => 400 ] );
		}

		$inicio = strtotime( "$fecha $hora" );
		$fin    = $inicio + ( 2 * 3600 );

		// Validación de solapamiento
		$conflictos = new WP_Query( [
			'post_type'      => 'reservacion',
			'posts_per_page' => 1,
			'post_status'    => [ 'publish', 'pending' ],
			'meta_query'     => [
				[ 'key' => 'mesa_id', 'value' => $mesa_id ],
				[ 'key' => 'hora_inicio', 'value' => $fin,    'compare' => '<', 'type' => 'NUMERIC' ],
				[ 'key' => 'hora_fin',    'value' => $inicio, 'compare' => '>', 'type' => 'NUMERIC' ],
			],
			'fields'         => 'ids',
		] );

		if ( $conflictos->have_posts() ) {
			return new WP_Error( 'mesa_ocupada', 'La mesa ya tiene una reservación a esa hora.', [ 'status' => 409 ] );
		}

		$id = wp_insert_post( [
			'post_type'   => 'reservacion',
			'post_title'  => "Reserva $nombre — Mesa $mesa_id — $fecha $hora",
			'post_status' => 'pending',
		] );

		update_post_meta( $id, 'mesa_id',     $mesa_id );
		update_post_meta( $id, 'hora_inicio', $inicio );
		update_post_meta( $id, 'hora_fin',    $fin );
		update_post_meta( $id, 'personas',    $personas );
		update_post_meta( $id, 'nombre',      $nombre );
		update_post_meta( $id, 'email',       $email );
		update_post_meta( $id, 'telefono',    $telefono );
		update_post_meta( $id, 'notas',       $notas );
		update_post_meta( $id, 'estado',      'pendiente' );

		$es_vip       = (bool)  get_post_meta( $mesa_id, 'es_vip', true );
		$consumo_min  = (float) get_post_meta( $mesa_id, 'consumo_minimo', true );
		$checkout_url = null;

		if ( $es_vip && $consumo_min > 0 ) {
			$checkout_url = Rustica_Billing::crear_deposito_vip( $id );
		} else {
			wp_update_post( [ 'ID' => $id, 'post_status' => 'publish' ] );
			update_post_meta( $id, 'estado', 'confirmada' );
			Rustica_Emails::confirmar_reserva( $id );
		}

		return new WP_REST_Response( [
			'reservacion_id' => $id,
			'estado'         => get_post_meta( $id, 'estado', true ),
			'checkout_url'   => $checkout_url,
		], 201 );
	}

	/**
	 * GET /reservacion/{id} — Devuelve datos de una reservación específica.
	 *
	 * @since  1.0.0
	 * @param  WP_REST_Request $req Petición REST.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function get_reservacion( WP_REST_Request $req ) {
		$id   = (int) $req->get_param( 'id' );
		$post = get_post( $id );

		if ( ! $post || 'reservacion' !== $post->post_type ) {
			return new WP_Error( 'not_found', 'Reservación no encontrada', [ 'status' => 404 ] );
		}

		return new WP_REST_Response( [
			'id'       => $id,
			'mesa_id'  => (int) get_post_meta( $id, 'mesa_id', true ),
			'nombre'   => get_post_meta( $id, 'nombre', true ),
			'email'    => get_post_meta( $id, 'email', true ),
			'telefono' => get_post_meta( $id, 'telefono', true ),
			'estado'   => get_post_meta( $id, 'estado', true ),
			'fecha'    => date( 'Y-m-d H:i', (int) get_post_meta( $id, 'hora_inicio', true ) ),
		], 200 );
	}

	/**
	 * GET /reservaciones/activas — Lista las reservaciones confirmadas o pendientes de hoy para una mesa.
	 *
	 * @since  1.0.0
	 * @param  WP_REST_Request $req Petición REST.
	 * @return WP_REST_Response
	 */
	public static function get_reservaciones_activas( WP_REST_Request $req ) {
		$mesa_id = (int) $req->get_param( 'mesa_id' );

		$meta_query = [
			[
				'key'     => 'estado',
				'value'   => [ 'confirmada', 'pendiente' ],
				'compare' => 'IN',
			]
		];

		if ( $mesa_id ) {
			$meta_query[] = [
				'key'   => 'mesa_id',
				'value' => $mesa_id,
			];
		}

		$q = new WP_Query( [
			'post_type'      => 'reservacion',
			'posts_per_page' => -1,
			'meta_query'     => $meta_query,
		] );

		$hoy_inicio = strtotime( 'today midnight' );
		$hoy_fin    = strtotime( 'tomorrow midnight' ) - 1;
		$resultado  = [];

		foreach ( $q->posts as $post ) {
			$inicio = (int) get_post_meta( $post->ID, 'hora_inicio', true );
			if ( $inicio >= $hoy_inicio && $inicio <= $hoy_fin ) {
				$resultado[] = [
					'id'       => $post->ID,
					'mesa_id'  => (int) get_post_meta( $post->ID, 'mesa_id', true ),
					'nombre'   => get_post_meta( $post->ID, 'nombre', true ) ?: 'Cliente sin nombre',
					'hora'     => date( 'H:i', $inicio ),
					'personas' => (int) get_post_meta( $post->ID, 'personas', true ) ?: 2,
				];
			}
		}

		return new WP_REST_Response( [ 'reservaciones' => $resultado ], 200 );
	}

	/**
	 * POST /reservacion/convertir-comanda — Convierte una reservación en comanda.
	 *
	 * @since  1.0.0
	 * @param  WP_REST_Request $req Petición REST.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function convertir_reserva_a_comanda( WP_REST_Request $req ) {
		$reservacion_id = (int) $req->get_param( 'reservacion_id' );
		$mesa_id        = (int) $req->get_param( 'mesa_id' );

		if ( ! $reservacion_id || ! $mesa_id ) {
			return new WP_Error( 'datos_invalidos', 'Se requiere reservacion_id y mesa_id', [ 'status' => 400 ] );
		}

		$reservacion = get_post( $reservacion_id );
		if ( ! $reservacion || 'reservacion' !== $reservacion->post_type ) {
			return new WP_Error( 'no_encontrado', 'Reservación no encontrada', [ 'status' => 404 ] );
		}

		// Validar si ya existe una comanda activa
		$q = new WP_Query( [
			'post_type'      => 'comanda',
			'posts_per_page' => 1,
			'meta_query'     => [
				[ 'key' => 'mesa_id', 'value' => $mesa_id ],
				[ 'key' => 'estado',  'value' => [ 'abierta', 'en_cocina' ], 'compare' => 'IN' ],
			],
		] );

		if ( $q->have_posts() ) {
			return new WP_Error( 'comanda_existente', 'Ya existe una comanda activa para esta mesa', [ 'status' => 409 ] );
		}

		$cliente = get_post_meta( $reservacion_id, 'nombre', true ) ?: 'Cliente Reserva';

		// Crear comanda
		$comanda_id = wp_insert_post( [
			'post_type'   => 'comanda',
			'post_title'  => "Comanda Mesa $mesa_id - $cliente",
			'post_status' => 'publish',
		], true );

		if ( is_wp_error( $comanda_id ) || ! $comanda_id ) {
			return new WP_Error( 'insert_error', 'No se pudo crear la comanda: ' . ( is_wp_error( $comanda_id ) ? $comanda_id->get_error_message() : 'ID=0' ), [ 'status' => 500 ] );
		}

		update_post_meta( $comanda_id, 'mesa_id',       $mesa_id );
		update_post_meta( $comanda_id, 'cliente',       $cliente );
		update_post_meta( $comanda_id, 'estado',        'abierta' );
		update_post_meta( $comanda_id, 'mesero_id',     get_current_user_id() );
		update_post_meta( $comanda_id, 'hora_apertura', time() );
		update_post_meta( $comanda_id, 'items',         [] );

		// Marcar la reserva como sentada (se sienta al cliente, reserva completada)
		update_post_meta( $reservacion_id, 'estado', 'sentado' );

		// Mesa en espera: comanda abierta, cliente leyendo la carta
		update_post_meta( $mesa_id, 'estado', 'waiting' );

		return new WP_REST_Response( [
			'ok'         => true,
			'comanda_id' => $comanda_id,
			'comanda'    => [
				'id'      => $comanda_id,
				'estado'  => 'abierta',
				'cliente' => $cliente,
				'items'   => [],
				'total'   => 0,
			]
		], 200 );
	}

	/**
	 * GET /comanda-activa — Comanda abierta o en cocina para una mesa.
	 *
	 * @since  1.0.0
	 * @param  WP_REST_Request $req Petición REST.
	 * @return WP_REST_Response
	 */
	public static function get_comanda_activa( WP_REST_Request $req ) {
		$mesa_id = (int) $req->get_param( 'mesa' );

		$q = new WP_Query( [
			'post_type'      => 'comanda',
			'post_status'    => 'any',
			'posts_per_page' => 1,
			'orderby'        => 'date',
			'order'          => 'DESC',
			'meta_query'     => [
				'relation' => 'AND',
				[ 'key' => 'mesa_id', 'value' => $mesa_id, 'type' => 'NUMERIC' ],
				[ 'key' => 'estado',  'value' => [ 'abierta', 'en_cocina', 'listo', 'cuenta_solicitada' ], 'compare' => 'IN' ],
			],
		] );

		if ( ! $q->have_posts() ) {
			return new WP_REST_Response( [ 'comanda' => null ], 200 );
		}

		$post  = $q->posts[0];
		$items = get_post_meta( $post->ID, 'items', true ) ?: [];

		return new WP_REST_Response( [
			'comanda' => [
				'id'       => $post->ID,
				'estado'   => get_post_meta( $post->ID, 'estado', true ),
				'cliente'  => get_post_meta( $post->ID, 'cliente', true ) ?: '',
				'personas' => (int) ( get_post_meta( $post->ID, 'personas', true ) ?: 1 ),
				'items'    => $items,
				'total'    => array_sum( array_column( $items, 'subtotal' ) ),
			],
		], 200 );
	}

	/**
	 * POST /comanda/crear — Crea una comanda vacía asociada a una mesa con el nombre del cliente.
	 *
	 * @since  1.0.0
	 * @param  WP_REST_Request $req Petición REST.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function crear_comanda( WP_REST_Request $req ) {
		$mesa_id  = (int) $req->get_param( 'mesa_id' );
		$cliente  = sanitize_text_field( $req->get_param( 'cliente' ) );
		$personas = max( 1, (int) ( $req->get_param( 'personas' ) ?: 1 ) );

		if ( ! $mesa_id || ! $cliente ) {
			return new WP_Error( 'datos_invalidos', 'Se requiere mesa_id y cliente', [ 'status' => 400 ] );
		}

		// Si ya existe una comanda activa para esta mesa, devolverla (idempotente)
		$q = new WP_Query( [
			'post_type'      => 'comanda',
			'posts_per_page' => 1,
			'meta_query'     => [
				[ 'key' => 'mesa_id', 'value' => $mesa_id ],
				[ 'key' => 'estado',  'value' => [ 'abierta', 'en_cocina', 'listo' ], 'compare' => 'IN' ],
			],
		] );

		if ( $q->have_posts() ) {
			$existing = $q->posts[0];
			$items    = get_post_meta( $existing->ID, 'items', true ) ?: [];
			return new WP_REST_Response( [
				'ok'         => true,
				'comanda_id' => $existing->ID,
				'comanda'    => [
					'id'      => $existing->ID,
					'estado'  => get_post_meta( $existing->ID, 'estado', true ),
					'cliente' => get_post_meta( $existing->ID, 'cliente', true ),
					'personas'=> (int) get_post_meta( $existing->ID, 'personas', true ) ?: 1,
					'items'   => $items,
					'total'   => array_sum( array_column( $items, 'subtotal' ) ),
				]
			], 200 );
		}

		$comanda_id = wp_insert_post( [
			'post_type'   => 'comanda',
			'post_title'  => "Comanda Mesa $mesa_id - $cliente",
			'post_status' => 'publish',
		], true );

		if ( is_wp_error( $comanda_id ) || ! $comanda_id ) {
			return new WP_Error( 'insert_error', 'No se pudo crear la comanda: ' . ( is_wp_error( $comanda_id ) ? $comanda_id->get_error_message() : 'ID=0' ), [ 'status' => 500 ] );
		}

		update_post_meta( $comanda_id, 'mesa_id',       $mesa_id );
		update_post_meta( $comanda_id, 'cliente',       $cliente );
		update_post_meta( $comanda_id, 'personas',      $personas );
		update_post_meta( $comanda_id, 'estado',        'abierta' );
		update_post_meta( $comanda_id, 'mesero_id',     get_current_user_id() );
		update_post_meta( $comanda_id, 'items',         [] );
		update_post_meta( $comanda_id, 'hora_apertura', time() );
		update_post_meta( $mesa_id, 'estado', 'waiting' );

		return new WP_REST_Response( [
			'ok'         => true,
			'comanda_id' => $comanda_id,
			'comanda'    => [
				'id'       => $comanda_id,
				'estado'   => 'abierta',
				'cliente'  => $cliente,
				'personas' => $personas,
				'items'    => [],
				'total'    => 0,
			]
		], 200 );
	}

	/**
	 * POST /comanda/agregar-item — Agrega un producto a la comanda de una mesa.
	 *
	 * @since  1.0.0
	 * @param  WP_REST_Request $req Petición REST.
	 * @return WP_REST_Response
	 */
	public static function agregar_item( WP_REST_Request $req ) {
		$mesa_id       = (int) $req->get_param( 'mesa_id' );
		$producto_id   = (int) $req->get_param( 'producto_id' );
		$cantidad      = (int) ( $req->get_param( 'cantidad' ) ?: 1 );
		$modificadores = $req->get_param( 'modificadores' ) ?: [];
		$notas         = sanitize_text_field( $req->get_param( 'notas' ) );

		if ( ! $mesa_id ) {
			return new WP_Error( 'datos_invalidos', 'Se requiere mesa_id', [ 'status' => 400 ] );
		}

		$q = new WP_Query( [
			'post_type'      => 'comanda',
			'post_status'    => 'any',
			'posts_per_page' => 1,
			'meta_query'     => [
				'relation' => 'AND',
				[ 'key' => 'mesa_id', 'value' => $mesa_id, 'type' => 'NUMERIC' ],
				[ 'key' => 'estado',  'value' => [ 'abierta', 'en_cocina', 'listo' ], 'compare' => 'IN' ],
			],
		] );

		if ( $q->have_posts() ) {
			$comanda_id = $q->posts[0]->ID;
		} else {
			$comanda_id = wp_insert_post( [
				'post_type'   => 'comanda',
				'post_title'  => "Comanda Mesa $mesa_id",
				'post_status' => 'publish',
			] );
			update_post_meta( $comanda_id, 'mesa_id',   $mesa_id );
			update_post_meta( $comanda_id, 'estado',    'abierta' );
			update_post_meta( $comanda_id, 'mesero_id', get_current_user_id() );
			update_post_meta( $comanda_id, 'items',     [] );
		}

		$producto = wc_get_product( $producto_id );
		$items    = get_post_meta( $comanda_id, 'items', true ) ?: [];
		$items[]  = [
			'producto_id'   => $producto_id,
			'nombre'        => $producto ? $producto->get_name() : '',
			'precio'        => $producto ? (float) $producto->get_price() : 0,
			'cantidad'      => $cantidad,
			'subtotal'      => $producto ? (float) $producto->get_price() * $cantidad : 0,
			'modificadores' => $modificadores,
			'notas'         => $notas,
			'estado'        => 'pendiente',
		];
		update_post_meta( $comanda_id, 'items', $items );

		return new WP_REST_Response( [ 'comanda_id' => $comanda_id, 'items' => count( $items ) ], 200 );
	}

	/**
	 * POST /comanda/enviar — Envía la comanda a cocina.
	 *
	 * @since  1.0.0
	 * @param  WP_REST_Request $req Petición REST.
	 * @return WP_REST_Response
	 */
	public static function enviar_comanda( WP_REST_Request $req ) {
		$comanda_id = (int) $req->get_param( 'comanda_id' );
		$items      = $req->get_param( 'items' );

		if ( ! $comanda_id ) {
			return new WP_REST_Response( [ 'ok' => false, 'message' => 'comanda_id requerido' ], 400 );
		}

		// Si vienen ítems en el request, guardarlos antes de cambiar el estado
		if ( is_array( $items ) && count( $items ) > 0 ) {
			update_post_meta( $comanda_id, 'items', $items );
		}

		update_post_meta( $comanda_id, 'estado',     'en_cocina' );
		update_post_meta( $comanda_id, 'hora_envio', time() );

		$mesa_id = (int) get_post_meta( $comanda_id, 'mesa_id', true );
		update_post_meta( $mesa_id, 'estado', 'processing' );

		return new WP_REST_Response( [ 'ok' => true, 'estado' => 'en_cocina' ], 200 );
	}

	/**
	 * GET /cocina/comandas-activas — Todas las comandas activas visibles en la cocina.
	 *
	 * @since  1.0.0
	 * @param  WP_REST_Request $req Petición REST.
	 * @return WP_REST_Response
	 */
	public static function get_comandas_cocina( WP_REST_Request $req ) {
		$q = new WP_Query( [
			'post_type'      => 'comanda',
			'post_status'    => 'any',
			'posts_per_page' => -1,
			'meta_query'     => [
				[
					'key'   => 'estado',
					'value' => 'en_cocina',
				],
			],
		] );

		$comandas = array_map(
			function ( $p ) {
				$mesa_id = (int) get_post_meta( $p->ID, 'mesa_id', true );
				return [
					'id'          => $p->ID,
					'mesa_id'     => $mesa_id,
					'mesa_numero' => (int) get_post_meta( $mesa_id, 'numero', true ),
					'estado'      => get_post_meta( $p->ID, 'estado', true ),
					'cliente'     => get_post_meta( $p->ID, 'cliente', true ) ?: '',
					'hora_envio'  => get_post_meta( $p->ID, 'hora_envio', true ),
					'items'       => get_post_meta( $p->ID, 'items', true ) ?: [],
				];
			},
			$q->posts
		);

		return new WP_REST_Response( [ 'comandas' => $comandas ], 200 );
	}

	/**
	 * POST /cocina/marcar-listo — Marca una comanda como lista para servir.
	 *
	 * @since  1.0.0
	 * @param  WP_REST_Request $req Petición REST.
	 * @return WP_REST_Response
	 */
	public static function marcar_listo( WP_REST_Request $req ) {
		$comanda_id = (int) $req->get_param( 'comanda_id' );

		update_post_meta( $comanda_id, 'estado',     'listo' );
		update_post_meta( $comanda_id, 'hora_listo', time() );

		$mesa_id_listo = (int) get_post_meta( $comanda_id, 'mesa_id', true );
		if ( $mesa_id_listo ) {
			update_post_meta( $mesa_id_listo, 'estado', 'eating' );
		}

		return new WP_REST_Response( [ 'ok' => true, 'estado' => 'listo' ], 200 );
	}

	/**
	 * GET /cuenta/mesa/{id} — Cuenta acumulada de una mesa.
	 *
	 * @since  1.0.0
	 * @param  WP_REST_Request $req Petición REST.
	 * @return WP_REST_Response
	 */
	public static function get_cuenta( WP_REST_Request $req ) {
		$mesa_id = (int) $req->get_param( 'id' );

		$q = new WP_Query( [
			'post_type'      => 'comanda',
			'posts_per_page' => -1,
			'meta_query'     => [
				[ 'key' => 'mesa_id', 'value' => $mesa_id ],
				[
					'key'     => 'estado',
					'value'   => [ 'abierta', 'en_cocina', 'listo' ],
					'compare' => 'IN',
				],
			],
		] );

		$total     = 0;
		$items_all = [];

		foreach ( $q->posts as $p ) {
			$items = get_post_meta( $p->ID, 'items', true ) ?: [];
			foreach ( $items as $item ) {
				$total      += $item['subtotal'];
				$items_all[] = $item;
			}
		}

		return new WP_REST_Response(
			[ 'mesa_id' => $mesa_id, 'items' => $items_all, 'total' => $total ],
			200
		);
	}

	/**
	 * POST /cuenta/dividir — Divide la cuenta de una mesa entre varias personas.
	 *
	 * @since  1.0.0
	 * @param  WP_REST_Request $req Petición REST.
	 * @return WP_REST_Response
	 */
	public static function dividir_cuenta( WP_REST_Request $req ) {
		$mesa_id  = (int) $req->get_param( 'mesa_id' );
		$modo     = $req->get_param( 'modo' ) ?: 'equitativa';
		$personas = (int) ( $req->get_param( 'personas' ) ?: 1 );

		// Reutiliza get_cuenta pasando un request con el id de la mesa.
		$sub_req = new WP_REST_Request( 'GET' );
		$sub_req->set_param( 'id', $mesa_id );
		$cuenta = self::get_cuenta( $sub_req );

		$total       = $cuenta->get_data()['total'] ?? 0;
		$por_persona = 'equitativa' === $modo ? round( $total / max( $personas, 1 ), 2 ) : null;

		return new WP_REST_Response( [
			'modo'        => $modo,
			'total'       => $total,
			'personas'    => $personas,
			'por_persona' => $por_persona,
		], 200 );
	}

	/**
	 * POST /cuenta/cerrar — Cierra todas las comandas de una mesa y la libera.
	 *
	 * @since  1.0.0
	 * @param  WP_REST_Request $req Petición REST.
	 * @return WP_REST_Response
	 */
	public static function cerrar_cuenta( WP_REST_Request $req ) {
		$mesa_id     = (int) $req->get_param( 'mesa_id' );
		$metodo_pago = sanitize_text_field( $req->get_param( 'metodo_pago' ) ?: 'efectivo' );

		$q = new WP_Query( [
			'post_type'      => 'comanda',
			'posts_per_page' => -1,
			'fields'         => 'ids',
			'meta_query'     => [ [ 'key' => 'mesa_id', 'value' => $mesa_id ] ],
		] );

		foreach ( $q->posts as $id ) {
			update_post_meta( $id, 'estado',       'cerrada' );
			update_post_meta( $id, 'metodo_pago',  $metodo_pago );
			update_post_meta( $id, 'hora_cierre',  time() );
		}

		update_post_meta( $mesa_id, 'estado', 'libre' );

		return new WP_REST_Response( [ 'ok' => true, 'mesa_id' => $mesa_id, 'estado' => 'libre' ], 200 );
	}

	/**
	 * GET /zonas — Devuelve cada zona con el conteo de mesas en estado "libre".
	 *
	 * Endpoint público usado por ZonasApp en el landing para mostrar disponibilidad
	 * en tiempo real sin recargar la página.
	 *
	 * @since  1.0.0
	 * @return WP_REST_Response
	 */
	public static function get_zonas_disponibles(): WP_REST_Response {
		$definicion = [
			'salon-principal' => [
				'nombre' => 'Salón Principal',
				'desc'   => 'Mesas para grupos desde 2 personas. El corazón del restaurante.',
			],
			'la-terrazza'     => [
				'nombre' => 'La Terrazza',
				'desc'   => 'Mesas al aire libre con vista panorámica. Para disfrutar el ambiente.',
			],
			'zona-vip'        => [
				'nombre' => 'Zona VIP',
				'desc'   => 'Mesas privadas con consumo mínimo. Para experiencias exclusivas.',
			],
		];

		$resultado = [];

		foreach ( $definicion as $slug => $info ) {
			// Total de mesas en la zona.
			$q_total = new WP_Query( [
				'post_type'      => 'mesa',
				'posts_per_page' => -1,
				'fields'         => 'ids',
				'tax_query'      => [ [
					'taxonomy' => 'zona_restaurante',
					'field'    => 'slug',
					'terms'    => $slug,
				] ],
			] );

			// Mesas actualmente libres (sin reserva activa ni ocupadas).
			$q_libres = new WP_Query( [
				'post_type'      => 'mesa',
				'posts_per_page' => -1,
				'fields'         => 'ids',
				'tax_query'      => [ [
					'taxonomy' => 'zona_restaurante',
					'field'    => 'slug',
					'terms'    => $slug,
				] ],
				'meta_query'     => [ [
					'key'   => 'estado',
					'value' => 'libre',
				] ],
			] );

			$resultado[] = [
				'slug'         => $slug,
				'nombre'       => $info['nombre'],
				'desc'         => $info['desc'],
				'total_mesas'  => $q_total->found_posts,
				'mesas_libres' => $q_libres->found_posts,
			];
		}

		return new WP_REST_Response( [ 'zonas' => $resultado ], 200 );
	}

	/**
	 * POST /comanda/actualizar-items — Reemplaza el array de items de una comanda abierta.
	 *
	 * Permite al mesero modificar cantidades, eliminar items o agregar nuevos
	 * antes de enviar la comanda a cocina. No opera sobre comandas en_cocina o cerradas.
	 *
	 * @since  1.0.0
	 * @param  WP_REST_Request $req { comanda_id: int, items: array }
	 * @return WP_REST_Response|WP_Error
	 */
	public static function actualizar_items( WP_REST_Request $req ): WP_REST_Response|WP_Error {
		$comanda_id = (int) $req->get_param( 'comanda_id' );
		$items_raw  = $req->get_param( 'items' );

		if ( ! $comanda_id || ! is_array( $items_raw ) ) {
			return new WP_Error( 'datos_invalidos', 'Se requiere comanda_id e items[]', [ 'status' => 400 ] );
		}

		$mesa_id = (int) get_post_meta( $comanda_id, 'mesa_id', true );
		if ( ! $mesa_id ) {
			return new WP_Error( 'comanda_sin_mesa', 'La comanda no tiene una mesa asignada', [ 'status' => 400 ] );
		}

		$estado = get_post_meta( $comanda_id, 'estado', true );
		if ( ! in_array( $estado, [ 'abierta', 'en_cocina', 'listo', '' ], true ) ) {
			return new WP_Error( 'comanda_no_editable', 'Solo se pueden editar comandas abiertas, en cocina o listas', [ 'status' => 409 ] );
		}
		// Si estaba en proceso o lista, regresa a abierta y mesa a waiting para re-enviar adicionales
		if ( in_array( $estado, [ 'en_cocina', 'listo' ], true ) ) {
			update_post_meta( $comanda_id, 'estado', 'abierta' );
			update_post_meta( $mesa_id, 'estado', 'waiting' );
		}

		// Recalcular subtotales para garantizar coherencia con el precio real del producto.
		// Permite precios personalizados solo si el usuario logueado es gerente o administrador.
		$current_user = wp_get_current_user();
		$es_gerente   = in_array( 'gerente', (array) $current_user->roles ) || in_array( 'administrator', (array) $current_user->roles );

		$items_limpios = [];
		foreach ( $items_raw as $item ) {
			$producto  = wc_get_product( (int) ( $item['producto_id'] ?? 0 ) );
			$cantidad  = max( 1, (int) ( $item['cantidad'] ?? 1 ) );
			
			if ( $es_gerente && isset( $item['precio'] ) ) {
				$precio = (float) $item['precio'];
			} else {
				$precio = $producto ? (float) $producto->get_price() : (float) ( $item['precio'] ?? 0 );
			}

			$items_limpios[] = [
				'producto_id'   => (int) ( $item['producto_id'] ?? 0 ),
				'nombre'        => $producto ? $producto->get_name() : ( $item['nombre'] ?? '' ),
				'precio'        => $precio,
				'cantidad'      => $cantidad,
				'subtotal'      => round( $precio * $cantidad, 2 ),
				'modificadores' => $item['modificadores'] ?? [],
				'notas'         => sanitize_text_field( $item['notas'] ?? '' ),
				'estado'        => $item['estado'] ?? 'pendiente',
			];
		}

		update_post_meta( $comanda_id, 'items', $items_limpios );

		$total = array_sum( array_column( $items_limpios, 'subtotal' ) );

		return new WP_REST_Response( [
			'ok'         => true,
			'comanda_id' => $comanda_id,
			'items'      => count( $items_limpios ),
			'total'      => $total,
		], 200 );
	}

	/**
	 * GET /menu — Menú completo agrupado por categoría WooCommerce.
	 *
	 * Incluye precio, descripción y tiempo de preparación de cada platillo.
	 * Usado por MeseroApp (tablet del mesero) y la página pública Nuestra Carta.
	 *
	 * @since  1.0.0
	 * @return WP_REST_Response
	 */
	public static function get_menu(): WP_REST_Response {
		$categorias = get_terms( [ 'taxonomy' => 'product_cat', 'hide_empty' => true ] );
		$menu       = [];

		foreach ( $categorias as $cat ) {
			$productos = wc_get_products( [
				'category' => [ $cat->slug ],
				'status'   => 'publish',
				'limit'    => -1,
			] );

			if ( empty( $productos ) ) continue;

			// Excluir productos marcados como no disponibles (86).
			$productos = array_filter( $productos, function ( $p ) {
				$disp = get_post_meta( $p->get_id(), 'rustica_disponible', true );
				return $disp !== 'no';
			} );

			if ( empty( $productos ) ) continue;

			$items = array_map( function ( $p ) {
				$img = $p->get_image_id()
					? wp_get_attachment_image_url( $p->get_image_id(), 'rustica-card' )
					: null;
				return [
					'id'          => $p->get_id(),
					'nombre'      => $p->get_name(),
					'desc'        => $p->get_short_description() ?: wp_strip_all_tags( $p->get_description() ),
					'precio'      => (float) $p->get_price(),
					'imagen'      => $img,
					'tiempo_prep' => (int) ( get_post_meta( $p->get_id(), 'tiempo_prep_min', true ) ?: get_post_meta( $p->get_id(), 'tiempo_preparacion', true ) ),
				];
			}, $productos );

			$menu[] = [
				'categoria' => $cat->name,
				'slug'      => $cat->slug,
				'items'     => $items,
			];
		}

		return new WP_REST_Response( [ 'menu' => $menu ], 200 );
	}

	/**
	 * GET /reservaciones — Lista todas las reservaciones (activas y ya procesadas).
	 *
	 * @since  1.0.0
	 * @param  WP_REST_Request $req Petición REST.
	 * @return WP_REST_Response
	 */
	public static function get_todas_reservaciones( WP_REST_Request $req ) {
		$q = new WP_Query( [
			'post_type'      => 'reservacion',
			'posts_per_page' => -1,
			'post_status'    => [ 'publish', 'pending', 'draft', 'private' ],
		] );

		$resultado = [];
		foreach ( $q->posts as $post ) {
			$inicio = (int) get_post_meta( $post->ID, 'hora_inicio', true );
			$mesa_id = (int) get_post_meta( $post->ID, 'mesa_id', true );
			$mesa_numero = 0;
			if ( $mesa_id ) {
				$mesa_numero = (int) get_post_meta( $mesa_id, 'numero', true );
			}
			$resultado[] = [
				'id'          => $post->ID,
				'mesa_id'     => $mesa_id,
				'mesa_numero' => $mesa_numero,
				'nombre'      => get_post_meta( $post->ID, 'nombre', true ) ?: 'Cliente sin nombre',
				'email'       => get_post_meta( $post->ID, 'email', true ) ?: '',
				'telefono'    => get_post_meta( $post->ID, 'telefono', true ) ?: '',
				'fecha'       => date( 'Y-m-d', $inicio ),
				'hora'        => date( 'H:i', $inicio ),
				'personas'    => (int) get_post_meta( $post->ID, 'personas', true ) ?: 2,
				'notas'       => get_post_meta( $post->ID, 'notas', true ) ?: '',
				'estado'      => get_post_meta( $post->ID, 'estado', true ) ?: 'pendiente',
			];
		}

		// Ordenar por fecha y hora descendente (más recientes primero)
		usort( $resultado, function( $a, $b ) {
			return strtotime( $b['fecha'] . ' ' . $b['hora'] ) - strtotime( $a['fecha'] . ' ' . $a['hora'] );
		} );

		return new WP_REST_Response( [ 'reservaciones' => $resultado ], 200 );
	}

	/**
	 * POST /reservacion/actualizar — Actualiza una reservación existente de forma administrativa.
	 *
	 * @since  1.0.0
	 * @param  WP_REST_Request $req Petición REST.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function actualizar_reservacion( WP_REST_Request $req ) {
		$id       = (int) $req->get_param( 'id' );
		$nombre   = sanitize_text_field( $req->get_param( 'nombre' ) );
		$fecha    = sanitize_text_field( $req->get_param( 'fecha' ) );
		$hora     = sanitize_text_field( $req->get_param( 'hora' ) );
		$personas = (int) $req->get_param( 'personas' );
		$notas    = sanitize_textarea_field( $req->get_param( 'notas' ) );
		$estado   = sanitize_text_field( $req->get_param( 'estado' ) );
		$mesa_id  = (int) $req->get_param( 'mesa_id' );

		if ( ! $id ) {
			return new WP_Error( 'datos_invalidos', 'Se requiere id de la reservación', [ 'status' => 400 ] );
		}

		$post = get_post( $id );
		if ( ! $post || 'reservacion' !== $post->post_type ) {
			return new WP_Error( 'no_encontrado', 'Reservación no encontrada', [ 'status' => 404 ] );
		}

		if ( $nombre ) {
			update_post_meta( $id, 'nombre', $nombre );
		}
		if ( $personas ) {
			update_post_meta( $id, 'personas', $personas );
		}
		if ( $notas !== null ) {
			update_post_meta( $id, 'notas', $notas );
		}
		if ( $estado ) {
			update_post_meta( $id, 'estado', $estado );
		}
		if ( $mesa_id ) {
			update_post_meta( $id, 'mesa_id', $mesa_id );
		}

		if ( $fecha && $hora ) {
			$inicio = strtotime( "$fecha $hora" );
			$fin    = $inicio + ( 2 * 3600 );

			// Validación de solapamiento (excluyendo la reserva actual)
			if ( $estado !== 'cancelada' && $estado !== 'sentado' ) {
				$conflictos = new WP_Query( [
					'post_type'      => 'reservacion',
					'posts_per_page' => 1,
					'post_status'    => [ 'publish', 'pending' ],
					'post__not_in'   => [ $id ],
					'meta_query'     => [
						[ 'key' => 'mesa_id', 'value' => $mesa_id ?: get_post_meta( $id, 'mesa_id', true ) ],
						[ 'key' => 'estado',  'value' => [ 'cancelada', 'sentado' ], 'compare' => 'NOT IN' ],
						[ 'key' => 'hora_inicio', 'value' => $fin,    'compare' => '<', 'type' => 'NUMERIC' ],
						[ 'key' => 'hora_fin',    'value' => $inicio, 'compare' => '>', 'type' => 'NUMERIC' ],
					],
					'fields'         => 'ids',
				] );

				if ( $conflictos->have_posts() ) {
					return new WP_Error( 'mesa_ocupada', 'La mesa ya tiene una reservación activa que se solapa en este horario.', [ 'status' => 409 ] );
				}
			}

			update_post_meta( $id, 'hora_inicio', $inicio );
			update_post_meta( $id, 'hora_fin',    $fin );
		}

		// Actualizar título de post para mantener consistencia en admin
		$m_id = $mesa_id ?: get_post_meta( $id, 'mesa_id', true );
		$f = $fecha ?: date( 'Y-m-d', (int) get_post_meta( $id, 'hora_inicio', true ) );
		$h = $hora ?: date( 'H:i', (int) get_post_meta( $id, 'hora_inicio', true ) );
		$n = $nombre ?: get_post_meta( $id, 'nombre', true );

		wp_update_post( [
			'ID'         => $id,
			'post_title' => "Reserva $n — Mesa $m_id — $f $h",
		] );

		return new WP_REST_Response( [ 'ok' => true ], 200 );
	}

	/**
	 * GET /auth/me — Obtiene la información del usuario autenticado actual.
	 *
	 * @since  1.0.0
	 * @param  WP_REST_Request $req Petición REST.
	 * @return WP_REST_Response
	 */
	public static function get_current_user_info( WP_REST_Request $req ) {
		$user = wp_get_current_user();
		$roles = (array) $user->roles;
		$user_role = !empty($roles) ? $roles[0] : '';
		$es_gerente = in_array( 'gerente', $roles ) || in_array( 'administrator', $roles );
		$is_staff = in_array( 'mesero', $roles ) || in_array( 'cocina', $roles ) || $es_gerente;

		return new WP_REST_Response( [
			'id'         => $user->ID,
			'name'       => $user->display_name,
			'user_role'  => $user_role,
			'es_gerente' => $es_gerente,
			'is_staff'   => $is_staff,
		], 200 );
	}

	/**
	 * POST /comanda/solicitar-cuenta — El mesero solicita la cuenta; cambia estado a cuenta_solicitada.
	 */
	public static function solicitar_cuenta( WP_REST_Request $req ): WP_REST_Response {
		$comanda_id = (int) $req->get_param( 'comanda_id' );
		if ( ! $comanda_id ) {
			return new WP_REST_Response( [ 'ok' => false, 'message' => 'comanda_id requerido' ], 400 );
		}
		update_post_meta( $comanda_id, 'estado', 'cuenta_solicitada' );
		update_post_meta( $comanda_id, 'hora_solicitud_cuenta', time() );
		$mesa_id_paying = (int) get_post_meta( $comanda_id, 'mesa_id', true );
		if ( $mesa_id_paying ) {
			update_post_meta( $mesa_id_paying, 'estado', 'paying' );
		}
		return new WP_REST_Response( [ 'ok' => true, 'estado' => 'cuenta_solicitada' ], 200 );
	}

	/**
	 * GET /facturacion/pendientes — Todas las comandas activas para el módulo de facturación.
	 * Incluye cualquier estado activo: abierta, en_cocina, listo, cuenta_solicitada.
	 */
	public static function get_facturacion_pendientes( WP_REST_Request $req ): WP_REST_Response {
		$q = new WP_Query( [
			'post_type'      => 'comanda',
			'posts_per_page' => -1,
			'meta_query'     => [ [
				'key'     => 'estado',
				'value'   => [ 'abierta', 'en_cocina', 'listo', 'cuenta_solicitada' ],
				'compare' => 'IN',
			] ],
		] );

		$pendientes = [];
		foreach ( $q->posts as $p ) {
			$mesa_id   = (int) get_post_meta( $p->ID, 'mesa_id', true );
			$items     = get_post_meta( $p->ID, 'items', true ) ?: [];
			$total     = array_sum( array_column( $items, 'subtotal' ) );
			$mesa_num  = get_post_meta( $mesa_id, 'numero', true );
			$estado    = get_post_meta( $p->ID, 'estado', true );
			$hora_apertura = (int) get_post_meta( $p->ID, 'hora_apertura', true );
			if ( ! $hora_apertura ) {
				$hora_apertura = strtotime( $p->post_date );
			}

			$pendientes[] = [
				'id'                    => $p->ID,
				'mesa_id'               => $mesa_id,
				'mesa_numero'           => (int) ( $mesa_num ?: $mesa_id ),
				'cliente'               => get_post_meta( $p->ID, 'cliente', true ),
				'estado'                => $estado,
				'hora_apertura'         => $hora_apertura,
				'hora_solicitud_cuenta' => (int) get_post_meta( $p->ID, 'hora_solicitud_cuenta', true ),
				'items'                 => $items,
				'total'                 => $total,
			];
		}

		usort( $pendientes, fn( $a, $b ) => $a['hora_apertura'] <=> $b['hora_apertura'] );

		return new WP_REST_Response( [ 'pendientes' => $pendientes ], 200 );
	}

	/**
	 * POST /facturacion/emitir — Genera número de factura, cierra la comanda y libera la mesa.
	 */
	public static function emitir_factura( WP_REST_Request $req ): WP_REST_Response {
		$comanda_id  = (int) $req->get_param( 'comanda_id' );
		$metodo_pago = sanitize_text_field( $req->get_param( 'metodo_pago' ) ?: 'efectivo' );
		$propina     = (float) ( $req->get_param( 'propina' ) ?: 0 );

		if ( ! $comanda_id ) {
			return new WP_REST_Response( [ 'ok' => false, 'message' => 'comanda_id requerido' ], 400 );
		}

		// Número de factura secuencial por año
		$anio         = date( 'Y' );
		$ultimo_num   = (int) get_option( "rustica_ultima_factura_$anio", 0 );
		$nuevo_num    = $ultimo_num + 1;
		update_option( "rustica_ultima_factura_$anio", $nuevo_num );
		$num_factura  = sprintf( 'F%s-%04d', $anio, $nuevo_num );

		$mesa_id      = (int) get_post_meta( $comanda_id, 'mesa_id', true );
		$items        = get_post_meta( $comanda_id, 'items', true ) ?: [];
		$subtotal     = (float) array_sum( array_column( $items, 'subtotal' ) );
		$total        = $subtotal + $propina;

		update_post_meta( $comanda_id, 'estado',       'cerrada' );
		update_post_meta( $comanda_id, 'metodo_pago',  $metodo_pago );
		update_post_meta( $comanda_id, 'propina',       $propina );
		update_post_meta( $comanda_id, 'hora_cierre',   time() );
		update_post_meta( $comanda_id, 'num_factura',   $num_factura );

		// Liberar mesa
		if ( $mesa_id ) {
			update_post_meta( $mesa_id, 'estado', 'libre' );
		}

		return new WP_REST_Response( [
			'ok'          => true,
			'num_factura' => $num_factura,
			'total'       => $total,
			'mesa_id'     => $mesa_id,
		], 200 );
	}

	/**
	 * POST /comanda/eliminar — Elimina una comanda y libera la mesa (solo gerente/administrador).
	 *
	 * @since  1.0.0
	 * @param  WP_REST_Request $req Petición REST.
	 * @return WP_REST_Response
	 */
	public static function eliminar_comanda( WP_REST_Request $req ): WP_REST_Response {
		$comanda_id = (int) $req->get_param( 'comanda_id' );

		if ( ! $comanda_id ) {
			return new WP_REST_Response( [ 'ok' => false, 'message' => 'comanda_id requerido' ], 400 );
		}

		$post = get_post( $comanda_id );
		if ( ! $post || $post->post_type !== 'comanda' ) {
			return new WP_REST_Response( [ 'ok' => false, 'message' => 'Comanda no encontrada' ], 404 );
		}

		$mesa_id = (int) get_post_meta( $comanda_id, 'mesa_id', true );

		// Eliminar la comanda permanentemente
		wp_delete_post( $comanda_id, true );

		// Verificar si la mesa tiene otras comandas activas antes de liberarla
		if ( $mesa_id ) {
			$otras = new WP_Query( [
				'post_type'      => 'comanda',
				'posts_per_page' => 1,
				'fields'         => 'ids',
				'meta_query'     => [
					[ 'key' => 'mesa_id', 'value' => $mesa_id ],
					[
						'key'     => 'estado',
						'value'   => [ 'abierta', 'en_cocina', 'listo', 'cuenta_solicitada' ],
						'compare' => 'IN',
					],
				],
			] );
			if ( ! $otras->have_posts() ) {
				update_post_meta( $mesa_id, 'estado', 'libre' );
			}
		}

		return new WP_REST_Response( [ 'ok' => true, 'mesa_id' => $mesa_id ], 200 );
	}

	/**
	 * POST /reservacion/eliminar — Elimina una reservación permanentemente (solo gerente/administrador).
	 */
	public static function eliminar_reservacion( WP_REST_Request $req ): WP_REST_Response {
		$reservacion_id = (int) $req->get_param( 'reservacion_id' );

		if ( ! $reservacion_id ) {
			return new WP_REST_Response( [ 'ok' => false, 'message' => 'reservacion_id requerido' ], 400 );
		}

		$post = get_post( $reservacion_id );
		if ( ! $post || $post->post_type !== 'reservacion' ) {
			return new WP_REST_Response( [ 'ok' => false, 'message' => 'Reservación no encontrada' ], 404 );
		}

		wp_delete_post( $reservacion_id, true );

		return new WP_REST_Response( [ 'ok' => true, 'reservacion_id' => $reservacion_id ], 200 );
	}

	/**
	 * GET /reportes/cierre-dia — Resumen de ventas del día (o fecha indicada).
	 * Parámetro opcional: ?fecha=YYYY-MM-DD  (default: hoy)
	 */
	public static function get_reporte_dia( WP_REST_Request $req ): WP_REST_Response {
		$fecha_param = sanitize_text_field( $req->get_param( 'fecha' ) ?: '' );
		$inicio      = $fecha_param ? strtotime( $fecha_param . ' 00:00:00' ) : strtotime( 'today midnight' );
		$fin         = $inicio + DAY_IN_SECONDS;

		$q = new WP_Query( [
			'post_type'      => 'comanda',
			'post_status'    => 'any',
			'posts_per_page' => -1,
			'meta_query'     => [
				'relation' => 'AND',
				[ 'key' => 'estado',      'value' => 'cerrada' ],
				[ 'key' => 'hora_cierre', 'value' => $inicio,  'compare' => '>=', 'type' => 'NUMERIC' ],
				[ 'key' => 'hora_cierre', 'value' => $fin,     'compare' => '<',  'type' => 'NUMERIC' ],
			],
		] );

		$total_ventas   = 0.0;
		$total_propinas = 0.0;
		$total_cubiertos = 0;
		$por_metodo     = [];
		$productos_map  = [];
		$facturas       = [];
		$detalle        = [];

		foreach ( $q->posts as $p ) {
			$items       = get_post_meta( $p->ID, 'items',       true ) ?: [];
			$subtotal    = (float) array_sum( array_column( $items, 'subtotal' ) );
			$propina     = (float) get_post_meta( $p->ID, 'propina',      true );
			$metodo      = get_post_meta( $p->ID, 'metodo_pago', true ) ?: 'efectivo';
			$personas    = max( 1, (int) get_post_meta( $p->ID, 'personas', true ) );
			$mesa_id     = (int) get_post_meta( $p->ID, 'mesa_id',     true );
			$mesa_num    = (int) get_post_meta( $mesa_id, 'numero',    true );
			$num_factura = get_post_meta( $p->ID, 'num_factura', true );
			$hora_cierre = (int) get_post_meta( $p->ID, 'hora_cierre', true );

			$total_ventas   += $subtotal;
			$total_propinas += $propina;
			$total_cubiertos += $personas;
			$por_metodo[ $metodo ] = ( $por_metodo[ $metodo ] ?? 0.0 ) + $subtotal + $propina;

			foreach ( $items as $item ) {
				$pid    = (int) ( $item['producto_id'] ?? 0 );
				$nombre = (string) ( $item['nombre']      ?? '' );
				if ( ! isset( $productos_map[ $pid ] ) ) {
					$productos_map[ $pid ] = [ 'nombre' => $nombre, 'cantidad' => 0, 'total' => 0.0 ];
				}
				$productos_map[ $pid ]['cantidad'] += (int) ( $item['cantidad'] ?? 1 );
				$productos_map[ $pid ]['total']    += (float) ( $item['subtotal'] ?? 0 );
			}

			if ( $num_factura ) {
				$facturas[] = [
					'num'    => $num_factura,
					'mesa'   => $mesa_num,
					'cliente'=> get_post_meta( $p->ID, 'cliente', true ),
					'subtotal'=> $subtotal,
					'propina' => $propina,
					'total'  => $subtotal + $propina,
					'metodo' => $metodo,
					'hora'   => $hora_cierre,
				];
			}

			$detalle[] = [
				'id'          => $p->ID,
				'mesa'        => $mesa_num,
				'cliente'     => get_post_meta( $p->ID, 'cliente', true ),
				'subtotal'    => $subtotal,
				'propina'     => $propina,
				'total'       => $subtotal + $propina,
				'metodo'      => $metodo,
				'personas'    => $personas,
				'num_factura' => $num_factura,
				'hora_cierre' => $hora_cierre,
			];
		}

		usort( $productos_map, fn( $a, $b ) => $b['cantidad'] <=> $a['cantidad'] );
		usort( $facturas,      fn( $a, $b ) => $a['hora'] <=> $b['hora'] );

		return new WP_REST_Response( [
			'fecha'           => date( 'Y-m-d', $inicio ),
			'total_ventas'    => round( $total_ventas, 2 ),
			'total_iva'       => round( $total_ventas * 0.19, 2 ),
			'total_propinas'  => round( $total_propinas, 2 ),
			'total_cubiertos' => $total_cubiertos,
			'mesas_atendidas' => $q->found_posts,
			'por_metodo'      => $por_metodo,
			'top_productos'   => array_slice( array_values( $productos_map ), 0, 10 ),
			'facturas'        => $facturas,
			'detalle'         => $detalle,
		], 200 );
	}

	/**
	 * GET /productos — Lista todos los productos con su estado de disponibilidad.
	 */
	public static function get_productos_admin(): WP_REST_Response {
		$categorias = get_terms( [ 'taxonomy' => 'product_cat', 'hide_empty' => true ] );
		$resultado  = [];

		foreach ( $categorias as $cat ) {
			if ( $cat->slug === 'uncategorized' ) continue;

			$productos = wc_get_products( [
				'category' => [ $cat->slug ],
				'status'   => 'publish',
				'limit'    => -1,
			] );

			foreach ( $productos as $p ) {
				$disp = get_post_meta( $p->get_id(), 'rustica_disponible', true );
				$resultado[] = [
					'id'           => $p->get_id(),
					'nombre'       => $p->get_name(),
					'precio'       => (float) $p->get_price(),
					'categoria'    => $cat->name,
					'cat_slug'     => $cat->slug,
					'disponible'   => $disp !== 'no',
				];
			}
		}

		return new WP_REST_Response( [ 'productos' => $resultado ], 200 );
	}

	/**
	 * POST /producto/disponibilidad — Activa o desactiva un producto del menú (solo gerente).
	 */
	public static function toggle_disponibilidad( WP_REST_Request $req ): WP_REST_Response {
		$producto_id = (int) $req->get_param( 'producto_id' );
		$disponible  = (bool) $req->get_param( 'disponible' );

		if ( ! $producto_id ) {
			return new WP_REST_Response( [ 'ok' => false, 'message' => 'producto_id requerido' ], 400 );
		}

		update_post_meta( $producto_id, 'rustica_disponible', $disponible ? 'si' : 'no' );

		return new WP_REST_Response( [
			'ok'         => true,
			'producto_id'=> $producto_id,
			'disponible' => $disponible,
		], 200 );
	}
}
