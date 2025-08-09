import React, { useEffect, useRef, useState } from 'react'
import PixelPetRenderer from './PixelPetRenderer'

// Desktop Pet - A smart companion that roams the entire page
export default function DesktopPet({ 
  petId = 'forest-fox',
  happiness = 65,
  hunger = 65,
  sleeping = false,
  traits,
  petName,
  actionSignal,
  onPet
}) {
  const petRef = useRef(null)
  const animationRef = useRef()
  const behaviorRef = useRef({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    targetX: window.innerWidth / 2,
    targetY: window.innerHeight / 2,
    velocity: { x: 0, y: 0 },
    speed: 1.5,
    behavior: 'exploring', // 'exploring', 'sleeping', 'playing', 'curious', 'excited'
    behaviorTimer: 0,
    lastClick: 0,
    energy: 100,
    mood: 'neutral', // 'happy', 'excited', 'sleepy', 'grumpy', 'curious'
    animation: 'idle', // 'idle', 'walking', 'running', 'sleeping', 'excited'
    direction: 'right', // 'left', 'right'
    lastSound: 0,
    obstacles: [] // UI elements to avoid
  })

  const [currentAnimation, setCurrentAnimation] = useState('idle')
  const [isVisible, setIsVisible] = useState(true)

  // Pet sounds
  const playPetSound = (type) => {
    const now = Date.now()
    if (now - behaviorRef.current.lastSound < 2000) return // Throttle sounds
    
    behaviorRef.current.lastSound = now
    
    // Create audio context for simple sound effects
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      let frequency = 440
      switch (type) {
        case 'happy': frequency = 600; break
        case 'excited': frequency = 800; break
        case 'curious': frequency = 500; break
        case 'sleepy': frequency = 300; break
        case 'grumpy': frequency = 200; break
      }
      
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime)
      oscillator.type = 'sine'
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.3)
    } catch (error) {
      console.log('Audio not available')
    }
  }

  // Detect UI elements to avoid
  const detectObstacles = () => {
    const obstacles = []
    
    // Find all interactive elements
    const elements = document.querySelectorAll('button, input, .chatbox, .stats, .btn, .modal, .dropdown, header, footer')
    
    elements.forEach(el => {
      const rect = el.getBoundingClientRect()
      if (rect.width > 0 && rect.height > 0) {
        obstacles.push({
          x: rect.left,
          y: rect.top,
          width: rect.width,
          height: rect.height,
          element: el.tagName.toLowerCase()
        })
      }
    })
    
    behaviorRef.current.obstacles = obstacles
  }

  // Check if position collides with UI elements
  const isPositionBlocked = (x, y, padding = 50) => {
    for (const obstacle of behaviorRef.current.obstacles) {
      if (x >= obstacle.x - padding && 
          x <= obstacle.x + obstacle.width + padding &&
          y >= obstacle.y - padding && 
          y <= obstacle.y + obstacle.height + padding) {
        return obstacle
      }
    }
    return null
  }

  // Find safe position near current location
  const findSafePosition = (currentX, currentY) => {
    const attempts = 20
    const radius = 100
    
    for (let i = 0; i < attempts; i++) {
      const angle = (Math.PI * 2 * i) / attempts
      const x = currentX + Math.cos(angle) * radius
      const y = currentY + Math.sin(angle) * radius
      
      // Keep on screen
      if (x < 50 || x > window.innerWidth - 50 || y < 50 || y > window.innerHeight - 50) continue
      
      if (!isPositionBlocked(x, y)) {
        return { x, y }
      }
    }
    
    // Fallback to screen center
    return { x: window.innerWidth / 2, y: window.innerHeight / 2 }
  }

  // Update pet behavior and movement
  const updatePetBehavior = () => {
    const pet = behaviorRef.current
    const now = Date.now()
    
    pet.behaviorTimer++
    
    // Update mood based on stats
    if (sleeping) {
      pet.mood = 'sleepy'
      pet.behavior = 'sleeping'
    } else if (happiness > 80) {
      pet.mood = 'excited'
    } else if (happiness > 60) {
      pet.mood = 'happy'
    } else if (hunger < 20) {
      pet.mood = 'grumpy'
    } else {
      pet.mood = 'neutral'
    }

    // Behavior changes based on mood and timer
    if (pet.behaviorTimer > 300 + Math.random() * 200) {
      const behaviors = ['exploring', 'curious', 'playing']
      
      if (pet.mood === 'sleepy') {
        pet.behavior = 'sleeping'
      } else if (pet.mood === 'excited') {
        pet.behavior = Math.random() > 0.5 ? 'playing' : 'exploring'
      } else {
        pet.behavior = behaviors[Math.floor(Math.random() * behaviors.length)]
      }
      
      pet.behaviorTimer = 0
      playPetSound(pet.mood)
    }

    // Behavior logic
    switch (pet.behavior) {
      case 'exploring':
        // Random exploration with obstacle avoidance
        if (pet.behaviorTimer % 120 === 0 || 
            Math.abs(pet.x - pet.targetX) < 30 && Math.abs(pet.y - pet.targetY) < 30) {
          
          let newTarget
          let attempts = 0
          do {
            newTarget = {
              x: 100 + Math.random() * (window.innerWidth - 200),
              y: 100 + Math.random() * (window.innerHeight - 200)
            }
            attempts++
          } while (isPositionBlocked(newTarget.x, newTarget.y) && attempts < 10)
          
          if (attempts < 10) {
            pet.targetX = newTarget.x
            pet.targetY = newTarget.y
          }
        }
        pet.speed = 1.5
        pet.animation = 'walking'
        break

      case 'curious':
        // Move towards UI elements but maintain distance
        const nearestObstacle = behaviorRef.current.obstacles
          .filter(obs => obs.element !== 'footer') // Avoid footer
          .sort((a, b) => {
            const distA = Math.sqrt((pet.x - (a.x + a.width/2))**2 + (pet.y - (a.y + a.height/2))**2)
            const distB = Math.sqrt((pet.x - (b.x + b.width/2))**2 + (pet.y - (b.y + b.height/2))**2)
            return distA - distB
          })[0]
        
        if (nearestObstacle) {
          const safeDistance = 80
          const centerX = nearestObstacle.x + nearestObstacle.width / 2
          const centerY = nearestObstacle.y + nearestObstacle.height / 2
          
          const angle = Math.atan2(pet.y - centerY, pet.x - centerX)
          pet.targetX = centerX + Math.cos(angle) * safeDistance
          pet.targetY = centerY + Math.sin(angle) * safeDistance
        }
        pet.speed = 1
        pet.animation = 'curious'
        break

      case 'playing':
        // Playful bouncing around
        if (pet.behaviorTimer % 60 === 0) {
          const safePos = findSafePosition(pet.x, pet.y)
          pet.targetX = safePos.x
          pet.targetY = safePos.y
        }
        pet.speed = 2.5
        pet.animation = 'running'
        break

      case 'sleeping':
        // Stay mostly still
        pet.velocity.x *= 0.98
        pet.velocity.y *= 0.98
        pet.animation = 'sleeping'
        break
    }

    // Movement physics
    if (pet.behavior !== 'sleeping') {
      const dx = pet.targetX - pet.x
      const dy = pet.targetY - pet.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      
      if (distance > 5) {
        pet.velocity.x += (dx / distance) * 0.1
        pet.velocity.y += (dy / distance) * 0.1
        
        // Update direction for sprite flipping
        pet.direction = pet.velocity.x > 0 ? 'right' : 'left'
      }
    }

    // Apply velocity with damping
    pet.velocity.x *= 0.95
    pet.velocity.y *= 0.95

    // Speed limits
    const maxSpeed = pet.speed
    const currentSpeed = Math.sqrt(pet.velocity.x ** 2 + pet.velocity.y ** 2)
    if (currentSpeed > maxSpeed) {
      pet.velocity.x = (pet.velocity.x / currentSpeed) * maxSpeed
      pet.velocity.y = (pet.velocity.y / currentSpeed) * maxSpeed
    }

    // Update position
    pet.x += pet.velocity.x
    pet.y += pet.velocity.y

    // Screen boundaries
    const margin = 20
    pet.x = Math.max(margin, Math.min(window.innerWidth - margin, pet.x))
    pet.y = Math.max(margin, Math.min(window.innerHeight - margin, pet.y))

    // Check for obstacle collision and adjust
    const collision = isPositionBlocked(pet.x, pet.y, 10)
    if (collision) {
      const safePos = findSafePosition(pet.x, pet.y)
      pet.targetX = safePos.x
      pet.targetY = safePos.y
    }
  }

  // Animation loop
  useEffect(() => {
    let frame = 0
    
    const animate = () => {
      frame++
      
      // Update obstacles periodically
      if (frame % 120 === 0) {
        detectObstacles()
      }
      
      updatePetBehavior()
      
      // Update pet position
      if (petRef.current) {
        const pet = behaviorRef.current
        petRef.current.style.left = `${pet.x - 24}px`
        petRef.current.style.top = `${pet.y - 24}px`
        
        // Update animation state
        setCurrentAnimation(pet.animation)
      }
      
      animationRef.current = requestAnimationFrame(animate)
    }
    
    // Initial obstacle detection
    detectObstacles()
    animate()
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [petId])

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const pet = behaviorRef.current
      // Keep pet on screen after resize
      pet.x = Math.max(50, Math.min(window.innerWidth - 50, pet.x))
      pet.y = Math.max(50, Math.min(window.innerHeight - 50, pet.y))
      detectObstacles()
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Handle pet interactions
  const handlePetClick = () => {
    const pet = behaviorRef.current
    const now = Date.now()
    
    // Double click detection
    if (now - pet.lastClick < 500) {
      // Double click - excited behavior
      pet.behavior = 'playing'
      pet.behaviorTimer = 0
      pet.mood = 'excited'
      playPetSound('excited')
    } else {
      // Single click - pet interaction
      pet.mood = 'happy'
      playPetSound('happy')
    }
    
    pet.lastClick = now
    onPet?.()
  }

  // Handle action signals from parent
  useEffect(() => {
    if (!actionSignal) return
    
    const pet = behaviorRef.current
    const { type } = actionSignal
    
    if (type === 'eat') {
      pet.behavior = 'playing'
      pet.mood = 'happy'
      pet.behaviorTimer = 0
      playPetSound('happy')
    } else if (type === 'play') {
      pet.behavior = 'playing'
      pet.mood = 'excited'
      pet.behaviorTimer = 0
      playPetSound('excited')
    }
  }, [actionSignal])

  if (!isVisible) return null

  return (
    <div
      ref={petRef}
      onClick={handlePetClick}
      style={{
        position: 'fixed',
        zIndex: 9999,
        cursor: 'pointer',
        userSelect: 'none',
        pointerEvents: 'auto',
        transition: 'none',
        left: `${behaviorRef.current.x - 24}px`,
        top: `${behaviorRef.current.y - 24}px`,
        filter: sleeping ? 'brightness(0.7)' : 'brightness(1)',
        animation: behaviorRef.current.behavior === 'playing' ? 'bounce 0.5s ease-in-out infinite alternate' : 'none',
        transform: behaviorRef.current.behavior === 'playing' ? 'none' : 'translateY(0px)'
      }}
      title={`${petName || 'Your Pet'} - ${behaviorRef.current.mood}`}
    >
      <PixelPetRenderer
        petId={petId}
        animation={currentAnimation}
        direction={behaviorRef.current.direction}
        mood={behaviorRef.current.mood}
        width={48}
        height={48}
        traits={traits}
      />
      
      {/* Pet status indicators */}
      {behaviorRef.current.mood === 'grumpy' && hunger < 20 && (
        <div style={{
          position: 'absolute',
          top: '-25px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '1rem',
          animation: 'float 2s ease-in-out infinite'
        }}>
          💢
        </div>
      )}
      
      {behaviorRef.current.mood === 'sleepy' && (
        <div style={{
          position: 'absolute',
          top: '-25px',
          right: '-15px',
          fontSize: '0.8rem',
          animation: 'float 3s ease-in-out infinite'
        }}>
          💤
        </div>
      )}
      
      {behaviorRef.current.mood === 'excited' && (
        <div style={{
          position: 'absolute',
          top: '-20px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '0.8rem',
          animation: 'sparkle 1s ease-in-out infinite'
        }}>
          ✨
        </div>
      )}
      
      {/* Global pet styles */}
      <style>{`
        @keyframes bounce {
          0% { transform: translateY(0px); }
          100% { transform: translateY(-10px); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(-50%); }
          50% { transform: translateY(-5px) translateX(-50%); }
        }
        
        @keyframes sparkle {
          0%, 100% { opacity: 1; transform: translateX(-50%) scale(1); }
          50% { opacity: 0.7; transform: translateX(-50%) scale(1.2); }
        }
      `}</style>
    </div>
  )
}