import { createClient } from '@/lib/supabase/server'
import { StarfieldCanvas } from '@/components/3d/StarfieldCanvas'
import { HeroSection } from '@/components/sections/HeroSection'
import { RegistroMensualSection } from '@/components/sections/RegistroMensualSection'
import { ArsenalTecnicoSection } from '@/components/sections/ArsenalTecnicoSection'
import { MisionesSection } from '@/components/sections/MisionesSection'
import { CertificadosSection } from '@/components/sections/CertificadosSection'
import { LogrosSection } from '@/components/sections/LogrosSection'
import { ObjetivosSection } from '@/components/sections/ObjetivosSection'
import type {
  Perfil, RegistroMensual, ArsenalTecnico, Mision,
  Certificado, Logro, Objetivo,
} from '@/types/database'

export const revalidate = 60

export default async function HomePage(): Promise<JSX.Element> {
  const supabase = await createClient()

  // All data fetched from Supabase — zero localStorage
  const [
    perfilRes,
    registrosRes,
    arsenalRes,
    misionesRes,
    certificadosRes,
    logrosRes,
    objetivosRes,
  ] = await Promise.all([
    supabase.from('perfil').select('*').single(),
    supabase.from('registro_mensual').select('*').order('ano', { ascending: false }).order('mes', { ascending: false }),
    supabase.from('arsenal_tecnico').select('*').eq('activo', true).order('orden'),
    supabase.from('misiones').select('*').eq('activo', true).order('orden'),
    supabase.from('certificados').select('*').eq('activo', true).order('orden'),
    supabase.from('logros').select('*').eq('activo', true).order('orden'),
    supabase.from('objetivos').select('*').eq('activo', true).order('orden'),
  ])

  const perfil = perfilRes.data as Perfil | null
  const registros = (registrosRes.data ?? []) as RegistroMensual[]
  const arsenal = (arsenalRes.data ?? []) as ArsenalTecnico[]
  const misiones = (misionesRes.data ?? []) as Mision[]
  const certificados = (certificadosRes.data ?? []) as Certificado[]
  const logros = (logrosRes.data ?? []) as Logro[]
  const objetivos = (objetivosRes.data ?? []) as Objetivo[]

  return (
    <main className="relative min-h-screen bg-black grid-bg">
      <StarfieldCanvas />

      {/* Ambient glow */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-[#00E5FF] opacity-[0.03] rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-64 h-64 bg-[#9B5CFF] opacity-[0.04] rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10">
        <HeroSection perfil={perfil} />
        <RegistroMensualSection registros={registros} />
        <ArsenalTecnicoSection arsenal={arsenal} />
        <MisionesSection misiones={misiones} />
        <CertificadosSection certificados={certificados} />
        <LogrosSection logros={logros} />
        <ObjetivosSection objetivos={objetivos} />

        <footer className="relative z-10 py-12 px-8 border-t border-[rgba(0,229,255,0.1)] text-center">
          <p className="font-mono-custom text-xs text-slate-600">
            {'// mellamobrau — '}{new Date().getFullYear()}{' — Next.js · Supabase · Three.js'}
          </p>
          <p className="font-mono-custom text-xs text-slate-700 mt-2">
            {'"Think like an attacker. Build like a defender. Design like an artist."'}
          </p>
        </footer>
      </div>
    </main>
  )
}
