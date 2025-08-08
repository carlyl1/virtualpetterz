import React from 'react'

export default function Roadmap() {
  return (
    <div style={{ maxWidth: 900, margin: '40px auto', padding: 16 }}>
      <h2>Roadmap</h2>
      <p>VirtualPetterz roadmap highlights where we’re going next. This page will update as we ship.</p>
      <h3>Now (MVP)</h3>
      <ul>
        <li>Canvas pet with idle/sleep/walk states, petting, and emotes</li>
        <li>Feed / Play actions, stat bars, daily check-in, quests</li>
        <li>Turn-based Battle (1v1) with token rewards</li>
        <li>Adventure with cooldown and basic outcomes</li>
        <li>Wallet connect, simulated token balance, shop/inventory</li>
        <li>Chat via OSS model proxy (Hugging Face Inference)</li>
      </ul>
      <h3>Next (1–2 sprints)</h3>
      <ul>
        <li>Battle 1.0: pet vs pet matchmaking, rewards, simple MMR</li>
        <li>Adventure 1.0: JSON-based Choose-Your-Own-Adventure (CYOA) nodes with stat/token effects</li>
        <li>Dynamic story prompts that reflect current pet mood/stats</li>
        <li>Status/health tuning, theme polish, brand/landing updates</li>
      </ul>
      <h3>Soon</h3>
      <ul>
        <li>Group Adventures: room-based CYOA. Pets join a room; each step opens a timed vote. Majority (or weighted) choice advances the story; shared loot distribution.</li>
        <li>Session persistence for adventure rooms (serverless store), join links, basic moderation</li>
        <li>Token utility: entry fees, boosts, revive mechanics</li>
        <li>Leaderboards (battles, adventure streaks, tokens)</li>
      </ul>
      <h3>Later</h3>
      <ul>
        <li>On-chain flows on Solana (feed/play/battle/adventure) and settlements</li>
        <li>Richer AI dialog for adventures (branching/story memory)</li>
        <li>Optional NFT minting/trading for pets & cosmetics</li>
      </ul>
    </div>
  )
}