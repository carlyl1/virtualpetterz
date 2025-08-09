import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react'
import {
  WalletModalProvider,
  WalletMultiButton,
} from '@solana/wallet-adapter-react-ui'
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets'
// remove unsupported imports
// import { SolflareWalletAdapter, GlowWalletAdapter } from '@solana/wallet-adapter-wallets'
import { clusterApiUrl } from '@solana/web3.js'
import { useWallet } from '@solana/wallet-adapter-react'

import './App.css'
import Battle from './components/Battle'
import P2PBattleRoom from './components/P2PBattleRoom'
import Adventure from './components/Adventure'
import PetSelect from './components/PetSelect'
import Balance from './components/Balance'
import Shop from './components/Shop'
import TokensBadge from './components/TokensBadge'
import DailyCheckin from './components/DailyCheckin'
import Leaderboard from './components/Leaderboard'
import AudioPlayer from './components/AudioPlayer'
import Quests from './components/Quests'
import { incrementQuest } from './quests/manager'
import PetWorld from './components/PetWorld'
import BottomDock from './components/BottomDock'
import ThemeToggle from './components/ThemeToggle'
import SideDock from './components/SideDock'
import { generateTraitsFromPubkey } from './traits/generator'
import { getPet, savePet } from './api/client'
import { enhanceApiPrompt, getPersonalityFallback } from './chat/petPersonality'

// near imports
import SimpleGroupAdventure from './components/SimpleGroupAdventure'
import CYOAAdventure from './components/CYOAAdventure'
import WalletHelp from './components/WalletHelp'
import HatchIntro from './components/HatchIntro'
import HatchReveal from './components/HatchReveal'
import NamePet from './components/NamePet'
import PetGarden from './components/PetGarden'
import StatsBoard from './components/StatsBoard'
import TokenWallet from './components/TokenWallet'
import ErrorBoundary, { PetCanvasErrorFallback, ChatErrorFallback } from './components/ErrorBoundary'
import ImprovedErrorBoundary from './components/ImprovedErrorBoundary'
import MultiplayerStatus from './components/MultiplayerStatus'
import LoadingSpinner, { ChatLoadingIndicator } from './components/LoadingSpinner'
import progressionSystem from './systems/PersistentProgression'
import unifiedProgression from './systems/UnifiedProgression'
import AdventurePanel from './components/AdventurePanel'
import LevelUpNotification from './components/LevelUpNotification'
import multiplayerService from './services/MultiplayerService'
import ChatSidebar from './components/ChatSidebar'
import TokenNotification, { useTokenNotification } from './components/TokenNotification'
import AboutPage from './components/AboutPage'
import RoadmapPage from './components/RoadmapPage'
import StatusPage from './components/StatusPage'

const AI_RESPONSE_DELAY_MS = 800

async function chatWithOssModel(message) {
  // Try server-side chat endpoint first (for production)
  try {
    // Force debug mode to see what's happening with HF API
    const serverUrl = window.location.origin + '/chat?debug=1';
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    console.log('🤖 Trying server chat:', serverUrl);
    
    const res = await fetch(serverUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: message }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (res.ok) {
      const data = await res.json();
      console.log('✅ Server chat response:', data);
      
      // Log debug info if available
      if (data.debug) {
        console.log('🔍 Chat Debug Info:', {
          hasModelUrl: data.debug.hasModelUrl,
          hasApiKey: data.debug.hasApiKey,
          attempts: data.debug.attempts,
          lastError: data.lastError
        });
      }
      
      // Return any non-empty response from HF API, even if it's a fallback
      if (data.output && data.output.trim() && data.output.length > 5) {
        return data.output;
      }
    }
  } catch (error) {
    console.log('⚠️ Server chat failed, using fallback:', error.message);
  }
  
  // Always return null to trigger personality fallback
  return null;
}

function mockGptOssResponse(input) {
  const lower = input.toLowerCase()
  if (lower.includes('hungry')) return "I'm hungry! Feed me some tokens, please!"
  if (lower.includes('play')) return "Yay! Let's play together!"
  if (lower.includes('hello') || lower.includes('hi')) return "Hi friend! I'm your tamagotchi pet!"
  return "I'm just a simple pet, but I love chatting with you!"
}

function moodLabel(hunger, happiness) {
  if (hunger < 20) return 'hangry 😤'
  if (hunger < 40) return 'peckish 😶'
  if (happiness > 80) return 'vibing 🎶'
  if (happiness < 30) return 'lonely 🥺'
  return 'happy 😊'
}

