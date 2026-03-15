'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { z } from 'zod'

const LoginSchema = z.object({
  email: z.string().email('Email inválido').max(255),
  password: z.string().min(6, 'Mínimo 6 caracteres').max(128),
})

export default function LoginPage(): JSX.Element {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()

    const result = LoginSchema.safeParse({ email, password })
    if (!result.success) {
      toast.error(result.error.issues[0]?.message ?? 'Datos inválidos')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: result.data.email,
        password: result.data.password,
      })

      if (error) {
        toast.error('Credenciales incorrectas')
        return
      }

      toast.success('Acceso concedido — redirigiendo...')
      router.push('/admin')
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-black grid-bg flex items-center justify-center p-4">
      {/* Ambient */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#00E5FF] opacity-[0.03] rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="glass-card p-8 w-full max-w-md border border-[rgba(0,229,255,0.3)]"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="font-mono-custom text-xs text-[#FF4444] mb-4 tracking-widest"
          >
            ⚠ ZONA RESTRINGIDA ⚠
          </motion.div>
          <h1 className="font-mono-custom text-2xl font-black text-[#00E5FF] mb-2">
            ADMIN ACCESS
          </h1>
          <p className="font-mono-custom text-xs text-slate-500">
            {'// Autenticación requerida — Supabase Auth'}
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="font-mono-custom text-xs text-slate-400 block mb-1.5">
              {'> email'}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="operator@domain.com"
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label className="font-mono-custom text-xs text-slate-400 block mb-1.5">
              {'> password'}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="••••••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 text-center disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? '> autenticando...' : '> iniciar_sesion()'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="/" className="font-mono-custom text-xs text-slate-600 hover:text-slate-400 transition-colors">
            ← volver al portfolio
          </a>
        </div>
      </motion.div>
    </main>
  )
}
