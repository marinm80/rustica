import { qs } from '../lib/dom.js';

interface BootstrapModal {
  show(): void;
  hide(): void;
}

declare const bootstrap: {
  Modal: new (el: Element, options?: object) => BootstrapModal;
};

let modalInstance: BootstrapModal | null = null;

export function initLightbox(): void {
  const modalEl = qs<HTMLElement>('#galleryModal');
  if (!modalEl) return;
  modalInstance = new bootstrap.Modal(modalEl);
}

export function openLightbox(src: string, alt: string): void {
  const img = qs<HTMLImageElement>('#lightboxImg');
  if (!img || !modalInstance) return;
  img.src = src;
  img.alt = alt;
  modalInstance.show();
}