function StatBar({ label, value }) {
  return (
    <div className="stat">
      <div className="stat-label">{label}: {value}</div>
      <div className="bar">
        <div className="bar-fill" style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

function ChatBox({ onSend }) {
  const [inputText, setInputText] = useState('')
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const send = async () => {
    if (!inputText.trim() || isLoading) return
    const userMsg = { from: 'user', text: inputText }
    setMessages((prev) => [...prev, userMsg])
    const current = inputText
    setInputText('')
    setIsLoading(true)
    
    onSend(current, (response) => {
      setIsLoading(false)
      setMessages((prev) => [...prev, { from: 'pet', text: response }])
    })
  }

  const onKeyDown = (event) => {
    if (event.key === 'Enter') send()
  }

  return (
    <div className="chatbox">
      <div className="messages">
        {messages.map((m, i) => (
          <div key={i} className={`message ${m.from}`}>
            <span className={`bubble ${m.from}`}>{m.text}</span>
          </div>
        ))}
        {isLoading && (
          <div className="message pet">
            <div className="bubble pet">
              <ChatLoadingIndicator />
            </div>
          </div>
        )}
      </div>
      <input
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Talk to your pet..."
        disabled={isLoading}
      />
      <button onClick={send} disabled={isLoading}>
        {isLoading ? 'Sending...' : 'Send'}
      </button>
    </div>
  )
}

function PetActions({ onFeed, onPlay, mood }) {
  return (
    <div className="pet-care">
      <button onClick={onFeed}>Feed 🍖 (Spend Tokens)</button>
      <button onClick={onPlay}>Play 🎾 (Spend Tokens)</button>
      <div className="mood-display">Mood: {mood}</div>
    </div>
  )
}

function HomeScreen({ selectedPet, setSelectedPet, goBattle, goAdventure, tokens, setTokens, openDaily, openLeaderboard, openQuests, petName, gameData, refreshGameData, onShowAbout, onShowRoadmap, onShowStatus }) {
  const containerRef = useRef(null)
  const wallet = useWallet()

  const [hunger, setHunger] = useState(gameData.petStats.hunger)
  const [happiness, setHappiness] = useState(gameData.petStats.happiness)
  const [mood, setMood] = useState('happy 😊')
  const [isFeeding, setIsFeeding] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showSelector, setShowSelector] = useState(!selectedPet)
  const [showShop, setShowShop] = useState(false)
  const [actionSignal, setActionSignal] = useState(null)
  const [isLoadingPetData, setIsLoadingPetData] = useState(false)

  useEffect(() => {
    // Only auto-generate pet if wallet connects and no saved pet exists
    if (wallet?.publicKey && !localStorage.getItem('ct_selected_pet')) {
      const t = generateTraitsFromPubkey(wallet.publicKey.toBase58())
      const speciesMap = { 
        fox: 'forest-fox', 
        bunny: 'mystic-bunny', 
        cat: 'robo-cat',
        duck: 'water-duck',
        wolf: 'shadow-wolf',
        sloth: 'pixel-sloth',
        hamster: 'chonk-hamster',
        moth: 'glitch-moth'
      }
      const mapped = speciesMap[t.species] || 'forest-fox'
      setSelectedPet(mapped)
      
      // Register pet with progression system
      const petSeed = `wallet-${mapped}`
      const petData = {
        seed: petSeed,
        species: mapped,
        rarity: t.rarity || 'common',
        stats: { hp: 80, attack: 15, defense: 10, speed: 12 }
      }
      progressionSystem.registerPet(petData)
    }
  }, [wallet?.publicKey])

  // Register existing pets with progression system
  useEffect(() => {
    if (selectedPet) {
      const t = (() => {
        try {
          const pk = wallet?.publicKey?.toBase58?.()
          return generateTraitsFromPubkey(pk || 'guest')
        } catch { 
          return { rarity: 'common' } 
        }
      })()
      
      const petSeed = wallet?.publicKey ? `wallet-${selectedPet}` : `guest-${selectedPet}`
      const petData = {
        seed: petSeed,
        species: selectedPet,
        rarity: t.rarity || 'common',
        stats: { hp: 80, attack: 15, defense: 10, speed: 12 }
      }
      progressionSystem.registerPet(petData)
    }
  }, [selectedPet, wallet?.publicKey])

  // Passive decay
  useEffect(() => {
    const interval = setInterval(() => {
      setHunger((prev) => Math.max(0, prev - 1))
      setHappiness((prev) => Math.max(0, prev - 1))
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    setMood(moodLabel(hunger, happiness))
  }, [hunger, happiness])

  // in HomeScreen, apply pending deltas from adventure
  useEffect(() => {
    const kh = 'ct_adv_hunger_delta'
    const kx = 'ct_adv_happiness_delta'
    const dh = Number(localStorage.getItem(kh) || '0')
    const dx = Number(localStorage.getItem(kx) || '0')
    if (dh !== 0) {
      setHunger((v) => Math.max(0, Math.min(100, v + dh)))
      localStorage.removeItem(kh)
    }
    if (dx !== 0) {
      setHappiness((v) => Math.max(0, Math.min(100, v + dx)))
      localStorage.removeItem(kx)
    }
  }, [])

  useEffect(() => {
    const load = async () => {
      const pk = wallet?.publicKey?.toBase58?.()
      if (!pk) return
      
      setIsLoadingPetData(true)
      try {
        const res = await fetch(`/.netlify/functions/pet?wallet=${encodeURIComponent(pk)}`)
        if (!res.ok) {
          console.warn('Failed to load pet data:', res.status)
          return
        }
        const data = await res.json()
        if (data?.state?.hunger != null) setHunger(Number(data.state.hunger))
        if (data?.state?.happiness != null) setHappiness(Number(data.state.happiness))
        if (data?.state?.name) setPetName(String(data.state.name))
      } catch (error) {
        console.error('Error loading pet data:', error)
      } finally {
        setIsLoadingPetData(false)
      }
    }
    load()
  }, [wallet?.publicKey])

  // Listen for shop open event from SideDock
  useEffect(() => {
    const handleShowShop = () => setShowShop(true)
    window.addEventListener('showShop', handleShowShop)
    return () => window.removeEventListener('showShop', handleShowShop)
  }, [])

  useEffect(() => {
    const pk = wallet?.publicKey?.toBase58?.()
    if (!pk) return
    ;(async () => {
      try { await fetch('/.netlify/functions/pet', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ wallet: pk, state: { hunger, happiness } }) }) } catch {}
    })()
  }, [hunger, happiness, wallet?.publicKey])

  const floatPlus = (text) => {
    const el = document.createElement('div')
    el.className = 'float-plus'
    el.textContent = text
    el.style.left = '50%'
    el.style.top = '220px'
    el.style.transform = 'translateX(-50%)'
    containerRef.current?.appendChild(el)
    setTimeout(() => el.remove(), 900)
  }

  const feedPet = () => {
    setIsFeeding(true)
    setTimeout(() => {
      unifiedProgression.feedPet({ hunger: 25, happiness: 5 })
      const newData = refreshGameData()
      setHunger(newData.petStats.hunger)
      setIsFeeding(false)
      floatPlus('+ Hunger')
      incrementQuest('feed_pet', 1)
      setActionSignal({ type: 'eat', t: Date.now() })
    }, 600)
  }

  const playWithPet = () => {
    setIsPlaying(true)
    setTimeout(() => {
      unifiedProgression.playWithPet({ happiness: 25, hunger: -3 })
      const newData = refreshGameData()
      setHappiness(newData.petStats.happiness)
      setHunger(newData.petStats.hunger)
      setIsPlaying(false)
      floatPlus('+ Happiness')
      incrementQuest('play_pet', 1)
      setActionSignal({ type: 'play', t: Date.now() })
    }, 600)
  }

  const handleUseItem = (id) => {
    if (id === 'food') {
      unifiedProgression.feedPet({ hunger: 20, happiness: 3 })
      const newData = refreshGameData()
      setHunger(newData.petStats.hunger)
    }
    if (id === 'toy') {
      unifiedProgression.playWithPet({ happiness: 20, hunger: -1 })
      const newData = refreshGameData()
      setHappiness(newData.petStats.happiness)
      setHunger(newData.petStats.hunger)
    }
    floatPlus(id === 'food' ? '+ Food' : '+ Fun')
  }


  return (
    <div ref={containerRef}>
      {showSelector && (
        <PetSelect
          onSelect={(pet) => {
            setSelectedPet(pet.id)
            setShowSelector(false)
          }}
        />
      )}
      {showShop && <Shop onClose={() => setShowShop(false)} onUseItem={handleUseItem} refreshGameData={refreshGameData} />}
      {/* Pet World - full screen background */}
      <ErrorBoundary fallback={PetCanvasErrorFallback}>
        <PetWorld
          petId={selectedPet}
          traits={(() => {
            try {
              const pk = wallet?.publicKey?.toBase58?.()
              return generateTraitsFromPubkey(pk || 'guest')
            } catch { return null }
          })()}
          onPet={() => setHappiness((v)=>Math.min(100,v+5))}
          actionSignal={actionSignal}
          happiness={happiness}
          hunger={hunger}
          sleeping={false}
          petName={petName}
        />
      </ErrorBoundary>
      {petName && <div className="mood-display">Name: {petName}</div>}
      <div className="stats">
        {isLoadingPetData ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px' }}>
            <LoadingSpinner size="small" inline />
            <span style={{ fontSize: '12px', color: 'var(--accent)' }}>Loading pet stats...</span>
          </div>
        ) : (
          <>
            <StatBar label="Hunger" value={hunger} />
            <StatBar label="Happiness" value={happiness} />
          </>
        )}
      </div>
      <PetActions onFeed={feedPet} onPlay={playWithPet} mood={mood} />
      {(isFeeding || isPlaying) && <div className="loading">Processing...</div>}
      
      {/* Pet Selection - Hidden for now since it shows blobs */}
      {false && (
        <div style={{ textAlign: 'center', marginTop: '12px' }}>
          <button 
            onClick={() => setShowSelector(true)}
            style={{
              padding: '8px 16px',
              fontSize: '11px',
              background: 'rgba(0, 255, 153, 0.8)',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontWeight: 'bold',
              transition: 'all 0.2s ease',
              opacity: 0.8
            }}
          >
            Choose Pet 🔄
          </button>
        </div>
      )}
      <footer>
        <small>
          <button 
            onClick={onShowAbout}
            style={{ background: 'none', border: 'none', color: 'inherit', textDecoration: 'underline', cursor: 'pointer', font: 'inherit' }}
          >
            About
          </button> · 
          <button 
            onClick={onShowRoadmap}
            style={{ background: 'none', border: 'none', color: 'inherit', textDecoration: 'underline', cursor: 'pointer', font: 'inherit' }}
          >
            Roadmap
          </button> · 
          <button 
            onClick={onShowStatus}
            style={{ background: 'none', border: 'none', color: 'inherit', textDecoration: 'underline', cursor: 'pointer', font: 'inherit' }}
          >
            Status
          </button> · 
          <span style={{ opacity: 0.6 }}>Terms · Privacy</span>
        </small>
        <small>In-game progress is saved locally and may be lost on browser data clear.</small>
      </footer>
    </div>
  )
}

