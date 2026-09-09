import { useEffect, useRef } from 'react'

// 轻量 2D 粒子场（无 WebGL 依赖）：漂浮+微光，用于封面背景
export default function Particles({ className = '' }) {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas.getContext('2d')
    if (!canvas || !ctx) return undefined

    let raf
    let w = 0
    let h = 0
    const colors = ['#62f1d1', '#9b6cff', '#f4f7f8']
    let dots = []

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = canvas.clientWidth
      h = canvas.clientHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const init = () => {
      const n = Math.max(40, Math.round((w * h) / 18000))
      dots = Array.from({ length: n }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.8 + 0.7,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        c: colors[(Math.random() * colors.length) | 0],
        a: Math.random() * 0.55 + 0.22,
        tw: Math.random() * Math.PI * 2,
      }))
    }

    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      for (const d of dots) {
        d.x += d.vx
        d.y += d.vy
        d.tw += 0.03
        if (d.x < 0) d.x = w
        if (d.x > w) d.x = 0
        if (d.y < 0) d.y = h
        if (d.y > h) d.y = 0
        const alpha = Math.max(0, Math.min(1, d.a + Math.sin(d.tw) * 0.2))
        ctx.beginPath()
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2)
        ctx.fillStyle = d.c
        ctx.globalAlpha = alpha
        ctx.shadowBlur = 9
        ctx.shadowColor = d.c
        ctx.fill()
      }
      ctx.globalAlpha = 1
      raf = requestAnimationFrame(draw)
    }

    resize()
    init()
    draw()
    const onResize = () => { resize(); init() }
    window.addEventListener('resize', onResize)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return <canvas ref={ref} className={`pointer-events-none h-full w-full ${className}`} aria-hidden="true" />
}
