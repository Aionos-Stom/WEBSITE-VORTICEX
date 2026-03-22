import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { StarfieldCanvas } from '@/components/3d/StarfieldCanvas'
import { HeroSection } from '@/components/sections/HeroSection'
import { SobreMiSection } from '@/components/sections/SobreMiSection'
import { ServiciosSection } from '@/components/sections/ServiciosSection'
import { RegistroMensualSection } from '@/components/sections/RegistroMensualSection'
import { ArsenalTecnicoSection } from '@/components/sections/ArsenalTecnicoSection'
import { MisionesSection } from '@/components/sections/MisionesSection'
import { ManifiestoSection } from '@/components/sections/ManifiestoSection'
import { ArmeriaSection } from '@/components/sections/ArmeriaSection'
import { CertificadosSection } from '@/components/sections/CertificadosSection'
import { LogrosSection } from '@/components/sections/LogrosSection'
import { ObjetivosSection } from '@/components/sections/ObjetivosSection'
import { ActivitySection } from '@/components/sections/ActivitySection'
import { GaleriaSection } from '@/components/sections/GaleriaSection'
import { ContactoSection } from '@/components/sections/ContactoSection'
import { parseSiteConfig } from '@/lib/utils'
import type {
  MonthlyEntry, Skill, Stat, Project,
  Certificate, Achievement, Objective, SiteConfig,
  Gallery, ActivityLog, ManifestoItem, ArmeriaLayer, Service,
} from '@/types/database'

export const revalidate = 0

export default async function HomePage(): Promise<JSX.Element> {
  const supabase = await createClient()

  // Check launch mode first
  const { data: configRows } = await supabase.from('site_config').select('*')
  const config = parseSiteConfig((configRows ?? []) as SiteConfig[])

  if (config.launch_mode === 'true') {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      redirect('/coming-soon')
    }
  }

  // Fetch all data in parallel
  const [
    statsRes,
    entriesRes,
    skillsRes,
    projectsRes,
    certsRes,
    achievementsRes,
    objectivesRes,
    galleryRes,
    activityRes,
    manifiestoRes,
    armeriaRes,
    serviciosRes,
  ] = await Promise.all([
    supabase.from('stats').select('*').order('sort_order'),
    supabase.from('monthly_entries').select('*').order('month', { ascending: false }),
    supabase.from('skills').select('*').order('sort_order'),
    supabase.from('projects').select('*').order('sort_order'),
    supabase.from('certificates').select('*').order('created_at', { ascending: false }),
    supabase.from('achievements').select('*').order('created_at', { ascending: false }),
    supabase.from('objectives').select('*').order('sort_order'),
    supabase.from('gallery').select('*').order('sort_order'),
    supabase.from('activity_log').select('*').order('date', { ascending: false }),
    supabase.from('manifesto_items').select('*').order('sort_order'),
    supabase.from('armeria_layers').select('*').order('sort_order'),
    supabase.from('services').select('*').order('sort_order'),
  ])

  const stats         = (statsRes.data ?? []) as Stat[]
  const entries       = (entriesRes.data ?? []) as MonthlyEntry[]
  const skills        = (skillsRes.data ?? []) as Skill[]
  const projects      = (projectsRes.data ?? []) as Project[]
  const certificates  = (certsRes.data ?? []) as Certificate[]
  const achievements  = (achievementsRes.data ?? []) as Achievement[]
  const objectives    = (objectivesRes.data ?? []) as Objective[]
  const gallery       = (galleryRes.data ?? []) as Gallery[]
  const activities    = (activityRes.data ?? []) as ActivityLog[]
  const manifiestoItems = (manifiestoRes.data ?? []) as ManifestoItem[]
  const armeriaLayers = (armeriaRes.data ?? []) as ArmeriaLayer[]
  const services      = (serviciosRes.data ?? []) as Service[]

  return (
    <main className="relative min-h-screen bg-black grid-bg">
      <StarfieldCanvas />

      {/* Ambient glows */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-[#00E5FF] opacity-[0.03] rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-64 h-64 bg-[#9B5CFF] opacity-[0.04] rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10">
        <HeroSection config={config} stats={stats} />
        <SobreMiSection config={config} />
        <ServiciosSection services={services} />
        <ArsenalTecnicoSection skills={skills} />
        <MisionesSection projects={projects} />
        <GaleriaSection items={gallery} />
        <ManifiestoSection items={manifiestoItems} />
        <ArmeriaSection layers={armeriaLayers} />
        <CertificadosSection certificates={certificates} />
        <LogrosSection achievements={achievements} />
        <ObjetivosSection objectives={objectives} />
        <ActivitySection activities={activities} certificates={certificates} />
        <RegistroMensualSection entries={entries} />
        <ContactoSection />

        <footer className="py-12 px-8 border-t border-[rgba(0,229,255,0.1)] text-center">
          <p className="font-mono-custom text-xs text-slate-600">
            {'// '}{config.hero_name}{' — '}{config.hero_year}{' — Next.js · Supabase · Three.js'}
          </p>
        </footer>
      </div>
    </main>
  )
}
