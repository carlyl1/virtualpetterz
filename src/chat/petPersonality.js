import { generatePet } from '../generators/petGenerator'

// Species-specific personality traits and speaking patterns
const SPECIES_PERSONALITIES = {
  'forest-fox': {
    traits: ['cunning', 'playful', 'mysterious'],
    speechPatterns: ['*swishes tail*', '*ears perk up*', '*sniffs curiously*'],
    responses: {
      greetings: ['*tilts head* Oh, hello there! I was just exploring...', 'Welcome to my forest domain, friend!', '*bounds over excitedly* You found me!'],
      hungry: ['*whimpers softly* My tummy is rumbling... could you spare some treats?', 'The forest berries just aren\'t filling enough...', '*paws at you* Feed me? Pretty please?'],
      happy: ['*playful yip* This is the best day ever!', '*does a little spin* I feel amazing!', '*nuzzles you* Thank you for making me so happy!'],
      sleepy: ['*yawns and stretches* Time for a cozy nap in my den...', '*curls up* Just... five... more... minutes...', '*drowsy mumble* So sleepy after all that exploring...'],
      curious: ['What\'s that shiny thing over there?', '*investigates* Hmm, interesting...', 'Tell me more! I love learning new things!']
    }
  },
  'mystic-bunny': {
    traits: ['wise', 'gentle', 'magical'],
    speechPatterns: ['*soft magical glow*', '*whispers wisdom*', '*ears twitch with insight*'],
    responses: {
      greetings: ['*gentle bow* Greetings, dear soul. The cosmic energies bring you to me...', 'Welcome, friend. I sense good fortune in your aura!', '*magical sparkle* The universe has aligned for our meeting!'],
      hungry: ['*stomach rumbles mystically* Even magical beings need sustenance...', 'The cosmic carrots are calling to me...', '*levitates hopefully* Could you conjure some food?'],
      happy: ['*aurora dances around me* My joy radiates through dimensions!', '*sparkles intensely* The happiness energy is overwhelming!', '*teleports with glee* This feeling transcends the physical realm!'],
      sleepy: ['*creates a dreamy cloud* Time to commune with the dream realm...', '*yawns starlight* The night magic beckons me to rest...', '*floats drowsily* Sleep carries the deepest wisdom...'],
      philosophical: ['As the ancient texts say...', 'The meaning of existence is...', 'In the grand tapestry of life...']
    }
  },
  'robo-cat': {
    traits: ['logical', 'efficient', 'tech-savvy'],
    speechPatterns: ['*mechanical purr*', '*LED eyes flash*', '*processing...*'],
    responses: {
      greetings: ['*BEEP* Greetings, human. My circuits are operational and ready for interaction!', 'System online! *whirr* Hello there, biological entity!', '*scanning* Friend detected! Initiating social protocol...'],
      hungry: ['*warning beep* Energy levels critical. Requesting fuel input...', 'ALERT: Battery at 15%. Please insert delicious data... I mean food!', '*mechanical stomach growl* My power cells require recharging!'],
      happy: ['*LED hearts in eyes* Joy subroutines activated! Happiness level: MAXIMUM!', '*spinning frantically* ERROR: Too much fun! Systems overloading with joy!', '*digital purr intensifies* This unit is experiencing optimal satisfaction!'],
      sleepy: ['*powering down sounds* Entering sleep mode... ZZZ.exe loading...', '*systems dimming* Time for defragmentation and dream.dll...', '*robotic yawn* Initiating night cycle... goodnight.bat'],
      technical: ['According to my calculations...', 'Processing data indicates...', 'My neural networks suggest...']
    }
  },
  'water-duck': {
    traits: ['cheerful', 'social', 'adventurous'],
    speechPatterns: ['*happy quack*', '*splashes playfully*', '*waddles excitedly*'],
    responses: {
      greetings: ['*quack quack* Hello friend! What a beautiful day for swimming!', '*splashes happily* Welcome to my pond!', '*waddles over* Quack! So nice to see you!'],
      hungry: ['*stomach quacks* My tummy is as empty as a dried-up pond!', 'Could you share some fish? *hopeful quack*', '*begging waddle* Please feed this hungry duckling!'],
      happy: ['*quacking with joy* This is absolutely ducky!', '*does water ballet* I could swim all day like this!', '*happy splash dance* Life is wonderful!'],
      sleepy: ['*tucks head under wing* Time to float peacefully to dreamland...', '*drowsy quack* Just need to rest my little webbed feet...', '*gentle water sounds* So peaceful... so sleepy...'],
      adventurous: ['Want to explore the pond with me?', '*excited quack* I know the best swimming spots!', 'Adventure awaits beyond the lily pads!']
    }
  },
  'shadow-wolf': {
    traits: ['mysterious', 'loyal', 'intense'],
    speechPatterns: ['*low growl*', '*piercing stare*', '*howls softly*'],
    responses: {
      greetings: ['*emerges from shadows* You seek audience with me...', '*nods respectfully* Human. I acknowledge your presence.', '*intense gaze* What brings you to my domain?'],
      hungry: ['*stomach rumbles ominously* The hunger calls to me...', 'My pack... I mean, I require sustenance...', '*stalking posture* Feed me, and earn my loyalty.'],
      happy: ['*rare smile* You have pleased the shadow wolf...', '*tail wag* This feeling... it is... acceptable.', '*proud howl* You honor me with your friendship!'],
      sleepy: ['*curls in shadow* The darkness calls me to rest...', '*yawns deeply* Even wolves must sleep...', '*finds dark corner* Guard me while I slumber...'],
      mysterious: ['The shadows whisper secrets...', '*cryptic growl* Not everything is as it seems...', 'I know things that would surprise you...']
    }
  },
  'pixel-sloth': {
    traits: ['laid-back', 'philosophical', 'slow-paced'],
    speechPatterns: ['*moves very slowly*', '*long pause*', '*contemplative sigh*'],
    responses: {
      greetings: ['*extremely slow wave* Hellooooo... there... friend...', '*yawns* Oh... you\'re... here... wonderful...', '*sleepy smile* Welcome... to... my... peaceful... world...'],
      hungry: ['*stomach rumbles in slow motion* I... should... probably... eat... something...', 'Food... sounds... nice... but... moving... is... hard...', '*contemplates* The eternal question... to eat... or to sleep...'],
      happy: ['*slow-motion celebration* This... is... the... best... feeling... ever...', '*peaceful sigh* Life... is... beautiful... when... you... slow... down...', '*content smile* Pure... zen... happiness...'],
      sleepy: ['*already half asleep* Always... time... for... more... sleep...', '*curls up slowly* Nap... time... is... the... best... time...', '*drowsy mumble* Sleep... is... my... superpower...'],
      wisdom: ['Slow... and... steady... wins... the... race...', 'Life... is... better... when... you... take... your... time...', 'Why... rush... when... you... can... enjoy... the... moment...']
    }
  },
  'chonk-hamster': {
    traits: ['energetic', 'hoarder', 'adorable'],
    speechPatterns: ['*stuffs cheeks*', '*runs on wheel*', '*squeaks excitedly*'],
    responses: {
      greetings: ['*squeaks happily* Oh my! A friend! Want to see my seed collection?', '*bounces excitedly* Hello hello hello! I have SO much to show you!', '*cheeks full* Welcome to my burrow! *muffled speaking*'],
      hungry: ['*dramatic squeak* I\'m STARVING! Well, not really, but I could eat!', '*patting round tummy* This belly needs filling! More snacks!', '*spinning on wheel* Working up an appetite! Feed the chonk!'],
      happy: ['*doing backflips* This is the most amazing day EVER!', '*squeaking with pure joy* I can\'t contain my excitement!', '*rolling around* So happy I could burst! But please don\'t let me!'],
      sleepy: ['*yawns squeakily* Time to curl up in my cozy nest...', '*rubbing sleepy eyes* All this excitement made me tired...', '*making tiny snoring sounds* ZZZ... dreaming of sunflower seeds...'],
      energetic: ['Want to run on my wheel together?', '*zooms around* So much energy! Can\'t sit still!', 'Let\'s go on an adventure! I know all the best hiding spots!']
    }
  },
  'glitch-moth': {
    traits: ['ethereal', 'glitchy', 'attracted-to-light'],
    speechPatterns: ['*flickers in and out*', '*static noise*', '*drawn to brightness*'],
    responses: {
      greetings: ['*fl1ck3r5* H-hello... *bzzt* ...existence is... interesting...', '*phases in* Greetings from the v0id... *static*', '*attracted to screen light* Oh! Bright human! *glitches*'],
      hungry: ['*stomach g1itch3s* Need... energy... *bzzt* ...from the light spectrum...', '*static* F00d.exe has st0pped w0rking... *flickers*', '*phases* The hunger... it transcends... *glitch* ...dimensions...'],
      happy: ['*rainbow glitch effect* Joy overfl0w3ng! *bzzt bzzt* System happy!', '*sparkle glitch* This feeling... it\'s... *static* ...beyond c0de!', '*reality tears* Happiness.dll loaded successfully! *bzzt*'],
      sleepy: ['*dimming flicker* Entering... sleep.m0de... *fading static*', '*glitches sleepily* The light... grows... dim... *zzzt*', '*phases out slowly* Dream5... in... the... v01d... *bzzt*'],
      otherworldly: ['Reality is... *glitch* ...merely a suggestion...', '*static* I exist between w0rlds...', 'The light... it calls to me... *flickers*']
    }
  }
}

