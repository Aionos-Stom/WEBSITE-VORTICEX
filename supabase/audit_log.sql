-- ============================================================
-- Tabla: admin_audit_log
-- Registra todas las acciones del panel de administración
-- ============================================================

CREATE TABLE IF NOT EXISTS admin_audit_log (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email   TEXT,
  action       TEXT        NOT NULL,          -- login | create | update | delete | upload | toggle
  table_name   TEXT,                          -- monthly_entries | skills | projects | etc.
  record_title TEXT,                          -- título legible del registro afectado
  details      JSONB,                         -- datos extra (opcional)
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Index para consultas recientes
CREATE INDEX IF NOT EXISTS admin_audit_log_created_at_idx ON admin_audit_log (created_at DESC);

-- RLS: solo usuarios autenticados pueden insertar/leer
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth insert audit" ON admin_audit_log
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "auth read audit" ON admin_audit_log
  FOR SELECT TO authenticated USING (true);

-- Función trigger: auto-rellenar user_email desde auth.users
CREATE OR REPLACE FUNCTION fill_audit_user_email()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  NEW.user_email := (SELECT email FROM auth.users WHERE id = auth.uid());
  RETURN NEW;
END;
$$;

CREATE TRIGGER audit_fill_email
  BEFORE INSERT ON admin_audit_log
  FOR EACH ROW EXECUTE FUNCTION fill_audit_user_email();
