// Deterministic trait generator for VirtualPetterz
import { generatePet } from '../generators/petGenerator'

function hashString(str) {
  let h = 2166136261 >>> 0
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function pickWeighted(r, table) {
  // table: [{ key, w }]
  const total = table.reduce((s, t) => s + t.w, 0)
  let x = r() * total
  for (const t of table) {
    if (x < t.w) return t.key
    x -= t.w
  }
  return table[table.length - 1].key
}

// Enhanced version using the advanced pet generator
export function generateEnhancedTraitsFromPubkey(pubkey) {
  return generatePet(pubkey)
}

export function generateTraitsFromPubkey(pubkey) {
  const seed = hashString(pubkey || 'guest')
  const rand = mulberry32(seed)

  const species = pickWeighted(rand, [
    { key: 'fox', w: 30 },
    { key: 'bunny', w: 25 },
    { key: 'cat', w: 25 },
    { key: 'duck', w: 10 },
    { key: 'wolf', w: 7 },
    { key: 'robo', w: 2 },
    { key: 'dragon', w: 1 },
  ])

  const palette = pickWeighted(rand, [
    { key: 'neon', w: 60 },
    { key: 'pastel', w: 25 },
    { key: 'dusk', w: 10 },
    { key: 'holo', w: 5 },
  ])

  const markings = pickWeighted(rand, [
    { key: 'none', w: 50 },
    { key: 'stripe', w: 20 },
    { key: 'spots', w: 15 },
    { key: 'mask', w: 10 },
    { key: 'circuit', w: species === 'robo' ? 5 : 1 },
  ])

  const ears = pickWeighted(rand, [
    { key: 'short', w: 35 },
    { key: 'tall', w: 30 },
    { key: 'floppy', w: 20 },
    { key: 'horns', w: species === 'dragon' ? 10 : 5 },
  ])

  const eyes = pickWeighted(rand, [
    { key: 'dot', w: 40 },
    { key: 'big', w: 30 },
    { key: 'sleepy', w: 15 },
    { key: 'visor', w: species === 'robo' ? 15 : 5 },
    { key: 'glow', w: 5 },
  ])

  const tail = pickWeighted(rand, [
    { key: 'none', w: 20 },
    { key: 'fluffy', w: 50 },
    { key: 'ringed', w: species === 'fox' ? 20 : 5 },
    { key: 'wisp', w: 10 },
  ])

  const aura = pickWeighted(rand, [
    { key: 'none', w: 70 },
    { key: 'neon-green', w: 20 },
    { key: 'neon-pink', w: 8 },
    { key: 'prismatic', w: 2 },
  ])

  const element = pickWeighted(rand, [
    { key: 'neutral', w: 40 },
    { key: 'fire', w: 12 },
    { key: 'water', w: 12 },
    { key: 'electric', w: 12 },
    { key: 'earth', w: 12 },
    { key: 'shadow', w: 12 },
  ])

  // Calculate rarity based on trait combinations
  const calculateRarity = () => {
    let rarityScore = 0
    
    // Species rarity contribution
    if (['dragon', 'robo'].includes(species)) rarityScore += 40
    else if (['wolf', 'duck'].includes(species)) rarityScore += 20
    else rarityScore += 5
    
    // Aura rarity contribution
    if (aura === 'prismatic') rarityScore += 30
    else if (aura.includes('neon')) rarityScore += 15
    else if (aura !== 'none') rarityScore += 5
    
    // Eyes rarity contribution
    if (eyes === 'glow') rarityScore += 15
    else if (eyes === 'visor') rarityScore += 10
    else if (eyes === 'big') rarityScore += 5
    
    // Palette rarity contribution
    if (palette === 'holo') rarityScore += 15
    else if (palette === 'dusk') rarityScore += 8
    else if (palette === 'pastel') rarityScore += 3
    
    // Special markings
    if (markings === 'circuit') rarityScore += 10
    else if (markings !== 'none') rarityScore += 3
    
    // Determine rarity tier
    if (rarityScore >= 60) return 'legendary'
    else if (rarityScore >= 35) return 'epic'
    else if (rarityScore >= 18) return 'rare'
    else return 'common'
  }

  const rarity = calculateRarity()

  return {
    ver: '1',
    wallet: pubkey || null,
    species,
    palette,
    markings,
    ears,
    eyes,
    tail,
    aura,
    accessories: [],
    held: null,
    element,
    rarity,
  }
}