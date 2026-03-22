-- ============================================================
-- Contact messages — submissions from the portfolio contact form
-- ============================================================
create table if not exists contact_messages (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  email        text not null,
  project_type text,
  budget       text,
  brief        text not null,
  status       text not null default 'nuevo',  -- nuevo | leido | respondido
  replied_at   timestamptz,
  created_at   timestamptz not null default now()
);

alter table contact_messages enable row level security;

-- Only authenticated admins can read/update messages
create policy "admin_all_contact" on contact_messages
  for all using (auth.role() = 'authenticated');

-- Public can insert (submit contact form) — no select/update/delete
create policy "public_insert_contact" on contact_messages
  for insert with check (true);
