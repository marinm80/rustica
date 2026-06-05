import { qs, qsa, on } from '../lib/dom.js';
import { scrollToAnchor, getNavbarHeight } from '../lib/smooth-scroll.js';

const SCROLL_THRESHOLD = 60;

interface BootstrapStatic {
  Collapse: new (el: Element) => { hide(): void };
}

declare global {
  interface Window {
    bootstrap?: BootstrapStatic;
  }
}

export function initNavbar(): void {
  const navbar = qs<HTMLElement>('#navbar');
  if (!navbar) return;

  // Scroll: transparente → sólida
  function updateNavbarState(): void {
    if (window.scrollY > SCROLL_THRESHOLD) {
      navbar!.classList.add('navbar-solid');
      navbar!.classList.remove('navbar-transparent');
    } else {
      navbar!.classList.remove('navbar-solid');
      navbar!.classList.add('navbar-transparent');
    }
  }

  updateNavbarState();
  on(window, 'scroll', updateNavbarState, { passive: true });

  // Smooth scroll en todos los enlaces de ancla
  qsa<HTMLAnchorElement>('a[href^="#"]').forEach(link => {
    on(link, 'click', (e: MouseEvent) => {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;
      e.preventDefault();
      const offset = getNavbarHeight();
      scrollToAnchor(href, offset);

      // Cierra el menú móvil si está abierto
      const collapse = qs<HTMLElement>('#navMenu');
      if (collapse && collapse.classList.contains('show')) {
        if (window.bootstrap) {
          new window.bootstrap.Collapse(collapse).hide();
        }
      }
    });
  });
}