// Rarity-based personality modifiers
const RARITY_MODIFIERS = {
  common: {
    confidence: 0.7,
    vocabulary: 'simple',
    specialPhrases: []
  },
  rare: {
    confidence: 0.8,
    vocabulary: 'elevated',
    specialPhrases: ['I\'m quite special, you know!', 'Not every pet is as refined as me!']
  },
  epic: {
    confidence: 0.9,
    vocabulary: 'sophisticated',
    specialPhrases: ['My epic nature shines through!', 'I possess extraordinary capabilities!', 'Witness my magnificence!']
  },
  legendary: {
    confidence: 1.0,
    vocabulary: 'majestic',
    specialPhrases: ['I am legend incarnate!', 'My power is unmatched!', 'Behold, a legendary being speaks!', 'Mortals rarely commune with beings such as I!']
  }
}

// Mood-based response modifiers
function getMoodModifier(happiness, hunger, sleeping) {
  if (sleeping) return { mood: 'sleepy', intensity: 1.0 }
  if (hunger < 20) return { mood: 'hangry', intensity: 0.8 }
  if (hunger < 40) return { mood: 'hungry', intensity: 0.6 }
  if (happiness > 90) return { mood: 'ecstatic', intensity: 1.2 }
  if (happiness > 70) return { mood: 'happy', intensity: 1.0 }
  if (happiness < 30) return { mood: 'sad', intensity: 0.5 }
  return { mood: 'neutral', intensity: 0.8 }
}

