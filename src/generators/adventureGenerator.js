// Advanced Procedural Adventure Generator with Massive Variety
// Uses weighted random selection and complex narrative structures

// Core story elements with weights
const BIOMES = {
  high: [
    { name: 'Quantum Pixel Forest', mood: 'mystical', danger: 2 },
    { name: 'Cyberpunk Data Streets', mood: 'tech', danger: 4 },
    { name: 'Floating Crystal Gardens', mood: 'peaceful', danger: 1 }
  ],
  medium: [
    { name: 'Neon Mushroom Grove', mood: 'whimsical', danger: 2 },
    { name: 'Binary Beach', mood: 'relaxing', danger: 1 },
    { name: 'Holographic Desert', mood: 'mysterious', danger: 3 },
    { name: 'Retro Arcade Ruins', mood: 'nostalgic', danger: 2 },
    { name: 'Digital Coral Reef', mood: 'vibrant', danger: 2 }
  ],
  common: [
    { name: 'Meme Valley', mood: 'funny', danger: 1 },
    { name: 'Pixel Meadows', mood: 'peaceful', danger: 1 },
    { name: 'Code Mountains', mood: 'adventurous', danger: 3 },
    { name: 'NFT Marketplace', mood: 'chaotic', danger: 4 },
    { name: 'Blockchain Bridge', mood: 'mysterious', danger: 3 }
  ]
}

const OBJECTIVES = {
  treasure: [
    'locate the legendary ${rarity} ${item}',
    'uncover the hidden vault of ${entity}',
    'retrieve the stolen ${item} from ${villain}',
    'discover the source of the mysterious ${phenomenon}'
  ],
  rescue: [
    'rescue the ${adjective} ${creature} from ${location}',
    'help ${npc} escape from ${predicament}',
    'save the ${group} from ${disaster}',
    'free the trapped ${entity} in ${prison}'
  ],
  mystery: [
    'investigate the strange ${phenomenon} in ${subLocation}',
    'solve the puzzle of the ${mystery}',
    'uncover why ${event} keeps happening',
    'decode the ${cipher} left by ${entity}'
  ],
  social: [
    'mediate the conflict between ${faction1} and ${faction2}',
    'organize a ${event} for the local ${community}',
    'convince ${npc} to ${action}',
    'unite the scattered ${group} under one cause'
  ]
}

const COMPLICATIONS = {
  environmental: [
    'a ${severity} ${weather} storm blocks the path',
    'the ${terrain} becomes unstable and ${effect}',
    '${phenomenon} distorts reality in the area',
    'a ${barrier} appears out of nowhere'
  ],
  social: [
    '${rival} challenges your pet to a ${competition}',
    'local ${authority} demands ${requirement} to proceed',
    '${ally} needs help with ${problem} first',
    'a ${crowd} blocks the way, arguing about ${topic}'
  ],
  technical: [
    'a ${glitchType} corrupts the local network',
    'the ${system} malfunctions and ${consequence}',
    '${virus} infects the area\'s infrastructure',
    'quantum interference scrambles ${affected}'
  ],
  combat: [
    '${enemy} guards the ${objective} fiercely',
    'a pack of wild ${creatures} attacks suddenly',
    '${boss} emerges from ${hideout} to stop you',
    '${trap} activates when your pet approaches'
  ]
}

const REWARDS = {
  items: [
    { name: '${material} ${accessory}', rarity: 'common', value: 10 },
    { name: '${enchanted} ${tool}', rarity: 'uncommon', value: 25 },
    { name: '${legendary} ${artifact}', rarity: 'rare', value: 50 },
    { name: '${cosmic} ${relic}', rarity: 'epic', value: 100 }
  ],
  currency: [
    { name: '${amount} Pixel Coins', min: 5, max: 20 },
    { name: '${amount} Memory Fragments', min: 2, max: 8 },
    { name: '${amount} Quantum Bits', min: 1, max: 4 }
  ],
  abilities: [
    'temporary ${ability} boost',
    'new ${skill} technique',
    '${element} resistance',
    '${stat} enhancement'
  ],
  social: [
    'friendship with ${npc}',
    'reputation boost with ${faction}',
    'access to ${location}',
    'knowledge of ${secret}'
  ]
}

