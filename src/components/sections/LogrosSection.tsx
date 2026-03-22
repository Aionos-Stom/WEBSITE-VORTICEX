'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SectionWrapper } from '@/components/ui/SectionWrapper'
import type { Achievement } from '@/types/database'

interface LogrosSectionProps {
  achievements: Achievement[]
}

function AchievementModal({ item, onClose }: { item: Achievement; onClose: () => void }): JSX.Element {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative z-10 glass-card p-6 max-w-lg w-full border border-[rgba(155,92,255,0.3)]"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 font-mono-custom text-slate-400 hover:text-[#FF4444] transition-colors"
          >
            [X]
          </button>
          {item.image_url ? (
            <div className="h-48 rounded-xl overflow-hidden mb-4 border border-[rgba(155,92,255,0.2)]">
              <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
            </div>
          ) : null}
          {item.category ? (
            <span className="font-mono-custom text-xs text-[#9B5CFF] bg-[rgba(155,92,255,0.1)] px-2 py-0.5 rounded mb-3 inline-block">
              {item.category}
            </span>
          ) : null}
          <h3 className="font-mono-custom font-bold text-xl text-[#9B5CFF] mb-3">{item.title}</h3>
          {item.description ? (
            <p className="font-mono-custom text-sm text-slate-400 leading-relaxed">{item.description}</p>
          ) : null}
          {item.event_url ? (
            <a
              href={item.event_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary mt-4 inline-block"
              style={{ borderColor: 'rgba(155,92,255,0.4)', color: '#9B5CFF' }}
            >
              [ver_evento →]
            </a>
          ) : null}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export function LogrosSection({ achievements }: LogrosSectionProps): JSX.Element {
  const [selected, setSelected] = useState<Achievement | null>(null)
  const categories = Array.from(new Set(achievements.map((a) => a.category).filter(Boolean) as string[]))

  return (
    <SectionWrapper
      id="logros"
      label="// achievements.dat"
      title="Logros"
      titleColor="purple"
    >
      {achievements.length === 0 ? (
        <div className="text-center text-slate-500 font-mono-custom py-12">
          {'> sin_logros — agrega logros desde /admin'}
        </div>
      ) : (
        <>
          {/* Category groups */}
          {categories.length > 0 ? (
            <div className="space-y-10">
              {categories.map((cat) => {
                const items = achievements.filter((a) => a.category === cat)
                return (
                  <div key={cat}>
                    <p className="section-label mb-5 text-[#9B5CFF]">{cat}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {items.map((item, i) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.07 }}
                          whileHover={{ y: -4, scale: 1.02 }}
                          onClick={() => setSelected(item)}
                          className="glass-card cursor-pointer group hover:border-[rgba(155,92,255,0.35)] hover:shadow-[0_0_25px_rgba(155,92,255,0.1)] transition-all duration-300"
                        >
                          {item.image_url ? (
                            <div className="h-36 rounded-xl overflow-hidden mb-4 border border-[rgba(155,92,255,0.15)]">
                              <img
                                src={item.image_url}
                                alt={item.title}
                                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                              />
                            </div>
                          ) : (
                            <div className="h-12 w-12 bg-[rgba(155,92,255,0.1)] rounded-xl flex items-center justify-center mb-4 border border-[rgba(155,92,255,0.2)]">
                              <span className="text-2xl">🏆</span>
                            </div>
                          )}
                          <h3 className="font-mono-custom font-bold text-sm text-slate-200 group-hover:text-[#9B5CFF] transition-colors mb-2">
                            {item.title}
                          </h3>
                          {item.description ? (
                            <p className="font-mono-custom text-xs text-slate-500 line-clamp-2">{item.description}</p>
                          ) : null}
                          <div className="mt-3 pt-3 border-t border-[rgba(255,255,255,0.05)]">
                            <span className="font-mono-custom text-xs text-[#9B5CFF] opacity-0 group-hover:opacity-100 transition-opacity">
                              [ver_detalle →]
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )
              })}
              {/* Uncategorized */}
              {achievements.filter((a) => !a.category).length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {achievements.filter((a) => !a.category).map((item, i) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.07 }}
                      whileHover={{ y: -4 }}
                      onClick={() => setSelected(item)}
                      className="glass-card cursor-pointer group hover:border-[rgba(155,92,255,0.3)] transition-all duration-300"
                    >
                      <h3 className="font-mono-custom font-bold text-sm text-slate-200 group-hover:text-[#9B5CFF] transition-colors">
                        {item.title}
                      </h3>
                    </motion.div>
                  ))}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  whileHover={{ y: -4 }}
                  onClick={() => setSelected(item)}
                  className="glass-card cursor-pointer group hover:border-[rgba(155,92,255,0.3)] transition-all duration-300"
                >
                  {item.image_url ? (
                    <div className="h-36 rounded-xl overflow-hidden mb-4">
                      <img src={item.image_url} alt={item.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ) : null}
                  <h3 className="font-mono-custom font-bold text-sm text-slate-200 group-hover:text-[#9B5CFF] transition-colors">
                    {item.title}
                  </h3>
                </motion.div>
              ))}
            </div>
          )}

          {selected ? <AchievementModal item={selected} onClose={() => setSelected(null)} /> : null}
        </>
      )}
    </SectionWrapper>
  )
}
