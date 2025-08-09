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
import PetCanvas from './components/PetCanvas'
import BottomDock from './components/BottomDock'
import ThemeToggle from './components/ThemeToggle'
import SideDock from './components/SideDock'
import { generateTraitsFromPubkey } from './traits/generator'
import { getPet, savePet } from './api/client'

// near imports
import GroupAdventure from './components/GroupAdventure'
import WalletHelp from './components/WalletHelp'
import HatchIntro from './components/HatchIntro'
import NamePet from './components/NamePet'
import ErrorBoundary, { PetCanvasErrorFallback, ChatErrorFallback } from './components/ErrorBoundary'
import LoadingSpinner, { ChatLoadingIndicator } from './components/LoadingSpinner'

const AI_RESPONSE_DELAY_MS = 800

async function chatWithOssModel(message) {
  const url = import.meta.env.PUBLIC_CHAT_URL || '/chat'
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout
  
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: message }),
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    
    if (!res.ok) {
      console.warn('Chat API error:', res.status, res.statusText)
      return null
    }
    
    const data = await res.json()
    return data?.output || data?.text || null
  } catch (error) {
    clearTimeout(timeoutId)
    
    if (error.name === 'AbortError') {
      console.warn('Chat request timed out')
    } else {
      console.error('Chat error:', error.message)
    }
    return null
  }
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

function HomeScreen({ selectedPet, setSelectedPet, goBattle, goAdventure, tokens, setTokens, openDaily, openLeaderboard, openQuests, petName }) {
  const containerRef = useRef(null)
  const wallet = useWallet()

  const [hunger, setHunger] = useState(65)
  const [happiness, setHappiness] = useState(65)
  const [mood, setMood] = useState('happy 😊')
  const [isFeeding, setIsFeeding] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showSelector, setShowSelector] = useState(!selectedPet)
  const [showShop, setShowShop] = useState(false)
  const [actionSignal, setActionSignal] = useState(null)
  const [isLoadingPetData, setIsLoadingPetData] = useState(false)

  useEffect(() => {
    if (wallet?.publicKey) {
      const t = generateTraitsFromPubkey(wallet.publicKey.toBase58())
      const speciesMap = { fox: 'forest-fox', bunny: 'mystic-bunny', cat: 'robo-cat' }
      const mapped = speciesMap[t.species] || 'forest-fox'
      setSelectedPet(mapped)
    }
  }, [wallet?.publicKey])

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
      setHunger((prev) => Math.min(100, prev + 25))
      setIsFeeding(false)
      floatPlus('+ Hunger')
      incrementQuest('feed_pet', 1)
      setActionSignal({ type: 'eat', t: Date.now() })
    }, 600)
  }

  const playWithPet = () => {
    setIsPlaying(true)
    setTimeout(() => {
      setHappiness((prev) => Math.min(100, prev + 25))
      setIsPlaying(false)
      floatPlus('+ Happiness')
      incrementQuest('play_pet', 1)
      setActionSignal({ type: 'play', t: Date.now() })
    }, 600)
  }

  const handleUseItem = (id) => {
    if (id === 'food') setHunger((v) => Math.min(100, v + 20))
    if (id === 'toy') setHappiness((v) => Math.min(100, v + 20))
    floatPlus(id === 'food' ? '+ Food' : '+ Fun')
  }

  const handleChatSend = async (input, callback) => {
    const apiResponse = await chatWithOssModel(input)
    if (apiResponse) {
      callback(apiResponse)
      return
    }
    setTimeout(() => callback(mockGptOssResponse(input)), AI_RESPONSE_DELAY_MS)
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
      {showShop && <Shop onClose={() => setShowShop(false)} onUseItem={handleUseItem} />}
      <div className="scene">
        <ErrorBoundary fallback={PetCanvasErrorFallback}>
          <PetCanvas petId={selectedPet} traits={(() => {
            try {
              const pk = wallet?.publicKey?.toBase58?.()
              return generateTraitsFromPubkey(pk || 'guest')
            } catch { return null }
          })()} onPet={() => setHappiness((v)=>Math.min(100,v+5))} actionSignal={actionSignal} />
        </ErrorBoundary>
      </div>
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
      <ErrorBoundary fallback={ChatErrorFallback}>
        <ChatBox onSend={handleChatSend} />
      </ErrorBoundary>
      <SideDock
        onFeed={feedPet}
        onPlay={playWithPet}
        onShop={() => setShowShop(true)}
        onQuests={openQuests}
        onAdventure={goAdventure}
        onBattle={goBattle}
        onDaily={openDaily}
        onLeaderboard={openLeaderboard}
        onGroup={() => setRoute('group')}
      />
      <BottomDock
        onFeed={feedPet}
        onPlay={playWithPet}
        onShop={() => setShowShop(true)}
        onQuests={openQuests}
        onAdventure={goAdventure}
        onBattle={goBattle}
        onDaily={openDaily}
        onLeaderboard={openLeaderboard}
      />
      <footer>
        <small>
          <a href="/about">About</a> · <a href="/roadmap">Roadmap</a> · <a href="/terms">Terms</a> · <a href="/privacy">Privacy</a>
        </small>
        <small>Token spends are simulated. Real integration coming soon!</small>
      </footer>
    </div>
  )
}

