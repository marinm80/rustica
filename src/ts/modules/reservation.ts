import { validateReservation } from '../lib/validators.js';
import { qs, on, setError, clearError, clearAllErrors, showAlert } from '../lib/dom.js';
import type { ReservationData } from '../types/index.js';

function getReservationData(form: HTMLFormElement): ReservationData {
  const fd = new FormData(form);
  return {
    name: String(fd.get('name') ?? ''),
    email: String(fd.get('email') ?? ''),
    phone: String(fd.get('phone') ?? ''),
    date: String(fd.get('date') ?? ''),
    time: String(fd.get('time') ?? ''),
    partySize: parseInt(String(fd.get('partySize') ?? '0'), 10),
  };
}

function applyErrors(form: HTMLFormElement, errors: Record<string, string>): void {
  clearAllErrors(form);
  const fields: Record<string, string> = {
    name: '#res-name',
    email: '#res-email',
    phone: '#res-phone',
    date: '#res-date',
    time: '#res-time',
    partySize: '#res-party',
  };
  for (const [key, selector] of Object.entries(fields)) {
    const el = qs<HTMLInputElement | HTMLSelectElement>(selector, form);
    if (!el) continue;
    if (errors[key]) {
      setError(el, errors[key]);
    } else {
      clearError(el);
    }
  }
}

export function initReservation(): void {
  const form = qs<HTMLFormElement>('#reservationForm');
  if (!form) return;

  on(form, 'submit', (e: Event) => {
    e.preventDefault();
    const data = getReservationData(form);
    const result = validateReservation(data);

    if (!result.valid) {
      applyErrors(form, result.errors);
      return;
    }

    clearAllErrors(form);
    const alertContainer = qs<HTMLElement>('#reservationAlert');
    if (alertContainer) {
      showAlert(
        alertContainer,
        '¡Gracias! Hemos recibido tu solicitud de reserva. Te contactaremos para confirmarla.',
        'success'
      );
    }
    form.reset();
  });
}
