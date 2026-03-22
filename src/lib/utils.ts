import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { SiteConfig, SiteConfigMap } from '@/types/database'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

export function parseSiteConfig(rows: SiteConfig[]): SiteConfigMap {
  const map: Record<string, string> = {}
  rows.forEach((r) => { if (r.key) map[r.key] = r.value ?? '' })
  return {
    hero_name:       map['hero_name']       ?? 'mellamobrau',
    hero_year:       map['hero_year']       ?? String(new Date().getFullYear()),
    hero_subtitle:   map['hero_subtitle']   ?? 'MISSION.COMPLETE',
    hero_photo_url:  map['hero_photo_url']  ?? '',
    recap_video_url: map['recap_video_url'] ?? '',
    launch_mode:     map['launch_mode']     ?? 'false',
    launch_date:     map['launch_date']     ?? '2026-12-01',
    launch_title:    map['launch_title']    ?? 'Sistema en Construcción',
    launch_subtitle: map['launch_subtitle'] ?? 'Regresando con algo épico',
    // Bio / Sobre Mi
    bio_quote:       map['bio_quote']       ?? 'Donde la seguridad es el cimiento, el diseño es la religión y el rendimiento es innegociable.',
    bio_description: map['bio_description'] ?? 'En un ecosistema digital saturado, no basta con que una aplicación funcione. Mi enfoque se centra en la intersección de tres pilares críticos que definen cada decisión de arquitectura.',
    bio_years:       map['bio_years']       ?? '4+',
    bio_languages:   map['bio_languages']   ?? '12+',
    bio_clouds:      map['bio_clouds']      ?? '5',
    // Contact & Social
    contact_email:   map['contact_email']   ?? 'johanATorresR@gmail.com',
    github_url:      map['github_url']      ?? 'https://github.com/mellamobrau',
    linkedin_url:    map['linkedin_url']    ?? 'https://linkedin.com/in/ax-johan-torres-4138a53aa',
    twitter_url:     map['twitter_url']     ?? '',
    // Terminal identity
    terminal_name:   map['terminal_name']   ?? 'Johan Torres',
    terminal_alias:  map['terminal_alias']  ?? 'The Monarch Of Chaos',
    terminal_role:   map['terminal_role']   ?? 'Arquitecto de Software & Defensor Digital',
  }
}