function MainApp() {
  const [route, setRoute] = useState('home')
  const [selectedPet, setSelectedPet] = useState(() => {
    // If there's a saved pet, use it. Otherwise randomize initial selection
    const saved = localStorage.getItem('ct_selected_pet')
    if (saved) return saved
    
    const pets = ['forest-fox', 'mystic-bunny', 'robo-cat', 'water-duck', 'shadow-wolf', 'pixel-sloth', 'chonk-hamster', 'glitch-moth']
    return pets[Math.floor(Math.random() * pets.length)]
  })
  // Use unified progression system
  const [gameData, setGameData] = useState(() => unifiedProgression.getAllData())
  const [tokens, setTokens] = useState(gameData.playerStats.tokens)
  
  // Helper function to refresh game data
  const refreshGameData = () => {
    const newData = unifiedProgression.getAllData()
    setGameData(newData)
    setTokens(newData.playerStats.tokens)
    return newData
  }
  
  // Wrapper functions for unified system
  const giveTokens = (amount) => {
    unifiedProgression.addTokens(amount)
    refreshGameData()
    showTokenChange(amount, 'gain')
  }
  
  const updatePetStats = (updates) => {
    if (updates.experience) {
      const result = unifiedProgression.addExperience(updates.experience)
      if (result.leveledUp) {
        setLevelUpData(result)
      }
    }
    if (updates.hunger !== undefined || updates.happiness !== undefined) {
      unifiedProgression.updatePetNeeds(
        updates.hunger !== undefined ? updates.hunger : gameData.petStats.hunger,
        updates.happiness !== undefined ? updates.happiness : gameData.petStats.happiness
      )
    }
    refreshGameData()
  }
  
  const recordBattleResult = (won, tokensEarned, expEarned) => {
    unifiedProgression.recordBattleResult(won, tokensEarned, expEarned)
    refreshGameData()
  }
  
  // Check daily login on app start and initialize multiplayer
  useEffect(() => {
    const dailyResult = unifiedProgression.checkDailyLogin()
    if (dailyResult.isNewDay) {
      // Could show a daily reward notification here
      console.log('Daily login bonus:', dailyResult)
      refreshGameData()
    }
    
    // Initialize multiplayer service
    multiplayerService.connect().then(() => {
      if (multiplayerService.isConnected()) {
        console.log('🌐 Multiplayer enabled');
        // Register player with current data
        multiplayerService.registerPlayer({
          name: petName || 'Anonymous',
          petSpecies: selectedPet || 'forest-fox',
          stats: gameData.battleStats,
          level: gameData.petStats.level
        });
      } else {
        console.log('⚠️ Playing in offline mode');
      }
    });
  }, [])
  const [showDaily, setShowDaily] = useState(false)
  const [showLB, setShowLB] = useState(false)
  const [showQuests, setShowQuests] = useState(false)
  const [showHatch, setShowHatch] = useState(() => !localStorage.getItem('ct_hatched'))
  const [showReveal, setShowReveal] = useState(false)
  const [showName, setShowName] = useState(false)
  const [petName, setPetName] = useState('')
  const [levelUpData, setLevelUpData] = useState(null)
  const [isChatCollapsed, setIsChatCollapsed] = useState(true)
  const { notifications, showTokenChange, removeNotification } = useTokenNotification()
  const [showAbout, setShowAbout] = useState(false)
  const [showRoadmap, setShowRoadmap] = useState(false)
  const [showStatus, setShowStatus] = useState(false)

  // persist per-wallet pet state
  const [walletPubkey, setWalletPubkey] = useState(null)
  useEffect(() => {
    // capture wallet pubkey via custom event from HomeScreen (or directly via window)
    try {
      const { solana } = window
      // no-op if unavailable
    } catch {}
  }, [])

  // load on wallet connect
  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const pk = window?.solana?.publicKey?.toString?.() || null
        setWalletPubkey(pk || null)
        if (!pk) return
        const data = await getPet(pk)
        if (cancelled) return
        if (data?.state?.tokens != null) setTokens(Number(data.state.tokens))
        if (data?.state?.name) setPetName(String(data.state.name))
      } catch {}
    }
    load()
    return () => { cancelled = true }
  }, [])

  // save when tokens change and wallet is present
  useEffect(() => {
    const pk = walletPubkey
    if (!pk) return
    ;(async () => {
      try { await savePet(pk, { state: { tokens } }) } catch {}
    })()
  }, [tokens, walletPubkey])

  useEffect(() => { localStorage.setItem('ct_selected_pet', selectedPet) }, [selectedPet])
  useEffect(() => {
    localStorage.setItem('ct_tokens', String(tokens))
    // Update local leaderboard entry tokens
    try {
      const lb = JSON.parse(localStorage.getItem('ct_leaderboard') || '[]')
      let me = lb.find((e) => e.name === 'You')
      if (!me) { me = { name: 'You', wins: 0, tokens: 0 }; lb.push(me) }
      me.tokens = tokens
      localStorage.setItem('ct_leaderboard', JSON.stringify(lb))
    } catch {}
  }, [tokens])

  useEffect(() => { if (!petName) { const n = localStorage.getItem('ct_pet_name'); if (n) setPetName(n) } }, [])

  const reward = (amount) => setTokens((t) => t + amount)

  const playerPet = { stats: { hp: 100, attack: 20, defense: 10, speed: 15 }, name: petName || 'Pet' }
  const [opponentPet, setOpponentPet] = useState({ 
    name: 'Shadow Wolf',
    stats: { hp: 90, attack: 18, defense: 12 }
  })

  return (
    <div className="app-container">
      {showHatch && (
        <HatchIntro onDone={() => { 
          localStorage.setItem('ct_hatched', '1'); 
          setShowHatch(false); 
          setTimeout(() => setShowReveal(true), 200) 
        }} />
      )}
      {showReveal && (
        <HatchReveal 
          petData={(() => {
            try {
              const pk = walletPubkey || 'guest'
              return generateTraitsFromPubkey(pk)
            } catch { 
              return { species: 'fox', element: 'neutral', rarity: 'common', traits: {} } 
            }
          })()}
          onDone={() => { 
            setShowReveal(false); 
            setTimeout(() => setShowName(true), 300) 
          }} 
        />
      )}
      {showName && <NamePet wallet={walletPubkey} onDone={(n) => { setPetName(n); setShowName(false) }} />}
      <header>
        <h1 
          onClick={() => setRoute('home')}
          style={{ 
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            userSelect: 'none'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.05)'
            e.target.style.textShadow = '0 0 10px rgba(0, 255, 153, 0.5)'
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)'
            e.target.style.textShadow = 'none'
          }}
        >
          VirtualPetterz
        </h1>
        <div className="topbar">
          <Balance />
          <TokensBadge tokens={tokens} />
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <WalletMultiButton />
          <AudioPlayer />
          <ThemeToggle />
        </div>
      </header>
      <main>
        {route === 'home' && (
          <ImprovedErrorBoundary>
            {showDaily && <DailyCheckin onClaim={reward} onClose={() => setShowDaily(false)} />}
            {showLB && <Leaderboard 
              onClose={() => setShowLB(false)}
              playerData={{
                name: petName || 'You',
                wins: gameData.playerStats.battlesWon,
                tokens: gameData.playerStats.tokens,
                battles: gameData.playerStats.battlesWon + gameData.playerStats.battlesLost,
                petSpecies: selectedPet ? selectedPet.replace('-', ' ') : 'Pet'
              }}
            />}
            {showQuests && <Quests onReward={reward} onClose={() => setShowQuests(false)} />}
            <div className="main-grid">
              {/* Left sidebar - Navigation only (no background panel) */}
              <div style={{ position: 'relative', zIndex: 1 }}></div>
              
              {/* Center content */}
              <div className="center">
                <HomeScreen
                  selectedPet={selectedPet}
                  setSelectedPet={setSelectedPet}
                  tokens={tokens}
                  setTokens={setTokens}
                  goBattle={() => setRoute('battle')}
                  goAdventure={() => setRoute('adventure')}
                  openDaily={() => setShowDaily(true)}
                  openLeaderboard={() => setShowLB(true)}
                  openQuests={() => setShowQuests(true)}
                  petName={petName}
                  gameData={gameData}
                  refreshGameData={refreshGameData}
                  onShowAbout={() => setShowAbout(true)}
                  onShowRoadmap={() => setShowRoadmap(true)}
                  onShowStatus={() => setShowStatus(true)}
                />
              </div>
              
              {/* Right sidebar - Wallet info */}
              <div style={{ 
                position: 'relative', 
                zIndex: 100,
                background: 'rgba(0, 0, 0, 0.8)',
                borderRadius: '12px',
                padding: '16px',
                border: '1px solid rgba(0, 255, 153, 0.3)'
              }}>
                <WalletHelp connected={!!walletPubkey} />
              </div>
            </div>
          </ImprovedErrorBoundary>
        )}
        {route === 'battle' && (
          <ErrorBoundary>
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <h2 style={{ color: '#00ff99', marginBottom: '2rem' }}>⚔️ Battle Arena</h2>
              <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button 
                  className="btn btn-primary" 
                  style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}
                  onClick={() => setRoute('p2p-battle')}
                >
                  🌐 P2P Battle
                  <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Fight real players</div>
                </button>
                <button 
                  className="btn btn-secondary" 
                  style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}
                  onClick={() => {
                    // Generate random opponent for classic battle
                    const randomOpponent = {
                      name: 'Wild Opponent',
                      stats: {
                        hp: 80 + Math.floor(Math.random() * 40),
                        attack: 10 + Math.floor(Math.random() * 15),
                        defense: 5 + Math.floor(Math.random() * 10)
                      }
                    };
                    setOpponentPet(randomOpponent);
                    setRoute('classic-battle');
                  }}
                >
                  🤖 Classic Battle
                  <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Fight AI opponents</div>
                </button>
                <button 
                  className="btn btn-tertiary" 
                  onClick={() => setRoute('home')}
                  style={{ padding: '0.5rem 1rem' }}
                >
                  ← Back
                </button>
              </div>
            </div>
          </ErrorBoundary>
        )}
        {route === 'p2p-battle' && (
          <ErrorBoundary>
            <P2PBattleRoom
              playerPet={{
                ...playerPet,
                stats: gameData.battleStats
              }}
              onBattleStart={(opponent) => {
                console.log('P2P Battle started with:', opponent);
              }}
              onBattleComplete={(result) => {
                console.log('P2P Battle completed:', result);
                recordBattleResult(result.victory, result.tokens || 15, result.exp || 25);
                incrementQuest('battles', 1);
              }}
              onExit={() => setRoute('home')}
            />
          </ErrorBoundary>
        )}
        {route === 'classic-battle' && (
          <ErrorBoundary>
            <Battle
              playerPet={{
                ...playerPet,
                stats: gameData.battleStats
              }}
              opponentPet={opponentPet}
              onReward={(amount) => giveTokens(amount)}
              onBattleEnd={(result) => {
                if (result) {
                  recordBattleResult(result.victory, result.tokens || 10, result.exp || 15);
                }
                setRoute('home');
              }}
            />
          </ErrorBoundary>
        )}
        {route === 'adventure' && (
          <ErrorBoundary>
            <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ color: '#00ff99', margin: 0 }}>🗺️ Adventure Portal</h2>
                <button 
                  className="btn btn-tertiary" 
                  onClick={() => setRoute('home')}
                  style={{ padding: '0.5rem 1rem' }}
                >
                  ← Back Home
                </button>
              </div>
              <AdventurePanel
                pet={{
                  ...gameData.petStats,
                  name: petName || 'Your Pet'
                }}
                updatePetStats={updatePetStats}
                giveTokens={giveTokens}
              />
            </div>
          </ErrorBoundary>
        )}
        {route === 'group' && (
          <ErrorBoundary>
            <SimpleGroupAdventure walletPubkey={walletPubkey} onExit={() => setRoute('home')} />
          </ErrorBoundary>
        )}
        {route === 'cyoa' && (
          <ErrorBoundary>
            <CYOAAdventure 
              petName={petName || 'Your Pet'} 
              onExit={() => setRoute('home')}
              onComplete={(rewards) => {
                if (rewards.experience) updatePetStats('experience', rewards.experience)
                if (rewards.tokens) giveTokens(rewards.tokens)
              }}
            />
          </ErrorBoundary>
        )}
        {route === 'garden' && (
          <ErrorBoundary>
            <div className="main-grid">
              <div className="center">
                <PetGarden 
                  gardenId={window.location.hash.replace('#garden-', '') || 'starter'} 
                  walletConnected={!!walletPubkey} 
                />
                <button 
                  onClick={() => setRoute('home')} 
                  style={{ marginTop: '16px' }}
                  className="btn"
                >
                  Back Home
                </button>
              </div>
            </div>
          </ErrorBoundary>
        )}

        {route === 'stats' && (
          <ErrorBoundary>
            <div className="main-grid">
              <div className="center">
                <StatsBoard 
                  selectedPet={selectedPet}
                  walletConnected={!!walletPubkey} 
                />
                <button 
                  onClick={() => setRoute('home')} 
                  style={{ marginTop: '16px' }}
                  className="btn"
                >
                  Back Home
                </button>
              </div>
            </div>
          </ErrorBoundary>
        )}

        {route === 'wallet' && (
          <ErrorBoundary>
            <div className="main-grid">
              <div className="center">
                <TokenWallet 
                  walletPublicKey={walletPubkey}
                  walletConnected={!!walletPubkey} 
                />
                <button 
                  onClick={() => setRoute('home')} 
                  style={{ marginTop: '16px' }}
                  className="btn"
                >
                  Back Home
                </button>
              </div>
            </div>
          </ErrorBoundary>
        )}
      </main>
      
      {/* Global Level Up Notification */}
      {levelUpData && (
        <LevelUpNotification
          levelUpData={levelUpData}
          onClose={() => setLevelUpData(null)}
        />
      )}
      
      {/* Global components */}
      <MultiplayerStatus />
      
      {/* Global Navigation - accessible on all routes */}
      {route === 'home' && (
        <>
          <SideDock
            onFeed={() => {
              // Trigger feed action in HomeScreen via unified progression
              unifiedProgression.feedPet({ hunger: 25, happiness: 5 });
              setGameData(unifiedProgression.getAllData());
              showTokenChange(-5, 'loss'); // Show token cost for feeding
            }}
            onPlay={() => {
              // Trigger play action in HomeScreen via unified progression
              unifiedProgression.playWithPet({ happiness: 25, hunger: -3 });
              setGameData(unifiedProgression.getAllData());
              showTokenChange(-3, 'loss'); // Show token cost for playing
            }}
            onShop={() => {
              // Find the HomeScreen and trigger shop display
              const homeScreenElement = document.querySelector('.center');
              if (homeScreenElement) {
                // Dispatch a custom event that HomeScreen can listen for
                window.dispatchEvent(new CustomEvent('showShop'));
              }
            }} 
            onQuests={() => setShowQuests(true)}
            onAdventure={() => setRoute('adventure')}
            onBattle={() => setRoute('battle')}
            onDaily={() => setShowDaily(true)}
            onLeaderboard={() => setShowLB(true)}
            onGroup={() => {
              console.log('🔍 Group Adventure clicked')
              setRoute('group')
            }}
            onCYOA={() => {
              console.log('📖 Story Quest clicked')
              setRoute('cyoa')
            }}
            onGarden={() => {
              console.log('🌱 Pet Garden clicked')
              setRoute('garden')
            }}
            onStats={() => {
              console.log('📊 Stats clicked')
              setRoute('stats')
            }}
            onWallet={() => {
              console.log('💰 Wallet clicked')
              setRoute('wallet')
            }}
            onAbout={() => setShowAbout(true)}
            onRoadmap={() => setShowRoadmap(true)}
            onStatus={() => setShowStatus(true)}
          />
          <BottomDock
            onFeed={() => {
              // Trigger feed action in HomeScreen via unified progression
              unifiedProgression.feedPet({ hunger: 25, happiness: 5 });
              setGameData(unifiedProgression.getAllData());
              showTokenChange(-5, 'loss'); // Show token cost for feeding
            }}
            onPlay={() => {
              // Trigger play action in HomeScreen via unified progression
              unifiedProgression.playWithPet({ happiness: 25, hunger: -3 });
              setGameData(unifiedProgression.getAllData());
              showTokenChange(-3, 'loss'); // Show token cost for playing
            }}
            onShop={() => {
              // Find the HomeScreen and trigger shop display
              window.dispatchEvent(new CustomEvent('showShop'));
            }}
            onQuests={() => setShowQuests(true)}
            onAdventure={() => setRoute('adventure')}
            onBattle={() => setRoute('battle')}
            onDaily={() => setShowDaily(true)}
            onLeaderboard={() => setShowLB(true)}
          />
        </>
      )}
      
      {/* Global Chat Sidebar */}
      <ChatSidebar
        isCollapsed={isChatCollapsed}
        onToggle={() => setIsChatCollapsed(!isChatCollapsed)}
        petName={petName || 'Your Pet'}
        onSend={async (input, callback) => {
          // Get pet traits for personality
          const petTraits = (() => {
            try {
              return generateTraitsFromPubkey(walletPubkey || 'guest')
            } catch { 
              return { rarity: 'common' } 
            }
          })()
          
          // Create personality-enhanced prompt for API
          const personalityPrompt = enhanceApiPrompt(
            input,
            selectedPet,
            gameData.petStats.happiness,
            gameData.petStats.hunger,
            false, // sleeping state
            petTraits.rarity || 'common',
            petName
          )
          
          // Try API with personality context
          const apiResponse = await chatWithOssModel(personalityPrompt)
          if (apiResponse) {
            callback(apiResponse)
            return
          }
          
          // Fallback to personality-driven response
          const personalityResponse = getPersonalityFallback(
            input,
            selectedPet,
            gameData.petStats.happiness,
            gameData.petStats.hunger,
            false, // sleeping state
            petTraits.rarity || 'common',
            petName
          )
          
          setTimeout(() => callback(personalityResponse), AI_RESPONSE_DELAY_MS)
        }}
      />
      
      {/* Token Notifications */}
      {notifications.map(notification => (
        <TokenNotification
          key={notification.id}
          amount={notification.amount}
          type={notification.type}
          onComplete={() => removeNotification(notification.id)}
        />
      ))}
      
      {/* Info Pages */}
      {showAbout && <AboutPage onBack={() => setShowAbout(false)} />}
      {showRoadmap && <RoadmapPage onBack={() => setShowRoadmap(false)} />}
      {showStatus && <StatusPage onBack={() => setShowStatus(false)} />}
      
      {/* Removed global footer to avoid duplicate */}
    </div>
  )
}

export default function App() {
  const wallets = useMemo(() => [
    new PhantomWalletAdapter(),
  ], [])
  const endpoint = clusterApiUrl('devnet')
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <MainApp />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}