import React from 'react'

export default function SideDock({ onFeed, onPlay, onShop, onQuests, onAdventure, onBattle, onDaily, onLeaderboard, disabled=false }) {
  return (
    <div className="side-dock">
      <button onClick={onFeed} disabled={disabled}>Feed 🍖</button>
      <button onClick={onPlay} disabled={disabled}>Play 🎾</button>
      <button onClick={onShop}>Shop</button>
      <button onClick={onQuests}>Quests</button>
      <button onClick={onAdventure}>Adventure</button>
      <button onClick={onBattle}>Battle</button>
      <button onClick={onDaily}>Daily</button>
      <button onClick={onLeaderboard}>Leaderboard</button>
    </div>
  )
}