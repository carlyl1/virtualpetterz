import React, { useEffect, useRef, useState } from 'react'
import { generatePet } from '../generators/petGenerator'
import { renderImprovedPet } from '../generators/improvedPetRenderer'
import PetSprite from './PetSprite'

// Map old IDs to new species names
const PET_ID_MAP = {
  'forest-fox': 'forest_fox',
  'mystic-bunny': 'mystic_bunny',
  'robo-cat': 'robo_cat',
  'water-duck': 'water_duck',
  'shadow-wolf': 'shadow_wolf',
  'pixel-sloth': 'pixel_sloth',
  'chonk-hamster': 'chonk_hamster',
  'glitch-moth': 'glitch_moth'
}

// Fallback to SVG if sprites aren't available
const SVG_SPRITES = {
  'forest-fox': '/assets/pets/forest-fox.svg',
  'mystic-bunny': '/assets/pets/mystic-bunny.svg',
  'robo-cat': '/assets/pets/robo-cat.svg',
}

function getSpritePath(petId, state = 'idle') {
  const mappedId = PET_ID_MAP[petId] || petId.replace('-', '_')
  return `/assets/sprites/${mappedId}__${state}.png`
}

function getSpriteStates(happiness, hunger, sleeping, inBattle) {
  if (inBattle) return 'battle'
  if (sleeping) return 'sleepy'
  if (hunger < 30) return 'hungry'
  if (happiness > 80) return 'happy'
  return 'idle'
}

