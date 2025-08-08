import React from 'react'

export default function BottomDock({ onFeed, onPlay, onShop, onQuests, onAdventure, onBattle, onDaily, onLeaderboard }) {
  return (
    <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 999 }}>
      <div className="bottom-dock">
        <button onClick={onFeed}>Feed 🍖</button>
        <button onClick={onPlay}>Play 🎾</button>
        <button onClick={onShop}>Shop</button>
        <button onClick={onQuests}>Quests</button>
        <button onClick={onAdventure}>Adventure</button>
        <button onClick={onBattle}>Battle</button>
        <button onClick={onDaily}>Daily</button>
        <button onClick={onLeaderboard}>Leaderboard</button>
      </div>
    </div>
  )
}