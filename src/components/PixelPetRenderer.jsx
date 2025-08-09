import React, { useRef, useEffect } from 'react'

// Pixel Pet Renderer - Creates proper pixel art sprites
export function PixelPetRenderer({ 
  petId, 
  animation = 'idle', 
  direction = 'right',
  mood = 'neutral',
  width = 48, 
  height = 48,
  traits,
  style = {}
}) {
  const canvasRef = useRef(null)
  
  // Draw pixel art directly on canvas
  const drawPixelPet = (ctx, petType, anim, facing, petMood) => {
    ctx.clearRect(0, 0, width, height)
    ctx.imageSmoothingEnabled = false
    
    // Get pet colors from traits
    const palette = traits?.palette || ['#00ff99', '#00cc77', '#008855']
    const main = palette[0]
    const accent = palette[1] || main
    const detail = palette[2] || accent
    
    // Scale for pixel art
    const scale = Math.floor(width / 16)
    ctx.scale(scale, scale)
    
    // Flip for direction
    if (facing === 'left') {
      ctx.scale(-1, 1)
      ctx.translate(-16, 0)
    }
    
    switch (petType) {
      case 'forest-fox':
        drawPixelFox(ctx, main, accent, detail, anim, petMood)
        break
      case 'mystic-bunny':
        drawPixelBunny(ctx, main, accent, detail, anim, petMood)
        break
      case 'robo-cat':
        drawPixelRoboCat(ctx, main, accent, detail, anim, petMood)
        break
      case 'water-duck':
        drawPixelDuck(ctx, main, accent, detail, anim, petMood)
        break
      case 'shadow-wolf':
        drawPixelWolf(ctx, main, accent, detail, anim, petMood)
        break
      case 'pixel-sloth':
        drawPixelSloth(ctx, main, accent, detail, anim, petMood)
        break
      case 'chonk-hamster':
        drawPixelHamster(ctx, main, accent, detail, anim, petMood)
        break
      case 'glitch-moth':
        drawPixelMoth(ctx, main, accent, detail, anim, petMood)
        break
      default:
        drawPixelFox(ctx, main, accent, detail, anim, petMood)
    }
  }
  
  // Pixel art drawing functions
  const drawPixelFox = (ctx, main, accent, detail, anim, mood) => {
    // Fox body (12x10 pixels)
    ctx.fillStyle = main
    
    // Body
    ctx.fillRect(4, 8, 8, 6)
    
    // Head
    ctx.fillRect(5, 4, 6, 6)
    
    // Ears
    ctx.fillStyle = accent
    ctx.fillRect(4, 2, 2, 3)
    ctx.fillRect(10, 2, 2, 3)
    
    // Tail
    ctx.fillStyle = accent
    if (anim === 'walking' || anim === 'running') {
      ctx.fillRect(1, 6, 4, 3) // Tail swaying
    } else {
      ctx.fillRect(2, 7, 3, 3)
    }
    
    // Eyes
    ctx.fillStyle = '#000'
    if (mood === 'sleepy' || anim === 'sleeping') {
      ctx.fillRect(6, 5, 1, 1)
      ctx.fillRect(9, 5, 1, 1)
    } else if (mood === 'excited') {
      ctx.fillRect(6, 5, 2, 1)
      ctx.fillRect(8, 5, 2, 1)
    } else {
      ctx.fillRect(6, 5, 1, 1)
      ctx.fillRect(9, 5, 1, 1)
    }
    
    // Nose
    ctx.fillStyle = '#333'
    ctx.fillRect(7, 7, 1, 1)
    
    // Legs (walking animation)
    ctx.fillStyle = main
    if (anim === 'walking' || anim === 'running') {
      const offset = Math.floor(Date.now() / 200) % 2
      ctx.fillRect(5 + offset, 14, 1, 2)
      ctx.fillRect(7 - offset, 14, 1, 2)
      ctx.fillRect(8 + offset, 14, 1, 2)
      ctx.fillRect(10 - offset, 14, 1, 2)
    } else {
      ctx.fillRect(5, 14, 1, 2)
      ctx.fillRect(7, 14, 1, 2)
      ctx.fillRect(8, 14, 1, 2)
      ctx.fillRect(10, 14, 1, 2)
    }
  }
  
  const drawPixelBunny = (ctx, main, accent, detail, anim, mood) => {
    // Bunny body
    ctx.fillStyle = main
    ctx.fillRect(4, 8, 8, 6)
    ctx.fillRect(5, 4, 6, 6)
    
    // Long ears
    ctx.fillStyle = accent
    ctx.fillRect(5, 1, 2, 4)
    ctx.fillRect(9, 1, 2, 4)
    
    // Ear tips
    ctx.fillStyle = detail
    ctx.fillRect(5, 1, 2, 1)
    ctx.fillRect(9, 1, 2, 1)
    
    // Fluffy tail
    ctx.fillStyle = '#fff'
    ctx.fillRect(2, 9, 2, 2)
    
    // Eyes
    ctx.fillStyle = '#000'
    if (mood === 'excited') {
      ctx.fillRect(6, 5, 2, 2)
      ctx.fillRect(8, 5, 2, 2)
    } else {
      ctx.fillRect(6, 5, 1, 2)
      ctx.fillRect(9, 5, 1, 2)
    }
    
    // Legs with hop animation
    ctx.fillStyle = main
    if (anim === 'walking' || anim === 'running') {
      const hop = Math.floor(Date.now() / 300) % 2
      const y = hop ? 13 : 14
      ctx.fillRect(5, y, 1, 3 - hop)
      ctx.fillRect(7, y, 1, 3 - hop)
      ctx.fillRect(8, y, 1, 3 - hop)
      ctx.fillRect(10, y, 1, 3 - hop)
    } else {
      ctx.fillRect(5, 14, 1, 2)
      ctx.fillRect(7, 14, 1, 2)
      ctx.fillRect(8, 14, 1, 2)
      ctx.fillRect(10, 14, 1, 2)
    }
  }
  
  const drawPixelRoboCat = (ctx, main, accent, detail, anim, mood) => {
    // Robot cat body (metallic)
    ctx.fillStyle = main
    ctx.fillRect(4, 8, 8, 6)
    ctx.fillRect(5, 4, 6, 6)
    
    // Robot ears (angular)
    ctx.fillStyle = accent
    ctx.fillRect(5, 2, 2, 3)
    ctx.fillRect(9, 2, 2, 3)
    
    // LED eyes
    ctx.fillStyle = mood === 'excited' ? '#00ffff' : '#0066ff'
    ctx.fillRect(6, 5, 2, 2)
    ctx.fillRect(8, 5, 2, 2)
    
    // Robot mouth
    ctx.fillStyle = '#666'
    ctx.fillRect(7, 8, 2, 1)
    
    // Antenna
    ctx.fillStyle = detail
    ctx.fillRect(7, 1, 2, 1)
    ctx.fillRect(8, 0, 1, 1)
    
    // Mechanical legs
    ctx.fillStyle = accent
    ctx.fillRect(5, 14, 1, 2)
    ctx.fillRect(7, 14, 1, 2)
    ctx.fillRect(8, 14, 1, 2)
    ctx.fillRect(10, 14, 1, 2)
    
    // Joints
    ctx.fillStyle = detail
    ctx.fillRect(5, 13, 1, 1)
    ctx.fillRect(7, 13, 1, 1)
    ctx.fillRect(8, 13, 1, 1)
    ctx.fillRect(10, 13, 1, 1)
  }
  
  const drawPixelDuck = (ctx, main, accent, detail, anim, mood) => {
    // Duck body (round)
    ctx.fillStyle = main
    ctx.fillRect(4, 9, 8, 5)
    ctx.fillRect(5, 5, 6, 6)
    
    // Bill
    ctx.fillStyle = '#ff9900'
    ctx.fillRect(2, 6, 3, 2)
    
    // Wing
    ctx.fillStyle = accent
    ctx.fillRect(4, 10, 3, 3)
    
    // Eyes
    ctx.fillStyle = '#000'
    ctx.fillRect(6, 6, 1, 1)
    ctx.fillRect(9, 6, 1, 1)
    
    // Webbed feet
    ctx.fillStyle = '#ff9900'
    if (anim === 'walking') {
      const waddle = Math.floor(Date.now() / 250) % 2
      ctx.fillRect(5 + waddle, 14, 2, 1)
      ctx.fillRect(8 - waddle, 14, 2, 1)
    } else {
      ctx.fillRect(5, 14, 2, 1)
      ctx.fillRect(8, 14, 2, 1)
    }
  }
  
  const drawPixelWolf = (ctx, main, accent, detail, anim, mood) => {
    // Wolf body (larger than fox)
    ctx.fillStyle = main
    ctx.fillRect(3, 8, 10, 6)
    ctx.fillRect(4, 4, 8, 6)
    
    // Pointed ears
    ctx.fillStyle = accent
    ctx.fillRect(4, 1, 2, 4)
    ctx.fillRect(10, 1, 2, 4)
    
    // Snout
    ctx.fillStyle = main
    ctx.fillRect(2, 6, 3, 3)
    
    // Fierce eyes
    ctx.fillStyle = mood === 'grumpy' ? '#ff0000' : '#ffff00'
    ctx.fillRect(5, 5, 2, 1)
    ctx.fillRect(9, 5, 2, 1)
    
    // Sharp teeth
    if (mood === 'grumpy' || mood === 'excited') {
      ctx.fillStyle = '#fff'
      ctx.fillRect(2, 8, 1, 1)
      ctx.fillRect(4, 8, 1, 1)
    }
    
    // Bushy tail
    ctx.fillStyle = accent
    ctx.fillRect(0, 6, 4, 4)
    
    // Legs
    ctx.fillStyle = main
    ctx.fillRect(4, 14, 2, 2)
    ctx.fillRect(7, 14, 2, 2)
    ctx.fillRect(9, 14, 2, 2)
    ctx.fillRect(11, 14, 2, 2)
  }
  
  const drawPixelSloth = (ctx, main, accent, detail, anim, mood) => {
    // Sloth body (hanging position)
    ctx.fillStyle = main
    ctx.fillRect(5, 6, 6, 8)
    ctx.fillRect(6, 3, 4, 5)
    
    // Long arms
    ctx.fillStyle = accent
    ctx.fillRect(3, 8, 3, 2)
    ctx.fillRect(10, 8, 3, 2)
    
    // Claws
    ctx.fillStyle = detail
    ctx.fillRect(2, 7, 2, 1)
    ctx.fillRect(12, 7, 2, 1)
    
    // Sleepy eyes
    ctx.fillStyle = '#000'
    if (mood === 'sleepy' || anim === 'sleeping') {
      ctx.fillRect(7, 5, 1, 1)
      ctx.fillRect(9, 5, 1, 1)
    } else {
      ctx.fillRect(7, 4, 1, 2)
      ctx.fillRect(9, 4, 1, 2)
    }
    
    // Smile
    ctx.fillStyle = '#333'
    ctx.fillRect(7, 7, 3, 1)
  }
  
  const drawPixelHamster = (ctx, main, accent, detail, anim, mood) => {
    // Hamster body (chubby)
    ctx.fillStyle = main
    ctx.fillRect(3, 7, 10, 7)
    ctx.fillRect(5, 3, 6, 6)
    
    // Round ears
    ctx.fillStyle = accent
    ctx.fillRect(5, 2, 2, 2)
    ctx.fillRect(9, 2, 2, 2)
    
    // Chubby cheeks
    ctx.fillStyle = accent
    ctx.fillRect(3, 5, 2, 3)
    ctx.fillRect(11, 5, 2, 3)
    
    // Button eyes
    ctx.fillStyle = '#000'
    ctx.fillRect(6, 5, 1, 1)
    ctx.fillRect(9, 5, 1, 1)
    
    // Tiny legs (barely visible)
    ctx.fillStyle = main
    ctx.fillRect(5, 14, 1, 1)
    ctx.fillRect(7, 14, 1, 1)
    ctx.fillRect(8, 14, 1, 1)
    ctx.fillRect(10, 14, 1, 1)
  }
  
  const drawPixelMoth = (ctx, main, accent, detail, anim, mood) => {
    // Moth body (thin)
    ctx.fillStyle = main
    ctx.fillRect(7, 4, 2, 10)
    
    // Wings (animated flutter)
    const flutter = Math.floor(Date.now() / 150) % 2
    ctx.fillStyle = accent
    if (anim === 'flying' || flutter) {
      // Wings up
      ctx.fillRect(3, 5, 4, 3)
      ctx.fillRect(9, 5, 4, 3)
      ctx.fillRect(4, 9, 3, 2)
      ctx.fillRect(9, 9, 3, 2)
    } else {
      // Wings down
      ctx.fillRect(4, 7, 4, 3)
      ctx.fillRect(8, 7, 4, 3)
      ctx.fillRect(5, 10, 3, 2)
      ctx.fillRect(8, 10, 3, 2)
    }
    
    // Wing patterns
    ctx.fillStyle = detail
    ctx.fillRect(5, 6, 1, 1)
    ctx.fillRect(10, 6, 1, 1)
    
    // Antennae
    ctx.fillStyle = '#333'
    ctx.fillRect(6, 2, 1, 2)
    ctx.fillRect(9, 2, 1, 2)
    ctx.fillRect(5, 1, 1, 1)
    ctx.fillRect(10, 1, 1, 1)
  }
  
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    ctx.save()
    
    drawPixelPet(ctx, petId, animation, direction, mood)
    
    ctx.restore()
  }, [petId, animation, direction, mood, width, height, traits])
  
  return (
    <canvas 
      ref={canvasRef}
      width={width}
      height={height}
      style={{
        imageRendering: 'pixelated',
        width: `${width}px`,
        height: `${height}px`,
        ...style
      }}
    />
  )
}

export default PixelPetRenderer