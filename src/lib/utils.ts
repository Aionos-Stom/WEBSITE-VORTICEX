import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatMonth(mes: string, ano: number): string {
  const months: Record<string, string> = {
    enero: 'Ene', febrero: 'Feb', marzo: 'Mar', abril: 'Abr',
    mayo: 'May', junio: 'Jun', julio: 'Jul', agosto: 'Ago',
    septiembre: 'Sep', octubre: 'Oct', noviembre: 'Nov', diciembre: 'Dic',
  }
  return `${months[mes.toLowerCase()] ?? mes} ${ano}`
}

export function getRarezaColor(rareza: string): string {
  const map: Record<string, string> = {
    COMUN: '#9CA3AF',
    RARO: '#3B82F6',
    EPICO: '#9B5CFF',
    LEGENDARIO: '#F59E0B',
  }
  return map[rareza] ?? '#9CA3AF'
}

export function getEstadoColor(estado: string): string {
  const map: Record<string, string> = {
    COMPLETADA: '#00FF88',
    EN_PROGRESO: '#00E5FF',
    PLANIFICADA: '#9B5CFF',
  }
  return map[estado] ?? '#9CA3AF'
}