export default function PetCanvasEnhanced({ 
  petId = 'forest-fox', 
  actionSignal, 
  onPet, 
  traits,
  happiness = 65,
  hunger = 65,
  sleeping = false,
  inBattle = false,
  useSprites = true,
  useLayeredSprites = true // New enhanced sprite system
}) {
  const canvasRef = useRef(null)
  const petSpriteRef = useRef(null)
  const [currentSprite, setCurrentSprite] = useState(null)
  const [spriteLoaded, setSpriteLoaded] = useState(false)
  const animationRef = useRef()
  const particlesRef = useRef([])
  const petPosRef = useRef({ x: 0, y: 0 })
  
  // Load sprite based on pet state
  useEffect(() => {
    if (!useSprites) return
    
    const state = getSpriteStates(happiness, hunger, sleeping, inBattle)
    const spritePath = getSpritePath(petId, state)
    
    const img = new Image()
    img.onload = () => {
      console.log('✅ Sprite loaded successfully:', spritePath)
      setCurrentSprite(img)
      setSpriteLoaded(true)
    }
    img.onerror = (err) => {
      console.warn('❌ Sprite failed to load:', spritePath, err)
      // Fallback to idle state
      const fallbackPath = getSpritePath(petId, 'idle')
      const fallbackImg = new Image()
      fallbackImg.onload = () => {
        console.log('✅ Fallback sprite loaded:', fallbackPath)
        setCurrentSprite(fallbackImg)
        setSpriteLoaded(true)
      }
      fallbackImg.onerror = (fallbackErr) => {
        console.warn('❌ Fallback sprite also failed:', fallbackPath, fallbackErr)
        // Use canvas fallback
        setSpriteLoaded(false)
      }
      fallbackImg.src = fallbackPath
    }
    console.log('🔄 Loading sprite:', spritePath)
    img.src = spritePath
  }, [petId, happiness, hunger, sleeping, inBattle, useSprites])
  
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    ctx.imageSmoothingEnabled = false
    
    let frame = 0
    
    // Virtual pet AI state
    const petAI = {
      x: canvas.width / 2,
      y: canvas.height / 2,
      targetX: canvas.width / 2,
      targetY: canvas.height / 2,
      velocity: { x: 0, y: 0 },
      speed: 1.2,
      behavior: 'wandering', // 'wandering', 'sitting', 'following_cursor', 'sleeping'
      behaviorTimer: 0,
      idleAnimation: 0,
      lastDirectionChange: 0,
      energy: 100,
      curiosity: Math.random() * 100
    }
    
    const particles = particlesRef.current
    
    // Pet behaviors
    const updatePetBehavior = () => {
      frame++
      petAI.behaviorTimer++
      petAI.idleAnimation = Math.sin(frame * 0.03) * 3
      
      // Random behavior changes
      if (petAI.behaviorTimer > 300 + Math.random() * 300) {
        const behaviors = ['wandering', 'sitting', 'wandering', 'sitting']
        petAI.behavior = behaviors[Math.floor(Math.random() * behaviors.length)]
        petAI.behaviorTimer = 0
        
        if (sleeping) {
          petAI.behavior = 'sleeping'
        }
      }
      
      // Behavior logic
      switch (petAI.behavior) {
        case 'wandering':
          // Wander around naturally
          if (frame % 60 === 0 || 
              Math.abs(petAI.x - petAI.targetX) < 20 && Math.abs(petAI.y - petAI.targetY) < 20) {
            // Pick new random destination, avoiding edges
            const margin = 100
            petAI.targetX = margin + Math.random() * (canvas.width - margin * 2)
            petAI.targetY = margin + Math.random() * (canvas.height - margin * 2)
          }
          
          // Move towards target with natural easing
          const dx = petAI.targetX - petAI.x
          const dy = petAI.targetY - petAI.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          
          if (distance > 5) {
            petAI.velocity.x += (dx / distance) * 0.08
            petAI.velocity.y += (dy / distance) * 0.08
          }
          break
          
        case 'sitting':
          // Stay mostly still with small movements
          petAI.velocity.x *= 0.92
          petAI.velocity.y *= 0.92
          
          // Occasional small adjustments
          if (Math.random() < 0.005) {
            petAI.velocity.x += (Math.random() - 0.5) * 0.3
            petAI.velocity.y += (Math.random() - 0.5) * 0.3
          }
          break
          
        case 'sleeping':
          // Very minimal movement
          petAI.velocity.x *= 0.98
          petAI.velocity.y *= 0.98
          break
      }
      
      // Apply velocity with natural damping
      petAI.velocity.x *= 0.95
      petAI.velocity.y *= 0.95
      
      // Speed limits
      const maxSpeed = petAI.behavior === 'sleeping' ? 0.2 : petAI.speed
      const currentSpeed = Math.sqrt(petAI.velocity.x ** 2 + petAI.velocity.y ** 2)
      if (currentSpeed > maxSpeed) {
        petAI.velocity.x = (petAI.velocity.x / currentSpeed) * maxSpeed
        petAI.velocity.y = (petAI.velocity.y / currentSpeed) * maxSpeed
      }
      
      // Update position
      petAI.x += petAI.velocity.x
      petAI.y += petAI.velocity.y
      
      // Keep on screen
      const petSize = 96 // Approximate pet size
      petAI.x = Math.max(petSize/2, Math.min(canvas.width - petSize/2, petAI.x))
      petAI.y = Math.max(petSize/2, Math.min(canvas.height - petSize/2, petAI.y))
      
      // Environmental sparkles
      if (frame % 180 === 0 && Math.random() < 0.7) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height * 0.3,
          vx: (Math.random() - 0.5) * 0.8,
          vy: Math.random() * 0.5 + 0.3,
          life: 80,
          type: 'sparkle'
        })
      }
    }
    
    const drawPet = () => {
      const drawX = petAI.x
      const drawY = petAI.y + petAI.idleAnimation
      
      petPosRef.current = { x: drawX, y: drawY }
      
      // Update layered sprite position if using enhanced sprites
      if (useLayeredSprites && petSpriteRef.current) {
        const spriteElement = petSpriteRef.current
        if (spriteElement && spriteElement.style) {
          spriteElement.style.left = (drawX - 48) + 'px'
          spriteElement.style.top = (drawY - 48) + 'px'
        }
        // Don't draw on canvas when using layered sprites - PetSprite handles rendering
        return
      }
      
      // Only draw on canvas when NOT using layered sprites
      if (!useLayeredSprites && useSprites && currentSprite && spriteLoaded) {
        // Draw sprite
        const scale = 3 // Smaller for free roaming
        const spriteSize = 32
        const drawSize = spriteSize * scale
        
        ctx.save()
        ctx.imageSmoothingEnabled = false
        
        // Add glow for rare pets
        if (traits?.rarity === 'epic' || traits?.rarity === 'legendary') {
          ctx.shadowColor = traits.rarity === 'legendary' ? '#ffd700' : '#8b5cf6'
          ctx.shadowBlur = 15
        }
        
        ctx.drawImage(
          currentSprite,
          drawX - drawSize / 2,
          drawY - drawSize / 2,
          drawSize,
          drawSize
        )
        ctx.restore()
      } else if (!useLayeredSprites) {
        // Canvas fallback - use improved pet renderer
        const petGen = traits || generatePet(petId)
        
        // Ensure species mapping for renderer
        if (petGen && !petGen.species && petId) {
          petGen.species = petId // Add species if missing
          petGen.id = petId // Also add id for fallback
        }
        
        // Create a temporary canvas for the pet
        const tempCanvas = document.createElement('canvas')
        tempCanvas.width = 128
        tempCanvas.height = 128
        
        // Use the improved renderer directly
        try {
          console.log('🎨 Rendering pet with data:', { petId, species: petGen?.species, id: petGen?.id })
          renderImprovedPet(petGen, tempCanvas, { scale: 0.8 })
          
          // Draw the rendered pet at the current position
          ctx.save()
          ctx.imageSmoothingEnabled = false
          
          // Add glow for rare pets
          if (petGen.rarity === 'epic' || petGen.rarity === 'legendary') {
            ctx.shadowColor = petGen.rarity === 'legendary' ? '#ffd700' : '#8b5cf6'
            ctx.shadowBlur = 15
          }
          
          ctx.drawImage(
            tempCanvas,
            drawX - 64,
            drawY - 64,
            128,
            128
          )
          
          if (sleeping) {
            ctx.fillStyle = '#9cf'
            ctx.font = '12px monospace'
            ctx.fillText('Z', drawX + 40, drawY - 45)
            ctx.fillText('z', drawX + 48, drawY - 52)
            ctx.fillText('z', drawX + 56, drawY - 58)
          }
          
          ctx.restore()
        } catch (error) {
          console.warn('Failed to render improved pet, using fallback:', error)
          // Fallback to simple rendering if import fails
          ctx.save()
          const colors = petGen.palette || ['#00ff99', '#00cc77']
          
          // Body
          ctx.fillStyle = colors[0]
          ctx.beginPath()
          ctx.ellipse(drawX, drawY, 30, 25, 0, 0, Math.PI * 2)
          ctx.fill()
          
          // Head
          ctx.fillStyle = colors[1] || colors[0]
          ctx.beginPath()
          ctx.ellipse(drawX, drawY - 18, 18, 16, 0, 0, Math.PI * 2)
          ctx.fill()
          
          // Eyes
          ctx.fillStyle = '#000'
          ctx.fillRect(drawX - 8, drawY - 20, 4, 4)
          ctx.fillRect(drawX + 4, drawY - 20, 4, 4)
          
          if (sleeping) {
            ctx.fillStyle = '#9cf'
            ctx.font = '12px monospace'
            ctx.fillText('Z', drawX + 20, drawY - 25)
          }
          ctx.restore()
        }
      }
    }
    
    const drawParticles = () => {
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.x += p.vx || 0
        p.y += p.vy || 0
        p.life--
        
        if (p.life <= 0) {
          particles.splice(i, 1)
          continue
        }
        
        ctx.save()
        ctx.globalAlpha = p.life / 80
        
        if (p.type === 'heart') {
          ctx.fillStyle = '#ff66aa'
          ctx.font = '14px monospace'
          ctx.fillText('❤', p.x, p.y)
        } else if (p.type === 'sparkle') {
          ctx.fillStyle = '#ffd700'
          ctx.fillRect(p.x, p.y, 2, 2)
        } else if (p.type === 'food') {
          ctx.fillStyle = '#aaffcc'
          ctx.font = '12px monospace'
          ctx.fillText('🍖', p.x, p.y)
        }
        
        ctx.restore()
      }
    }
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      updatePetBehavior()
      drawPet()
      drawParticles()
      
      animationRef.current = requestAnimationFrame(animate)
    }
    
    animate()
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [currentSprite, spriteLoaded, useSprites, traits, sleeping])
  
  // Handle pet interactions
  useEffect(() => {
    if (!actionSignal) return
    
    const { type } = actionSignal
    const particles = particlesRef.current
    const { x, y } = petPosRef.current
    
    if (type === 'eat') {
      for (let i = 0; i < 5; i++) {
        particles.push({
          x: x + (Math.random() - 0.5) * 40,
          y: y - 20,
          vy: -Math.random() * 2 - 1,
          life: 40,
          type: 'food'
        })
      }
    } else if (type === 'play') {
      for (let i = 0; i < 8; i++) {
        particles.push({
          x: x + (Math.random() - 0.5) * 60,
          y: y - 30,
          vx: (Math.random() - 0.5) * 2,
          vy: -Math.random() * 2 - 1,
          life: 50,
          type: 'sparkle'
        })
      }
    }
  }, [actionSignal])
  
  // Handle mouse interactions near pet
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const handleMouseMove = (e) => {
      const petPos = petPosRef.current
      if (!petPos) return
      
      const rect = canvas.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top
      
      // Check if mouse is near pet (within 100px)
      const distance = Math.sqrt((mouseX - petPos.x) ** 2 + (mouseY - petPos.y) ** 2)
      
      // Enable pointer events only when near pet
      if (distance <= 100) {
        canvas.style.pointerEvents = 'auto'
        canvas.style.cursor = 'pointer'
      } else {
        canvas.style.pointerEvents = 'none'
        canvas.style.cursor = 'default'
      }
    }
    
    const handleClick = (e) => {
      const petPos = petPosRef.current
      if (!petPos) return
      
      const rect = canvas.getBoundingClientRect()
      const clickX = e.clientX - rect.left
      const clickY = e.clientY - rect.top
      
      // Check if click is near pet (within 80px)
      const distance = Math.sqrt((clickX - petPos.x) ** 2 + (clickY - petPos.y) ** 2)
      if (distance > 80) return
      
      // Add heart particles around the pet
      const particles = particlesRef.current
      for (let i = 0; i < 5; i++) {
        particles.push({
          x: petPos.x + (Math.random() - 0.5) * 30,
          y: petPos.y - 20,
          vy: -Math.random() * 2 - 1,
          life: 50,
          type: 'heart'
        })
      }
      
      onPet?.()
    }
    
    // Use global mouse events for better performance
    document.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('click', handleClick)
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('click', handleClick)
    }
  }, [onPet])
  
  return (
    <>
      {/* Canvas for particles and environment effects */}
      <canvas 
        ref={canvasRef}
        width={window.innerWidth}
        height={window.innerHeight}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          imageRendering: 'pixelated',
          pointerEvents: 'none',
          zIndex: 10
        }}
      />
      
      {/* Enhanced layered sprite system */}
      {useLayeredSprites && (
        <PetSprite
          ref={petSpriteRef}
          petId={petId}
          petSpecies={petId}
          happiness={happiness}
          hunger={hunger}
          sleeping={sleeping}
          inBattle={inBattle}
          rarity={traits?.rarity}
          width={96}
          height={96}
          actionSignal={actionSignal}
          showEffects={true}
          enableLayering={true}
          style={{
            position: 'fixed',
            left: petPosRef.current.x - 48 + 'px',
            top: petPosRef.current.y - 48 + 'px',
            zIndex: 11,
            pointerEvents: 'auto',
            cursor: 'pointer',
            transition: 'left 0.1s ease-out, top 0.1s ease-out'
          }}
          onClick={() => {
            // Add heart particles around the pet
            const particles = particlesRef.current
            for (let i = 0; i < 5; i++) {
              particles.push({
                x: petPosRef.current.x + (Math.random() - 0.5) * 30,
                y: petPosRef.current.y - 20,
                vy: -Math.random() * 2 - 1,
                life: 50,
                type: 'heart'
              })
            }
            onPet?.()
          }}
        />
      )}
    </>
  )
}