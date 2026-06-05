import { validateEventRequest } from '../lib/validators.js';
import { qs, on, setError, clearError, clearAllErrors, showAlert } from '../lib/dom.js';
import type { EventRequest } from '../types/index.js';

function getEventData(form: HTMLFormElement): EventRequest {
  const fd = new FormData(form);
  return {
    name: String(fd.get('name') ?? ''),
    email: String(fd.get('email') ?? ''),
    phone: String(fd.get('phone') ?? '') || undefined,
    eventType: String(fd.get('eventType') ?? '') as EventRequest['eventType'],
    date: String(fd.get('date') ?? ''),
    guests: parseInt(String(fd.get('guests') ?? '0'), 10),
    message: String(fd.get('message') ?? ''),
  };
}

function applyErrors(form: HTMLFormElement, errors: Record<string, string>): void {
  clearAllErrors(form);
  const fields: Record<string, string> = {
    name: '#evt-name',
    email: '#evt-email',
    phone: '#evt-phone',
    eventType: '#evt-type',
    date: '#evt-date',
    guests: '#evt-guests',
    message: '#evt-message',
  };
  for (const [key, selector] of Object.entries(fields)) {
    const el = qs<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(selector, form);
    if (!el) continue;
    if (errors[key]) {
      setError(el, errors[key]);
    } else if (key !== 'phone' || (el as HTMLInputElement).value) {
      clearError(el);
    }
  }
}

export function initEventsForm(): void {
  const form = qs<HTMLFormElement>('#eventsForm');
  if (!form) return;

  on(form, 'submit', (e: Event) => {
    e.preventDefault();
    const data = getEventData(form);
    const result = validateEventRequest(data);

    if (!result.valid) {
      applyErrors(form, result.errors);
      return;
    }

    clearAllErrors(form);
    const alertContainer = qs<HTMLElement>('#eventsAlert');
    if (alertContainer) {
      showAlert(
        alertContainer,
        '¡Gracias! Hemos recibido tu solicitud de evento. Nuestro equipo te responderá pronto.',
        'success'
      );
    }
    form.reset();
  });
}
