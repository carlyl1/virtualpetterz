import React, { useState, useEffect } from 'react'
import progressionSystem from '../systems/PersistentProgression'

// Dynamic CYOA Story Generator
const STORY_THEMES = {
  fantasy: {
    settings: ['Enchanted Forest', 'Crystal Caverns', 'Sky Citadel', 'Ancient Ruins', 'Dragon Lair'],
    characters: ['wise wizard', 'forest guardian', 'crystal sage', 'ancient spirit', 'dragon lord'],
    items: ['magical amulet', 'enchanted sword', 'crystal of power', 'ancient tome', 'mystical staff'],
    threats: ['shadow creatures', 'cursed spirits', 'dark magic', 'ancient trap', 'malevolent entity']
  },
  scifi: {
    settings: ['Space Station Alpha', 'Quantum Laboratory', 'Alien Planet', 'Cybercity', 'Time Portal'],
    characters: ['AI consciousness', 'alien ambassador', 'quantum scientist', 'cyborg guardian', 'time traveler'],
    items: ['quantum device', 'alien artifact', 'neural implant', 'energy core', 'temporal key'],
    threats: ['system malfunction', 'alien threat', 'quantum anomaly', 'cyber virus', 'time paradox']
  },
  mystery: {
    settings: ['Abandoned Mansion', 'Foggy Harbor', 'Secret Library', 'Hidden Laboratory', 'Underground Tunnels'],
    characters: ['mysterious stranger', 'old librarian', 'detective partner', 'shadowy figure', 'witness'],
    items: ['cryptic letter', 'skeleton key', 'hidden diary', 'mysterious photograph', 'coded message'],
    threats: ['unknown stalker', 'deadly trap', 'poisonous gas', 'collapsing structure', 'hidden enemy']
  },
  adventure: {
    settings: ['Tropical Island', 'Mountain Peak', 'Desert Oasis', 'Jungle Temple', 'Pirate Ship'],
    characters: ['native guide', 'treasure hunter', 'ship captain', 'jungle explorer', 'desert nomad'],
    items: ['treasure map', 'climbing gear', 'compass', 'survival kit', 'ancient key'],
    threats: ['wild animals', 'treacherous terrain', 'rival explorers', 'natural disaster', 'booby trap']
  }
}

class CYOAGenerator {
  constructor() {
    this.storyState = {
      theme: null,
      currentChapter: 0,
      playerChoices: [],
      inventory: [],
      stats: { courage: 50, wisdom: 50, luck: 50 },
      relationships: new Map()
    }
  }

  pickRandom(array) {
    return array[Math.floor(Math.random() * array.length)]
  }

  generateOpeningChapter(theme, petName = 'Your Pet') {
    const themeData = STORY_THEMES[theme]
    const setting = this.pickRandom(themeData.settings)
    const character = this.pickRandom(themeData.characters)
    
    const openings = {
      fantasy: [
        `${petName} discovers a shimmering portal in the garden that leads to ${setting}. As you step through, a ${character} approaches with urgent news...`,
        `A mysterious letter arrives, asking ${petName} to investigate strange happenings at ${setting}. Upon arrival, you meet a ${character} who seems to know more than they're letting on...`,
        `${petName} inherits an ancient map pointing to ${setting}. When you arrive, a ${character} warns you of great danger ahead...`
      ],
      scifi: [
        `${petName} receives a transmission from ${setting} requesting immediate assistance. When you arrive, an ${character} explains the critical situation...`,
        `A strange device in your lab activates, transporting ${petName} to ${setting}. You're greeted by an ${character} with an urgent mission...`,
        `${petName} discovers a hidden signal from ${setting}. Upon investigation, you encounter an ${character} who needs your help...`
      ],
      mystery: [
        `${petName} receives an anonymous tip about suspicious activity at ${setting}. When you arrive, you meet a ${character} acting strangely...`,
        `A friend asks ${petName} to investigate their missing relative last seen near ${setting}. A ${character} there claims to have information...`,
        `${petName} finds a cryptic note leading to ${setting}. There, a ${character} approaches with a warning about danger...`
      ],
      adventure: [
        `${petName} discovers an old treasure map leading to ${setting}. Upon arrival, you encounter a ${character} who offers to guide you...`,
        `A storm washes ${petName} ashore at ${setting}. A friendly ${character} offers shelter and tells you about local legends...`,
        `${petName} joins an expedition to ${setting}. Your guide, a wise ${character}, shares tales of the challenges ahead...`
      ]
    }
    
    return {
      id: 'chapter_1',
      title: `Chapter 1: Journey to ${setting}`,
      text: this.pickRandom(openings[theme]),
      choices: this.generateChoices(theme, 'opening'),
      setting,
      character
    }
  }

