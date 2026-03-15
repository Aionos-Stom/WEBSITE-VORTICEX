export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

// Row types
export interface RegistroMensualRow {
  id: string
  mes: string
  ano: number
  horas_estudio: number
  certs_completados: number
  proyectos_activos: number
  vulnerabilidades_encontradas: number
  nivel_xp: number
  notas: string | null
  created_at: string
  updated_at: string
}

export interface ArsenalTecnicoRow {
  id: string
  nombre: string
  categoria: string
  nivel: number
  icono: string | null
  color: string | null
  descripcion: string | null
  orden: number
  activo: boolean
  created_at: string
  updated_at: string
}

export interface MisionRow {
  id: string
  titulo: string
  descripcion: string
  estado: 'COMPLETADA' | 'EN_PROGRESO' | 'PLANIFICADA'
  tecnologias: string[]
  github_url: string | null
  demo_url: string | null
  imagen_url: string | null
  fecha_inicio: string | null
  fecha_fin: string | null
  dificultad: number
  orden: number
  activo: boolean
  created_at: string
  updated_at: string
}

export interface CertificadoRow {
  id: string
  titulo: string
  emisor: string
  fecha_emision: string
  fecha_expiracion: string | null
  credencial_id: string | null
  credencial_url: string | null
  pdf_url: string | null
  imagen_url: string | null
  categoria: string
  orden: number
  activo: boolean
  created_at: string
  updated_at: string
}

export interface LogroRow {
  id: string
  titulo: string
  descripcion: string
  icono: string
  tipo: 'BADGE' | 'TROPHY' | 'STAR' | 'SHIELD'
  fecha: string
  puntos_xp: number
  rareza: 'COMUN' | 'RARO' | 'EPICO' | 'LEGENDARIO'
  orden: number
  activo: boolean
  created_at: string
  updated_at: string
}

export interface ObjetivoRow {
  id: string
  titulo: string
  descripcion: string
  progreso: number
  meta: number
  unidad: string
  categoria: string
  fecha_limite: string | null
  completado: boolean
  orden: number
  activo: boolean
  created_at: string
  updated_at: string
}

export interface PerfilRow {
  id: string
  nombre: string
  alias: string
  titulo: string
  bio: string
  avatar_url: string | null
  github_url: string | null
  linkedin_url: string | null
  email: string | null
  ubicacion: string | null
  disponible: boolean
  total_xp: number
  nivel: number
  created_at: string
  updated_at: string
}

// Insert types
export type RegistroMensualInsert = Omit<RegistroMensualRow, 'id' | 'created_at' | 'updated_at'>
export type ArsenalTecnicoInsert = Omit<ArsenalTecnicoRow, 'id' | 'created_at' | 'updated_at'>
export type MisionInsert = Omit<MisionRow, 'id' | 'created_at' | 'updated_at'>
export type CertificadoInsert = Omit<CertificadoRow, 'id' | 'created_at' | 'updated_at'>
export type LogroInsert = Omit<LogroRow, 'id' | 'created_at' | 'updated_at'>
export type ObjetivoInsert = Omit<ObjetivoRow, 'id' | 'created_at' | 'updated_at'>
export type PerfilInsert = Omit<PerfilRow, 'id' | 'created_at' | 'updated_at'>

export interface Database {
  public: {
    Tables: {
      registro_mensual: {
        Row: RegistroMensualRow
        Insert: RegistroMensualInsert
        Update: Partial<RegistroMensualInsert>
      }
      arsenal_tecnico: {
        Row: ArsenalTecnicoRow
        Insert: ArsenalTecnicoInsert
        Update: Partial<ArsenalTecnicoInsert>
      }
      misiones: {
        Row: MisionRow
        Insert: MisionInsert
        Update: Partial<MisionInsert>
      }
      certificados: {
        Row: CertificadoRow
        Insert: CertificadoInsert
        Update: Partial<CertificadoInsert>
      }
      logros: {
        Row: LogroRow
        Insert: LogroInsert
        Update: Partial<LogroInsert>
      }
      objetivos: {
        Row: ObjetivoRow
        Insert: ObjetivoInsert
        Update: Partial<ObjetivoInsert>
      }
      perfil: {
        Row: PerfilRow
        Insert: PerfilInsert
        Update: Partial<PerfilInsert>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Convenience aliases
export type RegistroMensual = RegistroMensualRow
export type ArsenalTecnico = ArsenalTecnicoRow
export type Mision = MisionRow
export type Certificado = CertificadoRow
export type Logro = LogroRow
export type Objetivo = ObjetivoRow
export type Perfil = PerfilRow
