import React, { useEffect, useRef, useState } from 'react'

const SPRITES = {
  'forest-fox': '/assets/pets/forest-fox.svg',
  'mystic-bunny': '/assets/pets/mystic-bunny.svg',
  'robo-cat': '/assets/pets/robo-cat.svg',
}

export default function PetCanvas({ petId = 'forest-fox', actionSignal, onPet }) {
  const ref = useRef(null)
  const [sleeping, setSleeping] = useState(false)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let frame = 0
    let raf = 0

    const img = new Image()
    img.src = SPRITES[petId] || SPRITES['forest-fox']

    // background stars
    const stars = Array.from({ length: 40 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * (canvas.height * 0.6),
      s: Math.random() * 1.2 + 0.4,
      v: Math.random() * 0.2 + 0.05,
    }))

    const particles = []

    let x = canvas.width / 2
    let y = canvas.height / 2
    let vx = 0.35
    let vy = 0.28
    let bounce = 0

    let state = 'idle'
    let stateTimer = 300
    function transition(next) { state = next; stateTimer = 240 + Math.floor(Math.random() * 240) }
    function updateState() {
      stateTimer--
      if (stateTimer <= 0) {
        const options = ['idle', 'sit', 'wag', 'walk']
        if (!sleeping && Math.random() < 0.2) options.push('curl')
        transition(options[Math.floor(Math.random() * options.length)])
      }
    }

    function drawBackground() {
      // sky gradient
      const g = ctx.createLinearGradient(0, 0, 0, canvas.height)
      g.addColorStop(0, '#0a0f0f')
      g.addColorStop(1, '#0f1313')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // stars parallax
      ctx.fillStyle = '#0ff9'
      for (const st of stars) {
        ctx.fillRect(st.x, st.y, st.s, st.s)
        st.x += st.v * 0.2
        if (st.x > canvas.width) st.x = -2
      }

      // ground ellipse shadow
      ctx.save()
      ctx.fillStyle = 'rgba(0,0,0,0.45)'
      const gw = canvas.width * 0.35
      const gh = 18
      ctx.beginPath()
      ctx.ellipse(canvas.width / 2, canvas.height * 0.75, gw, gh, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }

    function loop() {
      frame++
      updateState()
      drawBackground()

      if (!sleeping) {
        if (state === 'walk') {
          x += vx
          if (x < 120 || x > canvas.width - 120) vx *= -1
        } else if (state === 'wag') {
          vy = Math.sin(frame / 8) * 0.2
        } else {
          vy = Math.sin(frame / 40) * 0.15
        }
        y = canvas.height * 0.6 + vy * 30
      } else {
        y = canvas.height * 0.6 + Math.sin(frame / 20) * 3
      }

      const b = Math.max(0, bounce)
      if (bounce > 0) bounce -= 0.02

      const size = Math.min(canvas.width, canvas.height) * 0.35 * (1 + b * 0.15)
      ctx.save()
      ctx.imageSmoothingEnabled = false
      ctx.translate(x, y + (state === 'sit' ? 6 : state === 'curl' ? 10 : 0))
      ctx.drawImage(img, -size / 2, -size / 2, size, size)
      ctx.restore()

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.y += p.vy
        p.life--
        if (p.life <= 0) { particles.splice(i, 1); continue }
        ctx.save()
        ctx.globalAlpha = Math.max(0, p.life / 60)
        if (p.kind === 'heart') {
          ctx.fillStyle = '#ff66aa'
          ctx.font = '16px monospace'
          ctx.fillText('❤', p.x, p.y)
        } else if (p.kind === 'spark') {
          ctx.fillStyle = '#ffd37a'
          ctx.fillRect(p.x, p.y, 3, 3)
        } else if (p.kind === 'eat') {
          ctx.fillStyle = '#aaffcc'
          ctx.font = '14px monospace'
          ctx.fillText('🍖', p.x, p.y)
        }
        ctx.restore()
      }

      if (sleeping || state === 'curl') {
        if (frame % 60 < 30) {
          ctx.fillStyle = '#9cf'
          ctx.font = '16px monospace'
          ctx.fillText('Z', x + 40, y - 40)
        }
      }

      raf = requestAnimationFrame(loop)
    }

    img.onload = () => { raf = requestAnimationFrame(loop) }
    raf = requestAnimationFrame(loop)

    return () => cancelAnimationFrame(raf)
  }, [petId, sleeping])

  useEffect(() => {
    if (!actionSignal) return
    const { type } = actionSignal
    if (type === 'sleep') setSleeping(true)
    if (type === 'wake') setSleeping(false)
  }, [actionSignal])

  const handleClick = () => { onPet?.() }

  return (
    <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
      <canvas ref={ref} width={1200} height={700} style={{ width: '100%', height: 'min(60vh, 640px)', cursor: 'pointer' }} onClick={handleClick} />
      <div style={{ position: 'absolute', top: 8, right: 8 }}>
        <button onClick={() => setSleeping((s) => !s)}>{sleeping ? 'Wake' : 'Sleep'}</button>
      </div>
    </div>
  )
}