  generateChoices(theme, situation) {
    const themeData = STORY_THEMES[theme]
    
    const choiceTemplates = {
      opening: [
        {
          text: "Listen carefully to what they have to say",
          consequences: { wisdom: +5, relationship: +1 },
          leads_to: 'investigation'
        },
        {
          text: "Ask about potential rewards for helping",
          consequences: { luck: +3, wisdom: +2 },
          leads_to: 'negotiation'
        },
        {
          text: "Offer to help immediately without questions",
          consequences: { courage: +5, relationship: +2 },
          leads_to: 'action'
        },
        {
          text: "Suggest being cautious and gathering more information first",
          consequences: { wisdom: +3, courage: -1 },
          leads_to: 'research'
        }
      ],
      investigation: [
        {
          text: `Examine the ${this.pickRandom(themeData.items)} more closely`,
          consequences: { wisdom: +3 },
          leads_to: 'discovery'
        },
        {
          text: `Approach the ${this.pickRandom(themeData.characters)} for answers`,
          consequences: { courage: +2, relationship: +1 },
          leads_to: 'confrontation'
        },
        {
          text: "Search for hidden clues in the area",
          consequences: { luck: +4, wisdom: +1 },
          leads_to: 'exploration'
        }
      ],
      danger: [
        {
          text: "Face the threat head-on",
          consequences: { courage: +5, luck: -2 },
          leads_to: 'combat'
        },
        {
          text: "Try to find a clever solution",
          consequences: { wisdom: +4, courage: +1 },
          leads_to: 'puzzle'
        },
        {
          text: "Attempt to negotiate or retreat",
          consequences: { wisdom: +2, courage: -1 },
          leads_to: 'diplomacy'
        }
      ]
    }
    
    return choiceTemplates[situation] || choiceTemplates.investigation
  }

  generateNextChapter(previousChapter, choiceIndex) {
    const choice = previousChapter.choices[choiceIndex]
    this.applyChoiceConsequences(choice.consequences)
    
    const nextSituation = choice.leads_to
    const chapterNum = this.storyState.currentChapter + 1
    
    // Generate dynamic content based on choice consequences
    const scenarios = {
      investigation: {
        title: `Chapter ${chapterNum}: The Investigation Deepens`,
        text: this.generateInvestigationText(),
        choices: this.generateChoices(this.storyState.theme, 'investigation')
      },
      action: {
        title: `Chapter ${chapterNum}: Taking Action`,
        text: this.generateActionText(),
        choices: this.generateChoices(this.storyState.theme, 'danger')
      },
      research: {
        title: `Chapter ${chapterNum}: Gathering Intelligence`,
        text: this.generateResearchText(),
        choices: this.generateChoices(this.storyState.theme, 'investigation')
      },
      discovery: {
        title: `Chapter ${chapterNum}: A Startling Discovery`,
        text: this.generateDiscoveryText(),
        choices: this.generateChoices(this.storyState.theme, 'danger')
      },
      confrontation: {
        title: `Chapter ${chapterNum}: Direct Confrontation`,
        text: this.generateConfrontationText(),
        choices: this.generateChoices(this.storyState.theme, 'danger')
      }
    }
    
    return {
      id: `chapter_${chapterNum}`,
      ...scenarios[nextSituation],
      previousChoice: choice
    }
  }

