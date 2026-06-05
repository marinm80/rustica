import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getVisibleTabItems, initGallery } from '../../src/ts/modules/gallery.js';

// Mock lightbox module
vi.mock('../../src/ts/modules/lightbox.js', () => ({
  openLightbox: vi.fn(),
  initLightbox: vi.fn(),
}));

import { openLightbox } from '../../src/ts/modules/lightbox.js';

function buildGalleryDOM(): void {
  document.body.innerHTML = `
    <div class="tab-content">
      <div class="tab-pane show active" id="pane-restaurante">
        <div class="gallery-grid">
          <button class="gallery-item"
            data-lightbox-src="img/salon.jpg"
            data-lightbox-alt="Salón">
            <img class="gallery-img" src="img/salon.jpg" alt="Salón">
          </button>
          <button class="gallery-item"
            data-lightbox-src="img/terraza.jpg"
            data-lightbox-alt="Terraza">
            <img class="gallery-img" src="img/terraza.jpg" alt="Terraza">
          </button>
        </div>
      </div>
      <div class="tab-pane" id="pane-platos">
        <div class="gallery-grid">
          <button class="gallery-item"
            data-lightbox-src="img/plato.jpg"
            data-lightbox-alt="Plato">
            <img class="gallery-img" src="img/plato.jpg" alt="Plato">
          </button>
        </div>
      </div>
    </div>
  `;
}

describe('getVisibleTabItems', () => {
  beforeEach(buildGalleryDOM);

  it('returns items from pane-restaurante', () => {
    const items = getVisibleTabItems('pane-restaurante');
    expect(items).toHaveLength(2);
  });

  it('returns items from pane-platos', () => {
    const items = getVisibleTabItems('pane-platos');
    expect(items).toHaveLength(1);
  });

  it('returns empty array for non-existent pane', () => {
    expect(getVisibleTabItems('no-existe')).toHaveLength(0);
  });
});

describe('initGallery — click opens lightbox', () => {
  beforeEach(() => {
    buildGalleryDOM();
    vi.clearAllMocks();
    initGallery();
  });

  it('calls openLightbox with correct src and alt on click', () => {
    const first = document.querySelector<HTMLButtonElement>('.gallery-item')!;
    first.click();
    expect(openLightbox).toHaveBeenCalledWith('img/salon.jpg', 'Salón');
  });

  it('does not call openLightbox when src is empty', () => {
    const btn = document.querySelector<HTMLButtonElement>('.gallery-item')!;
    btn.removeAttribute('data-lightbox-src');
    btn.click();
    expect(openLightbox).not.toHaveBeenCalled();
  });

  it('calls openLightbox on Enter keydown', () => {
    const first = document.querySelector<HTMLButtonElement>('.gallery-item')!;
    const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
    first.dispatchEvent(event);
    expect(openLightbox).toHaveBeenCalledWith('img/salon.jpg', 'Salón');
  });

  it('calls openLightbox on Space keydown', () => {
    const first = document.querySelector<HTMLButtonElement>('.gallery-item')!;
    const event = new KeyboardEvent('keydown', { key: ' ', bubbles: true });
    first.dispatchEvent(event);
    expect(openLightbox).toHaveBeenCalledWith('img/salon.jpg', 'Salón');
  });
});
