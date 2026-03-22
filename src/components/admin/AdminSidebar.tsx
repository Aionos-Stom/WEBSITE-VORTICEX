'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: '◉' },
  { href: '/admin/config', label: 'Config & Launch', icon: '⚙️' },
  { href: '/admin/registro', label: 'Registro Mensual', icon: '📊' },
  { href: '/admin/stats', label: 'Stats Hero', icon: '📈' },
  { href: '/admin/arsenal', label: 'Skills', icon: '⚡' },
  { href: '/admin/misiones', label: 'Proyectos', icon: '🎯' },
  { href: '/admin/servicios', label: 'Servicios', icon: '🔧' },
  { href: '/admin/certificados', label: 'Certificados', icon: '🏆' },
  { href: '/admin/logros', label: 'Logros', icon: '🛡️' },
  { href: '/admin/objetivos', label: 'Objetivos', icon: '🚀' },
  { href: '/admin/galeria', label: 'Galería', icon: '🎨' },
  { href: '/admin/actividad', label: 'Actividad XP', icon: '📡' },
  { href: '/admin/manifiesto', label: 'Manifiesto', icon: '⚖️' },
  { href: '/admin/armeria', label: 'La Armería', icon: '🗡️' },
  { href: '/admin/mensajes', label: 'Mensajes', icon: '📨' },
  { href: '/admin/historial', label: 'Historial', icon: '📋' },
]

interface AdminSidebarProps {
  userEmail: string
}

export function AdminSidebar({ userEmail }: AdminSidebarProps): JSX.Element {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async (): Promise<void> => {
    await supabase.auth.signOut()
    toast.success('Sesión cerrada')
    router.push('/login')
    router.refresh()
  }

  const navContent = (
    <>
      {/* Logo */}
      <div className="p-5 border-b border-[rgba(0,229,255,0.1)]">
        <div className="font-mono-custom text-[#00E5FF] font-black text-lg">&gt; admin_panel</div>
        <div className="font-mono-custom text-xs text-slate-600 mt-1 truncate">{userEmail}</div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = item.href === '/admin'
            ? pathname === '/admin'
            : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg font-mono-custom text-sm transition-all duration-200',
                isActive
                  ? 'bg-[rgba(0,229,255,0.1)] text-[#00E5FF] border border-[rgba(0,229,255,0.2)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[rgba(255,255,255,0.03)]'
              )}
            >
              <span className="text-base">{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-[rgba(0,229,255,0.1)] space-y-1">
        <Link
          href="/"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-2 px-3 py-2 rounded font-mono-custom text-xs text-slate-500 hover:text-slate-300 transition-colors"
        >
          ← ver_portfolio
        </Link>
        <button
          onClick={() => void handleLogout()}
          className="w-full flex items-center gap-2 px-3 py-2 rounded font-mono-custom text-xs text-[#FF4444] hover:bg-[rgba(239,68,68,0.1)] transition-colors"
        >
          ⊗ cerrar_sesion()
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen((o) => !o)}
        className="md:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-lg border border-[rgba(0,229,255,0.2)] bg-black/80 backdrop-blur-sm flex items-center justify-center text-[#00E5FF] font-mono-custom text-lg transition-colors hover:bg-[rgba(0,229,255,0.08)]"
        aria-label="Toggle menu"
      >
        {mobileOpen ? '✕' : '☰'}
      </button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 min-h-screen border-r border-[rgba(0,229,255,0.1)] flex-col flex-shrink-0">
        {navContent}
      </aside>

      {/* Mobile sidebar drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="md:hidden fixed left-0 top-0 bottom-0 z-50 w-72 border-r border-[rgba(0,229,255,0.15)] flex flex-col"
            style={{ background: 'rgba(2,2,12,0.98)', backdropFilter: 'blur(20px)' }}
          >
            {navContent}
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  )
}