  generateInvestigationText() {
    const themeData = STORY_THEMES[this.storyState.theme]
    const item = this.pickRandom(themeData.items)
    const threat = this.pickRandom(themeData.threats)
    
    return `Your investigation reveals disturbing evidence. The ${item} holds more secrets than initially apparent, and there are signs that ${threat} may be involved. Your pet senses something important nearby...`
  }

  generateActionText() {
    const themeData = STORY_THEMES[this.storyState.theme]
    const threat = this.pickRandom(themeData.threats)
    
    return `Taking swift action, you and your pet move forward boldly. However, this direct approach has attracted attention - ${threat} now blocks your path. The situation has become more dangerous, but also more urgent...`
  }

  generateResearchText() {
    const themeData = STORY_THEMES[this.storyState.theme]
    const character = this.pickRandom(themeData.characters)
    const item = this.pickRandom(themeData.items)
    
    return `Your careful research pays off. You discover that the ${character} is connected to an ancient ${item}. This knowledge gives you an advantage, but time may be running out...`
  }

  generateDiscoveryText() {
    const themeData = STORY_THEMES[this.storyState.theme]
    const setting = this.pickRandom(themeData.settings)
    const threat = this.pickRandom(themeData.threats)
    
    return `Your discovery changes everything! The true location is not here, but at ${setting}. However, ${threat} has been awakened by your investigation. Your pet looks at you with determination - this adventure is far from over...`
  }

  generateConfrontationText() {
    const themeData = STORY_THEMES[this.storyState.theme]
    const character = this.pickRandom(themeData.characters)
    const threat = this.pickRandom(themeData.threats)
    
    return `Confronting the ${character} directly yields surprising results. They reveal the truth about ${threat}, but warn that others are watching. Your pet stays close, sensing the growing tension...`
  }

  applyChoiceConsequences(consequences) {
    for (const [stat, change] of Object.entries(consequences)) {
      if (stat === 'relationship') {
        // Handle relationship changes
        const currentRel = this.storyState.relationships.get('main_character') || 0
        this.storyState.relationships.set('main_character', currentRel + change)
      } else if (this.storyState.stats[stat] !== undefined) {
        this.storyState.stats[stat] = Math.max(0, Math.min(100, this.storyState.stats[stat] + change))
      }
    }
  }

  isStoryComplete() {
    return this.storyState.currentChapter >= 5 || 
           Object.values(this.storyState.stats).some(stat => stat <= 0 || stat >= 100)
  }

  generateEnding() {
    const { courage, wisdom, luck } = this.storyState.stats
    const dominantTrait = courage > wisdom && courage > luck ? 'courage' : 
                         wisdom > luck ? 'wisdom' : 'luck'
    
    const endings = {
      courage: {
        title: "The Hero's Ending",
        text: "Through bravery and determination, you and your pet overcome all obstacles. Your courage inspires others, and legends will be told of your adventures together.",
        rewards: { experience: 100, tokens: 50, title: "Brave Adventurer" }
      },
      wisdom: {
        title: "The Sage's Ending", 
        text: "Your careful thinking and wise choices lead to the best possible outcome. You solve the mystery with minimal conflict, earning the respect of all you encountered.",
        rewards: { experience: 80, tokens: 60, title: "Wise Explorer" }
      },
      luck: {
        title: "The Fortunate Ending",
        text: "Fortune favors the bold, and your willingness to take chances pays off spectacularly. You discover treasures and secrets that others missed.",
        rewards: { experience: 90, tokens: 70, title: "Lucky Finder" }
      }
    }
    
    return endings[dominantTrait]
  }
}

