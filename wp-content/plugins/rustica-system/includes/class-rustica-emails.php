<?php
/**
 * Rustica_Emails — Notificaciones por correo electrónico.
 *
 * @package Rustica_System
 * @since   1.0.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Clase que gestiona el envío de emails transaccionales del sistema.
 *
 * @since 1.0.0
 */
class Rustica_Emails {

	/**
	 * Envía el email de confirmación de reserva al cliente.
	 *
	 * @since  1.0.0
	 * @param  int $reservacion_id ID del post de tipo reservacion.
	 * @return void
	 */
	public static function confirmar_reserva( int $reservacion_id ): void {
		$email   = get_post_meta( $reservacion_id, 'email', true );
		$nombre  = get_post_meta( $reservacion_id, 'nombre', true );
		$mesa_id = (int) get_post_meta( $reservacion_id, 'mesa_id', true );
		$numero  = get_post_meta( $mesa_id, 'numero', true );
		$inicio  = (int) get_post_meta( $reservacion_id, 'hora_inicio', true );
		$fecha   = date( 'd/m/Y H:i', $inicio );

		if ( ! $email ) {
			return;
		}

		$asunto = '&#x2705; Reserva confirmada &#x2014; La Rustica Terrazza';
		$cuerpo = "
			<h2>&#xA1;Tu reserva est&#xE1; confirmada, {$nombre}!</h2>
			<p><strong>Mesa:</strong> {$numero}</p>
			<p><strong>Fecha y hora:</strong> {$fecha}</p>
			<p>Te esperamos en La Rustica Terrazza.</p>
			<p><em>Si necesitas cancelar o modificar tu reserva, cont&#xE1;ctanos.</em></p>
		";

		wp_mail(
			$email,
			$asunto,
			$cuerpo,
			[ 'Content-Type: text/html; charset=UTF-8' ]
		);
	}
}
