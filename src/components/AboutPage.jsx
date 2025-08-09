import React from 'react'

export default function AboutPage({ onBack }) {
  return (
    <div className="info-page">
      <div className="info-content">
        <h1>🐾 About VirtualPetterz</h1>
        
        <div className="info-section">
          <h2>What is VirtualPetterz?</h2>
          <p>
            VirtualPetterz is the ultimate blockchain-powered virtual pet experience. 
            Raise, care for, and battle with unique digital pets while earning rewards 
            in our play-to-earn ecosystem.
          </p>
        </div>

        <div className="info-section">
          <h2>🪙 Token Economics</h2>
          <p>
            <strong>In-Game Tokens:</strong> Earn tokens by caring for your pet, completing quests, 
            winning battles, and daily check-ins. Use tokens to buy food, toys, and premium features.
          </p>
          <p>
            <strong>$VPET Token:</strong> Our community token launched on pump.fun. Hold $VPET tokens 
            for exclusive benefits, VIP features, and community governance rights.
          </p>
        </div>

        <div className="info-section">
          <h2>🎮 Core Features</h2>
          <ul>
            <li><strong>Pet Care:</strong> Feed, play, and interact with your virtual pet</li>
            <li><strong>Interactive Environment:</strong> Pets interact with beds, toys, food bowls</li>
            <li><strong>Battle System:</strong> PvP battles with server-side validation</li>
            <li><strong>Adventure Mode:</strong> Explore and earn rewards</li>
            <li><strong>Pet Gardens:</strong> Create and share custom environments</li>
            <li><strong>Daily Rewards:</strong> Login streaks and daily quests</li>
            <li><strong>Personality AI:</strong> Each pet has unique traits and behaviors</li>
          </ul>
        </div>

        <div className="info-section">
          <h2>🚀 Get Started</h2>
          <p>
            1. Connect your Phantom wallet (optional)<br/>
            2. Choose your pet from 8 unique species<br/>
            3. Start caring for your pet and earning tokens<br/>
            4. Join the community and compete with friends!
          </p>
        </div>

        <div className="info-buttons">
          <button onClick={onBack} className="btn btn-primary">
            ← Back to Game
          </button>
          <a 
            href="https://pump.fun" 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn btn-secondary"
          >
            Buy $VPET Token 🚀
          </a>
        </div>
      </div>
    </div>
  )
}