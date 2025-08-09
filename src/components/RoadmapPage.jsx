import React from 'react'

export default function RoadmapPage({ onBack }) {
  const roadmapPhases = [
    {
      phase: "Phase 1: Foundation",
      status: "✅ Complete",
      items: [
        "✅ Core pet care mechanics (feed, play, sleep)",
        "✅ Interactive pet environment with objects",
        "✅ 8 unique pet species with personalities",
        "✅ Token earning and spending system",
        "✅ Basic battle system",
        "✅ Daily check-ins and streaks"
      ]
    },
    {
      phase: "Phase 2: Social & Competition", 
      status: "🚀 In Progress",
      items: [
        "✅ P2P battle system with validation",
        "✅ Pet gardens creation and sharing",
        "✅ Quest system with rewards",
        "✅ Leaderboards and competitions",
        "🚧 Enhanced chat and social features",
        "🚧 Guild/clan system"
      ]
    },
    {
      phase: "Phase 3: Advanced Features",
      status: "🔮 Coming Soon",
      items: [
        "🔮 Pet breeding and genetics system",
        "🔮 Advanced AI behaviors and learning",
        "🔮 Seasonal events and limited items",
        "🔮 Pet tournaments with prize pools",
        "🔮 Mobile app (PWA)",
        "🔮 Cross-platform pet synchronization"
      ]
    },
    {
      phase: "Phase 4: Token Integration",
      status: "🎯 Planned",
      items: [
        "🎯 $VPET holder exclusive features",
        "🎯 Token staking for pet care automation",
        "🎯 Community governance voting",
        "🎯 Rare pet NFT marketplace",
        "🎯 Real token rewards for competitions",
        "🎯 Partnership integrations"
      ]
    }
  ]

  return (
    <div className="info-page">
      <div className="info-content">
        <h1>🗺️ Development Roadmap</h1>
        
        <div className="roadmap-intro">
          <p>
            Our journey to creating the most engaging virtual pet experience on the blockchain. 
            Each phase builds upon the last, creating deeper gameplay and stronger community bonds.
          </p>
        </div>

        <div className="roadmap-phases">
          {roadmapPhases.map((phase, index) => (
            <div key={index} className={`roadmap-phase ${phase.status.includes('Complete') ? 'complete' : phase.status.includes('Progress') ? 'active' : 'future'}`}>
              <div className="phase-header">
                <h2>{phase.phase}</h2>
                <span className={`phase-status ${phase.status.includes('Complete') ? 'complete' : phase.status.includes('Progress') ? 'active' : 'future'}`}>
                  {phase.status}
                </span>
              </div>
              <ul className="phase-items">
                {phase.items.map((item, itemIndex) => (
                  <li key={itemIndex} className={item.startsWith('✅') ? 'done' : item.startsWith('🚧') ? 'wip' : 'planned'}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="roadmap-footer">
          <div className="info-section">
            <h2>🎯 Our Mission</h2>
            <p>
              To create a sustainable play-to-earn ecosystem where players genuinely enjoy 
              spending time with their virtual pets while building real value in the community.
            </p>
          </div>

          <div className="info-section">
            <h2>📈 Success Metrics</h2>
            <ul>
              <li><strong>Daily Active Users:</strong> Target 1,000+ by Q2</li>
              <li><strong>Average Session Time:</strong> 20+ minutes</li>
              <li><strong>User Retention:</strong> 50% weekly, 25% monthly</li>
              <li><strong>Community Size:</strong> 10,000+ Discord/Twitter followers</li>
            </ul>
          </div>
        </div>

        <button onClick={onBack} className="btn btn-primary">
          ← Back to Game
        </button>
      </div>
    </div>
  )
}