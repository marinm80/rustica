import { qsa, on } from '../lib/dom.js';
import { openLightbox } from './lightbox.js';

export function initGallery(): void {
  // Delegación de eventos: captura clicks en .gallery-item de ambas pestañas
  const galleryItems = qsa<HTMLButtonElement>('.gallery-item');

  galleryItems.forEach(item => {
    on(item, 'click', () => {
      const src = item.getAttribute('data-lightbox-src') ?? '';
      const alt = item.getAttribute('data-lightbox-alt') ?? '';
      if (src) openLightbox(src, alt);
    });

    // Accesibilidad: también responde a Enter/Espacio (el elemento ya es <button>)
    on(item, 'keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const src = item.getAttribute('data-lightbox-src') ?? '';
        const alt = item.getAttribute('data-lightbox-alt') ?? '';
        if (src) openLightbox(src, alt);
      }
    });
  });
}

// Exporta para tests
export function getVisibleTabItems(tabPaneId: string): HTMLButtonElement[] {
  const pane = document.getElementById(tabPaneId);
  if (!pane) return [];
  return qsa<HTMLButtonElement>('.gallery-item', pane);
}
