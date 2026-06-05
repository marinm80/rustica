import { PARTY_SIZE_MIN, PARTY_SIZE_MAX } from '../data/content.js';
import { EVENT_GUESTS_MIN, EVENT_GUESTS_MAX } from '../types/index.js';
import type { ReservationData, EventRequest, ValidationResult } from '../types/index.js';

export function isRequired(value: string): boolean {
  return value.trim().length > 0;
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function isValidPhone(value: string): boolean {
  const digits = value.replace(/\D/g, '');
  return digits.length >= 7;
}

export function isNotPastDate(dateStr: string): boolean {
  if (!dateStr) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selected = new Date(dateStr + 'T00:00:00');
  return selected >= today;
}

export function isPartySizeInRange(size: number): boolean {
  return Number.isInteger(size) && size >= PARTY_SIZE_MIN && size <= PARTY_SIZE_MAX;
}

export function isGuestCountInRange(count: number): boolean {
  return Number.isInteger(count) && count >= EVENT_GUESTS_MIN && count <= EVENT_GUESTS_MAX;
}

export function validateReservation(data: ReservationData): ValidationResult {
  const errors: Record<string, string> = {};

  if (!isRequired(data.name)) errors['name'] = 'El nombre es obligatorio.';
  if (!isRequired(data.email)) {
    errors['email'] = 'El correo es obligatorio.';
  } else if (!isValidEmail(data.email)) {
    errors['email'] = 'Introduce un correo electrónico válido.';
  }
  if (!isRequired(data.phone)) {
    errors['phone'] = 'El teléfono es obligatorio.';
  } else if (!isValidPhone(data.phone)) {
    errors['phone'] = 'El teléfono debe tener al menos 7 dígitos.';
  }
  if (!isRequired(data.date)) {
    errors['date'] = 'La fecha es obligatoria.';
  } else if (!isNotPastDate(data.date)) {
    errors['date'] = 'La fecha debe ser hoy o posterior.';
  }
  if (!isRequired(data.time)) errors['time'] = 'Selecciona una hora.';
  if (!isPartySizeInRange(data.partySize)) {
    errors['partySize'] = `El número de personas debe estar entre ${PARTY_SIZE_MIN} y ${PARTY_SIZE_MAX}.`;
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateEventRequest(data: EventRequest): ValidationResult {
  const errors: Record<string, string> = {};

  if (!isRequired(data.name)) errors['name'] = 'El nombre es obligatorio.';
  if (!isRequired(data.email)) {
    errors['email'] = 'El correo es obligatorio.';
  } else if (!isValidEmail(data.email)) {
    errors['email'] = 'Introduce un correo electrónico válido.';
  }
  if (data.phone && !isValidPhone(data.phone)) {
    errors['phone'] = 'El teléfono debe tener al menos 7 dígitos.';
  }
  if (!isRequired(data.eventType)) errors['eventType'] = 'Selecciona el tipo de evento.';
  if (!isRequired(data.date)) {
    errors['date'] = 'La fecha es obligatoria.';
  } else if (!isNotPastDate(data.date)) {
    errors['date'] = 'La fecha debe ser hoy o posterior.';
  }
  if (!isGuestCountInRange(data.guests)) {
    errors['guests'] = `El número de invitados debe estar entre ${EVENT_GUESTS_MIN} y ${EVENT_GUESTS_MAX}.`;
  }
  if (!isRequired(data.message)) errors['message'] = 'El mensaje es obligatorio.';

  return { valid: Object.keys(errors).length === 0, errors };
}
