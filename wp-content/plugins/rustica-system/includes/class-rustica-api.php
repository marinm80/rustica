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

		register_rest_route( $ns, '/reservacion/(?P<id>\d+)', [
			'methods'             => 'GET',
			'callback'            => [ self::class, 'get_reservacion' ],
			'permission_callback' => [ self::class, 'verificar_jwt' ],
		] );

		register_rest_route( $ns, '/comanda-activa', [
			'methods'             => 'GET',
			'callback'            => [ self::class, 'get_comanda_activa' ],
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
		] );

		$data = array_map(
			function ( $p ) {
				$terminos = wp_get_post_terms( $p->ID, 'zona_restaurante' );
				return [
					'id'        => $p->ID,
					'numero'    => (int) get_post_meta( $p->ID, 'numero', true ),
					'capacidad' => (int) get_post_meta( $p->ID, 'capacidad', true ),
					'estado'    => get_post_meta( $p->ID, 'estado', true ) ?: 'libre',
					'es_vip'    => (bool) get_post_meta( $p->ID, 'es_vip', true ),
					'zona'      => ! is_wp_error( $terminos ) && ! empty( $terminos ) ? $terminos[0]->name : '',
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
			'meta_query'     => [ [ 'key' => 'estado', 'value' => 'ocupada' ] ],
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
			'posts_per_page' => 1,
			'meta_query'     => [
				[ 'key' => 'mesa_id', 'value' => $mesa_id ],
				[ 'key' => 'estado',  'value' => [ 'abierta', 'en_cocina' ], 'compare' => 'IN' ],
			],
		] );

		if ( ! $q->have_posts() ) {
			return new WP_REST_Response( [ 'comanda' => null ], 200 );
		}

		$post  = $q->posts[0];
		$items = get_post_meta( $post->ID, 'items', true ) ?: [];

		return new WP_REST_Response( [
			'comanda' => [
				'id'     => $post->ID,
				'estado' => get_post_meta( $post->ID, 'estado', true ),
				'items'  => $items,
				'total'  => array_sum( array_column( $items, 'subtotal' ) ),
			],
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

		$q = new WP_Query( [
			'post_type'      => 'comanda',
			'posts_per_page' => 1,
			'meta_query'     => [
				[ 'key' => 'mesa_id', 'value' => $mesa_id ],
				[ 'key' => 'estado',  'value' => 'abierta' ],
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

		update_post_meta( $comanda_id, 'estado',     'en_cocina' );
		update_post_meta( $comanda_id, 'hora_envio', time() );

		$mesa_id = (int) get_post_meta( $comanda_id, 'mesa_id', true );
		update_post_meta( $mesa_id, 'estado', 'ocupada' );

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
			'posts_per_page' => -1,
			'meta_query'     => [
				[
					'key'     => 'estado',
					'value'   => [ 'en_cocina', 'abierta' ],
					'compare' => 'IN',
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
}