// Dynamic content pools
const ADJECTIVES = ['ancient', 'glowing', 'mysterious', 'corrupted', 'crystalline', 'ethereal', 'shadowy', 'brilliant', 'forgotten', 'pulsing']
const MATERIALS = ['Quantum', 'Plasma', 'Crystal', 'Nano', 'Void', 'Photon', 'Cyber', 'Bio', 'Astral', 'Prism']
const CREATURES = ['Data Sprites', 'Pixel Phoenixes', 'Code Golems', 'Memory Wisps', 'Binary Beasts', 'Holographic Hunters', 'Quantum Cats', 'Digital Dragons']
const PHENOMENA = ['reality glitches', 'time loops', 'gravity anomalies', 'color inversions', 'sound cascades', 'light fractals', 'space warps', 'data streams']

// Advanced randomization with context
function createSeededRandom(seed) {
  let m = 0x80000000
  let a = 1103515245
  let c = 12345
  let state = seed || Math.floor(Math.random() * m)
  
  return function() {
    state = (a * state + c) % m
    return state / (m - 1)
  }
}

function weightedPick(items, weights, rnd = Math.random) {
  const total = weights.reduce((sum, w) => sum + w, 0)
  let random = rnd() * total
  
  for (let i = 0; i < items.length; i++) {
    random -= weights[i]
    if (random <= 0) return items[i]
  }
  return items[items.length - 1]
}

function pickFromCategory(category, rnd = Math.random) {
  const keys = Object.keys(category)
  const rarityWeights = { high: 1, medium: 3, common: 6 }
  
  // Pick rarity first
  const rarities = keys.filter(k => category[k])
  const weights = rarities.map(r => rarityWeights[r] || 1)
  const selectedRarity = weightedPick(rarities, weights, rnd)
  
  // Then pick from that rarity
  return category[selectedRarity][Math.floor(rnd() * category[selectedRarity].length)]
}

function pickRandom(arr, rnd = Math.random) {
  return arr[Math.floor(rnd() * arr.length)]
}

