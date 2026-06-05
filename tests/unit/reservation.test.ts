import { describe, it, expect, beforeEach, vi } from 'vitest';
import { initReservation } from '../../src/ts/modules/reservation.js';

const futureDate = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

function buildReservationDOM(): void {
  document.body.innerHTML = `
    <form id="reservationForm" novalidate>
      <input id="res-name" name="name" value="Ana García">
      <div class="invalid-feedback"></div>
      <input id="res-email" name="email" value="ana@example.com">
      <div class="invalid-feedback"></div>
      <input id="res-phone" name="phone" value="612345678">
      <div class="invalid-feedback"></div>
      <input id="res-date" name="date" value="${futureDate}">
      <div class="invalid-feedback"></div>
      <select id="res-time" name="time"><option value="13:00" selected>13:00</option></select>
      <div class="invalid-feedback"></div>
      <input id="res-party" name="partySize" type="number" value="4">
      <div class="invalid-feedback"></div>
      <div id="reservationAlert"></div>
      <button type="submit">Reservar</button>
    </form>
  `;
}

describe('initReservation — valid submission', () => {
  beforeEach(() => {
    buildReservationDOM();
    initReservation();
  });

  it('shows success alert on valid submit', () => {
    document.getElementById('reservationForm')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    const alert = document.getElementById('reservationAlert')!;
    expect(alert.innerHTML).toContain('Gracias');
    expect(alert.innerHTML).toContain('alert-success');
  });

  it('resets form after valid submit', () => {
    const form = document.getElementById('reservationForm') as HTMLFormElement;
    const resetSpy = vi.spyOn(form, 'reset');
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    expect(resetSpy).toHaveBeenCalledOnce();
  });
});

describe('initReservation — invalid submission', () => {
  beforeEach(() => {
    buildReservationDOM();
    initReservation();
    // Clear required fields
    (document.getElementById('res-name') as HTMLInputElement).value = '';
    (document.getElementById('res-email') as HTMLInputElement).value = '';
  });

  it('marks name field as invalid when empty', () => {
    document.getElementById('reservationForm')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    expect(document.getElementById('res-name')!.classList.contains('is-invalid')).toBe(true);
  });

  it('does not show success alert when form is invalid', () => {
    document.getElementById('reservationForm')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    const alert = document.getElementById('reservationAlert')!;
    expect(alert.innerHTML).not.toContain('alert-success');
  });
});
