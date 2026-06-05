import { describe, it, expect } from 'vitest';
import {
  isRequired,
  isValidEmail,
  isValidPhone,
  isNotPastDate,
  isPartySizeInRange,
  isGuestCountInRange,
  validateReservation,
  validateEventRequest,
} from '../../src/ts/lib/validators.js';
import type { ReservationData, EventRequest } from '../../src/ts/types/index.js';

describe('isRequired', () => {
  it('returns false for empty string', () => expect(isRequired('')).toBe(false));
  it('returns false for whitespace', () => expect(isRequired('   ')).toBe(false));
  it('returns true for non-empty string', () => expect(isRequired('Juan')).toBe(true));
});

describe('isValidEmail', () => {
  it('accepts valid email', () => expect(isValidEmail('a@b.com')).toBe(true));
  it('rejects missing @', () => expect(isValidEmail('invalid')).toBe(false));
  it('rejects missing domain', () => expect(isValidEmail('a@')).toBe(false));
  it('accepts email with subdomain', () => expect(isValidEmail('user@sub.domain.es')).toBe(true));
});

describe('isValidPhone', () => {
  it('accepts 9-digit phone', () => expect(isValidPhone('612345678')).toBe(true));
  it('accepts phone with spaces', () => expect(isValidPhone('612 345 678')).toBe(true));
  it('rejects 4-digit string', () => expect(isValidPhone('1234')).toBe(false));
  it('accepts international format', () => expect(isValidPhone('+34 910 123 456')).toBe(true));
});

describe('isNotPastDate', () => {
  it('rejects empty string', () => expect(isNotPastDate('')).toBe(false));
  it('accepts today', () => {
    const today = new Date().toISOString().split('T')[0];
    expect(isNotPastDate(today)).toBe(true);
  });
  it('rejects yesterday', () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    expect(isNotPastDate(yesterday)).toBe(false);
  });
  it('accepts future date', () => {
    const future = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
    expect(isNotPastDate(future)).toBe(true);
  });
});

describe('isPartySizeInRange', () => {
  it('accepts 1', () => expect(isPartySizeInRange(1)).toBe(true));
  it('accepts 30', () => expect(isPartySizeInRange(30)).toBe(true));
  it('rejects 0', () => expect(isPartySizeInRange(0)).toBe(false));
  it('rejects 31', () => expect(isPartySizeInRange(31)).toBe(false));
  it('rejects float', () => expect(isPartySizeInRange(2.5)).toBe(false));
  it('rejects negative', () => expect(isPartySizeInRange(-1)).toBe(false));
});

describe('isGuestCountInRange', () => {
  it('accepts 1', () => expect(isGuestCountInRange(1)).toBe(true));
  it('accepts 300', () => expect(isGuestCountInRange(300)).toBe(true));
  it('rejects 0', () => expect(isGuestCountInRange(0)).toBe(false));
  it('rejects 301', () => expect(isGuestCountInRange(301)).toBe(false));
});

const futureDate = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

describe('validateReservation — valid data', () => {
  const valid: ReservationData = {
    name: 'Ana García',
    email: 'ana@example.com',
    phone: '612345678',
    date: futureDate,
    time: '13:00',
    partySize: 4,
  };
  it('returns valid=true with no errors', () => {
    const result = validateReservation(valid);
    expect(result.valid).toBe(true);
    expect(Object.keys(result.errors)).toHaveLength(0);
  });
});

describe('validateReservation — invalid data', () => {
  it('catches empty name', () => {
    const data: ReservationData = {
      name: '',
      email: 'a@b.com',
      phone: '600000000',
      date: futureDate,
      time: '13:00',
      partySize: 2,
    };
    expect(validateReservation(data).errors['name']).toBeTruthy();
  });
  it('catches invalid email', () => {
    const data: ReservationData = {
      name: 'Ana',
      email: 'notanemail',
      phone: '600000000',
      date: futureDate,
      time: '13:00',
      partySize: 2,
    };
    expect(validateReservation(data).errors['email']).toBeTruthy();
  });
  it('catches past date', () => {
    const past = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const data: ReservationData = {
      name: 'Ana',
      email: 'a@b.com',
      phone: '600000000',
      date: past,
      time: '13:00',
      partySize: 2,
    };
    expect(validateReservation(data).errors['date']).toBeTruthy();
  });
  it('catches party size 31', () => {
    const data: ReservationData = {
      name: 'Ana',
      email: 'a@b.com',
      phone: '600000000',
      date: futureDate,
      time: '13:00',
      partySize: 31,
    };
    expect(validateReservation(data).errors['partySize']).toBeTruthy();
  });
  it('catches party size 0', () => {
    const data: ReservationData = {
      name: 'Ana',
      email: 'a@b.com',
      phone: '600000000',
      date: futureDate,
      time: '13:00',
      partySize: 0,
    };
    expect(validateReservation(data).errors['partySize']).toBeTruthy();
  });
});

