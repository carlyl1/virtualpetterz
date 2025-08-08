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

const AI_RESPONSE_DELAY_MS = 800

async function chatWithOssModel(message) {
  const url = import.meta.env.PUBLIC_CHAT_URL || '/chat'
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: message }),
    })
    if (!res.ok) return null
    const data = await res.json()
    return data?.output || data?.text || null
  } catch (_e) {
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

  const send = async () => {
    if (!inputText.trim()) return
    const userMsg = { from: 'user', text: inputText }
    setMessages((prev) => [...prev, userMsg])
    const current = inputText
    setInputText('')
    onSend(current, (response) => {
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
      </div>
      <input
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Talk to your pet..."
      />
      <button onClick={send}>Send</button>
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

function HomeScreen({ selectedPet, setSelectedPet, goBattle, goAdventure, tokens, setTokens, openDaily, openLeaderboard, openQuests }) {
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

  useEffect(() => { if (wallet?.publicKey) { const seed = wallet.publicKey.toBase58(); const variants = ['forest-fox','mystic-bunny','robo-cat']; const idx = [...seed].reduce((a,c)=>a+c.charCodeAt(0),0)%variants.length; setSelectedPet(variants[idx]); } }, [wallet?.publicKey])

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
        <PetCanvas petId={selectedPet} onPet={() => setHappiness((v)=>Math.min(100,v+5))} actionSignal={actionSignal} />
      </div>
      <div className="stats">
        <StatBar label="Hunger" value={hunger} />
        <StatBar label="Happiness" value={happiness} />
      </div>
      <PetActions onFeed={feedPet} onPlay={playWithPet} mood={mood} />
      {(isFeeding || isPlaying) && <div className="loading">Processing...</div>}
      <ChatBox onSend={handleChatSend} />
      <SideDock
        onFeed={feedPet}
        onPlay={playWithPet}
        onShop={() => setShowShop(true)}
        onQuests={openQuests}
        onAdventure={goAdventure}
        onBattle={goBattle}
        onDaily={openDaily}
        onLeaderboard={openLeaderboard}
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

  const reward = (amount) => setTokens((t) => t + amount)

  const playerPet = { stats: { hp: 100, attack: 20, defense: 10, speed: 15 }, name: 'Pet' }
  const opponentPet = { stats: { hp: 90, attack: 18, defense: 12 }, name: 'Shadow Wolf' }

  return (
    <div className="app-container">
      <header>
        <h1>VirtualPetterz</h1>
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
            /></div></div>
          </>
        )}
        {route === 'battle' && (
          <Battle
            playerPet={playerPet}
            opponentPet={opponentPet}
            onReward={reward}
            onBattleEnd={() => setRoute('home')}
          />
        )}
        {route === 'adventure' && (
          <Adventure party={[{ name: 'You' }]} onReward={reward} onExit={() => setRoute('home')} />
        )}
      </main>
      <footer>
        <nav>
          <a href="/about">About</a>
          <a href="/terms">Terms</a>
          <a href="/privacy">Privacy</a>
        </nav>
      </footer>
    </div>
  )
}

export default function App() {
  const wallets = [new PhantomWalletAdapter()]
  return (
    <ConnectionProvider endpoint="https://api.devnet.solana.com">
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <MainApp />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}