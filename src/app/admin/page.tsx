import { createClient } from '@/lib/supabase/server'
import { parseSiteConfig } from '@/lib/utils'
import type { SiteConfig } from '@/types/database'
import type { AuditLog } from '@/lib/audit'

const ACTION_META: Record<string, { color: string; icon: string }> = {
  login:  { color: '#00FF88', icon: '→' },
  create: { color: '#00E5FF', icon: '+' },
  update: { color: '#F59E0B', icon: '~' },
  delete: { color: '#FF4444', icon: '×' },
  upload: { color: '#9B5CFF', icon: '↑' },
  toggle: { color: '#9B5CFF', icon: '⬡' },
}

const SECTION_LIMITS: Record<string, number> = {
  skills: 30, projects: 20, certificates: 50,
  achievements: 30, objectives: 20, gallery: 40,
}

export default async function AdminDashboard(): Promise<JSX.Element> {
  const supabase = await createClient()

  const [
    { count: entriesCount },
    { count: skillsCount },
    { count: statsCount },
    { count: projectsCount },
    { count: certsCount },
    { count: achievementsCount },
    { count: objectivesCount },
    { count: configCount },
    { count: galleryCount },
    { count: activityCount },
    { count: manifiestoCount },
    { count: armeriaCount },
    { count: serviciosCount },
    { count: mensajesCount },
    { data: configRows },
    { data: auditRows },
  ] = await Promise.all([
    supabase.from('monthly_entries').select('*', { count: 'exact', head: true }),
    supabase.from('skills').select('*', { count: 'exact', head: true }),
    supabase.from('stats').select('*', { count: 'exact', head: true }),
    supabase.from('projects').select('*', { count: 'exact', head: true }),
    supabase.from('certificates').select('*', { count: 'exact', head: true }),
    supabase.from('achievements').select('*', { count: 'exact', head: true }),
    supabase.from('objectives').select('*', { count: 'exact', head: true }),
    supabase.from('site_config').select('*', { count: 'exact', head: true }),
    supabase.from('gallery').select('*', { count: 'exact', head: true }),
    supabase.from('activity_log').select('*', { count: 'exact', head: true }),
    supabase.from('manifesto_items').select('*', { count: 'exact', head: true }),
    supabase.from('armeria_layers').select('*', { count: 'exact', head: true }),
    supabase.from('services').select('*', { count: 'exact', head: true }),
    supabase.from('contact_messages').select('*', { count: 'exact', head: true }),
    supabase.from('site_config').select('*'),
    supabase.from('admin_audit_log').select('*').order('created_at', { ascending: false }).limit(5),
  ])

  const config = parseSiteConfig((configRows ?? []) as SiteConfig[])
  const launchActive = config.launch_mode === 'true'
  const audits = (auditRows ?? []) as AuditLog[]

  const sections = [
    { label: 'Registro Mensual', count: entriesCount ?? 0, icon: '📊', href: '/admin/registro', color: '#00E5FF', limit: 24 },
    { label: 'Skills', count: skillsCount ?? 0, icon: '⚡', href: '/admin/arsenal', color: '#9B5CFF', limit: SECTION_LIMITS.skills },
    { label: 'Stats Hero', count: statsCount ?? 0, icon: '📈', href: '/admin/stats', color: '#00FF88', limit: 10 },
    { label: 'Proyectos', count: projectsCount ?? 0, icon: '🎯', href: '/admin/misiones', color: '#F59E0B', limit: SECTION_LIMITS.projects },
    { label: 'Certificados', count: certsCount ?? 0, icon: '🏆', href: '/admin/certificados', color: '#00E5FF', limit: SECTION_LIMITS.certificates },
    { label: 'Logros', count: achievementsCount ?? 0, icon: '🛡️', href: '/admin/logros', color: '#9B5CFF', limit: SECTION_LIMITS.achievements },
    { label: 'Objetivos', count: objectivesCount ?? 0, icon: '🚀', href: '/admin/objetivos', color: '#00FF88', limit: SECTION_LIMITS.objectives },
    { label: 'Galería', count: galleryCount ?? 0, icon: '🎨', href: '/admin/galeria', color: '#9B5CFF', limit: SECTION_LIMITS.gallery },
    { label: 'Actividad XP', count: activityCount ?? 0, icon: '📡', href: '/admin/actividad', color: '#00FF88', limit: 200 },
    { label: 'Manifiesto', count: manifiestoCount ?? 0, icon: '⚖️', href: '/admin/manifiesto', color: '#00FF88', limit: 10 },
    { label: 'La Armería', count: armeriaCount ?? 0, icon: '🗡️', href: '/admin/armeria', color: '#9B5CFF', limit: 12 },
    { label: 'Servicios', count: serviciosCount ?? 0, icon: '🔧', href: '/admin/servicios', color: '#00E5FF', limit: 6 },
    { label: 'Mensajes', count: mensajesCount ?? 0, icon: '📨', href: '/admin/mensajes', color: '#F59E0B', limit: 999 },
    { label: 'Config & Launch', count: configCount ?? 0, icon: '⚙️', href: '/admin/config', color: '#FF4444', limit: 20 },
  ]

  const formatTime = (iso: string): string => {
    const d = new Date(iso)
    return d.toLocaleString('es-ES', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="font-mono-custom text-xs text-[#00E5FF] opacity-60 mb-1">{'// control_center'}</p>
        <h1 className="font-mono-custom text-3xl font-black text-[#00E5FF]">Dashboard</h1>
        <p className="font-mono-custom text-sm text-slate-500 mt-2">
          Todo el contenido se guarda directamente en Supabase.
        </p>
      </div>

      {/* Launch mode banner */}
      {launchActive && (
        <div className="p-4 rounded-xl border border-[rgba(155,92,255,0.4)] bg-[rgba(155,92,255,0.08)]">
          <p className="font-mono-custom text-sm text-[#9B5CFF] font-bold">
            ⬡ MODO ESPERA ACTIVO — El portfolio muestra la página de cuenta regresiva.
          </p>
          <p className="font-mono-custom text-xs text-slate-500 mt-1">
            Lanzamiento: <span className="text-slate-300">{config.launch_date}</span> ·{' '}
            <a href="/admin/config" className="text-[#9B5CFF] hover:underline">Desactivar en Config &amp; Launch</a>
          </p>
        </div>
      )}

      {/* Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-4">
        {sections.map((s) => {
          const pct = Math.min(100, Math.round((s.count / (s.limit ?? 100)) * 100))
          return (
            <a
              key={s.label}
              href={s.href}
              className="glass-card p-5 group hover:border-[rgba(0,229,255,0.25)] transition-all duration-300"
            >
              <div className="text-2xl mb-2">{s.icon}</div>
              <div className="font-mono-custom text-2xl font-black mb-0.5" style={{ color: s.color }}>{s.count}</div>
              <div className="font-mono-custom text-xs text-slate-500 mb-3">{s.label}</div>
              {/* Progress bar */}
              <div className="h-1 bg-[rgba(255,255,255,0.04)] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, background: s.color, boxShadow: `0 0 6px ${s.color}60` }}
                />
              </div>
              <div className="font-mono-custom text-[0.58rem] text-slate-600 mt-1">{pct}% de {s.limit}</div>
              <div className="font-mono-custom text-xs mt-2 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: s.color }}>gestionar →</div>
            </a>
          )
        })}
      </div>

      {/* Audit log — últimas 5, ver todo en /admin/historial */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="font-mono-custom text-xs text-slate-500">{'// historial_reciente'}</p>
          <a href="/admin/historial" className="font-mono-custom text-[0.6rem] text-[#00E5FF] hover:underline">
            ver todo →
          </a>
        </div>

        {audits.length === 0 ? (
          <p className="font-mono-custom text-xs text-slate-600 py-8 text-center">
            {'> sin_actividad — ejecuta la SQL de supabase/audit_log.sql primero'}
          </p>
        ) : (
          <div className="space-y-1">
            {audits.map((entry) => {
              const meta = ACTION_META[entry.action] ?? { color: '#64748B', icon: '·' }
              return (
                <div key={entry.id} className="flex items-center gap-3 py-2 border-b border-[rgba(255,255,255,0.03)] last:border-0 group">
                  {/* Action badge */}
                  <span
                    className="font-mono-custom text-[0.6rem] font-bold px-2 py-0.5 rounded flex-shrink-0"
                    style={{ color: meta.color, background: `${meta.color}15`, border: `1px solid ${meta.color}30` }}
                  >
                    {meta.icon} {entry.action}
                  </span>
                  {/* Table */}
                  {entry.table_name && (
                    <span className="font-mono-custom text-[0.6rem] text-slate-600 flex-shrink-0">
                      [{entry.table_name}]
                    </span>
                  )}
                  {/* Title */}
                  <span className="font-mono-custom text-xs text-slate-300 flex-1 truncate">
                    {entry.record_title ?? '—'}
                  </span>
                  {/* Email */}
                  {entry.user_email && (
                    <span className="font-mono-custom text-[0.6rem] text-slate-600 hidden md:block flex-shrink-0">
                      {entry.user_email}
                    </span>
                  )}
                  {/* Time */}
                  <span className="font-mono-custom text-[0.6rem] text-slate-600 flex-shrink-0">
                    {formatTime(entry.created_at)}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
