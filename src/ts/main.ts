import { initNavbar } from './modules/navbar.js';
import { initLightbox } from './modules/lightbox.js';
import { initGallery } from './modules/gallery.js';
import { initReservation } from './modules/reservation.js';
import { initEventsForm } from './modules/events-form.js';

function init(): void {
  initNavbar();
  initLightbox();
  initGallery();
  initReservation();
  initEventsForm();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
