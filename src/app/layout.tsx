import type { Metadata } from 'next'
import './globals.css'
import { CursorOrb } from '@/components/ui/CursorOrb'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: 'mellamobrau | Carlos Efrain — Cybersecurity Developer',
  description:
    'Senior Full Stack Engineer & Cybersecurity Architect. Building secure, immersive digital experiences from the shadows.',
  keywords: ['cybersecurity', 'full stack', 'developer', 'portfolio', 'security', 'web'],
  authors: [{ name: 'Carlos Efrain Guillermo Rodriguez' }],
  openGraph: {
    title: 'mellamobrau | Carlos Efrain — Cybersecurity Developer',
    description: 'Senior Full Stack Engineer & Cybersecurity Architect.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="dark">
      <body className="bg-black text-slate-200 antialiased scanline-overlay">
        <CursorOrb />
        {children}
        <Toaster
          theme="dark"
          toastOptions={{
            style: {
              background: 'rgba(13,13,26,0.95)',
              border: '1px solid rgba(0,229,255,0.2)',
              color: '#E2E8F0',
              fontFamily: 'JetBrains Mono, monospace',
            },
          }}
        />
      </body>
    </html>
  )
}
