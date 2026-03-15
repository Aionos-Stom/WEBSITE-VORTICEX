'use client'

import { useEffect, useRef } from 'react'

interface Star {
  x: number
  y: number
  z: number
  px: number
  py: number
}

export function StarfieldCanvas(): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const starsRef = useRef<Star[]>([])
  const mouseRef = useRef({ x: 0, y: 0 })
  const animRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const NUM_STARS = 300
    const SPEED = 0.5
    let W = window.innerWidth
    let H = window.innerHeight

    const resize = (): void => {
      W = window.innerWidth
      H = window.innerHeight
      canvas.width = W
      canvas.height = H
    }

    const initStars = (): void => {
      starsRef.current = Array.from({ length: NUM_STARS }, () => ({
        x: Math.random() * W - W / 2,
        y: Math.random() * H - H / 2,
        z: Math.random() * W,
        px: 0,
        py: 0,
      }))
    }

    const handleMouseMove = (e: MouseEvent): void => {
      mouseRef.current = {
        x: (e.clientX - W / 2) * 0.0005,
        y: (e.clientY - H / 2) * 0.0005,
      }
    }

    resize()
    initStars()
    window.addEventListener('resize', () => { resize(); initStars() })
    window.addEventListener('mousemove', handleMouseMove)

    const draw = (): void => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)'
      ctx.fillRect(0, 0, W, H)

      ctx.save()
      ctx.translate(W / 2, H / 2)

      const parallaxX = mouseRef.current.x * 30
      const parallaxY = mouseRef.current.y * 30

      starsRef.current.forEach((star) => {
        star.z -= SPEED

        if (star.z <= 0) {
          star.x = Math.random() * W - W / 2
          star.y = Math.random() * H - H / 2
          star.z = W
          star.px = 0
          star.py = 0
        }

        const k = W / star.z
        const sx = star.x * k + parallaxX
        const sy = star.y * k + parallaxY

        const size = (1 - star.z / W) * 3
        const opacity = 1 - star.z / W

        // Draw trail
        if (star.px !== 0 || star.py !== 0) {
          ctx.beginPath()
          ctx.moveTo(star.px, star.py)
          ctx.lineTo(sx, sy)
          ctx.strokeStyle = `rgba(0, 229, 255, ${opacity * 0.4})`
          ctx.lineWidth = size * 0.5
          ctx.stroke()
        }

        star.px = sx
        star.py = sy

        // Draw star dot
        ctx.beginPath()
        ctx.arc(sx, sy, size, 0, Math.PI * 2)

        // Color variation: cyan, purple, white
        const rand = (star.x * star.y * star.z) % 3
        let color: string
        if (rand < 1) color = `rgba(0, 229, 255, ${opacity})`
        else if (rand < 2) color = `rgba(155, 92, 255, ${opacity * 0.7})`
        else color = `rgba(255, 255, 255, ${opacity * 0.5})`

        ctx.fillStyle = color

        // Glow for bright stars
        if (size > 1.5) {
          ctx.shadowBlur = 8
          ctx.shadowColor = 'rgba(0, 229, 255, 0.8)'
        } else {
          ctx.shadowBlur = 0
        }
        ctx.fill()
      })

      ctx.restore()
      animRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full"
      style={{ zIndex: 0, pointerEvents: 'none' }}
    />
  )
}
