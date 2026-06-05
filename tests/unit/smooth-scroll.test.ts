import { describe, it, expect, beforeEach, vi } from 'vitest';
import { scrollToAnchor, getNavbarHeight } from '../../src/ts/lib/smooth-scroll.js';

describe('scrollToAnchor', () => {
  beforeEach(() => {
    document.body.innerHTML = '<section id="reservas"></section>';
    window.scrollTo = vi.fn();
    Object.defineProperty(Element.prototype, 'getBoundingClientRect', {
      value: () => ({ top: 500, left: 0, right: 0, bottom: 0, width: 0, height: 0 }),
      configurable: true,
    });
    Object.defineProperty(window, 'scrollY', { value: 100, configurable: true });
  });

  it('calls window.scrollTo with smooth behavior', () => {
    scrollToAnchor('#reservas', 72);
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 528, behavior: 'smooth' });
  });

  it('does nothing for non-existent anchor', () => {
    scrollToAnchor('#no-existe', 72);
    expect(window.scrollTo).not.toHaveBeenCalled();
  });
});

describe('getNavbarHeight', () => {
  it('returns 72 when no navbar found', () => {
    document.body.innerHTML = '';
    expect(getNavbarHeight()).toBe(72);
  });

  it('returns navbar offsetHeight when present', () => {
    document.body.innerHTML = '<nav class="navbar"></nav>';
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
      value: 80,
      configurable: true,
    });
    expect(getNavbarHeight()).toBe(80);
  });
});
