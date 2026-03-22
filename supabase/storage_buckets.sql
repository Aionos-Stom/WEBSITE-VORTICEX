-- ============================================================
-- STORAGE BUCKETS — Ejecutar en Supabase SQL Editor
-- ============================================================
-- uploads  → todas las imágenes del portfolio
-- arcpdf   → todos los archivos PDF / certificados
-- ============================================================

-- 1. Crear buckets públicos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  (
    'uploads',
    'uploads',
    true,
    52428800, -- 50 MB máximo
    ARRAY['image/jpeg','image/jpg','image/png','image/webp','image/gif','image/avif','image/svg+xml']
  ),
  (
    'arcpdf',
    'arcpdf',
    true,
    104857600, -- 100 MB máximo
    ARRAY['application/pdf']
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 2. RLS Policies — bucket "uploads"
-- ============================================================

-- Lectura pública
CREATE POLICY "uploads: public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'uploads');

-- Solo autenticados pueden subir
CREATE POLICY "uploads: auth insert"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'uploads' AND auth.role() = 'authenticated');

-- Solo autenticados pueden actualizar/reemplazar
CREATE POLICY "uploads: auth update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'uploads' AND auth.role() = 'authenticated');

-- Solo autenticados pueden eliminar
CREATE POLICY "uploads: auth delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'uploads' AND auth.role() = 'authenticated');

-- ============================================================
-- 3. RLS Policies — bucket "arcpdf"
-- ============================================================

CREATE POLICY "arcpdf: public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'arcpdf');

CREATE POLICY "arcpdf: auth insert"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'arcpdf' AND auth.role() = 'authenticated');

CREATE POLICY "arcpdf: auth update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'arcpdf' AND auth.role() = 'authenticated');

CREATE POLICY "arcpdf: auth delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'arcpdf' AND auth.role() = 'authenticated');

-- ============================================================
-- Estructura de carpetas (se crean automáticamente al subir):
--
-- uploads/
--   logros/          ← imágenes de logros/achievements
--   certificados/    ← imágenes de certificados
--   certificados/thumbs/  ← thumbnails de certificados
--   general/         ← imágenes generales
--
-- arcpdf/
--   certificados/    ← PDFs de certificados
--   general/         ← PDFs generales
-- ============================================================
