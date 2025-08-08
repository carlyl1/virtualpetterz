import React from 'react'

export default function About() {
  return (
    <div style={{ maxWidth: 900, margin: '40px auto', padding: 16 }}>
      <h2>About VirtualPetterz</h2>
      <p>VirtualPetterz is an AI‑powered pixel pet game on Solana. Care for your pet, chat with it, and send it into battles and adventures. We’re privacy‑first, with chat proxied via open‑source models and no analytics by default.</p>
      <ul>
        <li>Canvas pet animations with petting and emotes</li>
        <li>Feed / Play / Battle / Adventure actions with token rewards</li>
        <li>Daily check‑ins, quests, inventory/shop, and leaderboards</li>
        <li>Wallet connect (devnet now), simulated token balance</li>
      </ul>
      <p>We’re building toward cooperative “Choose Your Own Adventure” missions where groups vote on each step—see the Roadmap for details.</p>
    </div>
  )
}