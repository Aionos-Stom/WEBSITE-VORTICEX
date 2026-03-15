-- ============================================================
-- Portfolio mellamobrau — Supabase Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PERFIL
-- ============================================================
CREATE TABLE IF NOT EXISTS public.perfil (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  alias TEXT NOT NULL DEFAULT 'mellamobrau',
  titulo TEXT NOT NULL,
  bio TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  github_url TEXT,
  linkedin_url TEXT,
  email TEXT,
  ubicacion TEXT,
  disponible BOOLEAN NOT NULL DEFAULT true,
  total_xp INTEGER NOT NULL DEFAULT 0,
  nivel INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- REGISTRO MENSUAL
-- ============================================================
CREATE TABLE IF NOT EXISTS public.registro_mensual (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mes TEXT NOT NULL,
  ano INTEGER NOT NULL,
  horas_estudio INTEGER NOT NULL DEFAULT 0,
  certs_completados INTEGER NOT NULL DEFAULT 0,
  proyectos_activos INTEGER NOT NULL DEFAULT 0,
  vulnerabilidades_encontradas INTEGER NOT NULL DEFAULT 0,
  nivel_xp INTEGER NOT NULL DEFAULT 0,
  notas TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(mes, ano)
);

-- ============================================================
-- ARSENAL TÉCNICO
-- ============================================================
CREATE TABLE IF NOT EXISTS public.arsenal_tecnico (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  categoria TEXT NOT NULL,
  nivel INTEGER NOT NULL DEFAULT 5 CHECK (nivel BETWEEN 1 AND 10),
  icono TEXT,
  color TEXT,
  descripcion TEXT,
  orden INTEGER NOT NULL DEFAULT 0,
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- MISIONES (proyectos)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.misiones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  estado TEXT NOT NULL DEFAULT 'PLANIFICADA' CHECK (estado IN ('COMPLETADA','EN_PROGRESO','PLANIFICADA')),
  tecnologias TEXT[] NOT NULL DEFAULT '{}',
  github_url TEXT,
  demo_url TEXT,
  imagen_url TEXT,
  fecha_inicio DATE,
  fecha_fin DATE,
  dificultad INTEGER NOT NULL DEFAULT 3 CHECK (dificultad BETWEEN 1 AND 5),
  orden INTEGER NOT NULL DEFAULT 0,
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- CERTIFICADOS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.certificados (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo TEXT NOT NULL,
  emisor TEXT NOT NULL,
  fecha_emision DATE NOT NULL,
  fecha_expiracion DATE,
  credencial_id TEXT,
  credencial_url TEXT,
  pdf_url TEXT,
  imagen_url TEXT,
  categoria TEXT NOT NULL DEFAULT 'Seguridad',
  orden INTEGER NOT NULL DEFAULT 0,
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- LOGROS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.logros (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  icono TEXT NOT NULL DEFAULT '🏅',
  tipo TEXT NOT NULL DEFAULT 'BADGE' CHECK (tipo IN ('BADGE','TROPHY','STAR','SHIELD')),
  fecha DATE NOT NULL,
  puntos_xp INTEGER NOT NULL DEFAULT 0,
  rareza TEXT NOT NULL DEFAULT 'COMUN' CHECK (rareza IN ('COMUN','RARO','EPICO','LEGENDARIO')),
  orden INTEGER NOT NULL DEFAULT 0,
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- OBJETIVOS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.objetivos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  progreso NUMERIC NOT NULL DEFAULT 0,
  meta NUMERIC NOT NULL DEFAULT 100,
  unidad TEXT NOT NULL DEFAULT '%',
  categoria TEXT NOT NULL DEFAULT 'Aprendizaje',
  fecha_limite DATE,
  completado BOOLEAN NOT NULL DEFAULT false,
  orden INTEGER NOT NULL DEFAULT 0,
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- UPDATED_AT TRIGGER (auto-update timestamps)
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['perfil','registro_mensual','arsenal_tecnico','misiones','certificados','logros','objetivos']
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS set_updated_at ON public.%I', t);
    EXECUTE format('CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION update_updated_at()', t);
  END LOOP;
END;
$$;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.perfil ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registro_mensual ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.arsenal_tecnico ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.misiones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.objetivos ENABLE ROW LEVEL SECURITY;

-- Public READ (portfolio is public)
CREATE POLICY "public_read_perfil" ON public.perfil FOR SELECT USING (true);
CREATE POLICY "public_read_registro" ON public.registro_mensual FOR SELECT USING (true);
CREATE POLICY "public_read_arsenal" ON public.arsenal_tecnico FOR SELECT USING (true);
CREATE POLICY "public_read_misiones" ON public.misiones FOR SELECT USING (true);
CREATE POLICY "public_read_certificados" ON public.certificados FOR SELECT USING (true);
CREATE POLICY "public_read_logros" ON public.logros FOR SELECT USING (true);
CREATE POLICY "public_read_objetivos" ON public.objetivos FOR SELECT USING (true);

-- Authenticated WRITE (admin only)
CREATE POLICY "auth_write_perfil" ON public.perfil FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_write_registro" ON public.registro_mensual FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_write_arsenal" ON public.arsenal_tecnico FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_write_misiones" ON public.misiones FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_write_certificados" ON public.certificados FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_write_logros" ON public.logros FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_write_objetivos" ON public.objetivos FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- STORAGE BUCKET
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio', 'portfolio', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "public_read_storage" ON storage.objects
  FOR SELECT USING (bucket_id = 'portfolio');

CREATE POLICY "auth_upload_storage" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'portfolio' AND auth.role() = 'authenticated');

CREATE POLICY "auth_update_storage" ON storage.objects
  FOR UPDATE USING (bucket_id = 'portfolio' AND auth.role() = 'authenticated');

CREATE POLICY "auth_delete_storage" ON storage.objects
  FOR DELETE USING (bucket_id = 'portfolio' AND auth.role() = 'authenticated');

-- ============================================================
-- SEED DATA (optional — delete if not needed)
-- ============================================================
INSERT INTO public.perfil (nombre, alias, titulo, bio, github_url, ubicacion, disponible, total_xp, nivel)
VALUES (
  'Carlos Efrain Guillermo Rodriguez',
  'mellamobrau',
  'Senior Full Stack Engineer & Cybersecurity Architect',
  'Think like an attacker. Build like a defender. Design like an artist.',
  'https://github.com/mellamobrau',
  'México 🇲🇽',
  true,
  42000,
  42
) ON CONFLICT DO NOTHING;
