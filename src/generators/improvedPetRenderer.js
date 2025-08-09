// Improved Pet Renderer - Creates actual creature sprites instead of blobs
export function renderImprovedPet(petObj, canvas, opts = {}) {
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  const w = canvas.width = opts.width || 128;
  const h = canvas.height = opts.height || 128;
  
  // Clear canvas with subtle gradient background
  ctx.clearRect(0, 0, w, h);
  const gradient = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, w/2);
  gradient.addColorStop(0, '#1a1a2e');
  gradient.addColorStop(1, '#0a0a1e');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);
  
  const pal = petObj.palette || ['#00ff99', '#00cc77', '#008855'];
  const main = pal[0];
  const accent = pal[1] || main;
  const detail = pal[2] || accent;
  
  // Scale for consistent sizing
  const scale = opts.scale || 1;
  ctx.save();
  ctx.translate(w/2, h/2);
  ctx.scale(scale, scale);
  
  // Draw based on species - handle both petId format and generated species format
  const species = petObj.species?.toLowerCase() || petObj.id?.toLowerCase() || '';
  switch(species) {
    case 'forest fox':
    case 'forest-fox':
      drawFox(ctx, main, accent, detail, petObj);
      break;
    case 'mystic bunny':
    case 'mystic-bunny':
      drawBunny(ctx, main, accent, detail, petObj);
      break;
    case 'robo cat':
    case 'robo-cat':
      drawRoboCat(ctx, main, accent, detail, petObj);
      break;
    case 'water duck':
    case 'water-duck':
      drawDuck(ctx, main, accent, detail, petObj);
      break;
    case 'shadow wolf':
    case 'shadow-wolf':
      drawWolf(ctx, main, accent, detail, petObj);
      break;
    case 'pixel sloth':
    case 'pixel-sloth':
      drawSloth(ctx, main, accent, detail, petObj);
      break;
    case 'chonk hamster':
    case 'chonk-hamster':
      drawHamster(ctx, main, accent, detail, petObj);
      break;
    case 'glitch moth':
    case 'glitch-moth':
      drawMoth(ctx, main, accent, detail, petObj);
      break;
    default:
      drawDefaultCreature(ctx, main, accent, detail, petObj);
  }
  
  ctx.restore();
  
  // Add effects based on rarity
  if (petObj.rarity === 'legendary') {
    addLegendaryGlow(ctx, w, h);
  } else if (petObj.rarity === 'epic') {
    addEpicSparkles(ctx, w, h);
  } else if (petObj.rarity === 'rare') {
    addRareShimmer(ctx, w, h);
  }
  
  // Add rarity label
  ctx.font = 'bold 8px monospace';
  ctx.fillStyle = getRarityColor(petObj.rarity);
  ctx.fillText(petObj.rarity?.toUpperCase() || 'COMMON', 4, h - 4);
}

