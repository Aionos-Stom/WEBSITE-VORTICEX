-- ============================================================
-- Manifesto items
-- ============================================================
create table if not exists manifesto_items (
  id          uuid primary key default gen_random_uuid(),
  number      text not null,
  title       text not null,
  body        text not null,
  color       text not null default '#00E5FF',
  icon_name   text not null default 'lock',
  sort_order  int  not null default 0
);

alter table manifesto_items enable row level security;
create policy "admin_all_manifesto"  on manifesto_items for all using (auth.role() = 'authenticated');
create policy "public_read_manifesto" on manifesto_items for select using (true);

-- Seed default manifesto items
insert into manifesto_items (number, title, body, color, icon_name, sort_order) values
('01', 'La Seguridad no es una característica — es el cimiento.',
 'No "añado" seguridad al final. El modelado de amenazas (STRIDE) y la validación estricta de esquemas son el primer paso de cada sprint. Si no es seguro, no existe.',
 '#00E5FF', 'lock', 1),
('02', 'UI/UX es una Religión.',
 'La estética es funcionalidad. Una interfaz hermosa que no es accesible o que tiene latencia es un fracaso de ingeniería. El diseño emocional se encuentra con el rendimiento técnico.',
 '#9B5CFF', 'palette', 2),
('03', 'Rendimiento No-Negociable.',
 'Aspiro a los 60fps en experiencias 3D y a tiempos de respuesta de API inferiores a 100ms. Si el código no es eficiente, es deuda técnica que no estoy dispuesto a pagar.',
 '#00FF88', 'gauge', 3),
('04', 'Pensar como Atacante, Construir como Defensor.',
 'Cada línea de código es un vector de ataque. Entiendo la vulnerabilidad para blindar la innovación. La perspectiva ofensiva informa cada decisión defensiva.',
 '#FF6B6B', 'eye', 4),
('05', 'Automatización u Obsolescencia.',
 'Si se hace dos veces, se automatiza. Mi infraestructura es código (IaC), mis pruebas son robóticas y mi despliegue es continuo. La repetición manual es el enemigo del progreso.',
 '#F59E0B', 'bot', 5)
on conflict do nothing;

-- ============================================================
-- Armeria layers
-- ============================================================
create table if not exists armeria_layers (
  id          uuid primary key default gen_random_uuid(),
  layer_name  text not null,
  color       text not null default '#00E5FF',
  icon_name   text not null default 'monitor',
  techs       text not null default '',   -- comma-separated
  philosophy  text not null default '',
  sort_order  int  not null default 0
);

alter table armeria_layers enable row level security;
create policy "admin_all_armeria"  on armeria_layers for all using (auth.role() = 'authenticated');
create policy "public_read_armeria" on armeria_layers for select using (true);

-- Seed default armeria layers
insert into armeria_layers (layer_name, color, icon_name, techs, philosophy, sort_order) values
('Frontend Core', '#00E5FF', 'monitor',
 'React 19,Next.js App Router,TypeScript,Angular 18,Tailwind CSS v4',
 'Tipado estricto, Server Components y renderizado híbrido (SSR/ISR/CSR).', 1),
('Visual Computing', '#9B5CFF', 'box',
 'Three.js,React Three Fiber,WebGPU,GLSL Shaders,Framer Motion,GSAP',
 'Experiencias inmersivas con compresión Draco, LOD y postprocessing de alto impacto.', 2),
('Backend & APIs', '#00FF88', 'server',
 'Node.js / NestJS,Go (Fiber),Rust,FastAPI (Python),Laravel 11',
 'Microservicios de alta disponibilidad, baja latencia y contratos de API estrictos.', 3),
('Data Engine', '#F59E0B', 'database',
 'PostgreSQL + pgvector,Redis L1/L2,ClickHouse,Prisma ORM,Drizzle ORM',
 'Integridad referencial, caché multicapa y analítica OLAP sub-segundo.', 4),
('Cloud & Ops', '#60A5FA', 'cloud',
 'AWS (ECS Lambda RDS),Terraform IaC,Kubernetes,Docker,GitHub Actions CI/CD',
 'Infraestructura inmutable, GitOps con ArgoCD y despliegue global zero-downtime.', 5),
('Security Suite', '#FF6B6B', 'shield',
 'Snyk + Dependabot,OWASP ZAP,Argon2id,JWT / RS256,Semgrep SAST',
 'Seguridad proactiva en cada etapa del pipeline — shift-left desde el día uno.', 6)
on conflict do nothing;

-- ============================================================
-- Services
-- ============================================================
create table if not exists services (
  id          uuid primary key default gen_random_uuid(),
  number      text not null,
  title       text not null,
  tagline     text not null default '',
  description text not null default '',
  bullets     text not null default '[]',  -- JSON array
  stack       text not null default '',    -- comma-separated
  color       text not null default '#00E5FF',
  sort_order  int  not null default 0
);

alter table services enable row level security;
create policy "admin_all_services"  on services for all using (auth.role() = 'authenticated');
create policy "public_read_services" on services for select using (true);

-- Seed
insert into services (number, title, tagline, description, bullets, stack, color, sort_order) values
('01', 'Desarrollo Full-Stack & Arquitectura Cloud',
 'Ecosistemas digitales escalables de punta a punta.',
 'No solo escribo código; diseño sistemas que respiran. Desde la arquitectura de microservicios hasta la experiencia de usuario, cada decisión es técnica, deliberada y orientada al negocio.',
 '["Infraestructura multi-cloud (AWS, GCP, Huawei) con Terraform & Kubernetes","Optimización PostgreSQL/Redis con estrategias de caché en el borde","APIs REST & GraphQL con autenticación JWT/OAuth 2.0 robusta"]',
 'Next.js 15+,NestJS,Go,Rust,Laravel 11', '#00E5FF', 1),
('02', 'Ciberseguridad Ofensiva & Defensiva (DevSecOps)',
 'Protejo tu capital digital antes de que llegue el primer paquete.',
 'La seguridad es el cimiento de cada bit que produzco. Mi metodología integra el análisis de amenazas desde el sprint cero, no como auditoría posterior.',
 '["Auditoría de vulnerabilidades bajo estándares OWASP Top 10","Sistemas de autenticación robustos: OAuth2, PKCE, WebAuthn, MFA","Hardening: WAF, CSP headers, cadena de suministro (SBOM), AES-256-GCM"]',
 'OWASP ZAP,Burp Suite,Semgrep,TruffleHog,Trivy', '#9B5CFF', 2),
('03', 'Experiencias Inmersivas 3D & UI/UX de Próxima Generación',
 'Transformo la navegación plana en una experiencia sensorial.',
 'Especialista en crear interfaces que no se olvidan. Combino el poder del rendering 3D en tiempo real con sistemas de diseño rigurosos que priorizan accesibilidad y rendimiento.',
 '["Escenas 3D con shaders GLSL personalizados y física en tiempo real (Rapier)","Sistemas de diseño basados en tokens, tipografía fluida y micro-interacciones","Compresión Draco, LOD y cumplimiento Web Vitals (LCP < 2.5s, CLS 0)"]',
 'Three.js,React Three Fiber,WebGPU,GLSL,Framer Motion', '#00FF88', 3)
on conflict do nothing;
