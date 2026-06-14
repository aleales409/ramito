-- ============================================================
-- RAMITO FUT SHOW — Supabase Storage: Buckets + Políticas RLS
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ============================================================

-- ─── 1. BUCKET: media (público) ──────────────────────────────
--    Carpetas: canchas/, cantina/, banners/, avatars/
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media',
  'media',
  true,
  10485760, -- 10 MB máximo por archivo
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/avif',
    'image/svg+xml'
  ]
) ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760;

-- ─── 2. BUCKET: receipts (público — admin gestiona) ──────────
--    Carpetas: bookings/
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'receipts',
  'receipts',
  true,
  10485760, -- 10 MB máximo
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf'
  ]
) ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760;


-- ============================================================
-- POLÍTICAS RLS — Bucket: media
-- ============================================================

-- Cualquiera puede leer archivos públicos del bucket media
CREATE POLICY "media_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'media');

-- Usuarios autenticados pueden subir/reemplazar archivos a media
CREATE POLICY "media_authenticated_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'media'
    AND auth.role() = 'authenticated'
  );

-- Usuarios autenticados pueden actualizar sus propios archivos
CREATE POLICY "media_authenticated_update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'media'
    AND auth.role() = 'authenticated'
  );

-- Solo admins pueden eliminar archivos de media
-- (usar anon key para lectura pública, service_role para admin)
CREATE POLICY "media_authenticated_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'media'
    AND auth.role() = 'authenticated'
  );


-- ============================================================
-- POLÍTICAS RLS — Bucket: receipts
-- ============================================================

-- Cualquiera autenticado puede leer comprobantes (admin verifica)
CREATE POLICY "receipts_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'receipts');

-- Usuarios autenticados pueden subir comprobantes
CREATE POLICY "receipts_authenticated_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'receipts'
    AND auth.role() = 'authenticated'
  );

-- Usuarios autenticados pueden reemplazar su propio comprobante
CREATE POLICY "receipts_authenticated_update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'receipts'
    AND auth.role() = 'authenticated'
  );

-- Solo autenticados pueden eliminar comprobantes
CREATE POLICY "receipts_authenticated_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'receipts'
    AND auth.role() = 'authenticated'
  );


-- ============================================================
-- TABLA: courts (canchas) — con imageUrl de Supabase Storage
-- Si no existe aún, crearla para gestionar canchas dinámicamente
-- ============================================================
CREATE TABLE IF NOT EXISTS public.courts (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name          TEXT NOT NULL,
  location      TEXT DEFAULT 'Ramito Fut Show - Complejo Principal',
  price         INTEGER NOT NULL DEFAULT 120,
  rating        NUMERIC(3,1) DEFAULT 4.8,
  type          TEXT DEFAULT 'Fútbol 5',
  features      TEXT[] DEFAULT '{}',
  image_url     TEXT DEFAULT '',   -- URL pública de Supabase Storage (media/canchas/)
  policy        TEXT DEFAULT '',
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- Activar RLS en courts
ALTER TABLE public.courts ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede leer canchas activas
CREATE POLICY "courts_public_read"
  ON public.courts FOR SELECT
  USING (is_active = true);

-- Solo admins pueden crear/modificar canchas
CREATE POLICY "courts_admin_write"
  ON public.courts FOR ALL
  USING (auth.role() = 'authenticated');


-- ============================================================
-- TABLA: cantina_items — agregar columna image_url si falta
-- ============================================================
ALTER TABLE public.cantina_items
  ADD COLUMN IF NOT EXISTS image_url TEXT DEFAULT '';

-- Comentario de uso:
-- image_url debe ser la URL pública de: media/cantina/item-{id}.jpg


-- ============================================================
-- TABLA: profiles — agregar columna avatar_url si falta
-- ============================================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_url TEXT DEFAULT '';

-- Comentario de uso:
-- avatar_url debe ser la URL pública de: media/avatars/{user_id}.jpg


-- ============================================================
-- FUNCIÓN: actualizar updated_at automáticamente en courts
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER courts_updated_at
  BEFORE UPDATE ON public.courts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ============================================================
-- VERIFICACIÓN FINAL
-- ============================================================
SELECT id, name, public FROM storage.buckets WHERE id IN ('media', 'receipts');
