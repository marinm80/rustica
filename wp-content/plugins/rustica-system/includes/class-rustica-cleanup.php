<?php
/**
 * Rustica_Cleanup — Limpieza automática de reservaciones expiradas.
 *
 * @package Rustica_System
 * @since   1.0.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Clase que gestiona el mantenimiento periódico de datos del sistema.
 *
 * @since 1.0.0
 */
class Rustica_Cleanup {

	/**
	 * Marca como expiradas las reservaciones pendientes cuyo inicio ya pasó
	 * hace más de 30 minutos.
	 *
	 * Llamada desde el cron diario rustica_cron_cleanup.
	 *
	 * @since  1.0.0
	 * @return void
	 */
	public static function limpiar_reservas_expiradas(): void {
		$limite = time() - ( 30 * 60 ); // 30 minutos antes del momento actual.

		$reservas = new WP_Query( [
			'post_type'      => 'reservacion',
			'post_status'    => 'pending',
			'posts_per_page' => -1,
			'fields'         => 'ids',
			'meta_query'     => [
				[
					'key'     => 'hora_inicio',
					'value'   => $limite,
					'compare' => '<',
					'type'    => 'NUMERIC',
				],
			],
		] );

		foreach ( $reservas->posts as $id ) {
			wp_update_post( [ 'ID' => $id, 'post_status' => 'draft' ] );
			update_post_meta( $id, 'estado', 'expirada' );
		}
	}
}
