import React, { useEffect, useRef, useState } from 'react'

export default function HatchIntro({ onDone }) {
  const canvasRef = useRef(null)
  const [step, setStep] = useState(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let raf = 0, t = 0
    function draw() {
      t++
      ctx.imageSmoothingEnabled = false
      ctx.fillStyle = '#0b0f10'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // vignette
      const g = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 20, canvas.width/2, canvas.height/2, 200)
      g.addColorStop(0, 'rgba(0,255,153,0.06)')
      g.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // pixel egg
      const cx = canvas.width/2
      const cy = canvas.height/2
      const s = 8
      const wob = Math.sin(t/20) * 2
      ctx.save()
      ctx.translate(cx + wob, cy)
      ctx.fillStyle = '#eae6d8'
      for (let y= -8; y<=8; y++) {
        const row = Math.round(Math.cos((y/8)*Math.PI) * 6)
        for (let x=-row; x<=row; x++) ctx.fillRect(x*s, y*s, s-1, s-1)
      }
      // crack progression
      if (step > 0) {
        ctx.strokeStyle = '#222'
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.moveTo(-10, -20)
        ctx.lineTo(0, -10)
        ctx.lineTo(10, -20)
        ctx.stroke()
      }
      if (step > 1) {
        ctx.beginPath(); ctx.moveTo(-6, -4); ctx.lineTo(0, 6); ctx.lineTo(8, -2); ctx.stroke()
      }
      if (step > 2) {
        ctx.beginPath(); ctx.moveTo(-2, 10); ctx.lineTo(4, 16); ctx.lineTo(10, 8); ctx.stroke()
      }
      ctx.restore()

      // sparkle
      if (step >= 3 && t % 5 === 0) {
        ctx.fillStyle = '#ccffcc'
        ctx.fillRect(cx-60 + Math.random()*120, cy-80 + Math.random()*120, 3, 3)
      }

      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [step])

  useEffect(() => {
    const a = setTimeout(() => setStep(1), 900)
    const b = setTimeout(() => setStep(2), 1800)
    const c = setTimeout(() => setStep(3), 2700)
    const d = setTimeout(() => onDone?.(), 3800)
    return () => { clearTimeout(a); clearTimeout(b); clearTimeout(c); clearTimeout(d) }
  }, [onDone])

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
      <div style={{ textAlign: 'center' }}>
        <canvas ref={canvasRef} width={480} height={320} style={{ width: 'min(90vw, 640px)', height: 'auto', imageRendering: 'pixelated' }} />
        <div style={{ color: '#b8ffe6', fontSize: 12, marginTop: 8 }}>Hatching your pet...</div>
      </div>
    </div>
  )
}