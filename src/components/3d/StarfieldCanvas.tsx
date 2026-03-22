'use client'

import { useEffect, useRef } from 'react'

interface Star {
  x: number
  y: number
  z: number
  px: number
  py: number
  color: number // 0=cyan, 1=purple, 2=white
}

export function StarfieldCanvas(): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const starsRef = useRef<Star[]>([])
  const mouseRef = useRef({ x: 0, y: 0, tx: 0, ty: 0 })
  const animRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return

    const NUM_STARS = 500
    const SPEED = 0.8
    let W = window.innerWidth
    let H = window.innerHeight

    const resize = (): void => {
      W = window.innerWidth
      H = window.innerHeight
      canvas.width = W
      canvas.height = H
    }

    const mkStar = (): Star => ({
      x: Math.random() * W - W / 2,
      y: Math.random() * H - H / 2,
      z: Math.random() * W,
      px: 0,
      py: 0,
      color: Math.floor(Math.random() * 10) < 6 ? 0 : Math.floor(Math.random() * 10) < 8 ? 1 : 2,
    })

    const initStars = (): void => {
      starsRef.current = Array.from({ length: NUM_STARS }, mkStar)
    }

    const handleMouseMove = (e: MouseEvent): void => {
      mouseRef.current.tx = (e.clientX - W / 2) * 0.0004
      mouseRef.current.ty = (e.clientY - H / 2) * 0.0004
    }

    resize()
    initStars()

    const onResize = (): void => { resize(); initStars() }
    window.addEventListener('resize', onResize)
    window.addEventListener('mousemove', handleMouseMove)

    let lastTime = 0

    const draw = (time: number): void => {
      const dt = Math.min((time - lastTime) / 16.67, 2) // cap at 2x
      lastTime = time

      // Smooth parallax interpolation
      mouseRef.current.x += (mouseRef.current.tx - mouseRef.current.x) * 0.06
      mouseRef.current.y += (mouseRef.current.ty - mouseRef.current.y) * 0.06

      ctx.fillStyle = 'rgba(0,0,0,0.18)'
      ctx.fillRect(0, 0, W, H)

      ctx.save()
      ctx.translate(W / 2, H / 2)

      const pX = mouseRef.current.x * 40
      const pY = mouseRef.current.y * 40

      starsRef.current.forEach((star) => {
        star.z -= SPEED * dt

        if (star.z <= 0) {
          Object.assign(star, mkStar(), { z: W, px: 0, py: 0 })
          return
        }

        const k = W / star.z
        const sx = star.x * k + pX
        const sy = star.y * k + pY

        // Clip stars outside canvas
        if (sx < -W / 2 - 10 || sx > W / 2 + 10 || sy < -H / 2 - 10 || sy > H / 2 + 10) {
          star.px = sx; star.py = sy; return
        }

        const size = Math.max(0.2, (1 - star.z / W) * 2.8)
        const opacity = 1 - star.z / W

        // Trail
        if (star.px !== 0 || star.py !== 0) {
          ctx.beginPath()
          ctx.moveTo(star.px, star.py)
          ctx.lineTo(sx, sy)
          const trailAlpha = opacity * 0.5 * dt
          if (star.color === 0) ctx.strokeStyle = `rgba(0,229,255,${trailAlpha})`
          else if (star.color === 1) ctx.strokeStyle = `rgba(155,92,255,${trailAlpha * 0.8})`
          else ctx.strokeStyle = `rgba(255,255,255,${trailAlpha * 0.4})`
          ctx.lineWidth = size * 0.5
          ctx.stroke()
        }

        star.px = sx
        star.py = sy

        // Glow for close bright stars
        if (size > 1.8) {
          ctx.shadowBlur = size * 6
          if (star.color === 0) ctx.shadowColor = 'rgba(0,229,255,0.9)'
          else if (star.color === 1) ctx.shadowColor = 'rgba(155,92,255,0.9)'
          else ctx.shadowColor = 'rgba(255,255,255,0.7)'
        } else {
          ctx.shadowBlur = 0
        }

        ctx.beginPath()
        ctx.arc(sx, sy, size, 0, Math.PI * 2)
        if (star.color === 0) ctx.fillStyle = `rgba(0,229,255,${opacity})`
        else if (star.color === 1) ctx.fillStyle = `rgba(155,92,255,${opacity * 0.85})`
        else ctx.fillStyle = `rgba(220,240,255,${opacity * 0.6})`
        ctx.fill()
      })

      ctx.shadowBlur = 0
      ctx.restore()
      animRef.current = requestAnimationFrame(draw)
    }

    animRef.current = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', onResize)
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
