-- ============================================================
-- NUEVAS TABLAS — Ejecutar en Supabase SQL Editor
-- ============================================================

-- 1. Galería de diseño
CREATE TABLE IF NOT EXISTS gallery (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  category     TEXT DEFAULT 'UI/UX',       -- UI/UX, Photoshop, Multimedia, 3D, Branding, Motion
  description  TEXT,
  image_url    TEXT,
  tools        TEXT,                        -- comma-separated: "Figma, Photoshop, After Effects"
  featured     BOOLEAN DEFAULT false,
  sort_order   INT DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Log de actividad (para barra de crecimiento)
CREATE TABLE IF NOT EXISTS activity_log (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date         DATE NOT NULL DEFAULT CURRENT_DATE,
  type         TEXT NOT NULL DEFAULT 'estudio',  -- certificado|proyecto|skill|logro|estudio|freelance
  title        TEXT NOT NULL,
  description  TEXT,
  xp_gained    INT DEFAULT 50,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- RLS Policies
-- ============================================================

ALTER TABLE gallery      ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Lectura pública
CREATE POLICY "gallery: public read"      ON gallery      FOR SELECT USING (true);
CREATE POLICY "activity_log: public read" ON activity_log FOR SELECT USING (true);

-- Solo autenticados pueden modificar
CREATE POLICY "gallery: auth all"      ON gallery      FOR ALL  USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "activity_log: auth all" ON activity_log FOR ALL  USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- ============================================================
-- Nuevas keys en site_config para Launch Mode
-- INSERT solo si no existen
-- ============================================================
INSERT INTO site_config (key, value) VALUES
  ('launch_mode',     'false'),
  ('launch_date',     '2026-12-01'),
  ('launch_title',    'Sistema en Construcción'),
  ('launch_subtitle', 'Regresando con algo épico')
ON CONFLICT (key) DO NOTHING;
