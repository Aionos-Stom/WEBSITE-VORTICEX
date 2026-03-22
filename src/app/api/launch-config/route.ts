import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { parseSiteConfig } from '@/lib/utils'
import type { SiteConfig } from '@/types/database'

export const revalidate = 0

export async function GET(): Promise<NextResponse> {
  const supabase = await createClient()
  const { data } = await supabase.from('site_config').select('*')
  const config = parseSiteConfig((data ?? []) as SiteConfig[])
  return NextResponse.json({
    launch_mode:     config.launch_mode,
    launch_date:     config.launch_date,
    launch_title:    config.launch_title,
    launch_subtitle: config.launch_subtitle,
  })
}