export default function CYOAAdventure({ petName = 'Your Pet', onExit, onComplete }) {
  const [generator] = useState(() => new CYOAGenerator())
  const [currentChapter, setCurrentChapter] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTheme, setSelectedTheme] = useState(null)
  const [storyEnded, setStoryEnded] = useState(false)
  const [ending, setEnding] = useState(null)

  useEffect(() => {
    if (selectedTheme && !currentChapter) {
      startNewStory(selectedTheme)
    }
  }, [selectedTheme])

  const startNewStory = (theme) => {
    setIsLoading(true)
    generator.storyState.theme = theme
    generator.storyState.currentChapter = 1
    
    setTimeout(() => {
      const openingChapter = generator.generateOpeningChapter(theme, petName)
      setCurrentChapter(openingChapter)
      setIsLoading(false)
    }, 1000)
  }

  const makeChoice = (choiceIndex) => {
    setIsLoading(true)
    
    setTimeout(() => {
      generator.storyState.currentChapter++
      generator.storyState.playerChoices.push(choiceIndex)
      
      if (generator.isStoryComplete()) {
        const storyEnding = generator.generateEnding()
        setEnding(storyEnding)
        setStoryEnded(true)
        
        // Award progression rewards
        const walletPubkey = localStorage.getItem('walletPublicKey')
        if (walletPubkey) {
          progressionSystem.awardExperience(walletPubkey, storyEnding.rewards.experience)
          progressionSystem.awardTokens(walletPubkey, storyEnding.rewards.tokens)
          progressionSystem.unlockAchievement(walletPubkey, storyEnding.rewards.title)
        }
        
        onComplete?.(storyEnding.rewards)
      } else {
        const nextChapter = generator.generateNextChapter(currentChapter, choiceIndex)
        setCurrentChapter(nextChapter)
      }
      
      setIsLoading(false)
    }, 1500)
  }

  const resetStory = () => {
    generator.storyState = {
      theme: null,
      currentChapter: 0,
      playerChoices: [],
      inventory: [],
      stats: { courage: 50, wisdom: 50, luck: 50 },
      relationships: new Map()
    }
    setCurrentChapter(null)
    setSelectedTheme(null)
    setStoryEnded(false)
    setEnding(null)
  }

  if (!selectedTheme) {
    return (
      <div style={{
        padding: '2rem',
        maxWidth: '600px',
        margin: '0 auto',
        background: 'rgba(0, 0, 0, 0.9)',
        borderRadius: '12px',
        border: '1px solid rgba(0, 255, 153, 0.3)',
        color: '#fff'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ color: '#00ff99', margin: 0 }}>📖 Choose Your Adventure</h2>
          <button onClick={onExit} className="btn btn-secondary">← Back</button>
        </div>
        
        <p style={{ textAlign: 'center', marginBottom: '2rem', color: '#ccc' }}>
          Select an adventure theme for {petName} to explore:
        </p>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: '1rem'
        }}>
          {Object.keys(STORY_THEMES).map(theme => (
            <button
              key={theme}
              onClick={() => setSelectedTheme(theme)}
              className="btn btn-primary"
              style={{
                padding: '1.5rem 1rem',
                textTransform: 'capitalize',
                fontSize: '1rem',
                background: `linear-gradient(45deg, ${
                  theme === 'fantasy' ? '#8B5CF6, #A78BFA' :
                  theme === 'scifi' ? '#06B6D4, #67E8F9' :
                  theme === 'mystery' ? '#DC2626, #FCA5A5' :
                  '#F59E0B, #FCD34D'
                })`
              }}
            >
              {theme === 'fantasy' && '🧙‍♂️'} 
              {theme === 'scifi' && '🚀'}
              {theme === 'mystery' && '🕵️'}
              {theme === 'adventure' && '⚔️'}
              <br />
              {theme}
            </button>
          ))}
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div style={{ 
        padding: '3rem', 
        textAlign: 'center', 
        background: 'rgba(0, 0, 0, 0.9)',
        borderRadius: '12px',
        border: '1px solid rgba(0, 255, 153, 0.3)',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <div className="spinner" style={{
          width: '40px',
          height: '40px',
          border: '4px solid rgba(0, 255, 153, 0.3)',
          borderTop: '4px solid #00ff99',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 1rem'
        }}></div>
        <p style={{ color: '#00ff99' }}>Generating your adventure...</p>
        
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  if (storyEnded && ending) {
    return (
      <div style={{
        padding: '2rem',
        maxWidth: '700px',
        margin: '0 auto',
        background: 'rgba(0, 0, 0, 0.9)',
        borderRadius: '12px',
        border: '1px solid rgba(0, 255, 153, 0.3)',
        color: '#fff',
        textAlign: 'center'
      }}>
        <h2 style={{ color: '#00ff99', marginBottom: '1rem' }}>🎉 {ending.title}</h2>
        
        <div style={{
          background: 'rgba(0, 255, 153, 0.1)',
          border: '1px solid rgba(0, 255, 153, 0.3)',
          borderRadius: '8px',
          padding: '1.5rem',
          marginBottom: '2rem'
        }}>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '1rem' }}>
            {ending.text}
          </p>
        </div>
        
        <div style={{
          background: 'rgba(0, 0, 0, 0.5)',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '2rem'
        }}>
          <h3 style={{ color: '#ffd700', marginBottom: '0.5rem' }}>Rewards Earned:</h3>
          <p>+{ending.rewards.experience} Experience Points</p>
          <p>+{ending.rewards.tokens} Tokens</p>
          <p>🏆 Title Unlocked: "{ending.rewards.title}"</p>
        </div>
        
        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center'
        }}>
          <button onClick={resetStory} className="btn btn-primary">
            🔄 New Adventure
          </button>
          <button onClick={onExit} className="btn btn-secondary">
            🏠 Return Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      padding: '2rem',
      maxWidth: '800px',
      margin: '0 auto',
      background: 'rgba(0, 0, 0, 0.9)',
      borderRadius: '12px',
      border: '1px solid rgba(0, 255, 153, 0.3)',
      color: '#fff'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ color: '#00ff99', margin: 0 }}>{currentChapter?.title}</h2>
        <button onClick={onExit} className="btn btn-secondary">← Back</button>
      </div>

      {/* Story Stats */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '2rem',
        fontSize: '0.9rem'
      }}>
        <div>🛡️ Courage: {generator.storyState.stats.courage}</div>
        <div>🧠 Wisdom: {generator.storyState.stats.wisdom}</div>
        <div>🍀 Luck: {generator.storyState.stats.luck}</div>
      </div>

      {/* Story Text */}
      <div style={{
        background: 'rgba(0, 255, 153, 0.05)',
        border: '1px solid rgba(0, 255, 153, 0.2)',
        borderRadius: '8px',
        padding: '2rem',
        marginBottom: '2rem',
        fontSize: '1.1rem',
        lineHeight: '1.7'
      }}>
        {currentChapter?.text}
      </div>

      {/* Choices */}
      <div style={{
        display: 'grid',
        gap: '1rem'
      }}>
        {currentChapter?.choices?.map((choice, index) => (
          <button
            key={index}
            onClick={() => makeChoice(index)}
            className="btn btn-primary"
            style={{
              padding: '1rem 1.5rem',
              textAlign: 'left',
              background: 'rgba(0, 255, 153, 0.1)',
              border: '1px solid rgba(0, 255, 153, 0.3)',
              borderRadius: '8px',
              fontSize: '1rem',
              lineHeight: '1.4',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(0, 255, 153, 0.2)'
              e.target.style.borderColor = 'rgba(0, 255, 153, 0.5)'
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(0, 255, 153, 0.1)'
              e.target.style.borderColor = 'rgba(0, 255, 153, 0.3)'
            }}
          >
            {choice.text}
          </button>
        ))}
      </div>
      
      <div style={{ 
        textAlign: 'center', 
        marginTop: '1rem', 
        fontSize: '0.9rem', 
        color: '#888' 
      }}>
        Chapter {generator.storyState.currentChapter} • {petName}'s Adventure
      </div>
    </div>
  )
}