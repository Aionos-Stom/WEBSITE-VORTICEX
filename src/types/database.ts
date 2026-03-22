// ============================================================
// Database types matching the actual Supabase schema
// ============================================================

export interface MonthlyEntry {
  id: string
  month: string
  title: string
  highlight_word: string | null
  description: string | null
  status: 'activo' | 'completado' | 'pendiente'
  image_url: string | null
  created_at: string
}

export interface Skill {
  id: string
  name: string
  percentage: number
  color_class: string
  sort_order: number
}

export interface Stat {
  id: string
  label: string
  value: string
  suffix: string | null
  sort_order: number
}

export interface Project {
  id: string
  name: string
  category: string | null
  description: string | null
  image_url: string | null
  project_url: string | null
  featured: boolean
  sort_order: number
  created_at: string
}

export interface Certificate {
  id: string
  name: string
  issuer: string
  date: string
  file_url: string | null
  file_type: string | null
  thumbnail_url: string | null
  created_at: string
}

export interface Achievement {
  id: string
  title: string
  category: string | null
  description: string | null
  image_url: string | null
  event_url: string | null
  created_at: string
}

export interface Objective {
  id: string
  title: string
  date_label: string | null
  status: 'activo' | 'pendiente' | 'completado'
  sort_order: number
}

export interface SiteConfig {
  id: string
  key: string
  value: string | null
  updated_at: string
}

export interface Gallery {
  id: string
  title: string
  category: string | null
  description: string | null
  image_url: string | null
  tools: string | null
  featured: boolean
  sort_order: number
  created_at: string
}

export interface ActivityLog {
  id: string
  date: string
  type: 'certificado' | 'proyecto' | 'skill' | 'logro' | 'estudio' | 'freelance'
  title: string
  description: string | null
  xp_gained: number
  created_at: string
}

// Parsed site config
export interface SiteConfigMap {
  hero_name: string
  hero_year: string
  hero_subtitle: string
  hero_photo_url: string
  recap_video_url: string
  launch_mode: string
  launch_date: string
  launch_title: string
  launch_subtitle: string
  // Bio / Sobre Mi
  bio_quote: string
  bio_description: string
  bio_years: string
  bio_languages: string
  bio_clouds: string
  // Contact & Social
  contact_email: string
  github_url: string
  linkedin_url: string
  twitter_url: string
  // Terminal
  terminal_name: string
  terminal_alias: string
  terminal_role: string
}

export const MONTH_NAMES: Record<number, string> = {
  1: 'Enero', 2: 'Febrero', 3: 'Marzo', 4: 'Abril',
  5: 'Mayo', 6: 'Junio', 7: 'Julio', 8: 'Agosto',
  9: 'Septiembre', 10: 'Octubre', 11: 'Noviembre', 12: 'Diciembre',
}

export const STATUS_COLORS: Record<string, string> = {
  completado: '#00FF88',
  pendiente: '#9B5CFF',
  activo: '#00E5FF',
}

export const STATUS_LABELS: Record<string, string> = {
  completado: '✓ COMPLETADO',
  pendiente: '○ PENDIENTE',
  activo: '◎ ACTIVO',
}

export const COLOR_MAP: Record<string, string> = {
  purple: '#9B5CFF',
  cyan: '#00E5FF',
  green: '#00FF88',
  red: '#FF4444',
  yellow: '#F59E0B',
  pink: '#FF6B9D',
  orange: '#FF8C42',
}

export const ACTIVITY_TYPES: Record<ActivityLog['type'], { label: string; color: string; icon: string }> = {
  certificado: { label: 'Certificado', color: '#00E5FF', icon: '🏆' },
  proyecto:    { label: 'Proyecto',    color: '#F59E0B', icon: '🎯' },
  skill:       { label: 'Skill',       color: '#9B5CFF', icon: '⚡' },
  logro:       { label: 'Logro',       color: '#00FF88', icon: '🛡️' },
  estudio:     { label: 'Estudio',     color: '#00E5FF', icon: '📚' },
  freelance:   { label: 'Freelance',   color: '#FF6B9D', icon: '💼' },
}

export interface ManifestoItem {
  id: string
  number: string
  title: string
  body: string
  color: string
  icon_name: string
  sort_order: number
}

export interface ArmeriaLayer {
  id: string
  layer_name: string
  color: string
  icon_name: string
  techs: string          // comma-separated
  philosophy: string
  sort_order: number
}

export interface Service {
  id: string
  number: string
  title: string
  tagline: string
  description: string
  bullets: string        // JSON array of strings
  stack: string          // comma-separated
  color: string
  sort_order: number
}

export interface ContactMessage {
  id: string
  name: string
  email: string
  project_type: string | null
  budget: string | null
  brief: string
  status: 'nuevo' | 'leido' | 'respondido' | 'eliminado'
  replied_at: string | null
  created_at: string
}

export const GALLERY_CATEGORIES = ['UI/UX', 'Photoshop', 'Multimedia', '3D', 'Branding', 'Motion', 'Ilustración', 'Web Design']

export const XP_LEVELS = [
  { level: 1, name: 'Iniciado',     min: 0,     max: 500   },
  { level: 2, name: 'Aprendiz',     min: 500,   max: 1500  },
  { level: 3, name: 'Desarrollador',min: 1500,  max: 3500  },
  { level: 4, name: 'Ingeniero',    min: 3500,  max: 7000  },
  { level: 5, name: 'Arquitecto',   min: 7000,  max: 12000 },
  { level: 6, name: 'Master',       min: 12000, max: 20000 },
  { level: 7, name: 'Elite',        min: 20000, max: 35000 },
  { level: 8, name: 'Leyenda',      min: 35000, max: Infinity },
]
