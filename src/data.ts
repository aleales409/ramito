import { Court, Slot, Booking } from './types';
import { getCanchaUrl } from './lib/storage';

// ─── Fallbacks de Unsplash (usados si aún no hay foto en Supabase Storage) ───
const FALLBACK_CANCHA_1 = 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800&auto=format&fit=crop';
const FALLBACK_CANCHA_2 = 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?q=80&w=800&auto=format&fit=crop';

/**
 * Resuelve la imagen de una cancha:
 * 1. Si hay URL en Supabase Storage → la usa
 * 2. Si no → usa la imagen hardcoded (Unsplash)
 */
export function resolveCourtImage(courtId: string, fallbackUrl: string): string {
  const storageUrl = getCanchaUrl(`cancha-${courtId}.jpg`);
  return storageUrl || fallbackUrl;
}

export const COURTS: Court[] = [
  {
    id: '1',
    name: 'Cancha con Césped',
    location: 'Ramito Fut Show - Complejo Principal',
    price: 120,
    rating: 4.9,
    type: 'Fútbol 5',
    features: ['Césped Sintético Pro', 'Techado', 'Iluminación LED'],
    imageUrl: FALLBACK_CANCHA_1,  // → Reemplazar subiendo cancha-1.jpg al bucket media/canchas/
    policy: 'CANCELACIÓN GRATUITA HASTA 24 HORAS ANTES DEL INICIO. EL USO DE CHIMPUNES CON COCOS GRANDES ESTÁ PROHIBIDO POR CUIDADO DEL CÉSPED.'
  },
  {
    id: '2',
    name: 'Cancha de Tierra',
    location: 'Ramito Fut Show - Complejo Principal',
    price: 100,
    rating: 4.7,
    type: 'Fútbol 5',
    features: ['Tierra Compactada', 'Al aire libre', 'Graderías'],
    imageUrl: FALLBACK_CANCHA_2,  // → Reemplazar subiendo cancha-2.jpg al bucket media/canchas/
    policy: 'EL USO DE CALZADO CON TAPONES O COCÓS (BOTINES) ESTÁ ABSOLUTAMENTE PROHIBIDO POR CUESTIONES DE SEGURIDAD Y CUIDADO DE LA LOSA. SE EXIGE EL USO EXCLUSIVO DE ZAPATILLAS DE SUELA LISA DE GOMA (SUELA FLAT/FUTSAL).'
  }
];

export const SLOTS: Slot[] = [
  { id: 's2', time: '20:00', price: 120, status: 'available', isFixed: true },
  { id: 's3', time: '21:00', price: 120, status: 'available' },
  { id: 's4', time: '22:00', price: 120, status: 'booked' },
];

export const MY_BOOKINGS: Booking[] = [
  {
    id: 'b1',
    courtName: 'Cancha 1 - "El Maracaná"',
    date: 'Lunes 18 de Mayo',
    time: '20:00 - 21:00',
    type: 'Fútbol 5',
    price: 125,
    status: 'upcoming',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDI2rR_zidKFtJFxsXgf-iBEkAl2R-EfWM9xwF87LMnUecRPj-EU8uVrmO5z29sIThB3bNFTDI-aoGQDn_93BuqWLdS-srGtl1K1actD1HXlEMP1Nw6SPpHHFgqu2NHg_32Ko675tdbIxjyUU8a-aB0jpjGbFu1Dwj6su5LFlHhxj73Yr-qS3Wf8fvBBdB9RVAi870qod4DA7yyVuVB-f9XPA7cNpK54mQfrUMcZyUIP58WddmJCOdL0q-qlbIediyoUbNPc2dAyQId'
  },
  {
    id: 'b2',
    courtName: 'Cancha 2 - "La Bombonera"',
    date: 'Miércoles 20 de Mayo',
    time: '21:00 - 22:00',
    type: 'Fútbol 5',
    price: 120,
    status: 'pending_approval',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB5cEUmZgCOXvrf74HEPl1SNc4yCHnSrK6_IuE03MzwP5UEoxkk9KTNAPFQBVR3w3i7d-BhFO5YSjhitaSsb8Cy2cIwl3dxLc9w6k8P40wrs1jKMvUq8dUCaHnJ25doHZsLCHuafJmRZPPFBfcc6jsD9AY3AS_-0x_SIe53mKZ4iJtG2WEzVBH8T3J3C8fTRH2Kc9dVmg2W9i_Zoss8ReQdSiNtkVg8AfFl9unxhvOfS3b4iAG7ug2371PN2-S6M7eUYlZCxO4Lx_Ur'
  },
  {
    id: 'b3',
    courtName: 'Cancha 1 - "El Monumental"',
    date: 'Viernes 22 de Mayo',
    time: '20:00 - 21:00',
    type: 'Fútbol 5',
    price: 125,
    status: 'pending_payment',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDI2rR_zidKFtJFxsXgf-iBEkAl2R-EfWM9xwF87LMnUecRPj-EU8uVrmO5z29sIThB3bNFTDI-aoGQDn_93BuqWLdS-srGtl1K1actD1HXlEMP1Nw6SPpHHFgqu2NHg_32Ko675tdbIxjyUU8a-aB0jpjGbFu1Dwj6su5LFlHhxj73Yr-qS3Wf8fvBBdB9RVAi870qod4DA7yyVuVB-f9XPA7cNpK54mQfrUMcZyUIP58WddmJCOdL0q-qlbIediyoUbNPc2dAyQId'
  }
];
