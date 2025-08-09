import React, { useEffect, useRef, useState } from 'react'

const SPRITES = {
  'forest-fox': '/assets/pets/forest-fox.svg',
  'mystic-bunny': '/assets/pets/mystic-bunny.svg',
  'robo-cat': '/assets/pets/robo-cat.svg',
}

function paletteColors(palette) {
  switch (palette) {
    case 'pastel': return { bgTop: '#1b1d22', bgBot: '#101317', star: '#ffd37a88', accent: '#ffd37a' }
    case 'dusk': return { bgTop: '#121420', bgBot: '#0b0e16', star: '#7aa4ff88', accent: '#7aa4ff' }
    case 'holo': return { bgTop: '#141414', bgBot: '#0f1113', star: '#c0ffee88', accent: '#c0ffee' }
    default: return { bgTop: '#0a0f0f', bgBot: '#0f1313', star: '#0ff9', accent: '#00ffcc' }
  }
}

export default function PetCanvas({ petId = 'forest-fox', actionSignal, onPet, traits }) {
  const ref = useRef(null)
  const [sleeping, setSleeping] = useState(false)
  const actionRef = useRef(null)
  const particlesRef = useRef([])
  const getParticleRef = useRef(null)
  const releaseParticleRef = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let frame = 0
    let raf = 0
    let lastFrameTime = 0
    const targetFPS = 30
    const frameInterval = 1000 / targetFPS

    const img = new Image()
    img.src = SPRITES[petId] || SPRITES['forest-fox']

    const colors = paletteColors(traits?.palette)

    const stars = Array.from({ length: 40 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * (canvas.height * 0.6),
      s: Math.random() * 1.2 + 0.4,
      v: Math.random() * 0.2 + 0.05,
    }))

    const particles = particlesRef.current
    const particlePool = []
    
    // Particle pool to reduce garbage collection
    const getParticle = (kind, x, y, vy, life) => {
      const particle = particlePool.pop() || {}
      particle.kind = kind
      particle.x = x
      particle.y = y
      particle.vy = vy
      particle.life = life
      return particle
    }
    
    const releaseParticle = (particle) => {
      if (particlePool.length < 50) { // Cap pool size
        particlePool.push(particle)
      }
    }
    
    // Store functions in refs for access in click handler
    getParticleRef.current = getParticle
    releaseParticleRef.current = releaseParticle

    let x = canvas.width / 2
    let y = canvas.height * 0.6
    let speed = 0.9
    let targetX = x
    let targetY = y
    let chaseUntil = 0
    let bounceFrames = 0

    function newTarget() {
      targetX = Math.random() * (canvas.width - 240) + 120
      targetY = canvas.height * (0.5 + Math.random() * 0.15)
    }

    let state = 'idle'
    let stateTimer = 300
    let idleTicks = 0
    function transition(next) { state = next; stateTimer = 240 + Math.floor(Math.random() * 240) }
    function updateState() {
      frame++
      stateTimer--
      idleTicks++
      if (bounceFrames > 0) bounceFrames--

      // occasional auto sleep/wake
      if (!sleeping && idleTicks > 1200 && Math.random() < 0.002) { setSleeping(true); idleTicks = 0 }
      if (sleeping && Math.random() < 0.01) { setSleeping(false) }

      // react to external actions once
      if (actionRef.current) {
        const { type } = actionRef.current
        if (type === 'play') {
          bounceFrames = 60
          for (let i = 0; i < 12; i++) {
            particles.push(getParticle('spark', x + (Math.random() * 80 - 40), y - 30 + (Math.random() * 20 - 10), -0.6 - Math.random() * 0.6, 60 + Math.random() * 30))
          }
        } else if (type === 'eat') {
          for (let i = 0; i < 8; i++) {
            particles.push(getParticle('eat', x + (Math.random() * 40 - 20), y - 20 + (Math.random() * 10 - 5), -0.4 - Math.random() * 0.4, 50 + Math.random() * 20))
          }
        } else if (type === 'sleep') {
          setSleeping(true)
        } else if (type === 'wake') {
          setSleeping(false)
        }
        actionRef.current = null
      }

      if (stateTimer <= 0) {
        const options = ['idle', 'sit', 'wag', 'walk']
        if (!sleeping && Math.random() < 0.2) options.push('curl')
        if (!sleeping && Math.random() < 0.15) options.push('scratch')
        if (!sleeping && Math.random() < 0.1) options.push('stretch')
        transition(options[Math.floor(Math.random() * options.length)])
        if (state === 'walk') newTarget()
      }

      // movement towards target; chase cursor while active
      const now = performance.now()
      if (now < chaseUntil) {
        const dx = targetX - x
        const dy = targetY - y
        const dist = Math.hypot(dx, dy)
        if (dist > 1) { x += (dx / dist) * (speed + 0.7); y += (dy / dist) * (speed + 0.5) }
      } else if (!sleeping) {
        if (state === 'walk') {
          const dx = targetX - x
          const dy = targetY - y
          const dist = Math.hypot(dx, dy)
          if (dist < 4) newTarget()
          else { x += (dx / dist) * speed; y += (dy / dist) * speed }
        }
      }

      // occasional idle emotes
      if (!sleeping && Math.random() < 0.01) {
        particles.push(getParticle('spark', x + (Math.random() * 60 - 30), y - 30, -0.4, 60))
      }
    }

    function drawBackground() {
      const g = ctx.createLinearGradient(0, 0, 0, canvas.height)
      g.addColorStop(0, colors.bgTop)
      g.addColorStop(1, colors.bgBot)
      ctx.fillStyle = g
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.fillStyle = colors.star
      for (const st of stars) {
        ctx.fillRect(st.x, st.y, st.s, st.s)
        st.x += st.v * 0.2
        if (st.x > canvas.width) st.x = -2
      }

      ctx.save()
      ctx.fillStyle = 'rgba(0,0,0,0.45)'
      const gw = canvas.width * 0.35
      const gh = 18
      ctx.beginPath()
      ctx.ellipse(canvas.width / 2, canvas.height * 0.75, gw, gh, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }

    function drawAura(cx, cy, size) {
      if (!traits?.aura || traits.aura === 'none') return
      const grd = ctx.createRadialGradient(cx, cy, size * 0.15, cx, cy, size * 0.55)
      const color = traits.aura === 'prismatic' ? '#aa0ff' : (traits.aura.includes('pink') ? '#ff66aa' : '#77ff99')
      grd.addColorStop(0, `${color}44`)
      grd.addColorStop(1, '#0000')
      ctx.save()
      ctx.globalCompositeOperation = 'lighter'
      ctx.fillStyle = grd
      ctx.beginPath()
      ctx.arc(cx, cy, size * 0.55, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }

    function drawMarkings(cx, cy, size) {
      const m = traits?.markings
      if (!m || m === 'none') return
      ctx.save()
      ctx.globalAlpha = 0.35
      ctx.strokeStyle = colors.accent
      ctx.lineWidth = 4
      if (m === 'stripe') {
        for (let i = -2; i <= 2; i++) {
          ctx.beginPath()
          ctx.moveTo(cx - size * 0.25, cy + i * 12)
          ctx.lineTo(cx + size * 0.25, cy + i * 12)
          ctx.stroke()
        }
      } else if (m === 'spots') {
        ctx.fillStyle = colors.accent
        for (let i = 0; i < 8; i++) {
          const ang = (i / 8) * Math.PI * 2
          ctx.beginPath()
          ctx.arc(cx + Math.cos(ang) * size * 0.2, cy + Math.sin(ang) * size * 0.2, 6, 0, Math.PI * 2)
          ctx.fill()
        }
      } else if (m === 'mask') {
        ctx.fillStyle = colors.accent
        ctx.beginPath()
        ctx.arc(cx, cy - size * 0.12, size * 0.18, 0, Math.PI * 2)
        ctx.fill()
      } else if (m === 'circuit') {
        ctx.strokeStyle = '#7fffd4'
        for (let i = 0; i < 6; i++) {
          ctx.beginPath()
          ctx.moveTo(cx - size * 0.2 + i * 12, cy - size * 0.15)
          ctx.lineTo(cx - size * 0.2 + i * 12, cy + size * 0.25)
          ctx.stroke()
        }
      }
      ctx.restore()
    }

    function drawEyes(cx, cy) {
      const e = traits?.eyes
      ctx.save()
      ctx.fillStyle = '#000'
      if (e === 'big') {
        ctx.fillRect(cx - 20, cy - 6, 10, 10)
        ctx.fillRect(cx + 10, cy - 6, 10, 10)
      } else if (e === 'sleepy') {
        ctx.fillRect(cx - 18, cy - 1, 12, 2)
        ctx.fillRect(cx + 6, cy - 1, 12, 2)
      } else if (e === 'visor') {
        ctx.fillStyle = '#0ff'
        ctx.fillRect(cx - 26, cy - 6, 52, 12)
      } else if (e === 'glow') {
        ctx.fillStyle = '#fff'
        ctx.globalAlpha = 0.9
        ctx.fillRect(cx - 16, cy - 4, 8, 8)
        ctx.fillRect(cx + 8, cy - 4, 8, 8)
      } else {
        ctx.fillRect(cx - 14, cy - 3, 6, 6)
        ctx.fillRect(cx + 8, cy - 3, 6, 6)
      }
      ctx.restore()
    }

    function loop(currentTime = 0) {
      // Frame throttling for better performance
      const deltaTime = currentTime - lastFrameTime
      
      if (deltaTime < frameInterval) {
        raf = requestAnimationFrame(loop)
        return
      }
      
      lastFrameTime = currentTime - (deltaTime % frameInterval)

      updateState()
      
      // Clear canvas efficiently
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      drawBackground()

      const size = Math.min(canvas.width, canvas.height) * 0.35 * (1 + (bounceFrames > 0 ? 0.08 : 0))
      const bob = sleeping ? Math.sin(frame / 20) * 3 : Math.sin(frame / 40) * 6
      const cx = x
      const cy = y + bob + (
        state === 'sit' ? 6 : 
        state === 'curl' ? 10 : 
        state === 'scratch' ? Math.sin(frame / 8) * 2 : 
        state === 'stretch' ? -2 : 
        0
      )

      drawAura(cx, cy, size)

      // Optimize image drawing
      ctx.save()
      ctx.imageSmoothingEnabled = false
      ctx.translate(cx, cy)
      if (img.complete && img.naturalWidth > 0) {
        ctx.drawImage(img, -size / 2, -size / 2, size, size)
      }
      ctx.restore()

      drawMarkings(cx, cy, size)
      drawEyes(cx, cy - size * 0.05)

      // Optimize particle rendering
      if (particles.length > 0) {
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i]
          p.y += p.vy
          p.life--
          if (p.life <= 0) { 
            releaseParticle(particles[i])
            particles.splice(i, 1)
            continue 
          }
          
          const alpha = Math.max(0, p.life / 60)
          if (alpha > 0.01) { // Skip nearly invisible particles
            ctx.save()
            ctx.globalAlpha = alpha
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
        }
      }

      // Only draw sleep indicators when needed
      if ((sleeping || state === 'curl') && frame % 60 < 30) {
        ctx.fillStyle = '#9cf'
        ctx.font = '16px monospace'
        ctx.fillText('Z', x + 40, y - 40)
      }

      raf = requestAnimationFrame(loop)
    }

    function getEventPos(e) {
      const rect = canvas.getBoundingClientRect()
      const scaleX = canvas.width / rect.width
      const scaleY = canvas.height / rect.height
      
      let clientX, clientY
      
      if (e.touches && e.touches[0]) {
        // Touch event
        clientX = e.touches[0].clientX
        clientY = e.touches[0].clientY
      } else {
        // Mouse event
        clientX = e.clientX
        clientY = e.clientY
      }
      
      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
      }
    }

    function onMove(e) {
      e.preventDefault() // Prevent scrolling on mobile
      const pos = getEventPos(e)
      targetX = pos.x
      targetY = pos.y
      chaseUntil = performance.now() + 1200
    }

    function onTouchStart(e) {
      e.preventDefault()
      onMove(e)
    }

    function onTouchMove(e) {
      e.preventDefault()
      onMove(e)
    }

    // Mouse events
    canvas.addEventListener('mousemove', onMove)
    
    // Touch events for mobile
    canvas.addEventListener('touchstart', onTouchStart, { passive: false })
    canvas.addEventListener('touchmove', onTouchMove, { passive: false })

    img.onload = () => { raf = requestAnimationFrame(loop) }
    raf = requestAnimationFrame(loop)

    return () => { 
      cancelAnimationFrame(raf)
      canvas.removeEventListener('mousemove', onMove)
      canvas.removeEventListener('touchstart', onTouchStart)
      canvas.removeEventListener('touchmove', onTouchMove)
    }
  }, [petId, sleeping, traits])

  useEffect(() => {
    if (!actionSignal) return
    actionRef.current = actionSignal
  }, [actionSignal])

  const handleInteraction = (e) => { 
    e.preventDefault()
    onPet?.()
    
    // Add petting hearts effect
    const canvas = ref.current
    if (canvas) {
      const rect = canvas.getBoundingClientRect()
      const scaleX = canvas.width / rect.width
      const scaleY = canvas.height / rect.height
      
      let clientX, clientY
      if (e.touches && e.touches[0]) {
        clientX = e.touches[0].clientX
        clientY = e.touches[0].clientY
      } else {
        clientX = e.clientX
        clientY = e.clientY
      }
      
      const clickX = (clientX - rect.left) * scaleX
      const clickY = (clientY - rect.top) * scaleY
      
      // Create multiple heart particles at click location
      if (getParticleRef.current && particlesRef.current) {
        const heartCount = 3 + Math.floor(Math.random() * 3)
        for (let i = 0; i < heartCount; i++) {
          const heart = getParticleRef.current(
            'heart', 
            clickX + (Math.random() * 40 - 20), 
            clickY + (Math.random() * 20 - 10), 
            -0.3 - Math.random() * 0.4, 
            40 + Math.random() * 20
          )
          particlesRef.current.push(heart)
        }
      }
    }
  }

  return (
    <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
      <canvas 
        ref={ref} 
        width={1200} 
        height={700} 
        style={{ 
          width: '100%', 
          height: 'min(65vh, 720px)', 
          cursor: 'pointer', 
          touchAction: 'none',
          borderRadius: '8px',
          boxShadow: '0 4px 20px rgba(0, 255, 153, 0.1)'
        }} 
        onClick={handleInteraction}
        onTouchEnd={handleInteraction}
      />
      <div style={{ position: 'absolute', top: 8, right: 8 }}>
        <button 
          onClick={() => setSleeping((s) => !s)}
          style={{
            padding: '4px 8px',
            fontSize: '10px',
            background: 'rgba(0, 255, 153, 0.6)',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            color: '#000',
            opacity: 0.7,
            transition: 'all 0.2s ease',
            backdropFilter: 'blur(2px)'
          }}
          onMouseEnter={(e) => {
            e.target.style.opacity = '1'
            e.target.style.background = 'rgba(0, 255, 153, 0.9)'
          }}
          onMouseLeave={(e) => {
            e.target.style.opacity = '0.7'
            e.target.style.background = 'rgba(0, 255, 153, 0.6)'
          }}
        >
          {sleeping ? 'Wake' : 'Sleep'}
        </button>
      </div>
    </div>
  )
}