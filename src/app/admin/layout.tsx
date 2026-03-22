import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin Panel | mellamobrau',
  robots: { index: false, follow: false },
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}): Promise<JSX.Element> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-black grid-bg flex">
      <AdminSidebar userEmail={user.email ?? ''} />
      <main className="flex-1 pt-16 md:pt-6 px-4 md:px-6 pb-6 overflow-auto min-w-0">
        {children}
      </main>
    </div>
  )
}
