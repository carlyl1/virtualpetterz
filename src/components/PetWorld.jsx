import React, { useEffect, useRef, useState } from 'react'

// Pet World - Full-screen canvas background world for the pet
export default function PetWorld({ 
  petId = 'forest-fox',
  happiness = 65,
  hunger = 65,
  sleeping = false,
  traits,
  petName,
  actionSignal,
  onPet
}) {
  const canvasRef = useRef(null)
  const animationRef = useRef()
  const petRef = useRef({
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    velocity: { x: 0, y: 0 },
    speed: 2,
    behavior: 'exploring',
    behaviorTimer: 0,
    animation: 'idle',
    direction: 'right',
    mood: 'neutral',
    energy: 100,
    mouseFollowDistance: 180,
    isNearMouse: false,
    lastInteraction: 0,
    playfulness: Math.random() * 0.5 + 0.5,
    curiosity: Math.random() * 0.5 + 0.5,
    socialness: Math.random() * 0.5 + 0.5,
    lastJumpTime: 0,
    jumpCooldown: 3000,
    soundTimer: 0,
    lastPetLocation: { x: 0, y: 0 },
    memorySpots: [],
    favoriteSpots: [],
    clickCount: 0,
    hasGreetedUser: false
  })
  
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [isMouseMoving, setIsMouseMoving] = useState(false)

  // Cute pet sprites - much larger and more recognizable
  const drawCutePet = (ctx, pet) => {
    const x = pet.x
    const y = pet.y
    const size = 120 // Even bigger for better visibility and interaction!
    
    ctx.save()
    
    // Flip for direction
    if (pet.direction === 'left') {
      ctx.scale(-1, 1)
      ctx.translate(-x * 2 - size, 0)
    }
    
    // Get colors from traits
    const colors = traits?.palette || ['#ff6b6b', '#4ecdc4', '#45b7d1']
    const main = colors[0]
    const accent = colors[1]
    const detail = colors[2]
    
    // Draw shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'
    ctx.beginPath()
    ctx.ellipse(x, y + size * 0.4, size * 0.4, size * 0.1, 0, 0, Math.PI * 2)
    ctx.fill()
    
    // Draw based on pet species
    switch (petId) {
      case 'forest-fox':
        drawCuteFox(ctx, x, y, size, main, accent, detail, pet)
        break
      case 'mystic-bunny':
        drawCuteBunny(ctx, x, y, size, main, accent, detail, pet)
        break
      case 'robo-cat':
        drawCuteCat(ctx, x, y, size, main, accent, detail, pet)
        break
      case 'water-duck':
        drawCuteDuck(ctx, x, y, size, main, accent, detail, pet)
        break
      case 'shadow-wolf':
        drawCuteWolf(ctx, x, y, size, main, accent, detail, pet)
        break
      case 'pixel-sloth':
        drawCuteSloth(ctx, x, y, size, main, accent, detail, pet)
        break
      case 'chonk-hamster':
        drawCuteHamster(ctx, x, y, size, main, accent, detail, pet)
        break
      case 'glitch-moth':
        drawCuteMoth(ctx, x, y, size, main, accent, detail, pet)
        break
      default:
        drawCuteFox(ctx, x, y, size, main, accent, detail, pet)
    }
    
    ctx.restore()
    
    // Draw mood indicators
    if (pet.mood === 'excited') {
      drawHearts(ctx, x, y - size * 0.6)
    } else if (pet.mood === 'grumpy') {
      drawAngerMark(ctx, x + size * 0.3, y - size * 0.5)
    } else if (pet.mood === 'sleepy') {
      drawSleepZ(ctx, x + size * 0.4, y - size * 0.7)
    }
  }

  // Cute Fox
  const drawCuteFox = (ctx, x, y, size, main, accent, detail, pet) => {
    // Body (oval)
    ctx.fillStyle = main
    ctx.beginPath()
    ctx.ellipse(x, y, size * 0.3, size * 0.25, 0, 0, Math.PI * 2)
    ctx.fill()
    
    // Head (circle)
    ctx.beginPath()
    ctx.ellipse(x, y - size * 0.3, size * 0.25, size * 0.22, 0, 0, Math.PI * 2)
    ctx.fill()
    
    // Ears (triangles)
    ctx.fillStyle = accent
    ctx.beginPath()
    ctx.moveTo(x - size * 0.15, y - size * 0.45)
    ctx.lineTo(x - size * 0.05, y - size * 0.55)
    ctx.lineTo(x - size * 0.25, y - size * 0.55)
    ctx.closePath()
    ctx.fill()
    
    ctx.beginPath()
    ctx.moveTo(x + size * 0.15, y - size * 0.45)
    ctx.lineTo(x + size * 0.05, y - size * 0.55)
    ctx.lineTo(x + size * 0.25, y - size * 0.55)
    ctx.closePath()
    ctx.fill()
    
    // Fluffy tail
    ctx.fillStyle = accent
    const tailX = x - size * 0.4
    const tailY = y + size * 0.1
    ctx.beginPath()
    ctx.ellipse(tailX, tailY, size * 0.15, size * 0.25, -0.3, 0, Math.PI * 2)
    ctx.fill()
    
    // Eyes
    ctx.fillStyle = '#000'
    const eyeY = y - size * 0.32
    if (sleeping) {
      // Closed eyes
      ctx.fillRect(x - size * 0.1, eyeY, size * 0.08, size * 0.02)
      ctx.fillRect(x + size * 0.02, eyeY, size * 0.08, size * 0.02)
    } else {
      // Open eyes
      ctx.beginPath()
      ctx.ellipse(x - size * 0.06, eyeY, size * 0.04, size * 0.05, 0, 0, Math.PI * 2)
      ctx.fill()
      
      ctx.beginPath()
      ctx.ellipse(x + size * 0.06, eyeY, size * 0.04, size * 0.05, 0, 0, Math.PI * 2)
      ctx.fill()
      
      // Eye shine
      ctx.fillStyle = '#fff'
      ctx.beginPath()
      ctx.ellipse(x - size * 0.05, eyeY - size * 0.02, size * 0.015, size * 0.02, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.ellipse(x + size * 0.07, eyeY - size * 0.02, size * 0.015, size * 0.02, 0, 0, Math.PI * 2)
      ctx.fill()
    }
    
    // Nose
    ctx.fillStyle = '#333'
    ctx.beginPath()
    ctx.ellipse(x, y - size * 0.25, size * 0.02, size * 0.015, 0, 0, Math.PI * 2)
    ctx.fill()
    
    // Mouth
    if (!sleeping && pet.mood === 'happy') {
      ctx.strokeStyle = '#333'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(x, y - size * 0.22, size * 0.05, 0.2, Math.PI - 0.2)
      ctx.stroke()
    }
  }

  // Cute Bunny
  const drawCuteBunny = (ctx, x, y, size, main, accent, detail, pet) => {
    // Body
    ctx.fillStyle = main
    ctx.beginPath()
    ctx.ellipse(x, y, size * 0.3, size * 0.25, 0, 0, Math.PI * 2)
    ctx.fill()
    
    // Head
    ctx.beginPath()
    ctx.ellipse(x, y - size * 0.3, size * 0.25, size * 0.22, 0, 0, Math.PI * 2)
    ctx.fill()
    
    // Long ears
    ctx.fillStyle = accent
    ctx.beginPath()
    ctx.ellipse(x - size * 0.12, y - size * 0.6, size * 0.08, size * 0.2, -0.2, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.ellipse(x + size * 0.12, y - size * 0.6, size * 0.08, size * 0.2, 0.2, 0, Math.PI * 2)
    ctx.fill()
    
    // Ear insides
    ctx.fillStyle = detail
    ctx.beginPath()
    ctx.ellipse(x - size * 0.12, y - size * 0.6, size * 0.04, size * 0.12, -0.2, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.ellipse(x + size * 0.12, y - size * 0.6, size * 0.04, size * 0.12, 0.2, 0, Math.PI * 2)
    ctx.fill()
    
    // Fluffy tail
    ctx.fillStyle = '#fff'
    ctx.beginPath()
    ctx.ellipse(x - size * 0.35, y + size * 0.05, size * 0.08, size * 0.1, 0, 0, Math.PI * 2)
    ctx.fill()
    
    // Eyes
    ctx.fillStyle = '#000'
    if (!sleeping) {
      ctx.beginPath()
      ctx.ellipse(x - size * 0.08, y - size * 0.32, size * 0.045, size * 0.06, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.ellipse(x + size * 0.08, y - size * 0.32, size * 0.045, size * 0.06, 0, 0, Math.PI * 2)
      ctx.fill()
      
      // Eye shine
      ctx.fillStyle = '#fff'
      ctx.beginPath()
      ctx.ellipse(x - size * 0.07, y - size * 0.34, size * 0.015, size * 0.02, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.ellipse(x + size * 0.09, y - size * 0.34, size * 0.015, size * 0.02, 0, 0, Math.PI * 2)
      ctx.fill()
    }
    
    // Nose (pink triangle)
    ctx.fillStyle = '#ff69b4'
    ctx.beginPath()
    ctx.moveTo(x, y - size * 0.27)
    ctx.lineTo(x - size * 0.02, y - size * 0.24)
    ctx.lineTo(x + size * 0.02, y - size * 0.24)
    ctx.closePath()
    ctx.fill()
  }

  // Cute Cat  
  const drawCuteCat = (ctx, x, y, size, main, accent, detail, pet) => {
    // Body
    ctx.fillStyle = main
    ctx.beginPath()
    ctx.ellipse(x, y, size * 0.3, size * 0.25, 0, 0, Math.PI * 2)
    ctx.fill()
    
    // Head
    ctx.beginPath()
    ctx.ellipse(x, y - size * 0.3, size * 0.25, size * 0.22, 0, 0, Math.PI * 2)
    ctx.fill()
    
    // Triangular ears
    ctx.fillStyle = accent
    ctx.beginPath()
    ctx.moveTo(x - size * 0.15, y - size * 0.45)
    ctx.lineTo(x - size * 0.08, y - size * 0.52)
    ctx.lineTo(x - size * 0.22, y - size * 0.52)
    ctx.closePath()
    ctx.fill()
    
    ctx.beginPath()
    ctx.moveTo(x + size * 0.15, y - size * 0.45)
    ctx.lineTo(x + size * 0.08, y - size * 0.52)
    ctx.lineTo(x + size * 0.22, y - size * 0.52)
    ctx.closePath()
    ctx.fill()
    
    // Stripes
    ctx.fillStyle = accent
    ctx.fillRect(x - size * 0.25, y - size * 0.15, size * 0.5, size * 0.03)
    ctx.fillRect(x - size * 0.25, y - size * 0.05, size * 0.5, size * 0.03)
    ctx.fillRect(x - size * 0.25, y + size * 0.05, size * 0.5, size * 0.03)
    
    // Tail
    ctx.strokeStyle = main
    ctx.lineWidth = size * 0.08
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(x - size * 0.3, y + size * 0.1)
    ctx.quadraticCurveTo(x - size * 0.5, y - size * 0.2, x - size * 0.2, y - size * 0.4)
    ctx.stroke()
    
    // Eyes
    ctx.fillStyle = pet.mood === 'excited' ? '#00ff88' : '#4a90e2'
    if (!sleeping) {
      ctx.beginPath()
      ctx.ellipse(x - size * 0.08, y - size * 0.32, size * 0.04, size * 0.05, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.ellipse(x + size * 0.08, y - size * 0.32, size * 0.04, size * 0.05, 0, 0, Math.PI * 2)
      ctx.fill()
    }
    
    // Nose
    ctx.fillStyle = '#ff69b4'
    ctx.beginPath()
    ctx.moveTo(x, y - size * 0.27)
    ctx.lineTo(x - size * 0.015, y - size * 0.25)
    ctx.lineTo(x + size * 0.015, y - size * 0.25)
    ctx.closePath()
    ctx.fill()
  }

  // Similar cute implementations for other pets...
  const drawCuteDuck = (ctx, x, y, size, main, accent, detail, pet) => {
    // Duck body (more rounded)
    ctx.fillStyle = main
    ctx.beginPath()
    ctx.ellipse(x, y, size * 0.35, size * 0.28, 0, 0, Math.PI * 2)
    ctx.fill()
    
    // Head
    ctx.beginPath()
    ctx.ellipse(x, y - size * 0.25, size * 0.22, size * 0.2, 0, 0, Math.PI * 2)
    ctx.fill()
    
    // Bill
    ctx.fillStyle = '#ffaa00'
    ctx.beginPath()
    ctx.ellipse(x - size * 0.25, y - size * 0.25, size * 0.08, size * 0.05, 0, 0, Math.PI * 2)
    ctx.fill()
    
    // Wing
    ctx.fillStyle = accent
    ctx.beginPath()
    ctx.ellipse(x - size * 0.1, y - size * 0.05, size * 0.15, size * 0.18, -0.3, 0, Math.PI * 2)
    ctx.fill()
    
    // Eyes
    ctx.fillStyle = '#000'
    if (!sleeping) {
      ctx.beginPath()
      ctx.ellipse(x - size * 0.05, y - size * 0.28, size * 0.025, size * 0.03, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.ellipse(x + size * 0.05, y - size * 0.28, size * 0.025, size * 0.03, 0, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  const drawCuteWolf = (ctx, x, y, size, main, accent, detail, pet) => {
    // Similar to fox but larger and more angular
    drawCuteFox(ctx, x, y, size * 1.1, main, accent, detail, pet)
  }

  const drawCuteSloth = (ctx, x, y, size, main, accent, detail, pet) => {
    // Hanging sloth
    ctx.fillStyle = main
    ctx.beginPath()
    ctx.ellipse(x, y, size * 0.25, size * 0.35, 0, 0, Math.PI * 2)
    ctx.fill()
    
    // Head
    ctx.beginPath()
    ctx.ellipse(x, y - size * 0.45, size * 0.2, size * 0.18, 0, 0, Math.PI * 2)
    ctx.fill()
    
    // Long arms
    ctx.fillStyle = accent
    ctx.fillRect(x - size * 0.4, y - size * 0.1, size * 0.15, size * 0.08)
    ctx.fillRect(x + size * 0.25, y - size * 0.1, size * 0.15, size * 0.08)
    
    // Always sleepy eyes
    ctx.fillStyle = '#000'
    ctx.fillRect(x - size * 0.08, y - size * 0.47, size * 0.05, size * 0.02)
    ctx.fillRect(x + size * 0.03, y - size * 0.47, size * 0.05, size * 0.02)
  }

  const drawCuteHamster = (ctx, x, y, size, main, accent, detail, pet) => {
    // Very round body
    ctx.fillStyle = main
    ctx.beginPath()
    ctx.ellipse(x, y, size * 0.4, size * 0.35, 0, 0, Math.PI * 2)
    ctx.fill()
    
    // Round head
    ctx.beginPath()
    ctx.ellipse(x, y - size * 0.2, size * 0.3, size * 0.25, 0, 0, Math.PI * 2)
    ctx.fill()
    
    // Chubby cheeks
    ctx.fillStyle = accent
    ctx.beginPath()
    ctx.ellipse(x - size * 0.35, y - size * 0.15, size * 0.1, size * 0.08, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.ellipse(x + size * 0.35, y - size * 0.15, size * 0.1, size * 0.08, 0, 0, Math.PI * 2)
    ctx.fill()
    
    // Small round ears
    ctx.fillStyle = detail
    ctx.beginPath()
    ctx.ellipse(x - size * 0.15, y - size * 0.35, size * 0.06, size * 0.05, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.ellipse(x + size * 0.15, y - size * 0.35, size * 0.06, size * 0.05, 0, 0, Math.PI * 2)
    ctx.fill()
    
    // Button eyes
    ctx.fillStyle = '#000'
    if (!sleeping) {
      ctx.beginPath()
      ctx.ellipse(x - size * 0.08, y - size * 0.22, size * 0.02, size * 0.025, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.ellipse(x + size * 0.08, y - size * 0.22, size * 0.02, size * 0.025, 0, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  const drawCuteMoth = (ctx, x, y, size, main, accent, detail, pet) => {
    // Moth body
    ctx.fillStyle = main
    ctx.fillRect(x - size * 0.03, y - size * 0.25, size * 0.06, size * 0.5)
    
    // Animated wings
    const wingFlap = Math.sin(Date.now() * 0.01) * 0.2
    ctx.fillStyle = accent
    
    // Upper wings
    ctx.save()
    ctx.translate(x, y - size * 0.1)
    ctx.rotate(wingFlap)
    ctx.beginPath()
    ctx.ellipse(-size * 0.2, 0, size * 0.15, size * 0.08, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
    
    ctx.save()
    ctx.translate(x, y - size * 0.1)
    ctx.rotate(-wingFlap)
    ctx.beginPath()
    ctx.ellipse(size * 0.2, 0, size * 0.15, size * 0.08, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
    
    // Lower wings  
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(wingFlap * 0.8)
    ctx.beginPath()
    ctx.ellipse(-size * 0.15, 0, size * 0.1, size * 0.06, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
    
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(-wingFlap * 0.8)
    ctx.beginPath()
    ctx.ellipse(size * 0.15, 0, size * 0.1, size * 0.06, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }

  // Mood indicators
  const drawHearts = (ctx, x, y) => {
    ctx.fillStyle = '#ff69b4'
    ctx.font = '16px Arial'
    ctx.fillText('💕', x - 8, y)
  }

  const drawAngerMark = (ctx, x, y) => {
    ctx.fillStyle = '#ff4444'
    ctx.font = '20px Arial'
    ctx.fillText('💢', x, y)
  }

  const drawSleepZ = (ctx, x, y) => {
    ctx.fillStyle = '#87ceeb'
    ctx.font = '14px Arial'
    ctx.fillText('💤', x, y)
  }

  // Draw background world
  const drawBackground = (ctx, width, height) => {
    // Gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, height)
    gradient.addColorStop(0, '#e6f3ff')
    gradient.addColorStop(0.7, '#b3e0ff')
    gradient.addColorStop(1, '#80ccff')
    
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)
    
    // Ground
    ctx.fillStyle = '#90EE90'
    ctx.fillRect(0, height * 0.8, width, height * 0.2)
    
    // Simple grass texture
    ctx.fillStyle = '#7FDD7F'
    for (let i = 0; i < width; i += 20) {
      ctx.fillRect(i, height * 0.8, 2, 10)
      ctx.fillRect(i + 10, height * 0.82, 2, 8)
    }
    
    // Floating sparkles/dust
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
    for (let i = 0; i < 15; i++) {
      const sparkleX = (i * 100 + Date.now() * 0.05) % width
      const sparkleY = 50 + Math.sin(Date.now() * 0.003 + i) * 30
      ctx.beginPath()
      ctx.arc(sparkleX, sparkleY, 2, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  // Advanced Pet AI and behavior system
  const updatePetBehavior = () => {
    const pet = petRef.current
    const canvas = canvasRef.current
    if (!canvas) return
    
    pet.behaviorTimer++
    pet.soundTimer++
    
    // Update mood based on stats and personality
    if (sleeping) {
      pet.mood = 'sleepy'
      pet.behavior = 'sleeping'
    } else if (happiness > 85) {
      pet.mood = 'excited'
    } else if (happiness > 60) {
      pet.mood = 'happy'
    } else if (hunger < 20) {
      pet.mood = 'grumpy'
    } else if (hunger < 40 && pet.socialness > 0.7) {
      pet.mood = 'attention_seeking'
    } else {
      pet.mood = 'neutral'
    }

    // Personality-based sound effects (simulate with mood changes)
    if (pet.soundTimer > 300 + Math.random() * 600 && pet.playfulness > 0.6) {
      pet.mood = 'playful'
      pet.soundTimer = 0
      // Trigger a little jump or bounce
      if (Date.now() - pet.lastJumpTime > pet.jumpCooldown) {
        pet.velocity.y -= 5
        pet.lastJumpTime = Date.now()
      }
    }

    // Greeting behavior for new users
    if (!pet.hasGreetedUser && pet.behaviorTimer > 60) {
      pet.hasGreetedUser = true
      pet.behavior = 'greeting'
      pet.mood = 'excited'
      pet.targetX = canvas.width / 2
      pet.targetY = canvas.height / 2
      pet.speed = 3
      pet.behaviorTimer = 0
    }

    // Mouse interaction with enhanced AI
    const mouseDistance = Math.sqrt(
      (mousePos.x - pet.x) ** 2 + (mousePos.y - pet.y) ** 2
    )
    
    pet.isNearMouse = mouseDistance < pet.mouseFollowDistance
    
    // Pet behavior is working correctly - debug removed
    
    // Remember where user clicks/moves
    if (isMouseMoving) {
      const spot = { x: mousePos.x, y: mousePos.y, timestamp: Date.now() }
      pet.memorySpots.push(spot)
      if (pet.memorySpots.length > 5) pet.memorySpots.shift()
    }

    // Advanced behavior decision tree
    if (pet.behavior === 'sleeping') {
      pet.velocity.x *= 0.95
      pet.velocity.y *= 0.95
    } else if (pet.behavior === 'greeting' && pet.behaviorTimer < 120) {
      // Greeting behavior - come to center and show excitement
      pet.speed = 3
    } else if (pet.isNearMouse && !sleeping && pet.curiosity > 0.4) {
      // Curious following with personality variations
      pet.behavior = 'curious'
      const personalityDistance = 60 + (1 - pet.socialness) * 80
      const angle = Math.atan2(mousePos.y - pet.y, mousePos.x - pet.x)
      
      if (pet.socialness > 0.7) {
        // Very social pets come closer
        pet.targetX = mousePos.x - Math.cos(angle) * personalityDistance * 0.7
        pet.targetY = mousePos.y - Math.sin(angle) * personalityDistance * 0.7
      } else if (pet.curiosity > 0.8) {
        // Curious pets investigate but keep some distance
        pet.targetX = mousePos.x - Math.cos(angle) * personalityDistance
        pet.targetY = mousePos.y - Math.sin(angle) * personalityDistance
      } else {
        // Shy pets watch from afar
        pet.targetX = mousePos.x - Math.cos(angle) * personalityDistance * 1.5
        pet.targetY = mousePos.y - Math.sin(angle) * personalityDistance * 1.5
      }
      
      pet.speed = 2 + pet.curiosity
    } else if (pet.mood === 'attention_seeking' && pet.socialness > 0.6) {
      // Attention seeking behavior - come near center
      pet.behavior = 'attention_seeking'
      pet.targetX = canvas.width / 2 + (Math.random() - 0.5) * 200
      pet.targetY = canvas.height / 2 + (Math.random() - 0.5) * 100
      pet.speed = 2.5
    } else if (pet.playfulness > 0.7 && Math.random() < 0.01) {
      // Random playful burst
      pet.behavior = 'playing'
      pet.mood = 'playful'
      pet.targetX = 100 + Math.random() * (canvas.width - 200)
      pet.targetY = 100 + Math.random() * (canvas.height - 200)
      pet.speed = 4
      pet.behaviorTimer = 0
    } else if (pet.favoriteSpots.length > 0 && Math.random() < 0.005) {
      // Visit favorite spots
      const favoriteSpot = pet.favoriteSpots[Math.floor(Math.random() * pet.favoriteSpots.length)]
      pet.behavior = 'visiting_favorite'
      pet.targetX = favoriteSpot.x
      pet.targetY = favoriteSpot.y
      pet.speed = 2
    } else {
      // Intelligent exploration based on personality
      if (pet.behaviorTimer > (120 + Math.random() * 180) * (2 - pet.curiosity)) {
        // More curious pets explore more frequently
        const explorationRange = pet.curiosity * 0.8
        const centerX = canvas.width / 2
        const centerY = canvas.height / 2
        const maxRangeX = canvas.width * explorationRange
        const maxRangeY = canvas.height * explorationRange
        
        pet.targetX = centerX + (Math.random() - 0.5) * maxRangeX
        pet.targetY = centerY + (Math.random() - 0.5) * maxRangeY
        
        // Ensure pet stays within reasonable bounds
        pet.targetX = Math.max(100, Math.min(canvas.width - 100, pet.targetX))
        pet.targetY = Math.max(100, Math.min(canvas.height - 100, pet.targetY))
        
        pet.behaviorTimer = 0
        pet.behavior = 'exploring'
        pet.speed = 1.5 + pet.curiosity * 0.5
      }
    }

    // Movement physics
    if (pet.behavior !== 'sleeping') {
      const dx = pet.targetX - pet.x
      const dy = pet.targetY - pet.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      
      if (distance > 10) {
        pet.velocity.x += (dx / distance) * 0.2
        pet.velocity.y += (dy / distance) * 0.2
        pet.direction = pet.velocity.x > 0 ? 'right' : 'left'
        pet.animation = distance > 50 ? 'running' : 'walking'
      } else {
        pet.animation = 'idle'
      }
    }

    // Apply physics
    pet.velocity.x *= 0.9
    pet.velocity.y *= 0.9
    
    const maxSpeed = pet.speed
    const currentSpeed = Math.sqrt(pet.velocity.x ** 2 + pet.velocity.y ** 2)
    if (currentSpeed > maxSpeed) {
      pet.velocity.x = (pet.velocity.x / currentSpeed) * maxSpeed
      pet.velocity.y = (pet.velocity.y / currentSpeed) * maxSpeed
    }

    pet.x += pet.velocity.x
    pet.y += pet.velocity.y

    // Screen boundaries
    pet.x = Math.max(60, Math.min(canvas.width - 60, pet.x))
    pet.y = Math.max(canvas.height * 0.2, Math.min(canvas.height * 0.75, pet.y))
  }

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    
    // Set initial canvas size
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    
    // Initialize pet position only if not already set
    if (petRef.current.x === 0 && petRef.current.y === 0) {
      petRef.current.x = canvas.width / 2
      petRef.current.y = canvas.height * 0.6
      petRef.current.targetX = canvas.width / 2
      petRef.current.targetY = canvas.height * 0.6
    }

    const animate = () => {
      // Only resize canvas if window size actually changed
      if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
        const oldWidth = canvas.width
        const oldHeight = canvas.height
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
        
        // Adjust pet position proportionally if canvas was resized
        if (oldWidth > 0 && oldHeight > 0) {
          const scaleX = canvas.width / oldWidth
          const scaleY = canvas.height / oldHeight
          petRef.current.x *= scaleX
          petRef.current.y *= scaleY
          petRef.current.targetX *= scaleX
          petRef.current.targetY *= scaleY
        }
      }
      
      updatePetBehavior()
      
      // Draw world
      drawBackground(ctx, canvas.width, canvas.height)
      
      // Draw pet
      drawCutePet(ctx, petRef.current)
      
      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [petId, happiness, hunger, sleeping, traits])

  // Mouse tracking
  useEffect(() => {
    let mouseTimer
    
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY })
      setIsMouseMoving(true)
      
      clearTimeout(mouseTimer)
      mouseTimer = setTimeout(() => setIsMouseMoving(false), 1000)
    }

    const handleClick = (e) => {
      const pet = petRef.current
      const distance = Math.sqrt(
        (e.clientX - pet.x) ** 2 + (e.clientY - pet.y) ** 2
      )
      
      pet.clickCount++
      
      if (distance < 150) { // Larger interaction zone
        // Direct pet interaction
        pet.mood = 'excited'
        pet.lastInteraction = Date.now()
        pet.behavior = 'being_petted'
        pet.behaviorTimer = 0
        
        // Special reactions based on click count
        if (pet.clickCount > 5 && pet.playfulness > 0.6) {
          pet.mood = 'playful'
          pet.behavior = 'showing_off'
          pet.velocity.y -= 8 // Big jump!
        } else if (pet.clickCount > 3 && pet.socialness > 0.7) {
          pet.mood = 'attention_seeking'
          // Come closer to user
          const angle = Math.atan2(e.clientY - pet.y, e.clientX - pet.x)
          pet.targetX = e.clientX - Math.cos(angle) * 50
          pet.targetY = e.clientY - Math.sin(angle) * 50
        }
        
        // Remember this as a favorite spot if clicked multiple times
        if (pet.clickCount > 2) {
          const existingSpot = pet.favoriteSpots.find(spot => 
            Math.sqrt((spot.x - e.clientX) ** 2 + (spot.y - e.clientY) ** 2) < 100
          )
          if (!existingSpot) {
            pet.favoriteSpots.push({ x: e.clientX, y: e.clientY, visits: 1 })
            if (pet.favoriteSpots.length > 3) pet.favoriteSpots.shift()
          } else {
            existingSpot.visits++
          }
        }
        
        onPet?.()
      } else {
        // Clicking away from pet - investigate the spot
        if (pet.curiosity > 0.5) {
          pet.behavior = 'investigating'
          pet.targetX = e.clientX
          pet.targetY = e.clientY
          pet.speed = 2.5
          pet.behaviorTimer = 0
          
          // Mark this spot as interesting
          pet.memorySpots.push({
            x: e.clientX,
            y: e.clientY,
            timestamp: Date.now(),
            type: 'click'
          })
        }
      }
      
      // Reset click count after a while
      setTimeout(() => {
        if (pet.clickCount > 0) pet.clickCount--
      }, 5000)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('click', handleClick)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('click', handleClick)
      clearTimeout(mouseTimer)
    }
  }, [onPet])

  // Handle action signals
  useEffect(() => {
    if (!actionSignal) return
    
    const pet = petRef.current
    const { type } = actionSignal
    
    if (type === 'eat') {
      pet.behavior = 'excited'
      pet.mood = 'happy'
      pet.behaviorTimer = 0
    } else if (type === 'play') {
      pet.behavior = 'playing'
      pet.mood = 'excited'
      pet.behaviorTimer = 0
    }
  }, [actionSignal])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 1,
        pointerEvents: 'auto'
      }}
    />
  )
}