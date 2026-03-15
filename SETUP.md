# mellamobrau Portfolio — Setup Guide

## 1. Supabase Setup

1. Crear proyecto en [supabase.com](https://supabase.com)
2. Ir al **SQL Editor** y ejecutar todo el contenido de `supabase/schema.sql`
3. Crear usuario admin en **Authentication > Users > Add User**
4. Copiar las credenciales de **Project Settings > API**

## 2. Variables de Entorno

Editar `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

## 3. Storage Bucket

El schema SQL ya crea el bucket `portfolio`. Verificar en **Storage** del dashboard.

## 4. Ejecutar en Desarrollo

```bash
npm run dev
```

- Portfolio: http://localhost:3000
- Admin: http://localhost:3000/admin (requiere login)
- Login: http://localhost:3000/login

## 5. Admin Panel — Flujo de uso

1. `/admin/perfil` → Configura tu nombre, bio, links, XP
2. `/admin/arsenal` → Agrega tus skills con nivel 1-10
3. `/admin/misiones` → Agrega tus proyectos
4. `/admin/certificados` → Sube PDFs e imágenes desde Supabase Storage
5. `/admin/logros` → Crea logros/achievements
6. `/admin/objetivos` → Define objetivos con progreso
7. `/admin/registro` → Registra estadísticas mensuales

## 6. Deploy en Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel
vercel

# Configurar env vars en el dashboard de Vercel
```

## Stack

- Next.js 14.2.35 (App Router + TypeScript)
- Tailwind CSS 3.4
- Framer Motion 11
- Supabase JS 2.99 (auth + db + storage)
- Canvas API para starfield (sin Three.js overhead)
- Zod para validación
- shadcn/ui primitives (Radix)
- Sonner para toasts

## Arquitectura de Datos

Todo el contenido viene de Supabase — **cero localStorage**.

| Tabla | Descripción |
|-------|-------------|
| `perfil` | Info personal, XP, nivel |
| `registro_mensual` | Stats mensuales (horas, certs, vulns) |
| `arsenal_tecnico` | Skills técnicas con nivel 1-10 |
| `misiones` | Proyectos con estado y tecnologías |
| `certificados` | Certs con PDF/imagen en Storage |
| `logros` | Achievements con rareza |
| `objetivos` | Metas con progreso |

## RLS (Row Level Security)

- **Lectura pública** en todas las tablas (portfolio es público)
- **Escritura solo autenticados** (admin panel protegido)
- Storage bucket `portfolio` público para lectura