describe('validateReservation — phone branches', () => {
  it('catches empty phone', () => {
    const data: ReservationData = { name: 'Ana', email: 'a@b.com', phone: '', date: futureDate, time: '13:00', partySize: 2 };
    expect(validateReservation(data).errors['phone']).toContain('obligatorio');
  });
  it('catches phone with fewer than 7 digits', () => {
    const data: ReservationData = { name: 'Ana', email: 'a@b.com', phone: '123', date: futureDate, time: '13:00', partySize: 2 };
    expect(validateReservation(data).errors['phone']).toContain('dígitos');
  });
  it('catches missing time', () => {
    const data: ReservationData = { name: 'Ana', email: 'a@b.com', phone: '612345678', date: futureDate, time: '', partySize: 2 };
    expect(validateReservation(data).errors['time']).toBeTruthy();
  });
  it('catches missing date', () => {
    const data: ReservationData = { name: 'Ana', email: 'a@b.com', phone: '612345678', date: '', time: '13:00', partySize: 2 };
    expect(validateReservation(data).errors['date']).toContain('obligatoria');
  });
});

describe('validateEventRequest — valid data', () => {
  const valid: EventRequest = {
    name: 'Carlos',
    email: 'c@example.com',
    eventType: 'Boda',
    date: futureDate,
    guests: 50,
    message: 'Necesito info.',
  };
  it('returns valid=true', () => expect(validateEventRequest(valid).valid).toBe(true));
});

describe('validateEventRequest — invalid data', () => {
  it('catches empty message', () => {
    const data: EventRequest = {
      name: 'X',
      email: 'a@b.com',
      eventType: 'Boda',
      date: futureDate,
      guests: 10,
      message: '',
    };
    expect(validateEventRequest(data).errors['message']).toBeTruthy();
  });
  it('catches guests 301', () => {
    const data: EventRequest = {
      name: 'X',
      email: 'a@b.com',
      eventType: 'Corporativo',
      date: futureDate,
      guests: 301,
      message: 'ok',
    };
    expect(validateEventRequest(data).errors['guests']).toBeTruthy();
  });
  it('optional phone: invalid format caught', () => {
    const data: EventRequest = {
      name: 'X',
      email: 'a@b.com',
      phone: '12',
      eventType: 'Otro',
      date: futureDate,
      guests: 20,
      message: 'ok',
    };
    expect(validateEventRequest(data).errors['phone']).toBeTruthy();
  });
  it('optional phone: absent is valid', () => {
    const data: EventRequest = {
      name: 'X',
      email: 'a@b.com',
      eventType: 'Otro',
      date: futureDate,
      guests: 20,
      message: 'ok',
    };
    expect(validateEventRequest(data).errors['phone']).toBeUndefined();
  });
  it('catches empty email in event request', () => {
    const data: EventRequest = { name: 'X', email: '', eventType: 'Boda', date: futureDate, guests: 10, message: 'ok' };
    expect(validateEventRequest(data).errors['email']).toContain('obligatorio');
  });
  it('catches invalid email in event request', () => {
    const data: EventRequest = { name: 'X', email: 'notvalid', eventType: 'Boda', date: futureDate, guests: 10, message: 'ok' };
    expect(validateEventRequest(data).errors['email']).toContain('válido');
  });
  it('catches missing date in event request', () => {
    const data: EventRequest = { name: 'X', email: 'a@b.com', eventType: 'Boda', date: '', guests: 10, message: 'ok' };
    expect(validateEventRequest(data).errors['date']).toContain('obligatoria');
  });
});
