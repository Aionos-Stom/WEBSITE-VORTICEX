import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#000000',
        surface: '#0D0D1A',
        'surface-80': 'rgba(13,13,26,0.8)',
        cyan: {
          DEFAULT: '#00E5FF',
          glow: 'rgba(0,229,255,0.2)',
        },
        purple: {
          DEFAULT: '#9B5CFF',
          glow: 'rgba(155,92,255,0.2)',
        },
        green: {
          DEFAULT: '#00FF88',
          glow: 'rgba(0,255,136,0.2)',
        },
        border: 'rgba(0,229,255,0.15)',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'grid-pattern': "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2300E5FF' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'scan': 'scan 8s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px #00E5FF, 0 0 10px #00E5FF' },
          '100%': { boxShadow: '0 0 20px #00E5FF, 0 0 40px #00E5FF, 0 0 80px #00E5FF' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
      },
      boxShadow: {
        'cyan-glow': '0 0 20px rgba(0,229,255,0.3), 0 0 60px rgba(0,229,255,0.1)',
        'purple-glow': '0 0 20px rgba(155,92,255,0.3), 0 0 60px rgba(155,92,255,0.1)',
        'green-glow': '0 0 20px rgba(0,255,136,0.3), 0 0 60px rgba(0,255,136,0.1)',
        'glass': '0 8px 32px 0 rgba(0, 229, 255, 0.05)',
      },
      backdropBlur: {
        glass: '16px',
      },
      borderRadius: {
        lg: '0.5rem',
        md: '0.375rem',
        sm: '0.25rem',
      },
    },
  },
  plugins: [],
}

export default config
