import { describe, it, expect, beforeEach, vi } from 'vitest';
import { initEventsForm } from '../../src/ts/modules/events-form.js';

const futureDate = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

function buildEventsDOM(): void {
  document.body.innerHTML = `
    <form id="eventsForm" novalidate>
      <input id="evt-name" name="name" value="Carlos">
      <div class="invalid-feedback"></div>
      <input id="evt-email" name="email" value="carlos@example.com">
      <div class="invalid-feedback"></div>
      <input id="evt-phone" name="phone" value="">
      <div class="invalid-feedback"></div>
      <select id="evt-type" name="eventType"><option value="Boda" selected>Boda</option></select>
      <div class="invalid-feedback"></div>
      <input id="evt-date" name="date" value="${futureDate}">
      <div class="invalid-feedback"></div>
      <input id="evt-guests" name="guests" type="number" value="50">
      <div class="invalid-feedback"></div>
      <textarea id="evt-message" name="message">Quiero info sobre bodas.</textarea>
      <div class="invalid-feedback"></div>
      <div id="eventsAlert"></div>
      <button type="submit">Enviar</button>
    </form>
  `;
}

describe('initEventsForm — valid submission', () => {
  beforeEach(() => {
    buildEventsDOM();
    initEventsForm();
  });

  it('shows success alert on valid submit', () => {
    document.getElementById('eventsForm')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    const alert = document.getElementById('eventsAlert')!;
    expect(alert.innerHTML).toContain('Gracias');
    expect(alert.innerHTML).toContain('alert-success');
  });

  it('resets form after valid submit', () => {
    const form = document.getElementById('eventsForm') as HTMLFormElement;
    const resetSpy = vi.spyOn(form, 'reset');
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    expect(resetSpy).toHaveBeenCalledOnce();
  });
});

describe('initEventsForm — invalid submission', () => {
  beforeEach(() => {
    buildEventsDOM();
    initEventsForm();
    (document.getElementById('evt-message') as HTMLTextAreaElement).value = '';
    (document.getElementById('evt-guests') as HTMLInputElement).value = '0';
  });

  it('marks message as invalid when empty', () => {
    document.getElementById('eventsForm')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    expect(document.getElementById('evt-message')!.classList.contains('is-invalid')).toBe(true);
  });

  it('marks guests as invalid when 0', () => {
    document.getElementById('eventsForm')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    expect(document.getElementById('evt-guests')!.classList.contains('is-invalid')).toBe(true);
  });
});