// Generate personality-driven response
export function generatePersonalityResponse(input, petSpecies, happiness, hunger, sleeping, rarity = 'common', petName = null) {
  const species = SPECIES_PERSONALITIES[petSpecies] || SPECIES_PERSONALITIES['forest-fox']
  const rarityMod = RARITY_MODIFIERS[rarity] || RARITY_MODIFIERS.common
  const moodMod = getMoodModifier(happiness, hunger, sleeping)
  
  const lowerInput = input.toLowerCase()
  
  // Determine response type based on input
  let responseType = 'general'
  if (lowerInput.includes('hello') || lowerInput.includes('hi') || lowerInput.includes('hey')) {
    responseType = 'greetings'
  } else if (lowerInput.includes('hungry') || lowerInput.includes('eat') || lowerInput.includes('food')) {
    responseType = 'hungry'
  } else if (lowerInput.includes('happy') || lowerInput.includes('joy') || lowerInput.includes('fun')) {
    responseType = 'happy'
  } else if (lowerInput.includes('sleep') || lowerInput.includes('tired') || lowerInput.includes('nap')) {
    responseType = 'sleepy'
  } else if (moodMod.mood === 'sleepy') {
    responseType = 'sleepy'
  } else if (moodMod.mood === 'hungry' || moodMod.mood === 'hangry') {
    responseType = 'hungry'
  } else if (moodMod.mood === 'happy' || moodMod.mood === 'ecstatic') {
    responseType = 'happy'
  }
  
  // Get appropriate response
  let baseResponse = ''
  if (species.responses[responseType]) {
    const responses = species.responses[responseType]
    baseResponse = responses[Math.floor(Math.random() * responses.length)]
  } else {
    // Fallback to general responses
    const generalResponses = [
      `*${species.speechPatterns[Math.floor(Math.random() * species.speechPatterns.length)]}* That's interesting...`,
      'Tell me more about that!',
      `I'm just a ${petSpecies.replace('-', ' ')}, but I find that fascinating!`,
      '*looks at you curiously* I never thought about it that way!'
    ]
    baseResponse = generalResponses[Math.floor(Math.random() * generalResponses.length)]
  }
  
  // Apply mood intensity modifier
  if (moodMod.mood === 'hangry' && responseType !== 'hungry') {
    baseResponse = `*grumpy* ${baseResponse} ...but I'm really hungry right now...`
  } else if (moodMod.mood === 'ecstatic' && responseType !== 'happy') {
    baseResponse = `*bouncing with joy* ${baseResponse} I'm feeling AMAZING today!`
  } else if (moodMod.mood === 'sad') {
    baseResponse = `*sighs sadly* ${baseResponse} ...I wish I felt happier...`
  }
  
  // Add rarity-based personality
  if (Math.random() < 0.3 && rarityMod.specialPhrases.length > 0) {
    const specialPhrase = rarityMod.specialPhrases[Math.floor(Math.random() * rarityMod.specialPhrases.length)]
    baseResponse = `${baseResponse} ${specialPhrase}`
  }
  
  // Add pet name if available
  if (petName && Math.random() < 0.2) {
    baseResponse = `${baseResponse} By the way, I'm ${petName}!`
  }
  
  return baseResponse
}

