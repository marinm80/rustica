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
    title: 'Sabores que saben a casa',
    subtitle:
      'Producto de temporada, fuego lento y la calidez del campo en cada plato. Reserva tu mesa y déjate llevar.',
    cta: 'Reserva una Mesa',
  },
  menu: [
    {
      id: 'cordero',
      name: 'Cordero al horno de leña',
      description: 'Paletilla cocida a fuego lento con romero, miel y patatas confitadas.',
      price: '24,50 €',
      badge: 'Especialidad',
      image: 'assets/img/menu/cordero.jpg',
    },
    {
      id: 'risotto',
      name: 'Risotto de setas de temporada',
      description: 'Arroz cremoso con boletus, parmesano curado y aceite de trufa.',
      price: '18,00 €',
      badge: 'Recomendado',
      image: 'assets/img/menu/risotto.jpg',
    },
    {
      id: 'huerto',
      name: 'Huerto a la brasa',
      description: 'Verduras de nuestro huerto asadas con vinagreta de hierbas y queso de cabra.',
      price: '15,50 €',
      badge: 'Recomendado',
      image: 'assets/img/menu/huerto.jpg',
    },
    {
      id: 'tarta',
      name: 'Tarta rústica de manzana',
      description: 'Masa quebrada artesanal, manzana caramelizada y helado de vainilla.',
      price: '8,50 €',
      image: 'assets/img/menu/tarta-manzana.jpg',
    },
  ],
  gallery: {
    restaurante: [
      { src: 'assets/img/gallery/salon-01.jpg', alt: 'Salón principal de Rústica' },
      { src: 'assets/img/gallery/terraza-02.jpg', alt: 'Terraza exterior' },
      { src: 'assets/img/gallery/barra-03.jpg', alt: 'Barra y bodega' },
      { src: 'assets/img/gallery/chimenea-04.jpg', alt: 'Rincón de la chimenea' },
    ],
    platos: [
      { src: 'assets/img/gallery/plato-01.jpg', alt: 'Cordero al horno de leña' },
      { src: 'assets/img/gallery/plato-02.jpg', alt: 'Risotto de setas' },
      { src: 'assets/img/gallery/plato-03.jpg', alt: 'Verduras a la brasa' },
      { src: 'assets/img/gallery/plato-04.jpg', alt: 'Tarta rústica de manzana' },
    ],
  },
  contact: {
    address: 'Camino del Molino 12, 28010 Madrid, España',
    phone: '+34 910 123 456',
    email: 'hola@rustica.example',
    hours: 'Mar–Dom: 13:00–16:00 y 20:00–23:30 · Lunes cerrado',
  },
  social: {
    instagram: '#',
    facebook: '#',
    tripadvisor: '#',
  },
};
