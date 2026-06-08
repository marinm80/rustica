<?php
/**
 * Rustica_Billing — Gestión de pagos y depósitos VIP con WooCommerce.
 *
 * @package Rustica_System
 * @since   1.0.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Clase que maneja la creación de productos de depósito VIP y el hook
 * de pago completado de WooCommerce.
 *
 * @since 1.0.0
 */
class Rustica_Billing {

	/**
	 * Crea un producto WooCommerce de depósito VIP (30 % del consumo mínimo)
	 * y redirige al checkout.
	 *
	 * @since  1.0.0
	 * @param  int $reservacion_id ID del post de tipo reservacion.
	 * @return string|null URL del checkout o null si no aplica depósito.
	 */
	public static function crear_deposito_vip( int $reservacion_id ): ?string {
		$mesa_id     = (int)   get_post_meta( $reservacion_id, 'mesa_id', true );
		$consumo_min = (float) get_post_meta( $mesa_id, 'consumo_minimo', true );
		$numero      = get_post_meta( $mesa_id, 'numero', true );

		if ( ! $consumo_min ) {
			return null;
		}

		$deposito = $consumo_min * 0.30;

		$product = new WC_Product_Simple();
		$product->set_name( "Deposito Reserva VIP — Mesa $numero" );
		$product->set_price( $deposito );
		$product->set_regular_price( $deposito );
		$product->set_virtual( true );
		$product->set_sold_individually( true );
		$product->set_status( 'private' );
		$product_id = $product->save();

		update_post_meta( $product_id, '_rustica_reservacion_id', $reservacion_id );
		update_post_meta( $product_id, '_rustica_tipo',           'deposito_vip' );

		WC()->cart->empty_cart();
		WC()->cart->add_to_cart( $product_id );

		return wc_get_checkout_url();
	}

	/**
	 * Hook woocommerce_order_status_completed — confirma la reservación VIP
	 * cuando el pedido de depósito se paga.
	 *
	 * @since  1.0.0
	 * @param  int $order_id ID del pedido WooCommerce.
	 * @return void
	 */
	public static function on_pago_completado( int $order_id ): void {
		$order = wc_get_order( $order_id );

		foreach ( $order->get_items() as $item ) {
			$pid    = $item->get_product_id();
			$tipo   = get_post_meta( $pid, '_rustica_tipo', true );
			$res_id = get_post_meta( $pid, '_rustica_reservacion_id', true );

			if ( 'deposito_vip' === $tipo && $res_id ) {
				update_post_meta( (int) $res_id, 'estado',              'confirmada' );
				update_post_meta( (int) $res_id, 'deposito_pagado',     $order->get_total() );
				update_post_meta( (int) $res_id, 'wc_order_deposito',   $order_id );
				wp_update_post( [ 'ID' => (int) $res_id, 'post_status' => 'publish' ] );
				Rustica_Emails::confirmar_reserva( (int) $res_id );
				do_action( 'rustica/reservacion_confirmada', $res_id );
			}
		}
	}
}
