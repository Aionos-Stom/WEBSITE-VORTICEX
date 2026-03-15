'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: '◉' },
  { href: '/admin/perfil', label: 'Perfil', icon: '👤' },
  { href: '/admin/registro', label: 'Registro Mensual', icon: '📊' },
  { href: '/admin/arsenal', label: 'Arsenal Técnico', icon: '⚡' },
  { href: '/admin/misiones', label: 'Misiones', icon: '🎯' },
  { href: '/admin/certificados', label: 'Certificados', icon: '🏆' },
  { href: '/admin/logros', label: 'Logros', icon: '🛡️' },
  { href: '/admin/objetivos', label: 'Objetivos', icon: '🚀' },
]

interface AdminSidebarProps {
  userEmail: string
}

export function AdminSidebar({ userEmail }: AdminSidebarProps): JSX.Element {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async (): Promise<void> => {
    await supabase.auth.signOut()
    toast.success('Sesión cerrada')
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="w-64 min-h-screen border-r border-[rgba(0,229,255,0.1)] flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-[rgba(0,229,255,0.1)]">
        <div className="font-mono-custom text-[#00E5FF] font-black text-lg">&gt; admin_panel</div>
        <div className="font-mono-custom text-xs text-slate-600 mt-1 truncate">{userEmail}</div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = item.href === '/admin'
            ? pathname === '/admin'
            : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg font-mono-custom text-sm transition-all duration-200',
                isActive
                  ? 'bg-[rgba(0,229,255,0.1)] text-[#00E5FF] border border-[rgba(0,229,255,0.2)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[rgba(255,255,255,0.03)]'
              )}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="p-4 border-t border-[rgba(0,229,255,0.1)] space-y-2">
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 rounded font-mono-custom text-xs text-slate-500 hover:text-slate-300 transition-colors"
        >
          ← ver_portfolio
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded font-mono-custom text-xs text-[#FF4444] hover:bg-[rgba(239,68,68,0.1)] transition-colors"
        >
          ⊗ cerrar_sesion()
        </button>
      </div>
    </aside>
  )
}