// Fox with pointy ears, snout, and bushy tail
function drawFox(ctx, main, accent, detail, pet) {
  // Tail (behind body)
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.ellipse(-25, 10, 18, 25, -0.3, 0, Math.PI * 2);
  ctx.fill();
  
  // Tail tip
  ctx.fillStyle = detail;
  ctx.beginPath();
  ctx.ellipse(-30, 18, 8, 12, -0.3, 0, Math.PI * 2);
  ctx.fill();
  
  // Body
  ctx.fillStyle = main;
  ctx.beginPath();
  ctx.ellipse(0, 8, 20, 24, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Chest fluff
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.ellipse(0, 12, 12, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Head
  ctx.fillStyle = main;
  ctx.beginPath();
  ctx.ellipse(0, -8, 18, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Snout
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.moveTo(0, -5);
  ctx.lineTo(8, 0);
  ctx.lineTo(0, 2);
  ctx.lineTo(-8, 0);
  ctx.closePath();
  ctx.fill();
  
  // Ears (triangular)
  ctx.fillStyle = main;
  ctx.beginPath();
  ctx.moveTo(-10, -18);
  ctx.lineTo(-6, -28);
  ctx.lineTo(-2, -20);
  ctx.closePath();
  ctx.fill();
  
  ctx.beginPath();
  ctx.moveTo(10, -18);
  ctx.lineTo(6, -28);
  ctx.lineTo(2, -20);
  ctx.closePath();
  ctx.fill();
  
  // Inner ears
  ctx.fillStyle = detail;
  ctx.beginPath();
  ctx.moveTo(-8, -20);
  ctx.lineTo(-6, -24);
  ctx.lineTo(-4, -20);
  ctx.closePath();
  ctx.fill();
  
  ctx.beginPath();
  ctx.moveTo(8, -20);
  ctx.lineTo(6, -24);
  ctx.lineTo(4, -20);
  ctx.closePath();
  ctx.fill();
  
  // Eyes
  drawEyes(ctx, pet.eyes, -6, -8, 6, -8);
  
  // Nose
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(0, -2, 2, 0, Math.PI * 2);
  ctx.fill();
}

// Bunny with long ears and fluffy tail
function drawBunny(ctx, main, accent, detail, pet) {
  // Body (round and chubby)
  ctx.fillStyle = main;
  ctx.beginPath();
  ctx.ellipse(0, 10, 22, 26, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Fluffy tail
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.arc(-20, 12, 8, 0, Math.PI * 2);
  ctx.fill();
  
  // Head
  ctx.fillStyle = main;
  ctx.beginPath();
  ctx.ellipse(0, -6, 16, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Long ears
  ctx.fillStyle = main;
  ctx.beginPath();
  ctx.ellipse(-6, -18, 5, 18, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(6, -18, 5, 18, 0.2, 0, Math.PI * 2);
  ctx.fill();
  
  // Inner ears
  ctx.fillStyle = detail;
  ctx.beginPath();
  ctx.ellipse(-6, -18, 2, 12, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(6, -18, 2, 12, 0.2, 0, Math.PI * 2);
  ctx.fill();
  
  // Cheeks
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.arc(-10, -2, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(10, -2, 4, 0, Math.PI * 2);
  ctx.fill();
  
  // Eyes
  drawEyes(ctx, pet.eyes, -5, -6, 5, -6);
  
  // Nose (small and cute)
  ctx.fillStyle = detail;
  ctx.beginPath();
  ctx.arc(0, -2, 1.5, 0, Math.PI * 2);
  ctx.fill();
  
  // Mouth (W shape)
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-3, 0);
  ctx.lineTo(0, 1);
  ctx.lineTo(3, 0);
  ctx.stroke();
}

// Robotic cat with angular features
function drawRoboCat(ctx, main, accent, detail, pet) {
  // Body (boxy)
  ctx.fillStyle = main;
  ctx.fillRect(-18, -5, 36, 30);
  
  // Panel lines
  ctx.strokeStyle = detail;
  ctx.lineWidth = 1;
  ctx.strokeRect(-18, -5, 36, 30);
  ctx.beginPath();
  ctx.moveTo(-18, 10);
  ctx.lineTo(18, 10);
  ctx.stroke();
  
  // Head (angular)
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.moveTo(-15, -5);
  ctx.lineTo(15, -5);
  ctx.lineTo(12, -20);
  ctx.lineTo(-12, -20);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  
  // Ears (triangular antennas)
  ctx.fillStyle = detail;
  ctx.beginPath();
  ctx.moveTo(-12, -20);
  ctx.lineTo(-10, -28);
  ctx.lineTo(-8, -20);
  ctx.closePath();
  ctx.fill();
  
  ctx.beginPath();
  ctx.moveTo(12, -20);
  ctx.lineTo(10, -28);
  ctx.lineTo(8, -20);
  ctx.closePath();
  ctx.fill();
  
  // LED eyes
  ctx.fillStyle = '#ff0000';
  ctx.shadowColor = '#ff0000';
  ctx.shadowBlur = 4;
  ctx.fillRect(-8, -12, 4, 4);
  ctx.fillRect(4, -12, 4, 4);
  ctx.shadowBlur = 0;
  
  // Screen mouth
  ctx.fillStyle = '#00ff00';
  ctx.fillRect(-6, -6, 12, 2);
  
  // Tail (segmented)
  ctx.fillStyle = main;
  for (let i = 0; i < 4; i++) {
    ctx.fillRect(-22 - i*4, 15 - i*2, 4, 6);
  }
}

// Duck with bill and webbed feet
function drawDuck(ctx, main, accent, detail, pet) {
  // Body
  ctx.fillStyle = main;
  ctx.beginPath();
  ctx.ellipse(0, 8, 18, 22, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Wing
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.ellipse(-8, 8, 10, 14, -0.3, 0, Math.PI * 2);
  ctx.fill();
  
  // Head
  ctx.fillStyle = main;
  ctx.beginPath();
  ctx.arc(2, -8, 12, 0, Math.PI * 2);
  ctx.fill();
  
  // Bill
  ctx.fillStyle = '#FFA500';
  ctx.beginPath();
  ctx.ellipse(10, -5, 8, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Bill line
  ctx.strokeStyle = '#FF8C00';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(4, -5);
  ctx.lineTo(16, -5);
  ctx.stroke();
  
  // Eyes
  drawEyes(ctx, pet.eyes, -2, -10, 6, -10);
  
  // Feet (webbed)
  ctx.fillStyle = '#FFA500';
  ctx.beginPath();
  ctx.moveTo(-8, 28);
  ctx.lineTo(-10, 32);
  ctx.lineTo(-6, 32);
  ctx.lineTo(-4, 32);
  ctx.closePath();
  ctx.fill();
  
  ctx.beginPath();
  ctx.moveTo(8, 28);
  ctx.lineTo(6, 32);
  ctx.lineTo(10, 32);
  ctx.lineTo(12, 32);
  ctx.closePath();
  ctx.fill();
}

// Wolf with fierce features
function drawWolf(ctx, main, accent, detail, pet) {
  // Tail
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.ellipse(-22, 5, 12, 20, -0.5, 0, Math.PI * 2);
  ctx.fill();
  
  // Body (muscular)
  ctx.fillStyle = main;
  ctx.beginPath();
  ctx.ellipse(0, 8, 20, 25, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Chest
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.ellipse(2, 10, 14, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Head (angular)
  ctx.fillStyle = main;
  ctx.beginPath();
  ctx.moveTo(-12, -5);
  ctx.lineTo(12, -5);
  ctx.lineTo(10, -18);
  ctx.lineTo(-10, -18);
  ctx.closePath();
  ctx.fill();
  
  // Snout (longer)
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.moveTo(0, -8);
  ctx.lineTo(12, -3);
  ctx.lineTo(10, 2);
  ctx.lineTo(0, 0);
  ctx.closePath();
  ctx.fill();
  
  // Ears (pointed)
  ctx.fillStyle = main;
  ctx.beginPath();
  ctx.moveTo(-10, -18);
  ctx.lineTo(-8, -26);
  ctx.lineTo(-4, -18);
  ctx.closePath();
  ctx.fill();
  
  ctx.beginPath();
  ctx.moveTo(10, -18);
  ctx.lineTo(8, -26);
  ctx.lineTo(4, -18);
  ctx.closePath();
  ctx.fill();
  
  // Eyes (fierce)
  ctx.fillStyle = pet.rarity === 'legendary' ? '#ff0000' : '#ffff00';
  ctx.beginPath();
  ctx.arc(-4, -10, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(6, -10, 3, 0, Math.PI * 2);
  ctx.fill();
  
  // Pupils
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.ellipse(-4, -10, 1, 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(6, -10, 1, 2, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Fangs
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.moveTo(6, 0);
  ctx.lineTo(7, 3);
  ctx.lineTo(8, 0);
  ctx.closePath();
  ctx.fill();
}

// Sloth with long arms
function drawSloth(ctx, main, accent, detail, pet) {
  // Arms (hanging)
  ctx.strokeStyle = main;
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(-15, -5);
  ctx.quadraticCurveTo(-20, 10, -18, 25);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(15, -5);
  ctx.quadraticCurveTo(20, 10, 18, 25);
  ctx.stroke();
  
  // Body (round)
  ctx.fillStyle = main;
  ctx.beginPath();
  ctx.ellipse(0, 5, 18, 22, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Belly
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.ellipse(0, 8, 12, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Head (wide)
  ctx.fillStyle = main;
  ctx.beginPath();
  ctx.ellipse(0, -10, 20, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Eye mask
  ctx.fillStyle = detail;
  ctx.beginPath();
  ctx.ellipse(-8, -10, 8, 6, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(8, -10, 8, 6, 0.2, 0, Math.PI * 2);
  ctx.fill();
  
  // Sleepy eyes
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(-6, -10, 3, 0, Math.PI);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(6, -10, 3, 0, Math.PI);
  ctx.stroke();
  
  // Nose
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.ellipse(0, -6, 3, 2, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Smile
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(0, -4, 4, 0, Math.PI);
  ctx.stroke();
}

// Chubby hamster
function drawHamster(ctx, main, accent, detail, pet) {
  // Body (very round)
  ctx.fillStyle = main;
  ctx.beginPath();
  ctx.arc(0, 8, 24, 0, Math.PI * 2);
  ctx.fill();
  
  // Belly
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.ellipse(0, 12, 16, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Head (round)
  ctx.fillStyle = main;
  ctx.beginPath();
  ctx.arc(0, -8, 14, 0, Math.PI * 2);
  ctx.fill();
  
  // Cheek pouches (puffed)
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.arc(-12, -4, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(12, -4, 8, 0, Math.PI * 2);
  ctx.fill();
  
  // Ears (small and round)
  ctx.fillStyle = main;
  ctx.beginPath();
  ctx.arc(-8, -18, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(8, -18, 5, 0, Math.PI * 2);
  ctx.fill();
  
  // Inner ears
  ctx.fillStyle = detail;
  ctx.beginPath();
  ctx.arc(-8, -18, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(8, -18, 2, 0, Math.PI * 2);
  ctx.fill();
  
  // Eyes (beady)
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(-4, -8, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(4, -8, 2, 0, Math.PI * 2);
  ctx.fill();
  
  // Nose
  ctx.fillStyle = detail;
  ctx.beginPath();
  ctx.arc(0, -4, 1, 0, Math.PI * 2);
  ctx.fill();
  
  // Tiny paws
  ctx.fillStyle = detail;
  ctx.beginPath();
  ctx.ellipse(-12, 28, 4, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(12, 28, 4, 3, 0, 0, Math.PI * 2);
  ctx.fill();
}

// Moth with wings
function drawMoth(ctx, main, accent, detail, pet) {
  // Wings (behind body)
  ctx.fillStyle = accent;
  ctx.globalAlpha = 0.8;
  
  // Upper wings
  ctx.beginPath();
  ctx.ellipse(-18, -5, 15, 8, -0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(18, -5, 15, 8, 0.5, 0, Math.PI * 2);
  ctx.fill();
  
  // Lower wings
  ctx.beginPath();
  ctx.ellipse(-14, 5, 12, 6, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(14, 5, 12, 6, 0.3, 0, Math.PI * 2);
  ctx.fill();
  
  // Wing patterns
  ctx.fillStyle = detail;
  ctx.beginPath();
  ctx.arc(-18, -5, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(18, -5, 4, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.globalAlpha = 1;
  
  // Body (fuzzy)
  ctx.fillStyle = main;
  ctx.beginPath();
  ctx.ellipse(0, 2, 8, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Head
  ctx.beginPath();
  ctx.arc(0, -8, 6, 0, Math.PI * 2);
  ctx.fill();
  
  // Antennae
  ctx.strokeStyle = detail;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-3, -12);
  ctx.quadraticCurveTo(-5, -18, -8, -20);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(3, -12);
  ctx.quadraticCurveTo(5, -18, 8, -20);
  ctx.stroke();
  
  // Antenna tips
  ctx.fillStyle = detail;
  ctx.beginPath();
  ctx.arc(-8, -20, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(8, -20, 2, 0, Math.PI * 2);
  ctx.fill();
  
  // Large eyes
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(-3, -8, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(3, -8, 3, 0, Math.PI * 2);
  ctx.fill();
  
  // Eye shine
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(-2, -9, 1, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(4, -9, 1, 0, Math.PI * 2);
  ctx.fill();
}

// Default creature (improved from blob)
function drawDefaultCreature(ctx, main, accent, detail, pet) {
  // Body with texture
  ctx.fillStyle = main;
  ctx.beginPath();
  ctx.ellipse(0, 8, 18, 22, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Add some body texture
  ctx.fillStyle = accent;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.arc(
      Math.cos(i * 1.2) * 10,
      8 + Math.sin(i * 1.2) * 12,
      3,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }
  
  // Head with character
  ctx.fillStyle = main;
  ctx.beginPath();
  ctx.ellipse(0, -8, 14, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Add some personality
  if (pet.pattern === 'stripes') {
    ctx.strokeStyle = detail;
    ctx.lineWidth = 2;
    for (let i = -10; i <= 10; i += 5) {
      ctx.beginPath();
      ctx.moveTo(i, -20);
      ctx.lineTo(i, 20);
      ctx.stroke();
    }
  } else if (pet.pattern === 'spots') {
    ctx.fillStyle = detail;
    for (let i = 0; i < 8; i++) {
      ctx.beginPath();
      ctx.arc(
        Math.cos(i * 0.8) * 12,
        Math.sin(i * 0.8) * 15,
        2,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  }
  
  // Eyes with expression
  drawEyes(ctx, pet.eyes, -5, -8, 5, -8);
  
  // Mouth with personality
  drawMouth(ctx, pet.mouth, 0, -2);
}

// Helper function to draw various eye types
function drawEyes(ctx, eyeType, x1, y1, x2, y2) {
  ctx.fillStyle = '#000';
  
  switch(eyeType) {
    case 'sleepy':
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x1, y1, 3, 0, Math.PI);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x2, y2, 3, 0, Math.PI);
      ctx.stroke();
      break;
      
    case 'sparkle':
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(x1, y1, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x2, y2, 4, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(x1, y1, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x2, y2, 2, 0, Math.PI * 2);
      ctx.fill();
      
      // Add sparkles
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(x1 - 1, y1 - 1, 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x2 - 1, y2 - 1, 0.5, 0, Math.PI * 2);
      ctx.fill();
      break;
      
    case 'one-eye':
      ctx.beginPath();
      ctx.arc((x1 + x2) / 2, (y1 + y2) / 2, 5, 0, Math.PI * 2);
      ctx.fill();
      break;
      
    case 'almond':
      ctx.beginPath();
      ctx.ellipse(x1, y1, 2, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(x2, y2, 2, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
      
    default: // round
      ctx.beginPath();
      ctx.arc(x1, y1, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x2, y2, 3, 0, Math.PI * 2);
      ctx.fill();
  }
  
  // Add pupils for most eye types
  if (eyeType !== 'sleepy' && eyeType !== 'one-eye') {
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(x1 + 1, y1 - 1, 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x2 + 1, y2 - 1, 1, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Helper function to draw mouth expressions
function drawMouth(ctx, mouthType, x, y) {
  ctx.strokeStyle = '#000';
  ctx.fillStyle = '#000';
  ctx.lineWidth = 1;
  
  switch(mouthType) {
    case 'smile':
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI);
      ctx.stroke();
      break;
      
    case 'open':
      ctx.fillStyle = '#ff6666';
      ctx.beginPath();
      ctx.arc(x, y + 2, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#000';
      ctx.stroke();
      break;
      
    case 'grin':
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI);
      ctx.stroke();
      // Add teeth
      ctx.fillStyle = '#fff';
      ctx.fillRect(x - 4, y, 2, 2);
      ctx.fillRect(x - 1, y, 2, 2);
      ctx.fillRect(x + 2, y, 2, 2);
      break;
      
    case 'pout':
      ctx.beginPath();
      ctx.arc(x, y + 4, 4, Math.PI, 0);
      ctx.stroke();
      break;
      
    case 'tongue':
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI);
      ctx.stroke();
      // Draw tongue
      ctx.fillStyle = '#ff6666';
      ctx.beginPath();
      ctx.ellipse(x, y + 3, 2, 4, 0, 0, Math.PI);
      ctx.fill();
      break;
      
    default:
      ctx.beginPath();
      ctx.moveTo(x - 3, y + 2);
      ctx.lineTo(x + 3, y + 2);
      ctx.stroke();
  }
}

// Add special effects for rare pets
function addLegendaryGlow(ctx, w, h) {
  ctx.shadowColor = '#FFD700';
  ctx.shadowBlur = 15;
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 2;
  ctx.strokeRect(2, 2, w - 4, h - 4);
  ctx.shadowBlur = 0;
}

function addEpicSparkles(ctx, w, h) {
  ctx.fillStyle = '#fff';
  ctx.shadowColor = '#fff';
  ctx.shadowBlur = 3;
  for (let i = 0; i < 8; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    ctx.beginPath();
    ctx.arc(x, y, 1, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.shadowBlur = 0;
}

function addRareShimmer(ctx, w, h) {
  const gradient = ctx.createLinearGradient(0, 0, w, h);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
  gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);
}

function getRarityColor(rarity) {
  switch(rarity) {
    case 'legendary': return '#FFD700';
    case 'epic': return '#9B30FF';
    case 'rare': return '#0099FF';
    default: return '#00FF99';
  }
}

export default renderImprovedPet;