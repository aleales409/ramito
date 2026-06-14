/**
 * storage.ts — Utilidad centralizada de Supabase Storage para Ramito Fut Show
 *
 * Buckets:
 *  - media     (público): canchas/, cantina/, banners/, avatars/
 *  - receipts  (público): bookings/
 */

import { supabase, isSupabaseConfigured } from './supabase';

// ─── Nombres de Buckets ────────────────────────────────────────────────────────
export const BUCKET_MEDIA    = 'media';
export const BUCKET_RECEIPTS = 'receipts';

// ─── Paths de carpetas ────────────────────────────────────────────────────────
export const FOLDER_CANCHAS  = 'canchas';
export const FOLDER_CANTINA  = 'cantina';
export const FOLDER_BANNERS  = 'banners';
export const FOLDER_AVATARS  = 'avatars';
export const FOLDER_BOOKINGS = 'bookings';

// ─── Helpers de URL pública ───────────────────────────────────────────────────

/** Devuelve la URL pública de un archivo en el bucket media */
export function getMediaUrl(folder: string, filename: string): string {
  if (!isSupabaseConfigured) return '';
  const { data } = supabase.storage
    .from(BUCKET_MEDIA)
    .getPublicUrl(`${folder}/${filename}`);
  return data?.publicUrl ?? '';
}

/** Devuelve la URL pública de un recibo de pago */
export function getReceiptUrl(filename: string): string {
  if (!isSupabaseConfigured) return '';
  const { data } = supabase.storage
    .from(BUCKET_RECEIPTS)
    .getPublicUrl(`${FOLDER_BOOKINGS}/${filename}`);
  return data?.publicUrl ?? '';
}

/** Devuelve la URL pública de la foto de una cancha */
export function getCanchaUrl(filename: string): string {
  return getMediaUrl(FOLDER_CANCHAS, filename);
}

/** Devuelve la URL pública de la foto de un producto de cantina */
export function getCantinaItemUrl(filename: string): string {
  return getMediaUrl(FOLDER_CANTINA, filename);
}

/** Devuelve la URL pública de un banner del complejo */
export function getBannerUrl(filename: string): string {
  return getMediaUrl(FOLDER_BANNERS, filename);
}

/** Devuelve la URL pública de la foto de perfil de un usuario */
export function getAvatarUrl(userId: string, ext = 'jpg'): string {
  return getMediaUrl(FOLDER_AVATARS, `${userId}.${ext}`);
}

// ─── Helpers de Upload ────────────────────────────────────────────────────────

export interface UploadResult {
  url: string | null;
  error: string | null;
}

/**
 * Sube una foto de cancha al storage.
 * @param courtId  ID de la cancha (ej: '1', '2')
 * @param file     Archivo de imagen
 */
export async function uploadCanchaPhoto(courtId: string, file: File): Promise<UploadResult> {
  return uploadToMedia(FOLDER_CANCHAS, `cancha-${courtId}.${getExt(file)}`, file);
}

/**
 * Sube una foto de producto de cantina.
 * @param itemId  ID del producto
 * @param file    Archivo de imagen
 */
export async function uploadCantinaItemPhoto(itemId: string, file: File): Promise<UploadResult> {
  return uploadToMedia(FOLDER_CANTINA, `item-${itemId}.${getExt(file)}`, file);
}

/**
 * Sube una foto de avatar de usuario.
 * @param userId  ID del usuario
 * @param file    Archivo de imagen
 */
export async function uploadAvatar(userId: string, file: File): Promise<UploadResult> {
  return uploadToMedia(FOLDER_AVATARS, `${userId}.${getExt(file)}`, file);
}

/**
 * Sube un banner del complejo.
 * @param name  Nombre del banner (ej: 'hero', 'promo-verano')
 * @param file  Archivo de imagen
 */
export async function uploadBanner(name: string, file: File): Promise<UploadResult> {
  return uploadToMedia(FOLDER_BANNERS, `${name}.${getExt(file)}`, file);
}

/**
 * Sube un comprobante de pago de reserva.
 * @param bookingId  ID de la reserva
 * @param file       Archivo (imagen o PDF)
 */
export async function uploadReceipt(bookingId: string, file: File): Promise<UploadResult> {
  if (!isSupabaseConfigured) {
    return { url: null, error: 'Supabase no configurado' };
  }

  const path = `${FOLDER_BOOKINGS}/${bookingId}_${Date.now()}.${getExt(file)}`;

  const { error } = await supabase.storage
    .from(BUCKET_RECEIPTS)
    .upload(path, file, { upsert: true, contentType: file.type });

  if (error) {
    console.error('❌ Error subiendo comprobante:', error);
    return { url: null, error: error.message };
  }

  const { data } = supabase.storage.from(BUCKET_RECEIPTS).getPublicUrl(path);
  const url = data?.publicUrl ?? null;
  console.log('✅ Comprobante subido:', url);
  return { url, error: null };
}

// ─── Interno ──────────────────────────────────────────────────────────────────

async function uploadToMedia(folder: string, filename: string, file: File): Promise<UploadResult> {
  if (!isSupabaseConfigured) {
    return { url: null, error: 'Supabase no configurado' };
  }

  const path = `${folder}/${filename}`;

  const { error } = await supabase.storage
    .from(BUCKET_MEDIA)
    .upload(path, file, { upsert: true, contentType: file.type });

  if (error) {
    console.error(`❌ Error subiendo a media/${path}:`, error);
    return { url: null, error: error.message };
  }

  const { data } = supabase.storage.from(BUCKET_MEDIA).getPublicUrl(path);
  const url = data?.publicUrl ?? null;
  console.log(`✅ Archivo subido: media/${path} →`, url);
  return { url, error: null };
}

function getExt(file: File): string {
  const parts = file.name.split('.');
  return parts.length > 1 ? parts.pop()!.toLowerCase() : 'jpg';
}
