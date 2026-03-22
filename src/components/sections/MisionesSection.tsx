'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SectionWrapper } from '@/components/ui/SectionWrapper'
import type { Project } from '@/types/database'

interface MisionesSectionProps {
  projects: Project[]
}

export function MisionesSection({ projects }: MisionesSectionProps): JSX.Element {
  const [filter, setFilter] = useState('TODOS')
  const categories = ['TODOS', ...Array.from(new Set(projects.map((p) => p.category).filter(Boolean) as string[]))]
  const featured = projects.filter((p) => p.featured)
  const filtered = filter === 'TODOS'
    ? [...projects].sort((a, b) => a.sort_order - b.sort_order)
    : projects.filter((p) => p.category === filter).sort((a, b) => a.sort_order - b.sort_order)

  return (
    <SectionWrapper
      id="misiones"
      label="// projects.db"
      title="Misiones"
      titleColor="green"
    >
      {projects.length === 0 ? (
        <div className="text-center text-slate-500 font-mono-custom py-12">
          {'> sin_proyectos — agrega misiones desde /admin'}
        </div>
      ) : (
        <>
          {/* Featured */}
          {featured.length > 0 ? (
            <div className="mb-8">
              <p className="section-label mb-4">DESTACADOS</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {featured.slice(0, 2).map((p, i) => (
                  <motion.a
                    key={p.id}
                    href={p.project_url ?? '#'}
                    target={p.project_url ? '_blank' : undefined}
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ y: -4 }}
                    className="glass-card overflow-hidden group border-[rgba(0,255,136,0.2)] hover:border-[rgba(0,255,136,0.4)] hover:shadow-[0_0_30px_rgba(0,255,136,0.1)] transition-all duration-300"
                  >
                    {p.image_url ? (
                      <div className="h-48 overflow-hidden">
                        <img
                          src={p.image_url}
                          alt={p.name}
                          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                        />
                      </div>
                    ) : (
                      <div className="h-48 bg-[rgba(0,255,136,0.05)] flex items-center justify-center">
                        <span className="font-mono-custom text-5xl opacity-30">⚡</span>
                      </div>
                    )}
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-2">
                        {p.category ? (
                          <span className="font-mono-custom text-xs text-[#00FF88] bg-[rgba(0,255,136,0.1)] px-2 py-0.5 rounded">
                            {p.category}
                          </span>
                        ) : null}
                        <span className="font-mono-custom text-xs text-[#F59E0B]">★ DESTACADO</span>
                      </div>
                      <h3 className="font-mono-custom font-bold text-slate-200 group-hover:text-[#00FF88] transition-colors">
                        {p.name}
                      </h3>
                      {p.description ? (
                        <p className="font-mono-custom text-xs text-slate-500 mt-2 line-clamp-2">{p.description}</p>
                      ) : null}
                    </div>
                  </motion.a>
                ))}
              </div>
            </div>
          ) : null}

          {/* Filter */}
          {categories.length > 1 ? (
            <div className="flex flex-wrap gap-2 mb-6">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className="font-mono-custom text-xs px-3 py-1.5 rounded border transition-all duration-200"
                  style={
                    filter === cat
                      ? { background: 'rgba(0,255,136,0.1)', borderColor: '#00FF88', color: '#00FF88' }
                      : { borderColor: 'rgba(255,255,255,0.1)', color: '#64748B' }
                  }
                >
                  {cat}
                </button>
              ))}
            </div>
          ) : null}

          {/* All projects grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={filter}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {filtered.map((p, i) => (
                <motion.a
                  key={p.id}
                  href={p.project_url ?? '#'}
                  target={p.project_url ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -3 }}
                  className="glass-card group hover:border-[rgba(0,229,255,0.3)] hover:shadow-[0_0_20px_rgba(0,229,255,0.08)] transition-all duration-300"
                >
                  {p.image_url ? (
                    <div className="h-36 overflow-hidden rounded-lg mb-4">
                      <img
                        src={p.image_url}
                        alt={p.name}
                        className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity"
                      />
                    </div>
                  ) : null}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      {p.category ? (
                        <span className="font-mono-custom text-xs text-[#9B5CFF] bg-[rgba(155,92,255,0.1)] px-2 py-0.5 rounded mb-2 inline-block">
                          {p.category}
                        </span>
                      ) : null}
                      <h3 className="font-mono-custom font-bold text-sm text-slate-200 group-hover:text-[#00E5FF] transition-colors">
                        {p.name}
                      </h3>
                      {p.description ? (
                        <p className="font-mono-custom text-xs text-slate-500 mt-2 line-clamp-2">{p.description}</p>
                      ) : null}
                    </div>
                    {p.project_url ? (
                      <span className="font-mono-custom text-xs text-[#00E5FF] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">→</span>
                    ) : null}
                  </div>
                </motion.a>
              ))}
            </motion.div>
          </AnimatePresence>
        </>
      )}
    </SectionWrapper>
  )
}
