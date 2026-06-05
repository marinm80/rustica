export function qs<T extends Element = Element>(
  selector: string,
  parent: Document | Element = document
): T | null {
  return parent.querySelector<T>(selector);
}

export function qsa<T extends Element = Element>(
  selector: string,
  parent: Document | Element = document
): T[] {
  return Array.from(parent.querySelectorAll<T>(selector));
}

export function on<K extends keyof HTMLElementEventMap>(
  el: HTMLElement | Document | Window,
  event: K,
  handler: (e: HTMLElementEventMap[K]) => void,
  options?: boolean | AddEventListenerOptions
): void {
  el.addEventListener(event as string, handler as EventListener, options);
}

export function setError(fieldEl: HTMLElement, message: string): void {
  fieldEl.classList.add('is-invalid');
  fieldEl.classList.remove('is-valid');
  const feedback = fieldEl.parentElement?.querySelector('.invalid-feedback');
  if (feedback) feedback.textContent = message;
}

export function clearError(fieldEl: HTMLElement): void {
  fieldEl.classList.remove('is-invalid');
  fieldEl.classList.add('is-valid');
}

export function clearAllErrors(formEl: HTMLFormElement): void {
  formEl.querySelectorAll('.is-invalid, .is-valid').forEach(el => {
    el.classList.remove('is-invalid', 'is-valid');
  });
}

export function showAlert(
  containerEl: HTMLElement,
  message: string,
  type: 'success' | 'danger'
): void {
  containerEl.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Cerrar"></button>
    </div>
  `;
}
