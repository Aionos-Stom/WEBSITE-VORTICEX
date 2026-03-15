import { createClient } from '@/lib/supabase/server'

export default async function AdminDashboard(): Promise<JSX.Element> {
  const supabase = await createClient()

  const [
    { count: registroCount },
    { count: arsenalCount },
    { count: misionesCount },
    { count: certsCount },
    { count: logrosCount },
    { count: objetivosCount },
  ] = await Promise.all([
    supabase.from('registro_mensual').select('*', { count: 'exact', head: true }),
    supabase.from('arsenal_tecnico').select('*', { count: 'exact', head: true }),
    supabase.from('misiones').select('*', { count: 'exact', head: true }),
    supabase.from('certificados').select('*', { count: 'exact', head: true }),
    supabase.from('logros').select('*', { count: 'exact', head: true }),
    supabase.from('objetivos').select('*', { count: 'exact', head: true }),
  ])

  const stats = [
    { label: 'Registros', count: registroCount ?? 0, color: '#00E5FF', icon: '📊', href: '/admin/registro' },
    { label: 'Skills', count: arsenalCount ?? 0, color: '#9B5CFF', icon: '⚡', href: '/admin/arsenal' },
    { label: 'Misiones', count: misionesCount ?? 0, color: '#00FF88', icon: '🎯', href: '/admin/misiones' },
    { label: 'Certificados', count: certsCount ?? 0, color: '#F59E0B', icon: '🏆', href: '/admin/certificados' },
    { label: 'Logros', count: logrosCount ?? 0, color: '#FF4444', icon: '🛡️', href: '/admin/logros' },
    { label: 'Objetivos', count: objetivosCount ?? 0, color: '#00E5FF', icon: '🚀', href: '/admin/objetivos' },
  ]

  return (
    <div>
      <div className="mb-8">
        <p className="font-mono-custom text-xs text-[#00E5FF] opacity-60 mb-1">{'// control_center'}</p>
        <h1 className="font-mono-custom text-3xl font-black text-[#00E5FF]">Dashboard</h1>
        <p className="font-mono-custom text-sm text-slate-500 mt-2">
          Gestiona todo el contenido del portfolio desde aquí. Todo se guarda en Supabase.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => (
          <a
            key={stat.label}
            href={stat.href}
            className="glass-card p-6 group hover:border-[rgba(0,229,255,0.3)] transition-all duration-300"
          >
            <div className="text-3xl mb-3">{stat.icon}</div>
            <div
              className="font-mono-custom text-3xl font-black mb-1"
              style={{ color: stat.color }}
            >
              {stat.count}
            </div>
            <div className="font-mono-custom text-xs text-slate-500">{stat.label}</div>
            <div className="font-mono-custom text-xs mt-3 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: stat.color }}>
              gestionar →
            </div>
          </a>
        ))}
      </div>

      <div className="glass-card p-6">
        <h2 className="font-mono-custom text-sm font-bold text-[#00E5FF] mb-4">
          {'// guia_rapida'}
        </h2>
        <ul className="space-y-2 font-mono-custom text-xs text-slate-400">
          <li>{'→ Configura tu perfil primero en /admin/perfil'}</li>
          <li>{'→ Agrega tus skills en Arsenal Técnico'}</li>
          <li>{'→ Registra tus proyectos en Misiones'}</li>
          <li>{'→ Sube tus certificados (PDF/imagen) desde Certificados'}</li>
          <li>{'→ Todo se guarda directamente en Supabase — sin localStorage'}</li>
        </ul>
      </div>
    </div>
  )
}