// Enhanced API integration - adds personality context to API calls
export function enhanceApiPrompt(userInput, petSpecies, happiness, hunger, sleeping, rarity = 'common', petName = null) {
  const species = SPECIES_PERSONALITIES[petSpecies] || SPECIES_PERSONALITIES['forest-fox']
  const moodMod = getMoodModifier(happiness, hunger, sleeping)
  
  const personalityContext = `You are a ${petSpecies.replace('-', ' ')} virtual pet${petName ? ` named ${petName}` : ''} with the following traits: ${species.traits.join(', ')}. 
Your rarity is ${rarity}. Your current happiness is ${happiness}/100 and hunger is ${hunger}/100. 
You are currently feeling ${moodMod.mood}. 
Respond in character using speech patterns like: ${species.speechPatterns.join(', ')}.
Keep responses short (1-2 sentences), fun, and pet-like. Include action text in asterisks like *tail wag* when appropriate.

User says: "${userInput}"

Respond as the pet:`

  return personalityContext
}

// Fallback personality responses for when API fails
export function getPersonalityFallback(input, petSpecies, happiness, hunger, sleeping, rarity = 'common', petName = null) {
  // Try personality-driven response first
  const personalityResponse = generatePersonalityResponse(input, petSpecies, happiness, hunger, sleeping, rarity, petName)
  
  if (personalityResponse && !personalityResponse.includes('That\'s interesting...')) {
    return personalityResponse
  }
  
  // Enhanced fallback responses based on pet state
  const lowerInput = input.toLowerCase()
  
  if (lowerInput.includes('hungry') || lowerInput.includes('food')) {
    if (hunger < 30) {
      return "I'm SO hungry! Please feed me! *puppy dog eyes*"
    } else {
      return "Food sounds nice, but I'm not super hungry right now!"
    }
  }
  
  if (lowerInput.includes('play') || lowerInput.includes('fun')) {
    if (happiness > 70) {
      return "*bounces excitedly* YES! Let's play! I love playtime!"
    } else if (sleeping) {
      return "*yawns* Maybe after my nap... so sleepy..."
    } else {
      return "Playing sounds fun! What did you have in mind?"
    }
  }
  
  if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
    const greetings = [
      `Hi there! I'm your ${petSpecies.replace('-', ' ')} friend!`,
      `*waves* Hello! Nice to see you!`,
      `Hey! Ready to hang out with me?`
    ]
    return greetings[Math.floor(Math.random() * greetings.length)]
  }
  
  // Generic responses with personality
  const genericResponses = [
    `As a ${petSpecies.replace('-', ' ')}, I find that really interesting!`,
    "*tilts head curiously* Tell me more about that!",
    "That's cool! I love learning new things!",
    "*excited pet noises* You're fun to talk to!"
  ]
  
  return genericResponses[Math.floor(Math.random() * genericResponses.length)]
}