function generateContextualContent(context, rnd = Math.random) {
  const substitutions = {
    // Base elements
    rarity: () => pickRandom(['ancient', 'legendary', 'forgotten', 'cursed', 'blessed'], rnd),
    item: () => `${pickRandom(MATERIALS, rnd)} ${pickRandom(['Sword', 'Shield', 'Orb', 'Crown', 'Gem', 'Staff'], rnd)}`,
    entity: () => pickRandom(['the Code Master', 'the Pixel Oracle', 'the Data Guardian', 'the Memory Keeper'], rnd),
    villain: () => `${pickRandom(['Shadow', 'Glitch', 'Virus', 'Corrupt'], rnd)} ${pickRandom(['Lord', 'Queen', 'Beast', 'Wraith'], rnd)}`,
    phenomenon: () => pickRandom(PHENOMENA, rnd),
    adjective: () => pickRandom(ADJECTIVES, rnd),
    creature: () => pickRandom(CREATURES, rnd),
    material: () => pickRandom(MATERIALS, rnd),
    
    // Locations and structures
    location: () => pickRandom(['the Quantum Archive', 'the Digital Nexus', 'the Memory Palace', 'the Code Sanctum', 'the Pixel Citadel'], rnd),
    subLocation: () => pickRandom(['the crystal caverns', 'the data streams', 'the abandoned servers', 'the glitched zones'], rnd),
    structure: () => pickRandom(['quantum beacon', 'data relay station', 'memory vault', 'processing core', 'harmony bridge'], rnd),
    prison: () => pickRandom(['energy cage', 'data loop', 'memory fragments', 'corrupted file', 'glitch maze'], rnd),
    
    // Characters and groups
    npc: () => pickRandom(['the Pixel Sage', 'Data Merchant Lin', 'Guardian Zyx', 'the Memory Child'], rnd),
    group: () => pickRandom(['Lost Sprites', 'Data Refugees', 'Code Fragments', 'Memory Echoes'], rnd),
    community: () => pickRandom(['Pixel Village', 'Data Colony', 'Memory Settlement', 'Code Outpost'], rnd),
    faction1: () => pickRandom(['the Order of Clean Code', 'the Memory Keepers', 'the Pixel Purists'], rnd),
    faction2: () => pickRandom(['the Chaos Coders', 'the Data Miners', 'the Glitch Artists'], rnd),
    authority: () => pickRandom(['System Admin', 'Data Guardian', 'Code Enforcer', 'Memory Warden'], rnd),
    ally: () => pickRandom(['friendly AI', 'helpful sprite', 'wise oracle', 'loyal companion'], rnd),
    rival: () => pickRandom(['competing pet', 'rival trainer', 'jealous sprite', 'challenge seeker'], rnd),
    crowd: () => pickRandom(['angry users', 'confused NPCs', 'protesting sprites', 'debating AIs'], rnd),
    
    // Events and problems  
    predicament: () => pickRandom(['a data loop', 'corrupted memory', 'system crash', 'infinite recursion'], rnd),
    disaster: () => pickRandom(['system meltdown', 'memory wipe', 'reality glitch', 'data corruption'], rnd),
    mystery: () => pickRandom(['vanishing code', 'temporal anomaly', 'memory gaps', 'phantom processes'], rnd),
    event: () => pickRandom(['random shutdowns', 'data duplications', 'time skips', 'reality shifts'], rnd),
    cipher: () => pickRandom(['encrypted message', 'binary poem', 'quantum equation', 'pixel pattern'], rnd),
    
    // Actions and requirements
    action: () => pickRandom(['share their data', 'reset their core', 'join the network', 'unlock memories'], rnd),
    requirement: () => pickRandom(['system authentication', 'data verification', 'memory scan', 'code review'], rnd),
    problem: () => pickRandom(['corrupted files', 'memory leak', 'infinite loop', 'network outage'], rnd),
    competition: () => pickRandom(['logic puzzle', 'speed test', 'memory challenge', 'creativity contest'], rnd),
    topic: () => pickRandom(['data rights', 'memory ownership', 'code ethics', 'AI consciousness'], rnd),
    
    // Technical elements
    glitchType: () => pickRandom(['visual', 'audio', 'temporal', 'spatial'], rnd),
    system: () => pickRandom(['navigation array', 'memory core', 'processing unit', 'quantum stabilizer'], rnd),
    consequence: () => pickRandom(['reverses gravity', 'scrambles time', 'inverts colors', 'loops space'], rnd),
    virus: () => pickRandom(['Corruption Worm', 'Memory Eater', 'Logic Bomb', 'Data Phantom'], rnd),
    affected: () => pickRandom(['pet abilities', 'user interface', 'environmental physics', 'communication'], rnd),
    
    // Combat and obstacles
    enemy: () => pickRandom(['Digital Sentinel', 'Code Wraith', 'Memory Phantom', 'System Virus'], rnd),
    creatures: () => pickRandom(['glitch bugs', 'error sprites', 'null entities', 'void fragments'], rnd),
    boss: () => pickRandom(['the Corrupted Admin', 'Memory Tyrant', 'Code Destroyer', 'System Overlord'], rnd),
    hideout: () => pickRandom(['the deleted folder', 'corrupted sector', 'hidden partition', 'backup storage'], rnd),
    trap: () => pickRandom(['logic bomb', 'memory maze', 'infinite loop', 'data snare'], rnd),
    objective: () => pickRandom(['sacred data', 'memory core', 'master key', 'source code'], rnd),
    
    // Environmental
    severity: () => pickRandom(['mild', 'severe', 'catastrophic'], rnd),
    weather: () => pickRandom(['data storm', 'pixel rain', 'quantum fog', 'electric surge'], rnd),
    terrain: () => pickRandom(['code structure', 'memory landscape', 'data foundation', 'quantum substrate'], rnd),
    effect: () => pickRandom(['shifts unpredictably', 'fragments into pieces', 'becomes transparent', 'starts floating'], rnd),
    barrier: () => pickRandom(['firewall', 'encryption shield', 'memory wall', 'quantum fence'], rnd),
    
    // Rewards and abilities
    ability: () => pickRandom(['Quantum Sight', 'Data Mining', 'Pixel Healing', 'Code Breaking', 'Reality Anchor', 'Memory Sync'], rnd),
    skill: () => pickRandom(['debugging', 'encryption', 'pattern matching', 'system analysis'], rnd),
    element: () => pickRandom(['fire', 'ice', 'electric', 'quantum'], rnd),
    stat: () => pickRandom(['speed', 'intelligence', 'creativity', 'resilience'], rnd),
    secret: () => pickRandom(['hidden pathways', 'ancient protocols', 'master passwords', 'system backdoors'], rnd),
    
    // Resources and achievements
    resource: () => pickRandom(['quantum energy', 'processing power', 'memory space', 'data bandwidth'], rnd),
    achievement: () => pickRandom(['Harmony Builder', 'Problem Solver', 'Unity Maker', 'Peace Bringer'], rnd),
    bonus: () => pickRandom(['experience', 'token', 'friendship', 'discovery'], rnd),
    
    // Additional contextual
    amount: () => Math.floor(rnd() * 50) + 5,
    partySize: () => Math.floor(rnd() * 4) + 2,
    scaling: () => pickRandom(['difficulty increases', 'rewards multiply', 'complexity grows', 'stakes rise'], rnd),
    decision: () => pickRandom(['strategy choice', 'resource allocation', 'risk assessment', 'priority setting'], rnd),
    
    // Missing item types
    accessory: () => pickRandom(['Amulet', 'Ring', 'Pendant', 'Bracelet', 'Headband', 'Cloak'], rnd),
    tool: () => pickRandom(['Scanner', 'Decoder', 'Analyzer', 'Modifier', 'Enhancer', 'Compiler'], rnd),
    artifact: () => pickRandom(['Codex', 'Matrix', 'Core', 'Fragment', 'Essence', 'Blueprint'], rnd),
    relic: () => pickRandom(['Archive', 'Manuscript', 'Tablet', 'Scroll', 'Crystal', 'Node'], rnd),
    enchanted: () => pickRandom(['Enhanced', 'Quantum', 'Neural', 'Digital', 'Cyber', 'Bio'], rnd),
    legendary: () => pickRandom(['Mythical', 'Ancient', 'Lost', 'Forbidden', 'Sacred', 'Ultimate'], rnd),
    cosmic: () => pickRandom(['Stellar', 'Galactic', 'Universal', 'Dimensional', 'Infinite', 'Eternal'], rnd),
    threat: () => pickRandom(['system malfunction', 'alien threat', 'quantum anomaly', 'cyber virus', 'time paradox', 'data corruption', 'reality glitch', 'memory wipe'], rnd)
  }
  
  return function(text) {
    return text.replace(/\$\{([^}]+)\}/g, (match, key) => {
      if (substitutions[key]) {
        return substitutions[key]()
      }
      return match
    })
  }
}

