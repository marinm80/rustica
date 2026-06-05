export interface Dish {
  id: string;
  name: string;
  description: string;
  price: string;
  badge?: 'Especialidad' | 'Recomendado';
  image: string;
}

export interface GalleryImage {
  src: string;
  alt: string;
}

export interface GalleryData {
  restaurante: GalleryImage[];
  platos: GalleryImage[];
}

export interface ReservationData {
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  partySize: number;
}

export interface EventRequest {
  name: string;
  email: string;
  phone?: string;
  eventType: 'Boda' | 'Cumpleaños' | 'Corporativo' | 'Otro';
  date: string;
  guests: number;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export interface SiteContent {
  hero: {
    title: string;
    subtitle: string;
    cta: string;
  };
  menu: Dish[];
  gallery: GalleryData;
  contact: {
    address: string;
    phone: string;
    email: string;
    hours: string;
  };
  social: {
    instagram: string;
    facebook: string;
    tripadvisor: string;
  };
}

export const PARTY_SIZE_MIN = 1;
export const PARTY_SIZE_MAX = 30;
export const EVENT_GUESTS_MIN = 1;
export const EVENT_GUESTS_MAX = 300;
