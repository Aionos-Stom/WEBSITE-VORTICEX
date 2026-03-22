import type { Metadata } from 'next'
import './globals.css'
import { CursorOrb } from '@/components/ui/CursorOrb'
import { ScrollProgress } from '@/components/ui/ScrollProgress'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: 'Hi Soy Johan | Cybersecurity Developer and Software Developer',
  description: 'Senior Full Stack Engineer & Cybersecurity Architect. Building secure, immersive digital experiences.',
  keywords: ['cybersecurity', 'full stack', 'developer', 'portfolio', 'security', 'web'],
  authors: [{ name: 'Carlos Efrain Guillermo Rodriguez' }],
  openGraph: {
    title: 'Johan Torres | Owner System — Software Developer, Cybersecurity Developer',
    description: 'Senior Full Stack Engineer & Cybersecurity Architect.',
    type: 'website',
  },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className="dark">
      <body className="bg-black text-slate-200 antialiased scanline-overlay">
        <ScrollProgress />
        <CursorOrb />
        {children}
        <Toaster
          theme="dark"
          toastOptions={{
            style: {
              background: 'rgba(10,10,20,0.97)',
              border: '1px solid rgba(0,229,255,0.2)',
              color: '#E2E8F0',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.8rem',
              borderRadius: '12px',
              boxShadow: '0 0 30px rgba(0,229,255,0.1)',
            },
          }}
        />
      </body>
    </html>
  )
}
