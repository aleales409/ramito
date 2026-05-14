export interface Court {
  id: string;
  name: string;
  location: string;
  price: number;
  rating: number;
  type: string;
  features: string[];
  imageUrl: string;
}

export interface Slot {
  id: string;
  time: string;
  price: number;
  status: 'available' | 'booked' | 'reserved';
}

export interface Booking {
  id: string;
  courtName: string;
  date: string;
  time: string;
  type: string;
  price: number;
  imageUrl: string;
  status: 'pending_approval' | 'pending_payment' | 'upcoming' | 'completed' | 'cancelled';
  paymentMethod?: 'transfer' | 'cash';
}

export type UserRole = 'player' | 'admin_elite' | 'admin_vip';

export interface User {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  memberSince: string;
}

export interface License {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  lastUsed?: string;
}