export function generateAdventure(seed = null) {
  const rnd = seed ? createSeededRandom(seed) : Math.random
  const substitute = generateContextualContent({}, rnd)
  
  // Pick core elements
  const biome = pickFromCategory(BIOMES, rnd)
  const objectiveType = pickRandom(Object.keys(OBJECTIVES), rnd)
  const objective = substitute(pickRandom(OBJECTIVES[objectiveType], rnd))
  
  const complicationType = pickRandom(Object.keys(COMPLICATIONS), rnd)
  const complication = substitute(pickRandom(COMPLICATIONS[complicationType], rnd))
  
  // Generate rewards based on difficulty
  const difficulty = biome.danger + (complicationType === 'combat' ? 2 : complicationType === 'technical' ? 1 : 0)
  const rewardCount = Math.min(3, Math.floor(difficulty / 2) + 1)
  const rewards = []
  
  for (let i = 0; i < rewardCount; i++) {
    const rewardType = pickRandom(Object.keys(REWARDS), rnd)
    if (rewardType === 'items') {
      const item = pickRandom(REWARDS.items, rnd)
      rewards.push(substitute(item.name))
    } else if (rewardType === 'currency') {
      const curr = pickRandom(REWARDS.currency, rnd)
      const amount = Math.floor(rnd() * (curr.max - curr.min + 1)) + curr.min
      rewards.push(substitute(curr.name.replace('${amount}', amount)))
    } else {
      rewards.push(substitute(pickRandom(REWARDS[rewardType], rnd)))
    }
  }
  
  // Construct narrative
  const intros = [
    '🌟 A new adventure awaits!',
    '🚀 The pixels are calling...',
    '⭐ Destiny unfolds in the digital realm!',
    '🎮 The simulation beckons your pet!',
    '✨ Reality shifts, revealing a quest...'
  ]
  
  const intro = pickRandom(intros, rnd)
  const moodEmoji = {
    mystical: '🔮', tech: '⚡', peaceful: '🌸', whimsical: '🎨',
    relaxing: '🏖️', mysterious: '🕵️', nostalgic: '🕰️', vibrant: '🌈',
    funny: '😄', adventurous: '⛰️', chaotic: '🌪️'
  }[biome.mood] || '🎯'
  
  const story = `${intro} ${moodEmoji}<br><br>` +
              `<strong>Location:</strong> ${biome.name}<br>` +
              `<strong>Objective:</strong> ${objective}<br>` +
              `<strong>Challenge:</strong> ${complication}<br>` +
              `<strong>Potential Rewards:</strong><br>` +
              rewards.map(r => `• ${r}`).join('<br>')
  
  return {
    story,
    biome,
    difficulty,
    rewards,
    type: objectiveType,
    complicationType
  }
}