function MainApp() {
  const [route, setRoute] = useState('home')
  const [selectedPet, setSelectedPet] = useState(() => localStorage.getItem('ct_selected_pet') || 'forest-fox')
  const [tokens, setTokens] = useState(() => Number(localStorage.getItem('ct_tokens') || '25'))
  const [showDaily, setShowDaily] = useState(false)
  const [showLB, setShowLB] = useState(false)
  const [showQuests, setShowQuests] = useState(false)
  const [showHatch, setShowHatch] = useState(() => !localStorage.getItem('ct_hatched'))
  const [petName, setPetName] = useState('')

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

  const playerPet = { stats: { hp: 100, attack: 20, defense: 10, speed: 15 }, name: 'Pet' }
  const opponentPet = { stats: { hp: 90, attack: 18, defense: 12 }, name: 'Shadow Wolf' }

  return (
    <div className="app-container">
      {showHatch && (
        <HatchIntro onDone={() => { localStorage.setItem('ct_hatched', '1'); setShowHatch(false); setTimeout(() => setShowName(true), 50) }} />
      )}
      {showName && <NamePet wallet={walletPubkey} onDone={(n) => { setPetName(n); setShowName(false) }} />}
      <header>
        <h1>VirtualPetterz</h1>
        <div className="topbar">
          <Balance />
          <TokensBadge tokens={tokens} />
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <WalletMultiButton />
          <WalletHelp connected={!!window?.solana?.isConnected} />
          <AudioPlayer />
          <ThemeToggle />
        </div>
      </header>
      <main>
        {route === 'home' && (
          <>
            {showDaily && <DailyCheckin onClaim={reward} onClose={() => setShowDaily(false)} />}
            {showLB && <Leaderboard onClose={() => setShowLB(false)} />}
            {showQuests && <Quests onReward={reward} onClose={() => setShowQuests(false)} />}
            <div className="main-grid"><div className="center"><HomeScreen
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
            /></div></div>
          </>
        )}
        {route === 'battle' && (
          <ErrorBoundary>
            <Battle
              playerPet={playerPet}
              opponentPet={opponentPet}
              onReward={reward}
              onBattleEnd={() => setRoute('home')}
            />
          </ErrorBoundary>
        )}
        {route === 'adventure' && (
          <ErrorBoundary>
            <Adventure
              party={[{ name: 'You' }]}
              onReward={reward}
              onExit={() => setRoute('home')}
              applyStat={(stat, delta) => {
                if (stat === 'tokens') setTokens((t) => Math.max(0, t + Number(delta || 0)))
                if (stat === 'hunger') {
                  // Bubble update via localStorage; HomeScreen reads from its own state
                  const key = 'ct_adv_hunger_delta'
                  localStorage.setItem(key, String(Number(localStorage.getItem(key) || '0') + Number(delta || 0)))
                }
                if (stat === 'happiness') {
                  const key = 'ct_adv_happiness_delta'
                  localStorage.setItem(key, String(Number(localStorage.getItem(key) || '0') + Number(delta || 0)))
                }
              }}
            >
            </Adventure>
          </ErrorBoundary>
        )}
        {route === 'group' && (
          <ErrorBoundary>
            <GroupAdventure walletPubkey={walletPubkey} onExit={() => setRoute('home')} />
          </ErrorBoundary>
        )}
      </main>
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