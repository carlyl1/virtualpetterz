import React, { useState } from 'react'

export default function SideDock({ onFeed, onPlay, onShop, onQuests, onAdventure, onBattle, onDaily, onLeaderboard, onGroup, onCYOA, onGarden, onStats, onWallet, onAbout, onRoadmap, onStatus }) {
  const [open, setOpen] = useState(true)
  return (
    <div className={`side-dock ${open ? 'open' : ''}`}>
      <button className="toggle" onClick={() => setOpen((o) => !o)}>{open ? '◀ Hide' : '▶ Actions'}</button>
      {open && (
        <div className="dock-buttons">
          <button onClick={onFeed}>Feed</button>
          <button onClick={onPlay}>Play</button>
          <button onClick={onShop}>Shop</button>
          <button onClick={onQuests}>Quests</button>
          <button onClick={onAdventure}>Adventure</button>
          <button onClick={onBattle}>Battle</button>
          <button onClick={onGroup}>Group Adventure</button>
          <button onClick={onCYOA}>Story Quest</button>
          <button onClick={onGarden}>Pet Garden</button>
          <button onClick={onStats}>Stats & Progress</button>
          <button onClick={onWallet}>Token Wallet</button>
          <button onClick={onDaily}>Daily</button>
          <button onClick={onLeaderboard}>Leaderboard</button>
          <button onClick={onAbout}>About</button>
          <button onClick={onRoadmap}>Roadmap</button>
          <button onClick={onStatus}>Status</button>
        </div>
      )}
    </div>
  )
}