// Group adventure system with party dynamics
export function generateGroupAdventure(partySize = 3, seed = null) {
  const rnd = seed ? createSeededRandom(seed) : Math.random
  const substitute = generateContextualContent({}, rnd)
  
  const groupObjectives = [
    'establish a ${structure} in ${location}',
    'defend the ${community} from ${threat}',
    'organize a massive ${event} across ${region}',
    'solve the ${mystery} that affects all of ${area}',
    'unite the warring ${faction1} and ${faction2}'
  ]
  
  const groupChallenges = [
    'coordination between ${partySize} different pet personalities',
    'managing resources for the entire group',
    'each pet must use their unique ${ability} to succeed',
    'the challenge scales with group size - ${scaling}',
    'leadership disputes arise over ${decision}'
  ]
  
  const partyRoles = ['Leader', 'Scout', 'Support', 'Specialist', 'Diplomat', 'Guardian']
  const abilities = ['Quantum Sight', 'Data Mining', 'Pixel Healing', 'Code Breaking', 'Reality Anchor', 'Memory Sync']
  
  // Generate party composition
  const party = []
  for (let i = 0; i < partySize; i++) {
    party.push({
      role: pickRandom(partyRoles, rnd),
      ability: pickRandom(abilities, rnd),
      personality: pickRandom(['Bold', 'Cautious', 'Creative', 'Analytical', 'Intuitive'], rnd)
    })
  }
  
  const biome = pickFromCategory(BIOMES, rnd)
  const objective = substitute(pickRandom(groupObjectives, rnd))
  const challenge = substitute(pickRandom(groupChallenges, rnd).replace('${partySize}', partySize))
  
  // Group-specific rewards
  const groupRewards = [
    'shared ${resource} pool for all members',
    'group ${ability} unlocked',
    'access to ${location} for entire party',
    'collective ${achievement} recognition',
    '${bonus} multiplier for group activities'
  ]
  
  const reward = substitute(pickRandom(groupRewards, rnd))
  
  const story = `🎪 <strong>Group Adventure Initiated!</strong><br><br>` +
              `<strong>Party Size:</strong> ${partySize} pets<br>` +
              `<strong>Location:</strong> ${biome.name}<br>` +
              `<strong>Mission:</strong> ${objective}<br>` +
              `<strong>Group Challenge:</strong> ${challenge}<br><br>` +
              `<strong>Party Composition:</strong><br>` +
              party.map((p, i) => `${i + 1}. ${p.personality} ${p.role} (${p.ability})`).join('<br>') +
              `<br><br><strong>Group Reward:</strong> ${reward}`
  
  return {
    story,
    partySize,
    party,
    biome,
    difficulty: biome.danger + partySize,
    reward,
    type: 'group'
  }
}

export default generateAdventure