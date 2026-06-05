import type { SiteContent } from '../types/index.js';

export const PARTY_SIZE_MIN = 1;
export const PARTY_SIZE_MAX = 30;

function generateTimeSlots(startHour: number, endHour: number, stepMinutes: number): string[] {
  const slots: string[] = [];
  for (let h = startHour; h < endHour; h++) {
    for (let m = 0; m < 60; m += stepMinutes) {
      const hh = String(h).padStart(2, '0');
      const mm = String(m).padStart(2, '0');
      slots.push(`${hh}:${mm}`);
    }
  }
  return slots;
}

export const TIME_SLOTS: string[] = generateTimeSlots(12, 24, 30);
// Genera: ['12:00','12:30','13:00',...,'23:30'] — 24 franjas

export const SITE_CONTENT: SiteContent = {
  hero: {
    title: 'Sabores de nuestra tierra',
    subtitle:
      'La tradición y la calidez de la cocina latinoamericana al fuego de la leña.',
    cta: 'Reserva una Mesa',
  },
  menu: [
    {
      id: 'lomo-saltado',
      name: 'Lomo Saltado',
      description: 'Tiras de res al wok con cebolla, tomate, ají amarillo, servido con papas fritas y arroz.',
      price: '22,00 €',
      badge: 'Especialidad',
      image: 'assets/img/menu/cordero.jpg',
    },
    {
      id: 'ceviche',
      name: 'Ceviche Clásico',
      description: 'Pescado blanco marinado en leche de tigre con cebolla morada, camote y choclo.',
      price: '15,00 €',
      badge: 'Recomendado',
      image: 'assets/img/menu/risotto.jpg',
    },
    {
      id: 'arepa',
      name: 'Arepa Reina Pepiada',
      description: 'Arepa de maíz rellena de ensalada de pollo desmechado y aguacate cremoso.',
      price: '9,00 €',
      badge: 'Recomendado',
      image: 'assets/img/menu/huerto.jpg',
    },
    {
      id: 'tres-leches',
      name: 'Tres Leches Tres Sabores',
      description: 'Bizcocho tradicional bañado en tres leches con un toque de canela y merengue.',
      price: '8,50 €',
      image: 'assets/img/menu/tarta-manzana.jpg',
    },
  ],
  gallery: {
    restaurante: [
      { src: 'assets/img/gallery/salon-01.jpg', alt: 'Salón principal de La Rústica Mesa' },
      { src: 'assets/img/gallery/terraza-02.jpg', alt: 'Terraza exterior de La Rústica Mesa' },
      { src: 'assets/img/gallery/barra-03.jpg', alt: 'Barra y coctelería' },
      { src: 'assets/img/gallery/chimenea-04.jpg', alt: 'Rincón acogedor' },
    ],
    platos: [
      { src: 'assets/img/gallery/plato-01.jpg', alt: 'Lomo Saltado' },
      { src: 'assets/img/gallery/plato-02.jpg', alt: 'Ceviche Clásico' },
      { src: 'assets/img/gallery/plato-03.jpg', alt: 'Arepa Reina Pepiada' },
      { src: 'assets/img/gallery/plato-04.jpg', alt: 'Tres Leches Tres Sabores' },
    ],
  },
  contact: {
    address: 'Calle de la Tradición 123, 28010 Madrid, España',
    phone: '+34 912 345 678',
    email: 'contacto@larusticamesa.com',
    hours: 'Mar–Dom: 13:00–23:30 · Lunes cerrado',
  },
  social: {
    instagram: '#',
    facebook: '#',
    tripadvisor: '#',
  },
};
